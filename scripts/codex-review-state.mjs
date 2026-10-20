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
export const hasCleanCodexState = (body, head) => {
  if (!/^[a-f0-9]{40}$/.test(head || "")) return false;
  const match = String(body || "")
    .trim()
    .match(
      /^<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 (\{[^\r\n]+\}) -->\n([\s\S]*)$/,
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
    JSON.stringify(state) !== raw ||
    !cleanKeys(state, "code_review,security_review") ||
    !cleanReview(state.code_review, head) ||
    !(
      inactiveReview(state.security_review) ||
      cleanReview(state.security_review, head)
    )
  )
    return false;
  let visible = match[2].trim();
  if (
    /codex-review-state|codex-pull-request-review-summary|codex-review-receipt/i.test(
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
  const activeSecurity = !inactiveReview(state.security_review);
  if (lines.length !== (activeSecurity ? 6 : 5)) return false;
  const expected = activeSecurity
    ? ["Code Review", "Security Review"]
    : ["Code Review"];
  for (const [index, label] of expected.entries()) {
    const row = lines[4 + index].match(
      /^\| (?:📝|🔒|🛡️) \*\*(Code Review|Security Review)\*\* \| ✅ \*\*Completed\*\*(?: <relative-time datetime="([^"<>]+)">([^<>]+)<\/relative-time>)? \| `([a-f0-9]{7,40})` \| ([^|<>`]+) \|$/,
    );
    if (
      !row ||
      row[1] !== label ||
      !head.startsWith(row[4]) ||
      (row[2] && (row[2] !== row[3] || !Number.isFinite(Date.parse(row[2]))))
    )
      return false;
  }
  return true;
};
