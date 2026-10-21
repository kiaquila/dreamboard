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
const escapedMarkdownPunctuation = (text, index) =>
  text[index] === "\\" &&
  /[\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]/.test(text[index + 1] || "");
const visibleLinkLabels = (text, activeLinkOnly = false) => {
  const footnoteKey = (label) =>
    label.trim().replace(/\s+/g, " ").toLowerCase();
  if (!activeLinkOnly) {
    const footnotes = [
      ...text.matchAll(
        /^ {0,3}\[\^([^\]\r\n]+)\]:[^\r\n]*(?:(?:\r\n|\r|\n)(?: {2,}|\t)[^\r\n]*)*/gm,
      ),
    ];
    let usage = text;
    for (const match of [...footnotes].reverse())
      usage =
        usage.slice(0, match.index) +
        "\n" +
        usage.slice(match.index + match[0].length);
    const used = new Set(
      [...usage.matchAll(/\[\^([^\]\r\n]+)\]/g)]
        .filter((match) => {
          let escapes = 0;
          for (let i = match.index - 1; i >= 0 && usage[i] === "\\"; i--)
            escapes++;
          return escapes % 2 === 0;
        })
        .map((match) => footnoteKey(match[1])),
    );
    for (const match of [...footnotes].reverse()) {
      const replacement = used.has(footnoteKey(match[1]))
        ? match[0].replace(/^ {0,3}\[\^[^\]\r\n]+\]:/, "")
        : match[0].replace(/[^\r\n]/g, "");
      text =
        text.slice(0, match.index) +
        replacement +
        text.slice(match.index + match[0].length);
    }
  }
  const opening = /\[/g;
  let result = "";
  let cursor = 0;
  let match;
  while ((match = opening.exec(text))) {
    let escapes = 0;
    for (let index = match.index - 1; text[index] === "\\"; index--) escapes++;
    if (escapes % 2) continue;
    let labelEnd = opening.lastIndex;
    let labelDepth = 1;
    for (; labelEnd < text.length; labelEnd++) {
      if (escapedMarkdownPunctuation(text, labelEnd)) labelEnd++;
      else if (text[labelEnd] === "[") labelDepth++;
      else if (text[labelEnd] === "]" && --labelDepth === 0) break;
    }
    if (labelDepth || text[labelEnd + 1] !== "(") continue;
    const label = text.slice(opening.lastIndex, labelEnd);
    // Blank lines terminate a Markdown link label; keep its destination literal.
    if (/\r?\n[ \t]*\r?\n/.test(label)) continue;
    let end = labelEnd + 2;
    let depth = 0;
    let valid = true;
    const skipWhitespace = () => {
      let lineEndings = 0;
      while (/[ \t\r\n]/.test(text[end] || "")) {
        if (text[end] === "\r" || text[end] === "\n") {
          lineEndings++;
          if (text[end] === "\r" && text[end + 1] === "\n") end++;
        }
        end++;
      }
      if (lineEndings > 1) valid = false;
    };
    skipWhitespace();
    // Destinations and optional titles have separate Markdown grammar. A title
    // may contain whitespace, but malformed destination text stays literal.
    if (text[end] === "<") {
      end++;
      while (end < text.length && text[end] !== ">") {
        if (escapedMarkdownPunctuation(text, end)) end++;
        else if (/[<\r\n]/.test(text[end])) valid = false;
        end++;
      }
      if (text[end] !== ">") valid = false;
      end++;
    } else {
      for (; end < text.length; end++) {
        if (escapedMarkdownPunctuation(text, end)) end++;
        else if (/[ \t\r\n]/.test(text[end])) break;
        else if (/[\x00-\x1f\x7f]/.test(text[end])) valid = false;
        else if (text[end] === "(") {
          depth++;
          if (depth > 32) valid = false;
        } else if (text[end] === ")") {
          if (depth === 0) break;
          depth--;
        } else if (text[end] === "<") valid = false;
      }
      if (depth) valid = false;
    }
    if (/[ \t\r\n]/.test(text[end] || "")) {
      skipWhitespace();
      if (text[end] !== ")") {
        const delimiter = text[end];
        const closing = delimiter === "(" ? ")" : delimiter;
        if (!['"', "'", "("].includes(delimiter)) valid = false;
        else {
          end++;
          const titleStart = end;
          for (; end < text.length && text[end] !== closing; end++) {
            if (escapedMarkdownPunctuation(text, end)) end++;
            else if (delimiter === "(" && text[end] === "(") valid = false;
          }
          if (/\r?\n[ \t]*\r?\n/.test(text.slice(titleStart, end)))
            valid = false;
          if (text[end] !== closing) valid = false;
          end++;
          skipWhitespace();
        }
      }
    }
    if (!valid || text[end] !== ")") continue;
    end++;
    let imageEscapes = 0;
    for (let index = match.index - 2; text[index] === "\\"; index--)
      imageEscapes++;
    const image = text[match.index - 1] === "!" && imageEscapes % 2 === 0;
    if (activeLinkOnly && image) {
      opening.lastIndex = end;
      continue;
    }
    // An active inner link wins over an enclosing link. Preserve the invalid
    // outer destination instead of hiding literal blocker text there.
    if (!image && visibleLinkLabels(label, true)) continue;
    if (activeLinkOnly) return true;
    result += text.slice(cursor, match.index) + label;
    cursor = end;
    opening.lastIndex = end;
  }
  return activeLinkOnly ? false : result + text.slice(cursor);
};
// Complete GFM inline HTML tags; malformed tag-like text remains visible.
const completeHtmlTag =
  /^(?:<\/[A-Za-z][A-Za-z0-9-]*\s*>|<[A-Za-z][A-Za-z0-9-]*(?:\s+[A-Za-z_:][A-Za-z0-9_.:-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*\s*\/?>)$/;

function htmlTagText(text, separator) {
  let result = "";
  const rawCode = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "<" && /^<\/?[a-z]/i.test(text.slice(i))) {
      let quote = null;
      let end = i + 1;
      for (; end < text.length; end++) {
        const char = text[end];
        if (quote) {
          if (char === quote) quote = null;
        } else if (char === '"' || char === "'") quote = char;
        else if (char === ">") break;
      }
      if (end < text.length) {
        const tag = text.slice(i, end + 1);
        if (!completeHtmlTag.test(tag)) {
          result += text[i];
          continue;
        }
        const codeTag = tag.match(/^<(\/?)(code|pre)\b/i);
        if (codeTag) {
          const name = codeTag[2].toLowerCase();
          if (!codeTag[1]) rawCode.push(name);
          else if (rawCode.at(-1) === name) rawCode.pop();
        }
        const alt = /^<img\b/i.test(tag)
          ? tag.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
          : null;
        result +=
          separator + (alt ? (alt[1] ?? alt[2] ?? alt[3]) : "") + separator;
        i = end;
        continue;
      }
    }
    result += rawCode.length && text[i] === "[" ? "&#91;" : text[i];
  }
  return result;
}

const markdownContainerContent = (original) => {
  let line = original;
  while (true) {
    const next = line
      .replace(/^ {0,3}>[ \t]?/, "")
      .replace(/^ {0,3}(?:[-+*]|[0-9]{1,9}[.)])[ \t]+/, "");
    if (next === line) return line;
    line = next;
  }
};

function rawHtmlBlockEnd(line) {
  const start = markdownContainerContent(line).replace(/^ {0,3}/, "");
  const special = start.match(/^<(script|pre|style|textarea)(?:\s|>|$)/i);
  const blockTag =
    /^(?:<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?>|$))/i;
  // Complete other open/close tags are GFM type 7 blocks.
  const completeTag =
    /^<\/?[A-Za-z][A-Za-z0-9-]*(?:\s+[A-Za-z_:][A-Za-z0-9_.:-]*(?:\s*=\s*(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\s"'=<>`]+))?)*\s*\/?>\s*$/;
  if (start.startsWith("<!--")) return /-->/;
  if (special) return new RegExp("</" + special[1] + "\\s*>", "i");
  else if (start.startsWith("<?")) return /\?>/;
  else if (start.startsWith("<![CDATA[")) return /\]\]>/;
  else if (/^<![A-Z]/.test(start)) return />/;
  else if (blockTag.test(start) || completeTag.test(start)) return "blank";
  return null;
}

function protectLiteralCode(source) {
  const literals = [];
  const save = (value) => "\uE000" + (literals.push(value) - 1) + "\uE001";
  let fence = null;
  let comment = false;
  // Code spans may contain newlines. Shield their raw contents before any
  // HTML, entity or link interpretation, including spans adjacent to HTML.
  let spans = "";
  let htmlBlock = null;
  const raw = String(source)
    .split(/(\r?\n)/)
    .map((line) => {
      if (/^\r?\n$/.test(line)) return line;
      if (htmlBlock === "blank" && !markdownContainerContent(line).trim()) {
        htmlBlock = null;
        return line;
      }
      if (!htmlBlock) htmlBlock = rawHtmlBlockEnd(line);
      if (!htmlBlock) return line;
      const literal = line.replace(/[\[`]/g, save);
      if (htmlBlock !== "blank" && htmlBlock.test(line)) htmlBlock = null;
      return literal;
    })
    .join("");
  for (let i = 0; i < raw.length; i++) {
    if (raw.startsWith("<!--", i)) {
      const end = raw.indexOf("-->", i + 4);
      const stop = end < 0 ? raw.length : end + 3;
      spans += raw.slice(i, stop);
      i = stop - 1;
      continue;
    }
    if (raw[i] === "`") {
      let escapes = 0;
      for (let before = i - 1; before >= 0 && raw[before] === "\\"; before--)
        escapes++;
      if (escapes % 2) {
        spans += raw[i];
        continue;
      }
      let run = 1;
      while (raw[i + run] === "`") run++;
      let end = i + run;
      while ((end = raw.indexOf("`".repeat(run), end)) >= 0) {
        if (raw[end - 1] !== "`" && raw[end + run] !== "`") break;
        end += run;
      }
      if (end >= 0) {
        spans += save(raw.slice(i + run, end));
        i = end + run - 1;
        continue;
      }
      spans += "`".repeat(run);
      i += run - 1;
      continue;
    }
    spans += raw[i];
  }
  const text = spans
    .split(/(\r?\n)/)
    .map((originalLine) => {
      // Block quotes are Markdown containers; code inside them remains literal.
      const line = markdownContainerContent(originalLine);
      if (/^\r?\n$/.test(line)) return line;
      if (fence) {
        const close = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
        if (
          close &&
          close[1][0] === fence[0] &&
          close[1].length >= fence.length &&
          !close[2].trim()
        ) {
          fence = null;
          return "";
        }
        return save(line);
      }
      // A fence in an HTML comment is presentation comment text, not code context.
      const open = !comment && line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (open) {
        fence = open[1];
        return "";
      }
      if (!comment && /^(?: {4}|\t)/.test(line)) return save(line);
      let result = "";
      for (let i = 0; i < line.length; i++) {
        if (comment) {
          if (line.startsWith("-->", i)) {
            result += "-->";
            i += 2;
            comment = false;
          } else result += line[i];
          continue;
        }
        if (line.startsWith("<!--", i)) {
          result += "<!--";
          i += 3;
          comment = true;
          continue;
        }
        if (line[i] === "`") {
          let escapes = 0;
          for (
            let before = i - 1;
            before >= 0 && line[before] === "\\";
            before--
          )
            escapes++;
          if (escapes % 2) {
            result += line[i];
            continue;
          }
          let run = 1;
          while (line[i + run] === "`") run++;
          let end = i + run;
          while ((end = line.indexOf("`".repeat(run), end)) >= 0) {
            if (line[end - 1] !== "`" && line[end + run] !== "`") break;
            end += run;
          }
          if (end >= 0) {
            result += save(line.slice(i + run, end));
            i = end + run - 1;
            continue;
          }
        }
        result += line[i];
      }
      return result;
    })
    .join("");
  return {
    text,
    restore: (value) => {
      for (let depth = 0; depth < literals.length; depth++) {
        const next = value.replace(
          /\uE000([0-9]+)\uE001/g,
          (marker, index) => literals[Number(index)] ?? marker,
        );
        if (next === value) break;
        value = next;
      }
      return value;
    },
  };
}

// HTML raw blocks accept semicolonless numeric references; Markdown does not.
// Add the terminator only after literal code is shielded and before structural
// HTML/link tokenization, so decoded entities can never create source markers.
const htmlNumericReferences = (source) => {
  let block = null;
  return source
    .split(/(\r?\n)/)
    .map((line) => {
      if (/^\r?\n$/.test(line)) return line;
      if (block === "blank" && !markdownContainerContent(line).trim()) {
        block = null;
        return line;
      }
      if (!block) block = rawHtmlBlockEnd(line);
      if (!block) return line;
      const text = line.replace(/&#(?:x[0-9a-f]+|[0-9]+);?/gi, (entity) =>
        entity.endsWith(";") ? entity : entity + ";",
      );
      if (block !== "blank" && block.test(line)) block = null;
      return text;
    })
    .join("");
};

// Visible warnings use one literal-code-aware projection. Structure is read
// before entities; raw protocol, JSON, SHA and completion clocks are untouched.
const renderedVisibleText = (text, formatSeparator = "") => {
  const literal = protectLiteralCode(text);
  const raw = htmlNumericReferences(literal.text).replace(
    /<!--[\s\S]*?(?:-->|$)/g,
    (comment) => comment.replace(/[^\r\n]/g, ""),
  );
  const projected = visibleLinkLabels(htmlTagText(raw, formatSeparator))
    .replace(/&#(?:x([0-9a-f]+)|([0-9]+));/gi, (entity, hex, decimal) => {
      const point = Number.parseInt(hex || decimal, hex ? 16 : 10);
      return point > 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : entity;
    })
    .replace(
      /&(?:nbsp|NonBreakingSpace|ensp|emsp|emsp13|emsp14|numsp|puncsp|thinsp|ThinSpace|hairsp|VeryThinSpace|MediumSpace|ThickSpace|Tab|NewLine);/gi,
      " ",
    )
    .replace(
      /&(?:af|ApplyFunction|ic|InvisibleComma|InvisibleTimes|it|lrm|NegativeMediumSpace|NegativeThickSpace|NegativeThinSpace|NegativeVeryThinSpace|NoBreak|rlm|shy|ZeroWidthSpace|zwj|zwnj);/gi,
      "\u200b",
    )
    .replace(/&nbsp;?/gi, " ")
    .replace(/&shy;?/gi, "\u00ad")
    .replace(/\p{Default_Ignorable_Code_Point}/gu, formatSeparator)
    .replace(/[*_~]/g, "");
  return literal.restore(projected);
};
const hasPositiveFindingStatement = (text) => {
  const paragraphs = text
    .replace(/\r\n?/g, "\n")
    .split(/\n[ \t]*\n/)
    .map((paragraph) => paragraph.replace(/\n/g, " "))
    .join("\n\n");
  return [
    ...paragraphs.matchAll(
      /\b(?:found|there[ \t]+(?:is|are))[ \t]+([^.!?\r\n]*)/gi,
    ),
  ].some((statement) =>
    [...statement[1].matchAll(/(.*?)\bissues?\b/gi)].some((clause) => {
      const count = clause[1]
        .trim()
        .replace(/^(?:[,;:]\s*)?(?:and|but|or)\b\s*/i, "");
      return !/^(?:no|zero|0)\b/i.test(count);
    }),
  );
};
const hasVisibleContradiction = (text) =>
  ["", " "].some((separator) => {
    const visible = renderedVisibleText(text, separator);
    return (
      /\b(?:P[0-2]|do\s+not\s+merge)\b/i.test(visible) ||
      hasPositiveFindingStatement(visible)
    );
  });

// A structured snapshot is authoritative only with one closed-schema machine
// record and the matching native visible table. Prose and reactions are not proof.
export const parseCodexState = (
  body,
  head,
  { sectionHeads = false, negativeEnvelope = false } = {},
) => {
  if (!/^[a-f0-9]{40}$/.test(head || "")) return false;
  const rawMarkerLine = String(body || "").match(
    /^[^\r\n]*<!-- codex-pull-request-review-summary -->[^\r\n]*$/m,
  )?.[0];
  if (
    !/^ {0,3}<!-- codex-pull-request-review-summary -->[ \t]*$/.test(
      rawMarkerLine || "",
    )
  )
    return false;
  const rawHeading = String(body || "").match(
    /^[^\r\n]*## Codex Review Summary[ \t]*\r?$/m,
  )?.[0];
  if (!/^ {0,3}## Codex Review Summary[ \t]*\r?$/.test(rawHeading || ""))
    return false;

  if (
    /^(?: {4}|[ \t]*\t)[ \t\uFEFF]*<!--\s*codex-(?:pull-request-review-summary|review-state|review-receipt)/m.test(
      (negativeEnvelope
        ? String(body || "").split(
            /^ {0,3}## Codex Review Summary[ \t]*\r?$/m,
          )[0]
        : String(body || "")
      ).replace(/^\uFEFF/, ""),
    )
  )
    return false;
  const source = sectionHeads
    ? String(body || "")
        .replace(/<!--[\s\S]*?-->/g, (comment, offset, raw) => {
          const linePrefix = raw.slice(
            raw.lastIndexOf("\n", offset - 1) + 1,
            offset,
          );
          const indentedCode = /^(?: {4}|[ \t]*\t)/.test(linePrefix);
          return /^<!--\s*codex-/i.test(comment) ||
            indentedCode ||
            /(?:^|[^\\])(?:\\\\)*\|/.test(comment)
            ? comment
            : comment.replace(/[^\r\n]/g, "");
        })
        .trim()
    : String(body || "").trim();
  // Comment removal must not turn a code-indented or BOM-prefixed heading
  // into live Markdown. Validate the effective line before capture trimming.
  const effectiveHeading = source.match(
    /^[^\r\n]*## Codex Review Summary[ \t]*\r?$/m,
  )?.[0];
  if (!/^ {0,3}## Codex Review Summary[ \t]*\r?$/.test(effectiveHeading || ""))
    return false;
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
  if (negativeEnvelope) {
    if (!/^## Codex Review Summary(?:\r?\n|$)/.test(visible)) return false;
    // A strict leading envelope can establish findings even when later
    // presentation is ambiguous. It never establishes clean or clearing facts.
    const rows = Object.values(state).filter(
      (review) => !inactiveReview(review),
    ).length;
    const visibleLines = visible
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const sectionRows = visibleLines.filter((line) =>
      /^\| (?:📝|🔒|🛡️) \*\*(?:Code Review|Security Review)\*\* \|/.test(line),
    );
    const canonicalVisible = visibleLines.slice(0, 4 + rows).join("\n");
    const canonical =
      !hasVisibleContradiction(visible) &&
      sectionRows.length === rows &&
      visibleLines.filter((line) => line.includes("|")).length === rows + 2 &&
      parseCodexState(
        source.slice(0, source.length - match[2].length) + canonicalVisible,
        head,
        { sectionHeads: true },
      );
    return { state, times: canonical ? canonical.times : {} };
  }
  if (hasVisibleContradiction(visible)) return false;
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
      parsed = parseCodexState(entry.body || "", head, {
        sectionHeads: true,
        negativeEnvelope: true,
      });
      negativeOnly = true;
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
