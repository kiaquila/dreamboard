const summaryMarker = "<!-- codex-pull-request-review-summary -->";
const statePrefix = "<!-- codex-review-state:v1 ";
const cleanKeys = (value, keys) =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).sort().join(",") === keys.split(",").sort().join(",");
const fields = "commit_sha,has_any_findings,has_unresolved_findings,status";
const cleanReview = (review, head) =>
  cleanKeys(review, fields) &&
  review.commit_sha === head &&
  review.has_any_findings === false &&
  review.has_unresolved_findings === false &&
  review.status === "completed";
const validReview = (review, head) =>
  cleanKeys(review, fields) &&
  /^[a-f0-9]{40}$/.test(review.commit_sha || "") &&
  review.commit_sha === head &&
  ["completed", "running"].includes(review.status) &&
  [review.has_any_findings, review.has_unresolved_findings].every(
    (flag) => flag === null || typeof flag === "boolean",
  );
const inactiveReview = (review) =>
  cleanKeys(review, fields) &&
  Object.values(review).every((value) => value === null);

export const isCodexStateBody = (body = "") =>
  /codex-pull-request-review-summary|codex-review-state/.test(body);

const summaryHelp = `[Your team has set up Codex to review pull requests in this repo](https://chatgpt.com/codex/cloud/settings/general). Reviews are triggered when you
- Open a pull request for review
- Mark a draft as ready
- Comment "@codex review" or "@codex security review".

Codex reacts with 👀 while any review is running, comments if it has suggestions, and reacts with 👍 once all reviews finish with no findings.`;
const normalize = (text) => text.replace(/\s+/g, " ").trim();

// A structured snapshot is authoritative only with one closed-schema machine
// record and the matching native visible table. Prose and reactions are not proof.
export const parseCodexState = (body, head, { sectionHeads = false } = {}) => {
  if (!/^[a-f0-9]{40}$/.test(head || "")) return false;
  if (
    /^(?: {4}|[ \t]*\t)[ \t]*<!--\s*codex-(?:pull-request-review-summary|review-state|review-receipt)/m.test(
      String(body || ""),
    )
  )
    return false;
  const source = sectionHeads
    ? String(body || "")
        .replace(/<!--[\s\S]*?-->/g, (comment) =>
          /^<!--\s*codex-/i.test(comment) ? comment : "",
        )
        .trim()
    : String(body || "").trim();
  const match = source.match(
    sectionHeads
      ? /^<!-- codex-pull-request-review-summary -->\s*<!-- codex-review-state:v1 (\{[\s\S]*?\}) -->\s*([\s\S]*)$/
      : /^<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 (\{[^\r\n]+\}) -->\n([\s\S]*)$/,
  );
  if (!match) return false;
  const raw = match[1];
  let state;
  try {
    state = JSON.parse(raw);
  } catch {
    return false;
  }
  // Native compact JSON round-trips exactly. Duplicate or escaped keys and
  // alternate scalar encodings cannot be silently normalized into valid proof.
  if (
    JSON.stringify(state) !==
      (sectionHeads
        ? raw.replace(
            /("(?:\\.|[^"\\])*")|\s+/g,
            (match, quoted) => quoted || "",
          )
        : raw) ||
    !cleanKeys(state, "code_review,security_review") ||
    !(
      (sectionHeads && inactiveReview(state.code_review)) ||
      validReview(
        state.code_review,
        sectionHeads ? state.code_review?.commit_sha : head,
      )
    ) ||
    !(
      inactiveReview(state.security_review) ||
      validReview(
        state.security_review,
        sectionHeads ? state.security_review?.commit_sha : head,
      )
    )
  )
    return false;
  let visible = match[2].trim();
  if (
    /<!--\s*(?:codex-review-state|codex-pull-request-review-summary|codex-review-receipt)/i.test(
      visible,
    )
  )
    return false;
  const footer = visible.indexOf("<details>");
  if (footer >= 0) {
    const help = visible
      .slice(footer)
      .match(
        /^<details>\s*<summary>ℹ️ About Codex in GitHub<\/summary>\s*(?:<br\s*\/>)?\s*([\s\S]*?)\s*<\/details>$/,
      );
    if (!help || normalize(help[1]) !== normalize(summaryHelp)) return false;
    visible = visible.slice(0, footer).trim();
  }
  const lines = visible
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (
    lines[0] !== "## Codex Review Summary" ||
    lines[1] !==
      "This comment shows the latest Codex review activity on this pull request." ||
    lines[2] !== "| Review | Status | Commit | Review trigger |" ||
    !/^\|\s*-+\s*\|\s*-+\s*\|\s*-+\s*\|\s*-+\s*\|$/.test(lines[3] || "")
  )
    return false;
  const expected = [
    ...(!inactiveReview(state.code_review) ? ["Code Review"] : []),
    ...(!inactiveReview(state.security_review) ? ["Security Review"] : []),
  ];
  if (lines.length !== 4 + expected.length) return false;
  const times = {};
  for (const [index, label] of expected.entries()) {
    const row = lines[4 + index].match(
      /^\| (?:📝|🔒|🛡️) \*\*(Code Review|Security Review)\*\* \| (?:✅ \*\*Completed\*\*|🔄 \*\*Running\*\* since)(?: <relative-time datetime="([^"<>]+)">([^<>]+)<\/relative-time>)? \| `([a-f0-9]{7,40})` \| ([^|<>`]+) \|$/,
    );
    const section = label === "Code Review" ? "code_review" : "security_review";
    if (
      !row ||
      !lines[4 + index].includes(
        state[section].status === "completed"
          ? "✅ **Completed**"
          : "🔄 **Running** since",
      ) ||
      !row[2] ||
      row[1] !== label ||
      !(sectionHeads ? state[section].commit_sha : head).startsWith(row[4]) ||
      (row[2] && (row[2] !== row[3] || !Number.isFinite(Date.parse(row[2]))))
    )
      return false;
    times[section] = Date.parse(row[2]);
  }
  return { state, times };
};

export const hasCleanCodexState = (body, head) => {
  const parsed = parseCodexState(body, head);
  return Boolean(
    parsed &&
    cleanReview(parsed.state.code_review, head) &&
    (inactiveReview(parsed.state.security_review) ||
      cleanReview(parsed.state.security_review, head)),
  );
};

// Findings belong to their review section across repeated same-head requests.
// A code-only receipt may clear resolved code history after its observation;
// security history always requires a newer clean security completion.
export const hasCodexNegativeHistory = (
  comments,
  head,
  isTrusted,
  codeApprovalTime = 0,
) => {
  const sections = { code_review: [], security_review: [] };
  for (const entry of comments) {
    if (!isTrusted(entry)) continue;
    let parsed = parseCodexState(entry.body || "", head, {
      sectionHeads: true,
    });
    let negativeOnly = false;
    if (!parsed) {
      const original = String(entry.body || "");
      // Every line of a trailing example must stay inside Markdown code
      // indentation. Never consume a partly unindented live protocol block.
      const leading = original.replace(
        /(?:\r?\n(?: {4}|[ \t]*\t)[ \t]*<!--[ \t]*codex-(?:review-state|pull-request-review-summary|review-receipt)(?:(?!-->)[^\r\n])*(?:\r?\n(?: {4}|[ \t]*\t)(?:(?!-->)[^\r\n])*)*-->[ \t]*)+\s*$/i,
        "",
      );
      if (leading !== original) {
        parsed = parseCodexState(leading, head, { sectionHeads: true });
        negativeOnly = true;
      }
    }
    if (!parsed) continue;
    const observed = Date.parse(entry.updated_at || entry.created_at || "");
    if (!Number.isFinite(observed)) continue;
    for (const section of Object.keys(sections)) {
      const review = parsed.state[section];
      if (review.commit_sha !== head) continue;
      if (
        review.has_any_findings === true ||
        review.has_unresolved_findings === true
      )
        sections[section].push({
          negative: true,
          observed: Math.floor(observed / 1000),
          resolved:
            !negativeOnly &&
            review.status === "completed" &&
            review.has_unresolved_findings === false &&
            Number.isFinite(parsed.times[section]) &&
            parsed.times[section] < observed + 1000,
          time: Math.floor(
            (review.status === "completed" &&
            Number.isFinite(parsed.times[section]) &&
            parsed.times[section] < observed + 1000
              ? parsed.times[section]
              : observed) / 1000,
          ),
        });
      else if (!negativeOnly && cleanReview(review, head)) {
        const completed = parsed.times[section];
        if (Number.isFinite(completed) && completed < observed + 1000)
          sections[section].push({
            negative: false,
            time: Math.floor(completed / 1000),
          });
      }
    }
  }
  return Object.entries(sections).some(([section, entries]) => {
    const negative = Math.max(
      -Infinity,
      ...entries.filter((entry) => entry.negative).map((entry) => entry.time),
    );
    const clean = Math.max(
      -Infinity,
      ...entries.filter((entry) => !entry.negative).map((entry) => entry.time),
    );
    if (negative === -Infinity || clean > negative) return false;
    if (section === "code_review" && Number.isFinite(codeApprovalTime)) {
      const observed = Math.max(
        ...entries
          .filter((entry) => entry.negative)
          .map((entry) => entry.observed),
      );
      if (
        entries.some(
          (entry) =>
            entry.negative &&
            entry.resolved &&
            entry.time >= negative &&
            entry.observed >= observed &&
            Math.floor(codeApprovalTime / 1000) >
              Math.max(entry.observed, entry.time),
        )
      )
        return false;
    }
    return true;
  });
};

// The summary can also be edited by security activity. Code completion time,
// not the mutable comment timestamp alone, proves this request was reviewed.
export const codexCodeReviewCompletionTime = (body) => {
  const match = String(body || "").match(
    /^\| 📝 \*\*Code Review\*\* \| ✅ \*\*Completed\*\* <relative-time datetime="([^"<>]+)">/m,
  );
  return Date.parse(match?.[1] || "");
};

export const codexNegativeCompletionTime = (entry, head) => {
  const parsed = parseCodexState(entry.body || "", head, {
    sectionHeads: true,
  });
  const observed = Date.parse(entry.updated_at || entry.created_at || "");
  if (
    !parsed ||
    Object.values(parsed.state).some((review) => review.status === "running")
  )
    return NaN;
  const negatives = Object.entries(parsed.state).filter(
    ([, review]) =>
      review.commit_sha === head &&
      (review.has_any_findings === true ||
        review.has_unresolved_findings === true),
  );
  if (!negatives.length) return NaN;
  return Math.max(
    ...negatives.map(([section, review]) =>
      review.status === "completed" &&
      Number.isFinite(parsed.times[section]) &&
      parsed.times[section] < observed + 1000
        ? Math.floor(parsed.times[section] / 1000) * 1000
        : observed,
    ),
  );
};
