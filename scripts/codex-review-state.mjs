// Unicode 16.0 full case-fold exceptions to per-code-point lowercase.
const unicodeCaseFold = Object.freeze({
  "\u00b5": "\u03bc",
  "\u00df": "ss",
  "\u0149": "\u02bcn",
  "\u017f": "s",
  "\u01f0": "j\u030c",
  "\u0345": "\u03b9",
  "\u0390": "\u03b9\u0308\u0301",
  "\u03b0": "\u03c5\u0308\u0301",
  "\u03c2": "\u03c3",
  "\u03d0": "\u03b2",
  "\u03d1": "\u03b8",
  "\u03d5": "\u03c6",
  "\u03d6": "\u03c0",
  "\u03f0": "\u03ba",
  "\u03f1": "\u03c1",
  "\u03f5": "\u03b5",
  "\u0587": "\u0565\u0582",
  "\u13a0": "\u13a0",
  "\u13a1": "\u13a1",
  "\u13a2": "\u13a2",
  "\u13a3": "\u13a3",
  "\u13a4": "\u13a4",
  "\u13a5": "\u13a5",
  "\u13a6": "\u13a6",
  "\u13a7": "\u13a7",
  "\u13a8": "\u13a8",
  "\u13a9": "\u13a9",
  "\u13aa": "\u13aa",
  "\u13ab": "\u13ab",
  "\u13ac": "\u13ac",
  "\u13ad": "\u13ad",
  "\u13ae": "\u13ae",
  "\u13af": "\u13af",
  "\u13b0": "\u13b0",
  "\u13b1": "\u13b1",
  "\u13b2": "\u13b2",
  "\u13b3": "\u13b3",
  "\u13b4": "\u13b4",
  "\u13b5": "\u13b5",
  "\u13b6": "\u13b6",
  "\u13b7": "\u13b7",
  "\u13b8": "\u13b8",
  "\u13b9": "\u13b9",
  "\u13ba": "\u13ba",
  "\u13bb": "\u13bb",
  "\u13bc": "\u13bc",
  "\u13bd": "\u13bd",
  "\u13be": "\u13be",
  "\u13bf": "\u13bf",
  "\u13c0": "\u13c0",
  "\u13c1": "\u13c1",
  "\u13c2": "\u13c2",
  "\u13c3": "\u13c3",
  "\u13c4": "\u13c4",
  "\u13c5": "\u13c5",
  "\u13c6": "\u13c6",
  "\u13c7": "\u13c7",
  "\u13c8": "\u13c8",
  "\u13c9": "\u13c9",
  "\u13ca": "\u13ca",
  "\u13cb": "\u13cb",
  "\u13cc": "\u13cc",
  "\u13cd": "\u13cd",
  "\u13ce": "\u13ce",
  "\u13cf": "\u13cf",
  "\u13d0": "\u13d0",
  "\u13d1": "\u13d1",
  "\u13d2": "\u13d2",
  "\u13d3": "\u13d3",
  "\u13d4": "\u13d4",
  "\u13d5": "\u13d5",
  "\u13d6": "\u13d6",
  "\u13d7": "\u13d7",
  "\u13d8": "\u13d8",
  "\u13d9": "\u13d9",
  "\u13da": "\u13da",
  "\u13db": "\u13db",
  "\u13dc": "\u13dc",
  "\u13dd": "\u13dd",
  "\u13de": "\u13de",
  "\u13df": "\u13df",
  "\u13e0": "\u13e0",
  "\u13e1": "\u13e1",
  "\u13e2": "\u13e2",
  "\u13e3": "\u13e3",
  "\u13e4": "\u13e4",
  "\u13e5": "\u13e5",
  "\u13e6": "\u13e6",
  "\u13e7": "\u13e7",
  "\u13e8": "\u13e8",
  "\u13e9": "\u13e9",
  "\u13ea": "\u13ea",
  "\u13eb": "\u13eb",
  "\u13ec": "\u13ec",
  "\u13ed": "\u13ed",
  "\u13ee": "\u13ee",
  "\u13ef": "\u13ef",
  "\u13f0": "\u13f0",
  "\u13f1": "\u13f1",
  "\u13f2": "\u13f2",
  "\u13f3": "\u13f3",
  "\u13f4": "\u13f4",
  "\u13f5": "\u13f5",
  "\u13f8": "\u13f0",
  "\u13f9": "\u13f1",
  "\u13fa": "\u13f2",
  "\u13fb": "\u13f3",
  "\u13fc": "\u13f4",
  "\u13fd": "\u13f5",
  "\u1c80": "\u0432",
  "\u1c81": "\u0434",
  "\u1c82": "\u043e",
  "\u1c83": "\u0441",
  "\u1c84": "\u0442",
  "\u1c85": "\u0442",
  "\u1c86": "\u044a",
  "\u1c87": "\u0463",
  "\u1c88": "\ua64b",
  "\u1e96": "h\u0331",
  "\u1e97": "t\u0308",
  "\u1e98": "w\u030a",
  "\u1e99": "y\u030a",
  "\u1e9a": "a\u02be",
  "\u1e9b": "\u1e61",
  "\u1e9e": "ss",
  "\u1f50": "\u03c5\u0313",
  "\u1f52": "\u03c5\u0313\u0300",
  "\u1f54": "\u03c5\u0313\u0301",
  "\u1f56": "\u03c5\u0313\u0342",
  "\u1f80": "\u1f00\u03b9",
  "\u1f81": "\u1f01\u03b9",
  "\u1f82": "\u1f02\u03b9",
  "\u1f83": "\u1f03\u03b9",
  "\u1f84": "\u1f04\u03b9",
  "\u1f85": "\u1f05\u03b9",
  "\u1f86": "\u1f06\u03b9",
  "\u1f87": "\u1f07\u03b9",
  "\u1f88": "\u1f00\u03b9",
  "\u1f89": "\u1f01\u03b9",
  "\u1f8a": "\u1f02\u03b9",
  "\u1f8b": "\u1f03\u03b9",
  "\u1f8c": "\u1f04\u03b9",
  "\u1f8d": "\u1f05\u03b9",
  "\u1f8e": "\u1f06\u03b9",
  "\u1f8f": "\u1f07\u03b9",
  "\u1f90": "\u1f20\u03b9",
  "\u1f91": "\u1f21\u03b9",
  "\u1f92": "\u1f22\u03b9",
  "\u1f93": "\u1f23\u03b9",
  "\u1f94": "\u1f24\u03b9",
  "\u1f95": "\u1f25\u03b9",
  "\u1f96": "\u1f26\u03b9",
  "\u1f97": "\u1f27\u03b9",
  "\u1f98": "\u1f20\u03b9",
  "\u1f99": "\u1f21\u03b9",
  "\u1f9a": "\u1f22\u03b9",
  "\u1f9b": "\u1f23\u03b9",
  "\u1f9c": "\u1f24\u03b9",
  "\u1f9d": "\u1f25\u03b9",
  "\u1f9e": "\u1f26\u03b9",
  "\u1f9f": "\u1f27\u03b9",
  "\u1fa0": "\u1f60\u03b9",
  "\u1fa1": "\u1f61\u03b9",
  "\u1fa2": "\u1f62\u03b9",
  "\u1fa3": "\u1f63\u03b9",
  "\u1fa4": "\u1f64\u03b9",
  "\u1fa5": "\u1f65\u03b9",
  "\u1fa6": "\u1f66\u03b9",
  "\u1fa7": "\u1f67\u03b9",
  "\u1fa8": "\u1f60\u03b9",
  "\u1fa9": "\u1f61\u03b9",
  "\u1faa": "\u1f62\u03b9",
  "\u1fab": "\u1f63\u03b9",
  "\u1fac": "\u1f64\u03b9",
  "\u1fad": "\u1f65\u03b9",
  "\u1fae": "\u1f66\u03b9",
  "\u1faf": "\u1f67\u03b9",
  "\u1fb2": "\u1f70\u03b9",
  "\u1fb3": "\u03b1\u03b9",
  "\u1fb4": "\u03ac\u03b9",
  "\u1fb6": "\u03b1\u0342",
  "\u1fb7": "\u03b1\u0342\u03b9",
  "\u1fbc": "\u03b1\u03b9",
  "\u1fbe": "\u03b9",
  "\u1fc2": "\u1f74\u03b9",
  "\u1fc3": "\u03b7\u03b9",
  "\u1fc4": "\u03ae\u03b9",
  "\u1fc6": "\u03b7\u0342",
  "\u1fc7": "\u03b7\u0342\u03b9",
  "\u1fcc": "\u03b7\u03b9",
  "\u1fd2": "\u03b9\u0308\u0300",
  "\u1fd3": "\u03b9\u0308\u0301",
  "\u1fd6": "\u03b9\u0342",
  "\u1fd7": "\u03b9\u0308\u0342",
  "\u1fe2": "\u03c5\u0308\u0300",
  "\u1fe3": "\u03c5\u0308\u0301",
  "\u1fe4": "\u03c1\u0313",
  "\u1fe6": "\u03c5\u0342",
  "\u1fe7": "\u03c5\u0308\u0342",
  "\u1ff2": "\u1f7c\u03b9",
  "\u1ff3": "\u03c9\u03b9",
  "\u1ff4": "\u03ce\u03b9",
  "\u1ff6": "\u03c9\u0342",
  "\u1ff7": "\u03c9\u0342\u03b9",
  "\u1ffc": "\u03c9\u03b9",
  "\uab70": "\u13a0",
  "\uab71": "\u13a1",
  "\uab72": "\u13a2",
  "\uab73": "\u13a3",
  "\uab74": "\u13a4",
  "\uab75": "\u13a5",
  "\uab76": "\u13a6",
  "\uab77": "\u13a7",
  "\uab78": "\u13a8",
  "\uab79": "\u13a9",
  "\uab7a": "\u13aa",
  "\uab7b": "\u13ab",
  "\uab7c": "\u13ac",
  "\uab7d": "\u13ad",
  "\uab7e": "\u13ae",
  "\uab7f": "\u13af",
  "\uab80": "\u13b0",
  "\uab81": "\u13b1",
  "\uab82": "\u13b2",
  "\uab83": "\u13b3",
  "\uab84": "\u13b4",
  "\uab85": "\u13b5",
  "\uab86": "\u13b6",
  "\uab87": "\u13b7",
  "\uab88": "\u13b8",
  "\uab89": "\u13b9",
  "\uab8a": "\u13ba",
  "\uab8b": "\u13bb",
  "\uab8c": "\u13bc",
  "\uab8d": "\u13bd",
  "\uab8e": "\u13be",
  "\uab8f": "\u13bf",
  "\uab90": "\u13c0",
  "\uab91": "\u13c1",
  "\uab92": "\u13c2",
  "\uab93": "\u13c3",
  "\uab94": "\u13c4",
  "\uab95": "\u13c5",
  "\uab96": "\u13c6",
  "\uab97": "\u13c7",
  "\uab98": "\u13c8",
  "\uab99": "\u13c9",
  "\uab9a": "\u13ca",
  "\uab9b": "\u13cb",
  "\uab9c": "\u13cc",
  "\uab9d": "\u13cd",
  "\uab9e": "\u13ce",
  "\uab9f": "\u13cf",
  "\uaba0": "\u13d0",
  "\uaba1": "\u13d1",
  "\uaba2": "\u13d2",
  "\uaba3": "\u13d3",
  "\uaba4": "\u13d4",
  "\uaba5": "\u13d5",
  "\uaba6": "\u13d6",
  "\uaba7": "\u13d7",
  "\uaba8": "\u13d8",
  "\uaba9": "\u13d9",
  "\uabaa": "\u13da",
  "\uabab": "\u13db",
  "\uabac": "\u13dc",
  "\uabad": "\u13dd",
  "\uabae": "\u13de",
  "\uabaf": "\u13df",
  "\uabb0": "\u13e0",
  "\uabb1": "\u13e1",
  "\uabb2": "\u13e2",
  "\uabb3": "\u13e3",
  "\uabb4": "\u13e4",
  "\uabb5": "\u13e5",
  "\uabb6": "\u13e6",
  "\uabb7": "\u13e7",
  "\uabb8": "\u13e8",
  "\uabb9": "\u13e9",
  "\uabba": "\u13ea",
  "\uabbb": "\u13eb",
  "\uabbc": "\u13ec",
  "\uabbd": "\u13ed",
  "\uabbe": "\u13ee",
  "\uabbf": "\u13ef",
  "\ufb00": "ff",
  "\ufb01": "fi",
  "\ufb02": "fl",
  "\ufb03": "ffi",
  "\ufb04": "ffl",
  "\ufb05": "st",
  "\ufb06": "st",
  "\ufb13": "\u0574\u0576",
  "\ufb14": "\u0574\u0565",
  "\ufb15": "\u0574\u056b",
  "\ufb16": "\u057e\u0576",
  "\ufb17": "\u0574\u056d",
});

const caseFoldLabel = (label) =>
  Array.from(
    label,
    (character) => unicodeCaseFold[character] ?? character.toLowerCase(),
  ).join("");

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
// Suppress only definition ranges accepted by the existing destination/title validator.
const withoutReferenceDefinitionUsage = (source, validDefinition) =>
  source.replace(
    /^ {0,3}\[([^\]\r\n]+)\]:[ \t]*([^\r\n]+)(?:(\r\n|\r|\n)([ \t]+["'(][^\r\n]*))?$/gm,
    (definition, label, destination, newline, title) => {
      if (title && validDefinition(label, destination + newline + title))
        return definition.replace(/[^\r\n]/g, "");
      const firstLine = definition.slice(
        0,
        definition.length - (title ? newline.length + title.length : 0),
      );
      return validDefinition(label, destination)
        ? firstLine.replace(/[^\r\n]/g, "") + (title ? newline + title : "")
        : definition;
    },
  );

const visibleLinkLabels = (
  text,
  activeLinkOnly = false,
  skipFootnotes = false,
) => {
  const footnoteKey = (label) =>
    caseFoldLabel(label.trim().replace(/\s+/g, " "));
  if (!activeLinkOnly && !skipFootnotes) {
    // Invalid footnote labels can still be valid ordinary link definitions.
    text = text.replace(
      /^ {0,3}\[\^([^\]\r\n]+)\]:[ \t]*([^\r\n]+)$/gm,
      (definition, label, destination) => {
        if (!/[\x00-\x20]/.test(label)) return definition;
        return visibleLinkLabels("[^" + label + "](" + destination + ")", true)
          ? definition.replace(/[^\r\n]/g, "")
          : definition;
      },
    );
    const footnotes = [
      ...text.matchAll(
        /^ {0,3}\[\^([^\[\]\x00-\x20]+)\]:[^\r\n]*(?:(?:\r\n|\r|\n)(?: {2,}|\t)[^\r\n]*)*/gm,
      ),
    ];
    const references = (source) => {
      const usage = withoutReferenceDefinitionUsage(
        source,
        (label, destination) =>
          visibleLinkLabels("[" + label + "](" + destination + ")", true),
      );
      const content = visibleLinkLabels(usage, false, true);
      return [...content.matchAll(/\[\^([^\[\]\x00-\x20]+)\]/g)]
        .filter((match) => {
          let escapes = 0;
          for (let i = match.index - 1; i >= 0 && content[i] === "\\"; i--)
            escapes++;
          return escapes % 2 === 0;
        })
        .map((match) => footnoteKey(match[1]));
    };
    let usage = text;
    for (const match of [...footnotes].reverse())
      usage =
        usage.slice(0, match.index) +
        "\n" +
        usage.slice(match.index + match[0].length);
    const used = new Set(references(usage));
    const visited = new Set();
    for (const label of used) {
      if (visited.has(label)) continue;
      visited.add(label);
      const definition = footnotes.find(
        (match) => footnoteKey(match[1]) === label,
      );
      if (definition)
        for (const reference of references(
          definition[0].replace(/^ {0,3}\[\^[^\]\r\n]+\]:/, ""),
        ))
          used.add(reference);
    }
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
  if (!activeLinkOnly)
    text = withoutReferenceDefinitionUsage(text, (label, destination) =>
      visibleLinkLabels("[" + label + "](" + destination + ")", true),
    );
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

function htmlTagText(text, separator, blockBoundaries = false) {
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
        const boundary = /^<br(?:\s|\/?>)/i.test(tag)
          ? " "
          : blockBoundaries &&
              /^<\/?(?:address|article|aside|blockquote|center|dd|details|dialog|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|menu|nav|ol|p|pre|section|summary|table|tbody|td|tfoot|th|thead|tr|ul|br)(?:\s|\/?>)/i.test(
                tag,
              )
            ? "\n\n"
            : separator;
        result +=
          boundary + (alt ? (alt[1] ?? alt[2] ?? alt[3]) : "") + boundary;
        i = end;
        continue;
      }
    }
    result += rawCode.length && text[i] === "[" ? "&#91;" : text[i];
  }
  return result;
}

function indentationColumns(prefix) {
  return Array.from(prefix).reduce(
    (column, character) => column + (character === "\t" ? 4 - (column % 4) : 1),
    0,
  );
}

function consumeIndentationColumns(line, required) {
  let column = 0,
    index = 0;
  while (column < required && /[ \t]/.test(line[index] || "x")) {
    column += line[index++] === "\t" ? 4 - (column % 4) : 1;
  }
  return column < required
    ? null
    : " ".repeat(column - required) + line.slice(index);
}

// HTML tokenizer comment endings, including abrupt empty-comment closure.
function htmlCommentEnd(source, start) {
  if (source.startsWith("<!-->", start)) return start + 5;
  if (source.startsWith("<!--->", start)) return start + 6;
  const close = /--!?>/g;
  close.lastIndex = start + 4;
  const match = close.exec(source);
  return match ? match.index + match[0].length : null;
}

function withoutHtmlComments(source) {
  let result = "",
    cursor = 0,
    start;
  while ((start = source.indexOf("<!--", cursor)) >= 0) {
    const end = htmlCommentEnd(source, start) ?? source.length;
    result +=
      source.slice(cursor, start) +
      source.slice(start, end).replace(/[^\r\n]/g, "");
    cursor = end;
  }
  return result + source.slice(cursor);
}

function markdownContainerContext(line) {
  const frames = [];
  while (true) {
    const quote = line.match(/^ {0,3}>[ \t]?/);
    if (quote) {
      frames.push({ kind: "quote" });
      line = line.slice(quote[0].length);
      continue;
    }
    const list = line.match(/^ {0,3}(?:[-+*]|[0-9]{1,9}[.)])[ \t]+/);
    if (list) {
      frames.push({ kind: "list", width: indentationColumns(list[0]) });
      line = line.slice(list[0].length);
      continue;
    }
    return { content: line, frames };
  }
}

function markdownContainerContinuation(line, frames) {
  for (const frame of frames) {
    if (frame.kind === "list") {
      line = consumeIndentationColumns(line, frame.width);
      if (line === null) return null;
    } else {
      const prefix = line.match(/^ {0,3}>[ \t]?/);
      if (!prefix) return null;
      line = line.slice(prefix[0].length);
    }
  }
  return line;
}

function markdownContainerContent(line) {
  return markdownContainerContext(line).content;
}

function markdownTableCells(line) {
  const value = String(line).trim();
  const cells = [];
  let cursor = 0;
  for (let index = 0; index < value.length; index++)
    if (
      value[index] === "|" &&
      (value.slice(0, index).match(/\\+$/)?.[0].length || 0) % 2 === 0
    ) {
      cells.push(value.slice(cursor, index).trim());
      cursor = index + 1;
    }
  if (!cells.length) return null;
  cells.push(value.slice(cursor).trim());
  if (value.startsWith("|")) cells.shift();
  if (
    value.endsWith("|") &&
    (value.slice(0, -1).match(/\\+$/)?.[0].length || 0) % 2 === 0
  )
    cells.pop();
  return cells;
}

function isMarkdownTableBoundary(header, delimiter) {
  const heading = markdownTableCells(header),
    cells = markdownTableCells(delimiter);
  return Boolean(
    heading &&
    cells &&
    heading.length === cells.length &&
    cells.length &&
    cells.every((cell) => /^:?-+:?$/.test(cell)),
  );
}

function rawHtmlBlockEnd(line, inParagraph = false) {
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
  else if (blockTag.test(start) || (!inParagraph && completeTag.test(start)))
    return "blank";
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
  let htmlContainer = null;
  let paragraphFrames = null;
  let tableActive = false,
    previousContent = "";
  const raw = String(source)
    .split(/(\r?\n)/)
    .map((line) => {
      if (/^\r?\n$/.test(line)) return line;
      const context = markdownContainerContext(line);
      if (
        paragraphFrames &&
        markdownContainerContinuation(line, paragraphFrames) === null
      )
        paragraphFrames = null;
      let content = htmlBlock
        ? markdownContainerContinuation(line, htmlContainer.frames)
        : context.content;
      if (content === null) {
        htmlBlock = null;
        htmlContainer = null;
        content = context.content;
      }
      if (htmlBlock === "blank" && !content.trim()) {
        htmlBlock = null;
        paragraphFrames = null;
        return line;
      }
      if (!htmlBlock) {
        htmlBlock = rawHtmlBlockEnd(content, paragraphFrames !== null);
        if (htmlBlock) htmlContainer = context;
      }
      if (isMarkdownTableBoundary(previousContent, content)) tableActive = true;
      else if (tableActive && !content.includes("|")) tableActive = false;
      previousContent = content;
      paragraphFrames =
        (!paragraphFrames &&
          indentationColumns(content.match(/^[ \t]*/)[0]) >= 4) ||
        tableActive ||
        htmlBlock ||
        !content.trim() ||
        /^ {0,3}(?:#{1,6}(?:[ \t]|$)|`{3,}|~{3,}|(?:[-*_][ \t]*){3,}$|\|)/.test(
          content,
        )
          ? null
          : context.frames;
      if (!htmlBlock) return line;
      const literal = line.replace(/[\[`*_~]/g, save);
      if (htmlBlock !== "blank" && htmlBlock.test(content)) htmlBlock = null;
      return literal;
    })
    .join("");
  for (let i = 0; i < raw.length; i++) {
    if (raw.startsWith("<!--", i)) {
      const stop = htmlCommentEnd(raw, i) ?? raw.length;
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
      if (!comment && /^(?: {4}|\t)/.test(line)) {
        const indent = line.match(/^[ \t]+/)[0];
        return indent + save(line.slice(indent.length));
      }
      let result = "";
      for (let i = 0; i < line.length; i++) {
        if (comment) {
          const close = /--!?>/.exec(line.slice(i));
          if (!close) {
            result += line.slice(i);
            break;
          }
          const stop = i + close.index + close[0].length;
          result += line.slice(i, stop);
          i = stop - 1;
          comment = false;
          continue;
        }
        if (line.startsWith("<!--", i)) {
          const end = htmlCommentEnd(line, i);
          result += line.slice(i, end ?? line.length);
          if (end === null) {
            comment = true;
            break;
          }
          i = end - 1;
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

// Legacy names accepted without a semicolon by the HTML tokenizer.
// https://html.spec.whatwg.org/multipage/named-characters.html
const HTML_LEGACY_NAMES = [
  "Aacute",
  "Agrave",
  "Atilde",
  "Ccedil",
  "Eacute",
  "Egrave",
  "Iacute",
  "Igrave",
  "Ntilde",
  "Oacute",
  "Ograve",
  "Oslash",
  "Otilde",
  "Uacute",
  "Ugrave",
  "Yacute",
  "aacute",
  "agrave",
  "atilde",
  "brvbar",
  "ccedil",
  "curren",
  "divide",
  "eacute",
  "egrave",
  "frac12",
  "frac14",
  "frac34",
  "iacute",
  "igrave",
  "iquest",
  "middot",
  "ntilde",
  "oacute",
  "ograve",
  "oslash",
  "otilde",
  "plusmn",
  "uacute",
  "ugrave",
  "yacute",
  "AElig",
  "Acirc",
  "Aring",
  "Ecirc",
  "Icirc",
  "Ocirc",
  "THORN",
  "Ucirc",
  "acirc",
  "acute",
  "aelig",
  "aring",
  "cedil",
  "ecirc",
  "icirc",
  "iexcl",
  "laquo",
  "micro",
  "ocirc",
  "pound",
  "raquo",
  "szlig",
  "thorn",
  "times",
  "ucirc",
  "Auml",
  "COPY",
  "Euml",
  "Iuml",
  "Ouml",
  "QUOT",
  "Uuml",
  "auml",
  "cent",
  "copy",
  "euml",
  "iuml",
  "macr",
  "nbsp",
  "ordf",
  "ordm",
  "ouml",
  "para",
  "quot",
  "sect",
  "sup1",
  "sup2",
  "sup3",
  "uuml",
  "yuml",
  "AMP",
  "ETH",
  "REG",
  "amp",
  "deg",
  "eth",
  "not",
  "reg",
  "shy",
  "uml",
  "yen",
  "GT",
  "LT",
  "gt",
  "lt",
];

// HTML raw blocks accept semicolonless references; Markdown does not.
// Add the terminator only after literal code is shielded and before structural
// HTML/link tokenization, so decoded entities can never create source markers.
const htmlRawReferences = (source) => {
  let block = null;
  let htmlContainer = null;
  let paragraphFrames = null;
  let tableActive = false,
    previousContent = "";
  return source
    .split(/(\r?\n)/)
    .map((line) => {
      if (/^\r?\n$/.test(line)) return line;
      const context = markdownContainerContext(line);
      if (
        paragraphFrames &&
        markdownContainerContinuation(line, paragraphFrames) === null
      )
        paragraphFrames = null;
      let content = block
        ? markdownContainerContinuation(line, htmlContainer.frames)
        : context.content;
      if (content === null) {
        block = null;
        htmlContainer = null;
        content = context.content;
      }
      if (block === "blank" && !content.trim()) {
        block = null;
        paragraphFrames = null;
        return line;
      }
      if (!block) {
        block = rawHtmlBlockEnd(content, paragraphFrames !== null);
        if (block) htmlContainer = context;
      }
      if (isMarkdownTableBoundary(previousContent, content)) tableActive = true;
      else if (tableActive && !content.includes("|")) tableActive = false;
      previousContent = content;
      paragraphFrames =
        (!paragraphFrames &&
          indentationColumns(content.match(/^[ \t]*/)[0]) >= 4) ||
        tableActive ||
        block ||
        !content.trim() ||
        /^ {0,3}(?:#{1,6}(?:[ \t]|$)|`{3,}|~{3,}|(?:[-*_][ \t]*){3,}$|\|)/.test(
          content,
        )
          ? null
          : context.frames;
      if (!block) return line;
      const text = line
        .replace(/&#(?:x[0-9a-f]+|[0-9]+);?/gi, (entity) =>
          entity.endsWith(";") ? entity : entity + ";",
        )
        .replace(/&([A-Za-z][A-Za-z0-9]*)(;?)/g, (entity, name, end) => {
          if (end && Object.hasOwn(HTML_NAMED_ENTITIES, name)) return entity;
          // Preserve the longest valid name and leave any trailing text literal.
          // Only add a terminator: decoding still happens after source structure.
          const prefix = HTML_LEGACY_NAMES.find((legacy) =>
            name.startsWith(legacy),
          );
          return prefix
            ? "&" + prefix + ";" + name.slice(prefix.length) + end
            : entity;
        });
      if (block !== "blank" && block.test(content)) block = null;
      return text;
    })
    .join("");
};

// Visible warnings use one literal-code-aware projection. Structure is read
// before entities; raw protocol, JSON, SHA and completion clocks are untouched.
// CommonMark delimiter runs: flanking, intraword underscores, and rule of three.
function activeMarkdownEmphasis(text) {
  const removed = new Set();
  const runs = [];
  const whitespace = (value) => !value || /\s/u.test(value);
  const punctuation = (value) => !!value && /[\p{P}\p{S}]/u.test(value);
  const escaped = (index) =>
    (text.slice(0, index).match(/\\+$/)?.[0].length || 0) % 2 === 1;
  // Matched code-span delimiters disappear; their literal content is protected
  // by the existing code-context stage before this projection.
  const ticks = [...text.matchAll(/`+/g)];
  let consumed = 0;
  for (let i = 0; i < ticks.length; i += 1) {
    const start = ticks[i];
    if (start.index < consumed || escaped(start.index)) continue;
    const end = ticks
      .slice(i + 1)
      .find((run) => run[0].length === start[0].length);
    if (!end) continue;
    for (let j = 0; j < start[0].length; j += 1) {
      removed.add(start.index + j);
      removed.add(end.index + j);
    }
    consumed = end.index + end[0].length;
  }
  for (const match of text.matchAll(/\*+|_+|~{2,}/g)) {
    if (escaped(match.index)) continue;
    const beforeIndex =
      match.index -
      (match.index >= 2 &&
      /[\uDC00-\uDFFF]/.test(text[match.index - 1]) &&
      /[\uD800-\uDBFF]/.test(text[match.index - 2])
        ? 2
        : 1);
    const before =
      beforeIndex >= 0
        ? String.fromCodePoint(text.codePointAt(beforeIndex))
        : "";
    const afterIndex = match.index + match[0].length;
    const after =
      afterIndex < text.length
        ? String.fromCodePoint(text.codePointAt(afterIndex))
        : "";
    const left =
      !whitespace(after) &&
      (!punctuation(after) || whitespace(before) || punctuation(before));
    const right =
      !whitespace(before) &&
      (!punctuation(before) || whitespace(after) || punctuation(after));
    runs.push({
      character: match[0][0],
      start: match.index,
      length: match[0].length,
      usedOpen: 0,
      usedClose: 0,
      open:
        match[0][0] === "_" ? left && (!right || punctuation(before)) : left,
      close:
        match[0][0] === "_" ? right && (!left || punctuation(after)) : right,
    });
  }
  const eligibleOpeners = new Map();
  for (let closeIndex = 0; closeIndex < runs.length; closeIndex += 1) {
    const closer = runs[closeIndex];
    const candidates = eligibleOpeners.get(closer.character) || [];
    if (closer.close)
      for (
        let candidate = candidates.length - 1;
        candidate >= 0 &&
        closer.length - closer.usedClose >= (closer.character === "~" ? 2 : 1);
        candidate -= 1
      ) {
        const openIndex = candidates[candidate];
        const opener = runs[openIndex];
        if (
          !opener.open ||
          opener.character !== closer.character ||
          /\r?\n[ \t\f\v]*\r?\n/.test(text.slice(opener.start, closer.start))
        )
          continue;
        let availableOpen = opener.length - opener.usedOpen - opener.usedClose;
        let availableClose = closer.length - closer.usedOpen - closer.usedClose;
        if (availableOpen < (closer.character === "~" ? 2 : 1)) continue;
        if (
          closer.character !== "~" &&
          (opener.close || closer.open) &&
          (availableOpen + availableClose) % 3 === 0 &&
          (availableOpen % 3 !== 0 || availableClose % 3 !== 0)
        )
          continue;
        while (
          availableOpen >= (closer.character === "~" ? 2 : 1) &&
          availableClose >= (closer.character === "~" ? 2 : 1)
        ) {
          const count = availableOpen >= 2 && availableClose >= 2 ? 2 : 1;
          for (let j = 0; j < count; j += 1) {
            removed.add(opener.start + opener.length - opener.usedOpen - 1 - j);
            removed.add(closer.start + closer.usedClose + j);
          }
          opener.usedOpen += count;
          closer.usedClose += count;
          for (let nested = openIndex + 1; nested < closeIndex; nested += 1) {
            runs[nested].open = false;
            runs[nested].close = false;
          }
          availableOpen -= count;
          availableClose -= count;
        }
      }
    if (closer.open) {
      candidates.push(closeIndex);
      eligibleOpeners.set(closer.character, candidates);
    }
  }
  return text
    .split("")
    .map((character, index) => (removed.has(index) ? "" : character))
    .join("");
}

const HTML_NAMED_ENTITIES = Object.freeze({
  AElig: "\u00c6",
  AMP: "&",
  Aacute: "\u00c1",
  Abreve: "\u0102",
  Acirc: "\u00c2",
  Acy: "\u0410",
  Afr: "\ud835\udd04",
  Agrave: "\u00c0",
  Alpha: "\u0391",
  Amacr: "\u0100",
  And: "\u2a53",
  Aogon: "\u0104",
  Aopf: "\ud835\udd38",
  ApplyFunction: "\u2061",
  Aring: "\u00c5",
  Ascr: "\ud835\udc9c",
  Assign: "\u2254",
  Atilde: "\u00c3",
  Auml: "\u00c4",
  Backslash: "\u2216",
  Barv: "\u2ae7",
  Barwed: "\u2306",
  Bcy: "\u0411",
  Because: "\u2235",
  Bernoullis: "\u212c",
  Beta: "\u0392",
  Bfr: "\ud835\udd05",
  Bopf: "\ud835\udd39",
  Breve: "\u02d8",
  Bscr: "\u212c",
  Bumpeq: "\u224e",
  CHcy: "\u0427",
  COPY: "\u00a9",
  Cacute: "\u0106",
  Cap: "\u22d2",
  CapitalDifferentialD: "\u2145",
  Cayleys: "\u212d",
  Ccaron: "\u010c",
  Ccedil: "\u00c7",
  Ccirc: "\u0108",
  Cconint: "\u2230",
  Cdot: "\u010a",
  Cedilla: "\u00b8",
  CenterDot: "\u00b7",
  Cfr: "\u212d",
  Chi: "\u03a7",
  CircleDot: "\u2299",
  CircleMinus: "\u2296",
  CirclePlus: "\u2295",
  CircleTimes: "\u2297",
  ClockwiseContourIntegral: "\u2232",
  CloseCurlyDoubleQuote: "\u201d",
  CloseCurlyQuote: "\u2019",
  Colon: "\u2237",
  Colone: "\u2a74",
  Congruent: "\u2261",
  Conint: "\u222f",
  ContourIntegral: "\u222e",
  Copf: "\u2102",
  Coproduct: "\u2210",
  CounterClockwiseContourIntegral: "\u2233",
  Cross: "\u2a2f",
  Cscr: "\ud835\udc9e",
  Cup: "\u22d3",
  CupCap: "\u224d",
  DD: "\u2145",
  DDotrahd: "\u2911",
  DJcy: "\u0402",
  DScy: "\u0405",
  DZcy: "\u040f",
  Dagger: "\u2021",
  Darr: "\u21a1",
  Dashv: "\u2ae4",
  Dcaron: "\u010e",
  Dcy: "\u0414",
  Del: "\u2207",
  Delta: "\u0394",
  Dfr: "\ud835\udd07",
  DiacriticalAcute: "\u00b4",
  DiacriticalDot: "\u02d9",
  DiacriticalDoubleAcute: "\u02dd",
  DiacriticalGrave: "`",
  DiacriticalTilde: "\u02dc",
  Diamond: "\u22c4",
  DifferentialD: "\u2146",
  Dopf: "\ud835\udd3b",
  Dot: "\u00a8",
  DotDot: "\u20dc",
  DotEqual: "\u2250",
  DoubleContourIntegral: "\u222f",
  DoubleDot: "\u00a8",
  DoubleDownArrow: "\u21d3",
  DoubleLeftArrow: "\u21d0",
  DoubleLeftRightArrow: "\u21d4",
  DoubleLeftTee: "\u2ae4",
  DoubleLongLeftArrow: "\u27f8",
  DoubleLongLeftRightArrow: "\u27fa",
  DoubleLongRightArrow: "\u27f9",
  DoubleRightArrow: "\u21d2",
  DoubleRightTee: "\u22a8",
  DoubleUpArrow: "\u21d1",
  DoubleUpDownArrow: "\u21d5",
  DoubleVerticalBar: "\u2225",
  DownArrow: "\u2193",
  DownArrowBar: "\u2913",
  DownArrowUpArrow: "\u21f5",
  DownBreve: "\u0311",
  DownLeftRightVector: "\u2950",
  DownLeftTeeVector: "\u295e",
  DownLeftVector: "\u21bd",
  DownLeftVectorBar: "\u2956",
  DownRightTeeVector: "\u295f",
  DownRightVector: "\u21c1",
  DownRightVectorBar: "\u2957",
  DownTee: "\u22a4",
  DownTeeArrow: "\u21a7",
  Downarrow: "\u21d3",
  Dscr: "\ud835\udc9f",
  Dstrok: "\u0110",
  ENG: "\u014a",
  ETH: "\u00d0",
  Eacute: "\u00c9",
  Ecaron: "\u011a",
  Ecirc: "\u00ca",
  Ecy: "\u042d",
  Edot: "\u0116",
  Efr: "\ud835\udd08",
  Egrave: "\u00c8",
  Element: "\u2208",
  Emacr: "\u0112",
  EmptySmallSquare: "\u25fb",
  EmptyVerySmallSquare: "\u25ab",
  Eogon: "\u0118",
  Eopf: "\ud835\udd3c",
  Epsilon: "\u0395",
  Equal: "\u2a75",
  EqualTilde: "\u2242",
  Equilibrium: "\u21cc",
  Escr: "\u2130",
  Esim: "\u2a73",
  Eta: "\u0397",
  Euml: "\u00cb",
  Exists: "\u2203",
  ExponentialE: "\u2147",
  Fcy: "\u0424",
  Ffr: "\ud835\udd09",
  FilledSmallSquare: "\u25fc",
  FilledVerySmallSquare: "\u25aa",
  Fopf: "\ud835\udd3d",
  ForAll: "\u2200",
  Fouriertrf: "\u2131",
  Fscr: "\u2131",
  GJcy: "\u0403",
  GT: ">",
  Gamma: "\u0393",
  Gammad: "\u03dc",
  Gbreve: "\u011e",
  Gcedil: "\u0122",
  Gcirc: "\u011c",
  Gcy: "\u0413",
  Gdot: "\u0120",
  Gfr: "\ud835\udd0a",
  Gg: "\u22d9",
  Gopf: "\ud835\udd3e",
  GreaterEqual: "\u2265",
  GreaterEqualLess: "\u22db",
  GreaterFullEqual: "\u2267",
  GreaterGreater: "\u2aa2",
  GreaterLess: "\u2277",
  GreaterSlantEqual: "\u2a7e",
  GreaterTilde: "\u2273",
  Gscr: "\ud835\udca2",
  Gt: "\u226b",
  HARDcy: "\u042a",
  Hacek: "\u02c7",
  Hat: "^",
  Hcirc: "\u0124",
  Hfr: "\u210c",
  HilbertSpace: "\u210b",
  Hopf: "\u210d",
  HorizontalLine: "\u2500",
  Hscr: "\u210b",
  Hstrok: "\u0126",
  HumpDownHump: "\u224e",
  HumpEqual: "\u224f",
  IEcy: "\u0415",
  IJlig: "\u0132",
  IOcy: "\u0401",
  Iacute: "\u00cd",
  Icirc: "\u00ce",
  Icy: "\u0418",
  Idot: "\u0130",
  Ifr: "\u2111",
  Igrave: "\u00cc",
  Im: "\u2111",
  Imacr: "\u012a",
  ImaginaryI: "\u2148",
  Implies: "\u21d2",
  Int: "\u222c",
  Integral: "\u222b",
  Intersection: "\u22c2",
  InvisibleComma: "\u2063",
  InvisibleTimes: "\u2062",
  Iogon: "\u012e",
  Iopf: "\ud835\udd40",
  Iota: "\u0399",
  Iscr: "\u2110",
  Itilde: "\u0128",
  Iukcy: "\u0406",
  Iuml: "\u00cf",
  Jcirc: "\u0134",
  Jcy: "\u0419",
  Jfr: "\ud835\udd0d",
  Jopf: "\ud835\udd41",
  Jscr: "\ud835\udca5",
  Jsercy: "\u0408",
  Jukcy: "\u0404",
  KHcy: "\u0425",
  KJcy: "\u040c",
  Kappa: "\u039a",
  Kcedil: "\u0136",
  Kcy: "\u041a",
  Kfr: "\ud835\udd0e",
  Kopf: "\ud835\udd42",
  Kscr: "\ud835\udca6",
  LJcy: "\u0409",
  LT: "<",
  Lacute: "\u0139",
  Lambda: "\u039b",
  Lang: "\u27ea",
  Laplacetrf: "\u2112",
  Larr: "\u219e",
  Lcaron: "\u013d",
  Lcedil: "\u013b",
  Lcy: "\u041b",
  LeftAngleBracket: "\u27e8",
  LeftArrow: "\u2190",
  LeftArrowBar: "\u21e4",
  LeftArrowRightArrow: "\u21c6",
  LeftCeiling: "\u2308",
  LeftDoubleBracket: "\u27e6",
  LeftDownTeeVector: "\u2961",
  LeftDownVector: "\u21c3",
  LeftDownVectorBar: "\u2959",
  LeftFloor: "\u230a",
  LeftRightArrow: "\u2194",
  LeftRightVector: "\u294e",
  LeftTee: "\u22a3",
  LeftTeeArrow: "\u21a4",
  LeftTeeVector: "\u295a",
  LeftTriangle: "\u22b2",
  LeftTriangleBar: "\u29cf",
  LeftTriangleEqual: "\u22b4",
  LeftUpDownVector: "\u2951",
  LeftUpTeeVector: "\u2960",
  LeftUpVector: "\u21bf",
  LeftUpVectorBar: "\u2958",
  LeftVector: "\u21bc",
  LeftVectorBar: "\u2952",
  Leftarrow: "\u21d0",
  Leftrightarrow: "\u21d4",
  LessEqualGreater: "\u22da",
  LessFullEqual: "\u2266",
  LessGreater: "\u2276",
  LessLess: "\u2aa1",
  LessSlantEqual: "\u2a7d",
  LessTilde: "\u2272",
  Lfr: "\ud835\udd0f",
  Ll: "\u22d8",
  Lleftarrow: "\u21da",
  Lmidot: "\u013f",
  LongLeftArrow: "\u27f5",
  LongLeftRightArrow: "\u27f7",
  LongRightArrow: "\u27f6",
  Longleftarrow: "\u27f8",
  Longleftrightarrow: "\u27fa",
  Longrightarrow: "\u27f9",
  Lopf: "\ud835\udd43",
  LowerLeftArrow: "\u2199",
  LowerRightArrow: "\u2198",
  Lscr: "\u2112",
  Lsh: "\u21b0",
  Lstrok: "\u0141",
  Lt: "\u226a",
  Map: "\u2905",
  Mcy: "\u041c",
  MediumSpace: "\u205f",
  Mellintrf: "\u2133",
  Mfr: "\ud835\udd10",
  MinusPlus: "\u2213",
  Mopf: "\ud835\udd44",
  Mscr: "\u2133",
  Mu: "\u039c",
  NJcy: "\u040a",
  Nacute: "\u0143",
  Ncaron: "\u0147",
  Ncedil: "\u0145",
  Ncy: "\u041d",
  NegativeMediumSpace: "\u200b",
  NegativeThickSpace: "\u200b",
  NegativeThinSpace: "\u200b",
  NegativeVeryThinSpace: "\u200b",
  NestedGreaterGreater: "\u226b",
  NestedLessLess: "\u226a",
  NewLine: "\n",
  Nfr: "\ud835\udd11",
  NoBreak: "\u2060",
  NonBreakingSpace: "\u00a0",
  Nopf: "\u2115",
  Not: "\u2aec",
  NotCongruent: "\u2262",
  NotCupCap: "\u226d",
  NotDoubleVerticalBar: "\u2226",
  NotElement: "\u2209",
  NotEqual: "\u2260",
  NotEqualTilde: "\u2242\u0338",
  NotExists: "\u2204",
  NotGreater: "\u226f",
  NotGreaterEqual: "\u2271",
  NotGreaterFullEqual: "\u2267\u0338",
  NotGreaterGreater: "\u226b\u0338",
  NotGreaterLess: "\u2279",
  NotGreaterSlantEqual: "\u2a7e\u0338",
  NotGreaterTilde: "\u2275",
  NotHumpDownHump: "\u224e\u0338",
  NotHumpEqual: "\u224f\u0338",
  NotLeftTriangle: "\u22ea",
  NotLeftTriangleBar: "\u29cf\u0338",
  NotLeftTriangleEqual: "\u22ec",
  NotLess: "\u226e",
  NotLessEqual: "\u2270",
  NotLessGreater: "\u2278",
  NotLessLess: "\u226a\u0338",
  NotLessSlantEqual: "\u2a7d\u0338",
  NotLessTilde: "\u2274",
  NotNestedGreaterGreater: "\u2aa2\u0338",
  NotNestedLessLess: "\u2aa1\u0338",
  NotPrecedes: "\u2280",
  NotPrecedesEqual: "\u2aaf\u0338",
  NotPrecedesSlantEqual: "\u22e0",
  NotReverseElement: "\u220c",
  NotRightTriangle: "\u22eb",
  NotRightTriangleBar: "\u29d0\u0338",
  NotRightTriangleEqual: "\u22ed",
  NotSquareSubset: "\u228f\u0338",
  NotSquareSubsetEqual: "\u22e2",
  NotSquareSuperset: "\u2290\u0338",
  NotSquareSupersetEqual: "\u22e3",
  NotSubset: "\u2282\u20d2",
  NotSubsetEqual: "\u2288",
  NotSucceeds: "\u2281",
  NotSucceedsEqual: "\u2ab0\u0338",
  NotSucceedsSlantEqual: "\u22e1",
  NotSucceedsTilde: "\u227f\u0338",
  NotSuperset: "\u2283\u20d2",
  NotSupersetEqual: "\u2289",
  NotTilde: "\u2241",
  NotTildeEqual: "\u2244",
  NotTildeFullEqual: "\u2247",
  NotTildeTilde: "\u2249",
  NotVerticalBar: "\u2224",
  Nscr: "\ud835\udca9",
  Ntilde: "\u00d1",
  Nu: "\u039d",
  OElig: "\u0152",
  Oacute: "\u00d3",
  Ocirc: "\u00d4",
  Ocy: "\u041e",
  Odblac: "\u0150",
  Ofr: "\ud835\udd12",
  Ograve: "\u00d2",
  Omacr: "\u014c",
  Omega: "\u03a9",
  Omicron: "\u039f",
  Oopf: "\ud835\udd46",
  OpenCurlyDoubleQuote: "\u201c",
  OpenCurlyQuote: "\u2018",
  Or: "\u2a54",
  Oscr: "\ud835\udcaa",
  Oslash: "\u00d8",
  Otilde: "\u00d5",
  Otimes: "\u2a37",
  Ouml: "\u00d6",
  OverBar: "\u203e",
  OverBrace: "\u23de",
  OverBracket: "\u23b4",
  OverParenthesis: "\u23dc",
  PartialD: "\u2202",
  Pcy: "\u041f",
  Pfr: "\ud835\udd13",
  Phi: "\u03a6",
  Pi: "\u03a0",
  PlusMinus: "\u00b1",
  Poincareplane: "\u210c",
  Popf: "\u2119",
  Pr: "\u2abb",
  Precedes: "\u227a",
  PrecedesEqual: "\u2aaf",
  PrecedesSlantEqual: "\u227c",
  PrecedesTilde: "\u227e",
  Prime: "\u2033",
  Product: "\u220f",
  Proportion: "\u2237",
  Proportional: "\u221d",
  Pscr: "\ud835\udcab",
  Psi: "\u03a8",
  QUOT: '"',
  Qfr: "\ud835\udd14",
  Qopf: "\u211a",
  Qscr: "\ud835\udcac",
  RBarr: "\u2910",
  REG: "\u00ae",
  Racute: "\u0154",
  Rang: "\u27eb",
  Rarr: "\u21a0",
  Rarrtl: "\u2916",
  Rcaron: "\u0158",
  Rcedil: "\u0156",
  Rcy: "\u0420",
  Re: "\u211c",
  ReverseElement: "\u220b",
  ReverseEquilibrium: "\u21cb",
  ReverseUpEquilibrium: "\u296f",
  Rfr: "\u211c",
  Rho: "\u03a1",
  RightAngleBracket: "\u27e9",
  RightArrow: "\u2192",
  RightArrowBar: "\u21e5",
  RightArrowLeftArrow: "\u21c4",
  RightCeiling: "\u2309",
  RightDoubleBracket: "\u27e7",
  RightDownTeeVector: "\u295d",
  RightDownVector: "\u21c2",
  RightDownVectorBar: "\u2955",
  RightFloor: "\u230b",
  RightTee: "\u22a2",
  RightTeeArrow: "\u21a6",
  RightTeeVector: "\u295b",
  RightTriangle: "\u22b3",
  RightTriangleBar: "\u29d0",
  RightTriangleEqual: "\u22b5",
  RightUpDownVector: "\u294f",
  RightUpTeeVector: "\u295c",
  RightUpVector: "\u21be",
  RightUpVectorBar: "\u2954",
  RightVector: "\u21c0",
  RightVectorBar: "\u2953",
  Rightarrow: "\u21d2",
  Ropf: "\u211d",
  RoundImplies: "\u2970",
  Rrightarrow: "\u21db",
  Rscr: "\u211b",
  Rsh: "\u21b1",
  RuleDelayed: "\u29f4",
  SHCHcy: "\u0429",
  SHcy: "\u0428",
  SOFTcy: "\u042c",
  Sacute: "\u015a",
  Sc: "\u2abc",
  Scaron: "\u0160",
  Scedil: "\u015e",
  Scirc: "\u015c",
  Scy: "\u0421",
  Sfr: "\ud835\udd16",
  ShortDownArrow: "\u2193",
  ShortLeftArrow: "\u2190",
  ShortRightArrow: "\u2192",
  ShortUpArrow: "\u2191",
  Sigma: "\u03a3",
  SmallCircle: "\u2218",
  Sopf: "\ud835\udd4a",
  Sqrt: "\u221a",
  Square: "\u25a1",
  SquareIntersection: "\u2293",
  SquareSubset: "\u228f",
  SquareSubsetEqual: "\u2291",
  SquareSuperset: "\u2290",
  SquareSupersetEqual: "\u2292",
  SquareUnion: "\u2294",
  Sscr: "\ud835\udcae",
  Star: "\u22c6",
  Sub: "\u22d0",
  Subset: "\u22d0",
  SubsetEqual: "\u2286",
  Succeeds: "\u227b",
  SucceedsEqual: "\u2ab0",
  SucceedsSlantEqual: "\u227d",
  SucceedsTilde: "\u227f",
  SuchThat: "\u220b",
  Sum: "\u2211",
  Sup: "\u22d1",
  Superset: "\u2283",
  SupersetEqual: "\u2287",
  Supset: "\u22d1",
  THORN: "\u00de",
  TRADE: "\u2122",
  TSHcy: "\u040b",
  TScy: "\u0426",
  Tab: "\t",
  Tau: "\u03a4",
  Tcaron: "\u0164",
  Tcedil: "\u0162",
  Tcy: "\u0422",
  Tfr: "\ud835\udd17",
  Therefore: "\u2234",
  Theta: "\u0398",
  ThickSpace: "\u205f\u200a",
  ThinSpace: "\u2009",
  Tilde: "\u223c",
  TildeEqual: "\u2243",
  TildeFullEqual: "\u2245",
  TildeTilde: "\u2248",
  Topf: "\ud835\udd4b",
  TripleDot: "\u20db",
  Tscr: "\ud835\udcaf",
  Tstrok: "\u0166",
  Uacute: "\u00da",
  Uarr: "\u219f",
  Uarrocir: "\u2949",
  Ubrcy: "\u040e",
  Ubreve: "\u016c",
  Ucirc: "\u00db",
  Ucy: "\u0423",
  Udblac: "\u0170",
  Ufr: "\ud835\udd18",
  Ugrave: "\u00d9",
  Umacr: "\u016a",
  UnderBar: "_",
  UnderBrace: "\u23df",
  UnderBracket: "\u23b5",
  UnderParenthesis: "\u23dd",
  Union: "\u22c3",
  UnionPlus: "\u228e",
  Uogon: "\u0172",
  Uopf: "\ud835\udd4c",
  UpArrow: "\u2191",
  UpArrowBar: "\u2912",
  UpArrowDownArrow: "\u21c5",
  UpDownArrow: "\u2195",
  UpEquilibrium: "\u296e",
  UpTee: "\u22a5",
  UpTeeArrow: "\u21a5",
  Uparrow: "\u21d1",
  Updownarrow: "\u21d5",
  UpperLeftArrow: "\u2196",
  UpperRightArrow: "\u2197",
  Upsi: "\u03d2",
  Upsilon: "\u03a5",
  Uring: "\u016e",
  Uscr: "\ud835\udcb0",
  Utilde: "\u0168",
  Uuml: "\u00dc",
  VDash: "\u22ab",
  Vbar: "\u2aeb",
  Vcy: "\u0412",
  Vdash: "\u22a9",
  Vdashl: "\u2ae6",
  Vee: "\u22c1",
  Verbar: "\u2016",
  Vert: "\u2016",
  VerticalBar: "\u2223",
  VerticalLine: "|",
  VerticalSeparator: "\u2758",
  VerticalTilde: "\u2240",
  VeryThinSpace: "\u200a",
  Vfr: "\ud835\udd19",
  Vopf: "\ud835\udd4d",
  Vscr: "\ud835\udcb1",
  Vvdash: "\u22aa",
  Wcirc: "\u0174",
  Wedge: "\u22c0",
  Wfr: "\ud835\udd1a",
  Wopf: "\ud835\udd4e",
  Wscr: "\ud835\udcb2",
  Xfr: "\ud835\udd1b",
  Xi: "\u039e",
  Xopf: "\ud835\udd4f",
  Xscr: "\ud835\udcb3",
  YAcy: "\u042f",
  YIcy: "\u0407",
  YUcy: "\u042e",
  Yacute: "\u00dd",
  Ycirc: "\u0176",
  Ycy: "\u042b",
  Yfr: "\ud835\udd1c",
  Yopf: "\ud835\udd50",
  Yscr: "\ud835\udcb4",
  Yuml: "\u0178",
  ZHcy: "\u0416",
  Zacute: "\u0179",
  Zcaron: "\u017d",
  Zcy: "\u0417",
  Zdot: "\u017b",
  ZeroWidthSpace: "\u200b",
  Zeta: "\u0396",
  Zfr: "\u2128",
  Zopf: "\u2124",
  Zscr: "\ud835\udcb5",
  aacute: "\u00e1",
  abreve: "\u0103",
  ac: "\u223e",
  acE: "\u223e\u0333",
  acd: "\u223f",
  acirc: "\u00e2",
  acute: "\u00b4",
  acy: "\u0430",
  aelig: "\u00e6",
  af: "\u2061",
  afr: "\ud835\udd1e",
  agrave: "\u00e0",
  alefsym: "\u2135",
  aleph: "\u2135",
  alpha: "\u03b1",
  amacr: "\u0101",
  amalg: "\u2a3f",
  amp: "&",
  and: "\u2227",
  andand: "\u2a55",
  andd: "\u2a5c",
  andslope: "\u2a58",
  andv: "\u2a5a",
  ang: "\u2220",
  ange: "\u29a4",
  angle: "\u2220",
  angmsd: "\u2221",
  angmsdaa: "\u29a8",
  angmsdab: "\u29a9",
  angmsdac: "\u29aa",
  angmsdad: "\u29ab",
  angmsdae: "\u29ac",
  angmsdaf: "\u29ad",
  angmsdag: "\u29ae",
  angmsdah: "\u29af",
  angrt: "\u221f",
  angrtvb: "\u22be",
  angrtvbd: "\u299d",
  angsph: "\u2222",
  angst: "\u00c5",
  angzarr: "\u237c",
  aogon: "\u0105",
  aopf: "\ud835\udd52",
  ap: "\u2248",
  apE: "\u2a70",
  apacir: "\u2a6f",
  ape: "\u224a",
  apid: "\u224b",
  apos: "'",
  approx: "\u2248",
  approxeq: "\u224a",
  aring: "\u00e5",
  ascr: "\ud835\udcb6",
  ast: "*",
  asymp: "\u2248",
  asympeq: "\u224d",
  atilde: "\u00e3",
  auml: "\u00e4",
  awconint: "\u2233",
  awint: "\u2a11",
  bNot: "\u2aed",
  backcong: "\u224c",
  backepsilon: "\u03f6",
  backprime: "\u2035",
  backsim: "\u223d",
  backsimeq: "\u22cd",
  barvee: "\u22bd",
  barwed: "\u2305",
  barwedge: "\u2305",
  bbrk: "\u23b5",
  bbrktbrk: "\u23b6",
  bcong: "\u224c",
  bcy: "\u0431",
  bdquo: "\u201e",
  becaus: "\u2235",
  because: "\u2235",
  bemptyv: "\u29b0",
  bepsi: "\u03f6",
  bernou: "\u212c",
  beta: "\u03b2",
  beth: "\u2136",
  between: "\u226c",
  bfr: "\ud835\udd1f",
  bigcap: "\u22c2",
  bigcirc: "\u25ef",
  bigcup: "\u22c3",
  bigodot: "\u2a00",
  bigoplus: "\u2a01",
  bigotimes: "\u2a02",
  bigsqcup: "\u2a06",
  bigstar: "\u2605",
  bigtriangledown: "\u25bd",
  bigtriangleup: "\u25b3",
  biguplus: "\u2a04",
  bigvee: "\u22c1",
  bigwedge: "\u22c0",
  bkarow: "\u290d",
  blacklozenge: "\u29eb",
  blacksquare: "\u25aa",
  blacktriangle: "\u25b4",
  blacktriangledown: "\u25be",
  blacktriangleleft: "\u25c2",
  blacktriangleright: "\u25b8",
  blank: "\u2423",
  blk12: "\u2592",
  blk14: "\u2591",
  blk34: "\u2593",
  block: "\u2588",
  bne: "=\u20e5",
  bnequiv: "\u2261\u20e5",
  bnot: "\u2310",
  bopf: "\ud835\udd53",
  bot: "\u22a5",
  bottom: "\u22a5",
  bowtie: "\u22c8",
  boxDL: "\u2557",
  boxDR: "\u2554",
  boxDl: "\u2556",
  boxDr: "\u2553",
  boxH: "\u2550",
  boxHD: "\u2566",
  boxHU: "\u2569",
  boxHd: "\u2564",
  boxHu: "\u2567",
  boxUL: "\u255d",
  boxUR: "\u255a",
  boxUl: "\u255c",
  boxUr: "\u2559",
  boxV: "\u2551",
  boxVH: "\u256c",
  boxVL: "\u2563",
  boxVR: "\u2560",
  boxVh: "\u256b",
  boxVl: "\u2562",
  boxVr: "\u255f",
  boxbox: "\u29c9",
  boxdL: "\u2555",
  boxdR: "\u2552",
  boxdl: "\u2510",
  boxdr: "\u250c",
  boxh: "\u2500",
  boxhD: "\u2565",
  boxhU: "\u2568",
  boxhd: "\u252c",
  boxhu: "\u2534",
  boxminus: "\u229f",
  boxplus: "\u229e",
  boxtimes: "\u22a0",
  boxuL: "\u255b",
  boxuR: "\u2558",
  boxul: "\u2518",
  boxur: "\u2514",
  boxv: "\u2502",
  boxvH: "\u256a",
  boxvL: "\u2561",
  boxvR: "\u255e",
  boxvh: "\u253c",
  boxvl: "\u2524",
  boxvr: "\u251c",
  bprime: "\u2035",
  breve: "\u02d8",
  brvbar: "\u00a6",
  bscr: "\ud835\udcb7",
  bsemi: "\u204f",
  bsim: "\u223d",
  bsime: "\u22cd",
  bsol: "\\",
  bsolb: "\u29c5",
  bsolhsub: "\u27c8",
  bull: "\u2022",
  bullet: "\u2022",
  bump: "\u224e",
  bumpE: "\u2aae",
  bumpe: "\u224f",
  bumpeq: "\u224f",
  cacute: "\u0107",
  cap: "\u2229",
  capand: "\u2a44",
  capbrcup: "\u2a49",
  capcap: "\u2a4b",
  capcup: "\u2a47",
  capdot: "\u2a40",
  caps: "\u2229\ufe00",
  caret: "\u2041",
  caron: "\u02c7",
  ccaps: "\u2a4d",
  ccaron: "\u010d",
  ccedil: "\u00e7",
  ccirc: "\u0109",
  ccups: "\u2a4c",
  ccupssm: "\u2a50",
  cdot: "\u010b",
  cedil: "\u00b8",
  cemptyv: "\u29b2",
  cent: "\u00a2",
  centerdot: "\u00b7",
  cfr: "\ud835\udd20",
  chcy: "\u0447",
  check: "\u2713",
  checkmark: "\u2713",
  chi: "\u03c7",
  cir: "\u25cb",
  cirE: "\u29c3",
  circ: "\u02c6",
  circeq: "\u2257",
  circlearrowleft: "\u21ba",
  circlearrowright: "\u21bb",
  circledR: "\u00ae",
  circledS: "\u24c8",
  circledast: "\u229b",
  circledcirc: "\u229a",
  circleddash: "\u229d",
  cire: "\u2257",
  cirfnint: "\u2a10",
  cirmid: "\u2aef",
  cirscir: "\u29c2",
  clubs: "\u2663",
  clubsuit: "\u2663",
  colon: ":",
  colone: "\u2254",
  coloneq: "\u2254",
  comma: ",",
  commat: "@",
  comp: "\u2201",
  compfn: "\u2218",
  complement: "\u2201",
  complexes: "\u2102",
  cong: "\u2245",
  congdot: "\u2a6d",
  conint: "\u222e",
  copf: "\ud835\udd54",
  coprod: "\u2210",
  copy: "\u00a9",
  copysr: "\u2117",
  crarr: "\u21b5",
  cross: "\u2717",
  cscr: "\ud835\udcb8",
  csub: "\u2acf",
  csube: "\u2ad1",
  csup: "\u2ad0",
  csupe: "\u2ad2",
  ctdot: "\u22ef",
  cudarrl: "\u2938",
  cudarrr: "\u2935",
  cuepr: "\u22de",
  cuesc: "\u22df",
  cularr: "\u21b6",
  cularrp: "\u293d",
  cup: "\u222a",
  cupbrcap: "\u2a48",
  cupcap: "\u2a46",
  cupcup: "\u2a4a",
  cupdot: "\u228d",
  cupor: "\u2a45",
  cups: "\u222a\ufe00",
  curarr: "\u21b7",
  curarrm: "\u293c",
  curlyeqprec: "\u22de",
  curlyeqsucc: "\u22df",
  curlyvee: "\u22ce",
  curlywedge: "\u22cf",
  curren: "\u00a4",
  curvearrowleft: "\u21b6",
  curvearrowright: "\u21b7",
  cuvee: "\u22ce",
  cuwed: "\u22cf",
  cwconint: "\u2232",
  cwint: "\u2231",
  cylcty: "\u232d",
  dArr: "\u21d3",
  dHar: "\u2965",
  dagger: "\u2020",
  daleth: "\u2138",
  darr: "\u2193",
  dash: "\u2010",
  dashv: "\u22a3",
  dbkarow: "\u290f",
  dblac: "\u02dd",
  dcaron: "\u010f",
  dcy: "\u0434",
  dd: "\u2146",
  ddagger: "\u2021",
  ddarr: "\u21ca",
  ddotseq: "\u2a77",
  deg: "\u00b0",
  delta: "\u03b4",
  demptyv: "\u29b1",
  dfisht: "\u297f",
  dfr: "\ud835\udd21",
  dharl: "\u21c3",
  dharr: "\u21c2",
  diam: "\u22c4",
  diamond: "\u22c4",
  diamondsuit: "\u2666",
  diams: "\u2666",
  die: "\u00a8",
  digamma: "\u03dd",
  disin: "\u22f2",
  div: "\u00f7",
  divide: "\u00f7",
  divideontimes: "\u22c7",
  divonx: "\u22c7",
  djcy: "\u0452",
  dlcorn: "\u231e",
  dlcrop: "\u230d",
  dollar: "$",
  dopf: "\ud835\udd55",
  dot: "\u02d9",
  doteq: "\u2250",
  doteqdot: "\u2251",
  dotminus: "\u2238",
  dotplus: "\u2214",
  dotsquare: "\u22a1",
  doublebarwedge: "\u2306",
  downarrow: "\u2193",
  downdownarrows: "\u21ca",
  downharpoonleft: "\u21c3",
  downharpoonright: "\u21c2",
  drbkarow: "\u2910",
  drcorn: "\u231f",
  drcrop: "\u230c",
  dscr: "\ud835\udcb9",
  dscy: "\u0455",
  dsol: "\u29f6",
  dstrok: "\u0111",
  dtdot: "\u22f1",
  dtri: "\u25bf",
  dtrif: "\u25be",
  duarr: "\u21f5",
  duhar: "\u296f",
  dwangle: "\u29a6",
  dzcy: "\u045f",
  dzigrarr: "\u27ff",
  eDDot: "\u2a77",
  eDot: "\u2251",
  eacute: "\u00e9",
  easter: "\u2a6e",
  ecaron: "\u011b",
  ecir: "\u2256",
  ecirc: "\u00ea",
  ecolon: "\u2255",
  ecy: "\u044d",
  edot: "\u0117",
  ee: "\u2147",
  efDot: "\u2252",
  efr: "\ud835\udd22",
  eg: "\u2a9a",
  egrave: "\u00e8",
  egs: "\u2a96",
  egsdot: "\u2a98",
  el: "\u2a99",
  elinters: "\u23e7",
  ell: "\u2113",
  els: "\u2a95",
  elsdot: "\u2a97",
  emacr: "\u0113",
  empty: "\u2205",
  emptyset: "\u2205",
  emptyv: "\u2205",
  emsp: "\u2003",
  emsp13: "\u2004",
  emsp14: "\u2005",
  eng: "\u014b",
  ensp: "\u2002",
  eogon: "\u0119",
  eopf: "\ud835\udd56",
  epar: "\u22d5",
  eparsl: "\u29e3",
  eplus: "\u2a71",
  epsi: "\u03b5",
  epsilon: "\u03b5",
  epsiv: "\u03f5",
  eqcirc: "\u2256",
  eqcolon: "\u2255",
  eqsim: "\u2242",
  eqslantgtr: "\u2a96",
  eqslantless: "\u2a95",
  equals: "=",
  equest: "\u225f",
  equiv: "\u2261",
  equivDD: "\u2a78",
  eqvparsl: "\u29e5",
  erDot: "\u2253",
  erarr: "\u2971",
  escr: "\u212f",
  esdot: "\u2250",
  esim: "\u2242",
  eta: "\u03b7",
  eth: "\u00f0",
  euml: "\u00eb",
  euro: "\u20ac",
  excl: "!",
  exist: "\u2203",
  expectation: "\u2130",
  exponentiale: "\u2147",
  fallingdotseq: "\u2252",
  fcy: "\u0444",
  female: "\u2640",
  ffilig: "\ufb03",
  fflig: "\ufb00",
  ffllig: "\ufb04",
  ffr: "\ud835\udd23",
  filig: "\ufb01",
  fjlig: "fj",
  flat: "\u266d",
  fllig: "\ufb02",
  fltns: "\u25b1",
  fnof: "\u0192",
  fopf: "\ud835\udd57",
  forall: "\u2200",
  fork: "\u22d4",
  forkv: "\u2ad9",
  fpartint: "\u2a0d",
  frac12: "\u00bd",
  frac13: "\u2153",
  frac14: "\u00bc",
  frac15: "\u2155",
  frac16: "\u2159",
  frac18: "\u215b",
  frac23: "\u2154",
  frac25: "\u2156",
  frac34: "\u00be",
  frac35: "\u2157",
  frac38: "\u215c",
  frac45: "\u2158",
  frac56: "\u215a",
  frac58: "\u215d",
  frac78: "\u215e",
  frasl: "\u2044",
  frown: "\u2322",
  fscr: "\ud835\udcbb",
  gE: "\u2267",
  gEl: "\u2a8c",
  gacute: "\u01f5",
  gamma: "\u03b3",
  gammad: "\u03dd",
  gap: "\u2a86",
  gbreve: "\u011f",
  gcirc: "\u011d",
  gcy: "\u0433",
  gdot: "\u0121",
  ge: "\u2265",
  gel: "\u22db",
  geq: "\u2265",
  geqq: "\u2267",
  geqslant: "\u2a7e",
  ges: "\u2a7e",
  gescc: "\u2aa9",
  gesdot: "\u2a80",
  gesdoto: "\u2a82",
  gesdotol: "\u2a84",
  gesl: "\u22db\ufe00",
  gesles: "\u2a94",
  gfr: "\ud835\udd24",
  gg: "\u226b",
  ggg: "\u22d9",
  gimel: "\u2137",
  gjcy: "\u0453",
  gl: "\u2277",
  glE: "\u2a92",
  gla: "\u2aa5",
  glj: "\u2aa4",
  gnE: "\u2269",
  gnap: "\u2a8a",
  gnapprox: "\u2a8a",
  gne: "\u2a88",
  gneq: "\u2a88",
  gneqq: "\u2269",
  gnsim: "\u22e7",
  gopf: "\ud835\udd58",
  grave: "`",
  gscr: "\u210a",
  gsim: "\u2273",
  gsime: "\u2a8e",
  gsiml: "\u2a90",
  gt: ">",
  gtcc: "\u2aa7",
  gtcir: "\u2a7a",
  gtdot: "\u22d7",
  gtlPar: "\u2995",
  gtquest: "\u2a7c",
  gtrapprox: "\u2a86",
  gtrarr: "\u2978",
  gtrdot: "\u22d7",
  gtreqless: "\u22db",
  gtreqqless: "\u2a8c",
  gtrless: "\u2277",
  gtrsim: "\u2273",
  gvertneqq: "\u2269\ufe00",
  gvnE: "\u2269\ufe00",
  hArr: "\u21d4",
  hairsp: "\u200a",
  half: "\u00bd",
  hamilt: "\u210b",
  hardcy: "\u044a",
  harr: "\u2194",
  harrcir: "\u2948",
  harrw: "\u21ad",
  hbar: "\u210f",
  hcirc: "\u0125",
  hearts: "\u2665",
  heartsuit: "\u2665",
  hellip: "\u2026",
  hercon: "\u22b9",
  hfr: "\ud835\udd25",
  hksearow: "\u2925",
  hkswarow: "\u2926",
  hoarr: "\u21ff",
  homtht: "\u223b",
  hookleftarrow: "\u21a9",
  hookrightarrow: "\u21aa",
  hopf: "\ud835\udd59",
  horbar: "\u2015",
  hscr: "\ud835\udcbd",
  hslash: "\u210f",
  hstrok: "\u0127",
  hybull: "\u2043",
  hyphen: "\u2010",
  iacute: "\u00ed",
  ic: "\u2063",
  icirc: "\u00ee",
  icy: "\u0438",
  iecy: "\u0435",
  iexcl: "\u00a1",
  iff: "\u21d4",
  ifr: "\ud835\udd26",
  igrave: "\u00ec",
  ii: "\u2148",
  iiiint: "\u2a0c",
  iiint: "\u222d",
  iinfin: "\u29dc",
  iiota: "\u2129",
  ijlig: "\u0133",
  imacr: "\u012b",
  image: "\u2111",
  imagline: "\u2110",
  imagpart: "\u2111",
  imath: "\u0131",
  imof: "\u22b7",
  imped: "\u01b5",
  in: "\u2208",
  incare: "\u2105",
  infin: "\u221e",
  infintie: "\u29dd",
  inodot: "\u0131",
  int: "\u222b",
  intcal: "\u22ba",
  integers: "\u2124",
  intercal: "\u22ba",
  intlarhk: "\u2a17",
  intprod: "\u2a3c",
  iocy: "\u0451",
  iogon: "\u012f",
  iopf: "\ud835\udd5a",
  iota: "\u03b9",
  iprod: "\u2a3c",
  iquest: "\u00bf",
  iscr: "\ud835\udcbe",
  isin: "\u2208",
  isinE: "\u22f9",
  isindot: "\u22f5",
  isins: "\u22f4",
  isinsv: "\u22f3",
  isinv: "\u2208",
  it: "\u2062",
  itilde: "\u0129",
  iukcy: "\u0456",
  iuml: "\u00ef",
  jcirc: "\u0135",
  jcy: "\u0439",
  jfr: "\ud835\udd27",
  jmath: "\u0237",
  jopf: "\ud835\udd5b",
  jscr: "\ud835\udcbf",
  jsercy: "\u0458",
  jukcy: "\u0454",
  kappa: "\u03ba",
  kappav: "\u03f0",
  kcedil: "\u0137",
  kcy: "\u043a",
  kfr: "\ud835\udd28",
  kgreen: "\u0138",
  khcy: "\u0445",
  kjcy: "\u045c",
  kopf: "\ud835\udd5c",
  kscr: "\ud835\udcc0",
  lAarr: "\u21da",
  lArr: "\u21d0",
  lAtail: "\u291b",
  lBarr: "\u290e",
  lE: "\u2266",
  lEg: "\u2a8b",
  lHar: "\u2962",
  lacute: "\u013a",
  laemptyv: "\u29b4",
  lagran: "\u2112",
  lambda: "\u03bb",
  lang: "\u27e8",
  langd: "\u2991",
  langle: "\u27e8",
  lap: "\u2a85",
  laquo: "\u00ab",
  larr: "\u2190",
  larrb: "\u21e4",
  larrbfs: "\u291f",
  larrfs: "\u291d",
  larrhk: "\u21a9",
  larrlp: "\u21ab",
  larrpl: "\u2939",
  larrsim: "\u2973",
  larrtl: "\u21a2",
  lat: "\u2aab",
  latail: "\u2919",
  late: "\u2aad",
  lates: "\u2aad\ufe00",
  lbarr: "\u290c",
  lbbrk: "\u2772",
  lbrace: "{",
  lbrack: "[",
  lbrke: "\u298b",
  lbrksld: "\u298f",
  lbrkslu: "\u298d",
  lcaron: "\u013e",
  lcedil: "\u013c",
  lceil: "\u2308",
  lcub: "{",
  lcy: "\u043b",
  ldca: "\u2936",
  ldquo: "\u201c",
  ldquor: "\u201e",
  ldrdhar: "\u2967",
  ldrushar: "\u294b",
  ldsh: "\u21b2",
  le: "\u2264",
  leftarrow: "\u2190",
  leftarrowtail: "\u21a2",
  leftharpoondown: "\u21bd",
  leftharpoonup: "\u21bc",
  leftleftarrows: "\u21c7",
  leftrightarrow: "\u2194",
  leftrightarrows: "\u21c6",
  leftrightharpoons: "\u21cb",
  leftrightsquigarrow: "\u21ad",
  leftthreetimes: "\u22cb",
  leg: "\u22da",
  leq: "\u2264",
  leqq: "\u2266",
  leqslant: "\u2a7d",
  les: "\u2a7d",
  lescc: "\u2aa8",
  lesdot: "\u2a7f",
  lesdoto: "\u2a81",
  lesdotor: "\u2a83",
  lesg: "\u22da\ufe00",
  lesges: "\u2a93",
  lessapprox: "\u2a85",
  lessdot: "\u22d6",
  lesseqgtr: "\u22da",
  lesseqqgtr: "\u2a8b",
  lessgtr: "\u2276",
  lesssim: "\u2272",
  lfisht: "\u297c",
  lfloor: "\u230a",
  lfr: "\ud835\udd29",
  lg: "\u2276",
  lgE: "\u2a91",
  lhard: "\u21bd",
  lharu: "\u21bc",
  lharul: "\u296a",
  lhblk: "\u2584",
  ljcy: "\u0459",
  ll: "\u226a",
  llarr: "\u21c7",
  llcorner: "\u231e",
  llhard: "\u296b",
  lltri: "\u25fa",
  lmidot: "\u0140",
  lmoust: "\u23b0",
  lmoustache: "\u23b0",
  lnE: "\u2268",
  lnap: "\u2a89",
  lnapprox: "\u2a89",
  lne: "\u2a87",
  lneq: "\u2a87",
  lneqq: "\u2268",
  lnsim: "\u22e6",
  loang: "\u27ec",
  loarr: "\u21fd",
  lobrk: "\u27e6",
  longleftarrow: "\u27f5",
  longleftrightarrow: "\u27f7",
  longmapsto: "\u27fc",
  longrightarrow: "\u27f6",
  looparrowleft: "\u21ab",
  looparrowright: "\u21ac",
  lopar: "\u2985",
  lopf: "\ud835\udd5d",
  loplus: "\u2a2d",
  lotimes: "\u2a34",
  lowast: "\u2217",
  lowbar: "_",
  loz: "\u25ca",
  lozenge: "\u25ca",
  lozf: "\u29eb",
  lpar: "(",
  lparlt: "\u2993",
  lrarr: "\u21c6",
  lrcorner: "\u231f",
  lrhar: "\u21cb",
  lrhard: "\u296d",
  lrm: "\u200e",
  lrtri: "\u22bf",
  lsaquo: "\u2039",
  lscr: "\ud835\udcc1",
  lsh: "\u21b0",
  lsim: "\u2272",
  lsime: "\u2a8d",
  lsimg: "\u2a8f",
  lsqb: "[",
  lsquo: "\u2018",
  lsquor: "\u201a",
  lstrok: "\u0142",
  lt: "<",
  ltcc: "\u2aa6",
  ltcir: "\u2a79",
  ltdot: "\u22d6",
  lthree: "\u22cb",
  ltimes: "\u22c9",
  ltlarr: "\u2976",
  ltquest: "\u2a7b",
  ltrPar: "\u2996",
  ltri: "\u25c3",
  ltrie: "\u22b4",
  ltrif: "\u25c2",
  lurdshar: "\u294a",
  luruhar: "\u2966",
  lvertneqq: "\u2268\ufe00",
  lvnE: "\u2268\ufe00",
  mDDot: "\u223a",
  macr: "\u00af",
  male: "\u2642",
  malt: "\u2720",
  maltese: "\u2720",
  map: "\u21a6",
  mapsto: "\u21a6",
  mapstodown: "\u21a7",
  mapstoleft: "\u21a4",
  mapstoup: "\u21a5",
  marker: "\u25ae",
  mcomma: "\u2a29",
  mcy: "\u043c",
  mdash: "\u2014",
  measuredangle: "\u2221",
  mfr: "\ud835\udd2a",
  mho: "\u2127",
  micro: "\u00b5",
  mid: "\u2223",
  midast: "*",
  midcir: "\u2af0",
  middot: "\u00b7",
  minus: "\u2212",
  minusb: "\u229f",
  minusd: "\u2238",
  minusdu: "\u2a2a",
  mlcp: "\u2adb",
  mldr: "\u2026",
  mnplus: "\u2213",
  models: "\u22a7",
  mopf: "\ud835\udd5e",
  mp: "\u2213",
  mscr: "\ud835\udcc2",
  mstpos: "\u223e",
  mu: "\u03bc",
  multimap: "\u22b8",
  mumap: "\u22b8",
  nGg: "\u22d9\u0338",
  nGt: "\u226b\u20d2",
  nGtv: "\u226b\u0338",
  nLeftarrow: "\u21cd",
  nLeftrightarrow: "\u21ce",
  nLl: "\u22d8\u0338",
  nLt: "\u226a\u20d2",
  nLtv: "\u226a\u0338",
  nRightarrow: "\u21cf",
  nVDash: "\u22af",
  nVdash: "\u22ae",
  nabla: "\u2207",
  nacute: "\u0144",
  nang: "\u2220\u20d2",
  nap: "\u2249",
  napE: "\u2a70\u0338",
  napid: "\u224b\u0338",
  napos: "\u0149",
  napprox: "\u2249",
  natur: "\u266e",
  natural: "\u266e",
  naturals: "\u2115",
  nbsp: "\u00a0",
  nbump: "\u224e\u0338",
  nbumpe: "\u224f\u0338",
  ncap: "\u2a43",
  ncaron: "\u0148",
  ncedil: "\u0146",
  ncong: "\u2247",
  ncongdot: "\u2a6d\u0338",
  ncup: "\u2a42",
  ncy: "\u043d",
  ndash: "\u2013",
  ne: "\u2260",
  neArr: "\u21d7",
  nearhk: "\u2924",
  nearr: "\u2197",
  nearrow: "\u2197",
  nedot: "\u2250\u0338",
  nequiv: "\u2262",
  nesear: "\u2928",
  nesim: "\u2242\u0338",
  nexist: "\u2204",
  nexists: "\u2204",
  nfr: "\ud835\udd2b",
  ngE: "\u2267\u0338",
  nge: "\u2271",
  ngeq: "\u2271",
  ngeqq: "\u2267\u0338",
  ngeqslant: "\u2a7e\u0338",
  nges: "\u2a7e\u0338",
  ngsim: "\u2275",
  ngt: "\u226f",
  ngtr: "\u226f",
  nhArr: "\u21ce",
  nharr: "\u21ae",
  nhpar: "\u2af2",
  ni: "\u220b",
  nis: "\u22fc",
  nisd: "\u22fa",
  niv: "\u220b",
  njcy: "\u045a",
  nlArr: "\u21cd",
  nlE: "\u2266\u0338",
  nlarr: "\u219a",
  nldr: "\u2025",
  nle: "\u2270",
  nleftarrow: "\u219a",
  nleftrightarrow: "\u21ae",
  nleq: "\u2270",
  nleqq: "\u2266\u0338",
  nleqslant: "\u2a7d\u0338",
  nles: "\u2a7d\u0338",
  nless: "\u226e",
  nlsim: "\u2274",
  nlt: "\u226e",
  nltri: "\u22ea",
  nltrie: "\u22ec",
  nmid: "\u2224",
  nopf: "\ud835\udd5f",
  not: "\u00ac",
  notin: "\u2209",
  notinE: "\u22f9\u0338",
  notindot: "\u22f5\u0338",
  notinva: "\u2209",
  notinvb: "\u22f7",
  notinvc: "\u22f6",
  notni: "\u220c",
  notniva: "\u220c",
  notnivb: "\u22fe",
  notnivc: "\u22fd",
  npar: "\u2226",
  nparallel: "\u2226",
  nparsl: "\u2afd\u20e5",
  npart: "\u2202\u0338",
  npolint: "\u2a14",
  npr: "\u2280",
  nprcue: "\u22e0",
  npre: "\u2aaf\u0338",
  nprec: "\u2280",
  npreceq: "\u2aaf\u0338",
  nrArr: "\u21cf",
  nrarr: "\u219b",
  nrarrc: "\u2933\u0338",
  nrarrw: "\u219d\u0338",
  nrightarrow: "\u219b",
  nrtri: "\u22eb",
  nrtrie: "\u22ed",
  nsc: "\u2281",
  nsccue: "\u22e1",
  nsce: "\u2ab0\u0338",
  nscr: "\ud835\udcc3",
  nshortmid: "\u2224",
  nshortparallel: "\u2226",
  nsim: "\u2241",
  nsime: "\u2244",
  nsimeq: "\u2244",
  nsmid: "\u2224",
  nspar: "\u2226",
  nsqsube: "\u22e2",
  nsqsupe: "\u22e3",
  nsub: "\u2284",
  nsubE: "\u2ac5\u0338",
  nsube: "\u2288",
  nsubset: "\u2282\u20d2",
  nsubseteq: "\u2288",
  nsubseteqq: "\u2ac5\u0338",
  nsucc: "\u2281",
  nsucceq: "\u2ab0\u0338",
  nsup: "\u2285",
  nsupE: "\u2ac6\u0338",
  nsupe: "\u2289",
  nsupset: "\u2283\u20d2",
  nsupseteq: "\u2289",
  nsupseteqq: "\u2ac6\u0338",
  ntgl: "\u2279",
  ntilde: "\u00f1",
  ntlg: "\u2278",
  ntriangleleft: "\u22ea",
  ntrianglelefteq: "\u22ec",
  ntriangleright: "\u22eb",
  ntrianglerighteq: "\u22ed",
  nu: "\u03bd",
  num: "#",
  numero: "\u2116",
  numsp: "\u2007",
  nvDash: "\u22ad",
  nvHarr: "\u2904",
  nvap: "\u224d\u20d2",
  nvdash: "\u22ac",
  nvge: "\u2265\u20d2",
  nvgt: ">\u20d2",
  nvinfin: "\u29de",
  nvlArr: "\u2902",
  nvle: "\u2264\u20d2",
  nvlt: "<\u20d2",
  nvltrie: "\u22b4\u20d2",
  nvrArr: "\u2903",
  nvrtrie: "\u22b5\u20d2",
  nvsim: "\u223c\u20d2",
  nwArr: "\u21d6",
  nwarhk: "\u2923",
  nwarr: "\u2196",
  nwarrow: "\u2196",
  nwnear: "\u2927",
  oS: "\u24c8",
  oacute: "\u00f3",
  oast: "\u229b",
  ocir: "\u229a",
  ocirc: "\u00f4",
  ocy: "\u043e",
  odash: "\u229d",
  odblac: "\u0151",
  odiv: "\u2a38",
  odot: "\u2299",
  odsold: "\u29bc",
  oelig: "\u0153",
  ofcir: "\u29bf",
  ofr: "\ud835\udd2c",
  ogon: "\u02db",
  ograve: "\u00f2",
  ogt: "\u29c1",
  ohbar: "\u29b5",
  ohm: "\u03a9",
  oint: "\u222e",
  olarr: "\u21ba",
  olcir: "\u29be",
  olcross: "\u29bb",
  oline: "\u203e",
  olt: "\u29c0",
  omacr: "\u014d",
  omega: "\u03c9",
  omicron: "\u03bf",
  omid: "\u29b6",
  ominus: "\u2296",
  oopf: "\ud835\udd60",
  opar: "\u29b7",
  operp: "\u29b9",
  oplus: "\u2295",
  or: "\u2228",
  orarr: "\u21bb",
  ord: "\u2a5d",
  order: "\u2134",
  orderof: "\u2134",
  ordf: "\u00aa",
  ordm: "\u00ba",
  origof: "\u22b6",
  oror: "\u2a56",
  orslope: "\u2a57",
  orv: "\u2a5b",
  oscr: "\u2134",
  oslash: "\u00f8",
  osol: "\u2298",
  otilde: "\u00f5",
  otimes: "\u2297",
  otimesas: "\u2a36",
  ouml: "\u00f6",
  ovbar: "\u233d",
  par: "\u2225",
  para: "\u00b6",
  parallel: "\u2225",
  parsim: "\u2af3",
  parsl: "\u2afd",
  part: "\u2202",
  pcy: "\u043f",
  percnt: "%",
  period: ".",
  permil: "\u2030",
  perp: "\u22a5",
  pertenk: "\u2031",
  pfr: "\ud835\udd2d",
  phi: "\u03c6",
  phiv: "\u03d5",
  phmmat: "\u2133",
  phone: "\u260e",
  pi: "\u03c0",
  pitchfork: "\u22d4",
  piv: "\u03d6",
  planck: "\u210f",
  planckh: "\u210e",
  plankv: "\u210f",
  plus: "+",
  plusacir: "\u2a23",
  plusb: "\u229e",
  pluscir: "\u2a22",
  plusdo: "\u2214",
  plusdu: "\u2a25",
  pluse: "\u2a72",
  plusmn: "\u00b1",
  plussim: "\u2a26",
  plustwo: "\u2a27",
  pm: "\u00b1",
  pointint: "\u2a15",
  popf: "\ud835\udd61",
  pound: "\u00a3",
  pr: "\u227a",
  prE: "\u2ab3",
  prap: "\u2ab7",
  prcue: "\u227c",
  pre: "\u2aaf",
  prec: "\u227a",
  precapprox: "\u2ab7",
  preccurlyeq: "\u227c",
  preceq: "\u2aaf",
  precnapprox: "\u2ab9",
  precneqq: "\u2ab5",
  precnsim: "\u22e8",
  precsim: "\u227e",
  prime: "\u2032",
  primes: "\u2119",
  prnE: "\u2ab5",
  prnap: "\u2ab9",
  prnsim: "\u22e8",
  prod: "\u220f",
  profalar: "\u232e",
  profline: "\u2312",
  profsurf: "\u2313",
  prop: "\u221d",
  propto: "\u221d",
  prsim: "\u227e",
  prurel: "\u22b0",
  pscr: "\ud835\udcc5",
  psi: "\u03c8",
  puncsp: "\u2008",
  qfr: "\ud835\udd2e",
  qint: "\u2a0c",
  qopf: "\ud835\udd62",
  qprime: "\u2057",
  qscr: "\ud835\udcc6",
  quaternions: "\u210d",
  quatint: "\u2a16",
  quest: "?",
  questeq: "\u225f",
  quot: '"',
  rAarr: "\u21db",
  rArr: "\u21d2",
  rAtail: "\u291c",
  rBarr: "\u290f",
  rHar: "\u2964",
  race: "\u223d\u0331",
  racute: "\u0155",
  radic: "\u221a",
  raemptyv: "\u29b3",
  rang: "\u27e9",
  rangd: "\u2992",
  range: "\u29a5",
  rangle: "\u27e9",
  raquo: "\u00bb",
  rarr: "\u2192",
  rarrap: "\u2975",
  rarrb: "\u21e5",
  rarrbfs: "\u2920",
  rarrc: "\u2933",
  rarrfs: "\u291e",
  rarrhk: "\u21aa",
  rarrlp: "\u21ac",
  rarrpl: "\u2945",
  rarrsim: "\u2974",
  rarrtl: "\u21a3",
  rarrw: "\u219d",
  ratail: "\u291a",
  ratio: "\u2236",
  rationals: "\u211a",
  rbarr: "\u290d",
  rbbrk: "\u2773",
  rbrace: "}",
  rbrack: "]",
  rbrke: "\u298c",
  rbrksld: "\u298e",
  rbrkslu: "\u2990",
  rcaron: "\u0159",
  rcedil: "\u0157",
  rceil: "\u2309",
  rcub: "}",
  rcy: "\u0440",
  rdca: "\u2937",
  rdldhar: "\u2969",
  rdquo: "\u201d",
  rdquor: "\u201d",
  rdsh: "\u21b3",
  real: "\u211c",
  realine: "\u211b",
  realpart: "\u211c",
  reals: "\u211d",
  rect: "\u25ad",
  reg: "\u00ae",
  rfisht: "\u297d",
  rfloor: "\u230b",
  rfr: "\ud835\udd2f",
  rhard: "\u21c1",
  rharu: "\u21c0",
  rharul: "\u296c",
  rho: "\u03c1",
  rhov: "\u03f1",
  rightarrow: "\u2192",
  rightarrowtail: "\u21a3",
  rightharpoondown: "\u21c1",
  rightharpoonup: "\u21c0",
  rightleftarrows: "\u21c4",
  rightleftharpoons: "\u21cc",
  rightrightarrows: "\u21c9",
  rightsquigarrow: "\u219d",
  rightthreetimes: "\u22cc",
  ring: "\u02da",
  risingdotseq: "\u2253",
  rlarr: "\u21c4",
  rlhar: "\u21cc",
  rlm: "\u200f",
  rmoust: "\u23b1",
  rmoustache: "\u23b1",
  rnmid: "\u2aee",
  roang: "\u27ed",
  roarr: "\u21fe",
  robrk: "\u27e7",
  ropar: "\u2986",
  ropf: "\ud835\udd63",
  roplus: "\u2a2e",
  rotimes: "\u2a35",
  rpar: ")",
  rpargt: "\u2994",
  rppolint: "\u2a12",
  rrarr: "\u21c9",
  rsaquo: "\u203a",
  rscr: "\ud835\udcc7",
  rsh: "\u21b1",
  rsqb: "]",
  rsquo: "\u2019",
  rsquor: "\u2019",
  rthree: "\u22cc",
  rtimes: "\u22ca",
  rtri: "\u25b9",
  rtrie: "\u22b5",
  rtrif: "\u25b8",
  rtriltri: "\u29ce",
  ruluhar: "\u2968",
  rx: "\u211e",
  sacute: "\u015b",
  sbquo: "\u201a",
  sc: "\u227b",
  scE: "\u2ab4",
  scap: "\u2ab8",
  scaron: "\u0161",
  sccue: "\u227d",
  sce: "\u2ab0",
  scedil: "\u015f",
  scirc: "\u015d",
  scnE: "\u2ab6",
  scnap: "\u2aba",
  scnsim: "\u22e9",
  scpolint: "\u2a13",
  scsim: "\u227f",
  scy: "\u0441",
  sdot: "\u22c5",
  sdotb: "\u22a1",
  sdote: "\u2a66",
  seArr: "\u21d8",
  searhk: "\u2925",
  searr: "\u2198",
  searrow: "\u2198",
  sect: "\u00a7",
  semi: ";",
  seswar: "\u2929",
  setminus: "\u2216",
  setmn: "\u2216",
  sext: "\u2736",
  sfr: "\ud835\udd30",
  sfrown: "\u2322",
  sharp: "\u266f",
  shchcy: "\u0449",
  shcy: "\u0448",
  shortmid: "\u2223",
  shortparallel: "\u2225",
  shy: "\u00ad",
  sigma: "\u03c3",
  sigmaf: "\u03c2",
  sigmav: "\u03c2",
  sim: "\u223c",
  simdot: "\u2a6a",
  sime: "\u2243",
  simeq: "\u2243",
  simg: "\u2a9e",
  simgE: "\u2aa0",
  siml: "\u2a9d",
  simlE: "\u2a9f",
  simne: "\u2246",
  simplus: "\u2a24",
  simrarr: "\u2972",
  slarr: "\u2190",
  smallsetminus: "\u2216",
  smashp: "\u2a33",
  smeparsl: "\u29e4",
  smid: "\u2223",
  smile: "\u2323",
  smt: "\u2aaa",
  smte: "\u2aac",
  smtes: "\u2aac\ufe00",
  softcy: "\u044c",
  sol: "/",
  solb: "\u29c4",
  solbar: "\u233f",
  sopf: "\ud835\udd64",
  spades: "\u2660",
  spadesuit: "\u2660",
  spar: "\u2225",
  sqcap: "\u2293",
  sqcaps: "\u2293\ufe00",
  sqcup: "\u2294",
  sqcups: "\u2294\ufe00",
  sqsub: "\u228f",
  sqsube: "\u2291",
  sqsubset: "\u228f",
  sqsubseteq: "\u2291",
  sqsup: "\u2290",
  sqsupe: "\u2292",
  sqsupset: "\u2290",
  sqsupseteq: "\u2292",
  squ: "\u25a1",
  square: "\u25a1",
  squarf: "\u25aa",
  squf: "\u25aa",
  srarr: "\u2192",
  sscr: "\ud835\udcc8",
  ssetmn: "\u2216",
  ssmile: "\u2323",
  sstarf: "\u22c6",
  star: "\u2606",
  starf: "\u2605",
  straightepsilon: "\u03f5",
  straightphi: "\u03d5",
  strns: "\u00af",
  sub: "\u2282",
  subE: "\u2ac5",
  subdot: "\u2abd",
  sube: "\u2286",
  subedot: "\u2ac3",
  submult: "\u2ac1",
  subnE: "\u2acb",
  subne: "\u228a",
  subplus: "\u2abf",
  subrarr: "\u2979",
  subset: "\u2282",
  subseteq: "\u2286",
  subseteqq: "\u2ac5",
  subsetneq: "\u228a",
  subsetneqq: "\u2acb",
  subsim: "\u2ac7",
  subsub: "\u2ad5",
  subsup: "\u2ad3",
  succ: "\u227b",
  succapprox: "\u2ab8",
  succcurlyeq: "\u227d",
  succeq: "\u2ab0",
  succnapprox: "\u2aba",
  succneqq: "\u2ab6",
  succnsim: "\u22e9",
  succsim: "\u227f",
  sum: "\u2211",
  sung: "\u266a",
  sup: "\u2283",
  sup1: "\u00b9",
  sup2: "\u00b2",
  sup3: "\u00b3",
  supE: "\u2ac6",
  supdot: "\u2abe",
  supdsub: "\u2ad8",
  supe: "\u2287",
  supedot: "\u2ac4",
  suphsol: "\u27c9",
  suphsub: "\u2ad7",
  suplarr: "\u297b",
  supmult: "\u2ac2",
  supnE: "\u2acc",
  supne: "\u228b",
  supplus: "\u2ac0",
  supset: "\u2283",
  supseteq: "\u2287",
  supseteqq: "\u2ac6",
  supsetneq: "\u228b",
  supsetneqq: "\u2acc",
  supsim: "\u2ac8",
  supsub: "\u2ad4",
  supsup: "\u2ad6",
  swArr: "\u21d9",
  swarhk: "\u2926",
  swarr: "\u2199",
  swarrow: "\u2199",
  swnwar: "\u292a",
  szlig: "\u00df",
  target: "\u2316",
  tau: "\u03c4",
  tbrk: "\u23b4",
  tcaron: "\u0165",
  tcedil: "\u0163",
  tcy: "\u0442",
  tdot: "\u20db",
  telrec: "\u2315",
  tfr: "\ud835\udd31",
  there4: "\u2234",
  therefore: "\u2234",
  theta: "\u03b8",
  thetasym: "\u03d1",
  thetav: "\u03d1",
  thickapprox: "\u2248",
  thicksim: "\u223c",
  thinsp: "\u2009",
  thkap: "\u2248",
  thksim: "\u223c",
  thorn: "\u00fe",
  tilde: "\u02dc",
  times: "\u00d7",
  timesb: "\u22a0",
  timesbar: "\u2a31",
  timesd: "\u2a30",
  tint: "\u222d",
  toea: "\u2928",
  top: "\u22a4",
  topbot: "\u2336",
  topcir: "\u2af1",
  topf: "\ud835\udd65",
  topfork: "\u2ada",
  tosa: "\u2929",
  tprime: "\u2034",
  trade: "\u2122",
  triangle: "\u25b5",
  triangledown: "\u25bf",
  triangleleft: "\u25c3",
  trianglelefteq: "\u22b4",
  triangleq: "\u225c",
  triangleright: "\u25b9",
  trianglerighteq: "\u22b5",
  tridot: "\u25ec",
  trie: "\u225c",
  triminus: "\u2a3a",
  triplus: "\u2a39",
  trisb: "\u29cd",
  tritime: "\u2a3b",
  trpezium: "\u23e2",
  tscr: "\ud835\udcc9",
  tscy: "\u0446",
  tshcy: "\u045b",
  tstrok: "\u0167",
  twixt: "\u226c",
  twoheadleftarrow: "\u219e",
  twoheadrightarrow: "\u21a0",
  uArr: "\u21d1",
  uHar: "\u2963",
  uacute: "\u00fa",
  uarr: "\u2191",
  ubrcy: "\u045e",
  ubreve: "\u016d",
  ucirc: "\u00fb",
  ucy: "\u0443",
  udarr: "\u21c5",
  udblac: "\u0171",
  udhar: "\u296e",
  ufisht: "\u297e",
  ufr: "\ud835\udd32",
  ugrave: "\u00f9",
  uharl: "\u21bf",
  uharr: "\u21be",
  uhblk: "\u2580",
  ulcorn: "\u231c",
  ulcorner: "\u231c",
  ulcrop: "\u230f",
  ultri: "\u25f8",
  umacr: "\u016b",
  uml: "\u00a8",
  uogon: "\u0173",
  uopf: "\ud835\udd66",
  uparrow: "\u2191",
  updownarrow: "\u2195",
  upharpoonleft: "\u21bf",
  upharpoonright: "\u21be",
  uplus: "\u228e",
  upsi: "\u03c5",
  upsih: "\u03d2",
  upsilon: "\u03c5",
  upuparrows: "\u21c8",
  urcorn: "\u231d",
  urcorner: "\u231d",
  urcrop: "\u230e",
  uring: "\u016f",
  urtri: "\u25f9",
  uscr: "\ud835\udcca",
  utdot: "\u22f0",
  utilde: "\u0169",
  utri: "\u25b5",
  utrif: "\u25b4",
  uuarr: "\u21c8",
  uuml: "\u00fc",
  uwangle: "\u29a7",
  vArr: "\u21d5",
  vBar: "\u2ae8",
  vBarv: "\u2ae9",
  vDash: "\u22a8",
  vangrt: "\u299c",
  varepsilon: "\u03f5",
  varkappa: "\u03f0",
  varnothing: "\u2205",
  varphi: "\u03d5",
  varpi: "\u03d6",
  varpropto: "\u221d",
  varr: "\u2195",
  varrho: "\u03f1",
  varsigma: "\u03c2",
  varsubsetneq: "\u228a\ufe00",
  varsubsetneqq: "\u2acb\ufe00",
  varsupsetneq: "\u228b\ufe00",
  varsupsetneqq: "\u2acc\ufe00",
  vartheta: "\u03d1",
  vartriangleleft: "\u22b2",
  vartriangleright: "\u22b3",
  vcy: "\u0432",
  vdash: "\u22a2",
  vee: "\u2228",
  veebar: "\u22bb",
  veeeq: "\u225a",
  vellip: "\u22ee",
  verbar: "|",
  vert: "|",
  vfr: "\ud835\udd33",
  vltri: "\u22b2",
  vnsub: "\u2282\u20d2",
  vnsup: "\u2283\u20d2",
  vopf: "\ud835\udd67",
  vprop: "\u221d",
  vrtri: "\u22b3",
  vscr: "\ud835\udccb",
  vsubnE: "\u2acb\ufe00",
  vsubne: "\u228a\ufe00",
  vsupnE: "\u2acc\ufe00",
  vsupne: "\u228b\ufe00",
  vzigzag: "\u299a",
  wcirc: "\u0175",
  wedbar: "\u2a5f",
  wedge: "\u2227",
  wedgeq: "\u2259",
  weierp: "\u2118",
  wfr: "\ud835\udd34",
  wopf: "\ud835\udd68",
  wp: "\u2118",
  wr: "\u2240",
  wreath: "\u2240",
  wscr: "\ud835\udccc",
  xcap: "\u22c2",
  xcirc: "\u25ef",
  xcup: "\u22c3",
  xdtri: "\u25bd",
  xfr: "\ud835\udd35",
  xhArr: "\u27fa",
  xharr: "\u27f7",
  xi: "\u03be",
  xlArr: "\u27f8",
  xlarr: "\u27f5",
  xmap: "\u27fc",
  xnis: "\u22fb",
  xodot: "\u2a00",
  xopf: "\ud835\udd69",
  xoplus: "\u2a01",
  xotime: "\u2a02",
  xrArr: "\u27f9",
  xrarr: "\u27f6",
  xscr: "\ud835\udccd",
  xsqcup: "\u2a06",
  xuplus: "\u2a04",
  xutri: "\u25b3",
  xvee: "\u22c1",
  xwedge: "\u22c0",
  yacute: "\u00fd",
  yacy: "\u044f",
  ycirc: "\u0177",
  ycy: "\u044b",
  yen: "\u00a5",
  yfr: "\ud835\udd36",
  yicy: "\u0457",
  yopf: "\ud835\udd6a",
  yscr: "\ud835\udcce",
  yucy: "\u044e",
  yuml: "\u00ff",
  zacute: "\u017a",
  zcaron: "\u017e",
  zcy: "\u0437",
  zdot: "\u017c",
  zeetrf: "\u2128",
  zeta: "\u03b6",
  zfr: "\ud835\udd37",
  zhcy: "\u0436",
  zigrarr: "\u21dd",
  zopf: "\ud835\udd6b",
  zscr: "\ud835\udccf",
  zwj: "\u200d",
  zwnj: "\u200c",
});

const renderedVisibleText = (text, formatSeparator = "") => {
  const literal = protectLiteralCode(text);
  const raw = withoutHtmlComments(htmlRawReferences(literal.text));
  const projected = activeMarkdownEmphasis(
    visibleLinkLabels(htmlTagText(raw, formatSeparator, true)),
  )
    .replace(
      /&#(x[0-9a-f]+|[0-9]+);|&([A-Za-z][A-Za-z0-9]*);/gi,
      (entity, digits, name) => {
        if (name)
          return Object.hasOwn(HTML_NAMED_ENTITIES, name)
            ? HTML_NAMED_ENTITIES[name]
            : entity;
        const point =
          digits[0].toLowerCase() === "x"
            ? parseInt(digits.slice(1), 16)
            : Number(digits);
        return point > 0 &&
          point <= 0x10ffff &&
          !(point >= 0xd800 && point <= 0xdfff)
          ? String.fromCodePoint(point)
          : entity;
      },
    )
    .replace(/[^\S\r\n]/gu, " ")
    .replace(/\p{Default_Ignorable_Code_Point}/gu, formatSeparator);
  return literal.restore(projected);
};
function hasPositiveFindingStatement(text) {
  const cardinal =
    "(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[ -](?:one|two|three|four|five|six|seven|eight|nine))?)";
  const paragraphs = String(text)
    .replace(/\r\n/g, "\n")
    .split(/[\r\n][ \t\f\v]*[\r\n]/);
  return paragraphs.some((paragraph) =>
    paragraph
      .replace(/[ \t\r\n\f\v]+/g, " ")
      .replace(
        new RegExp(
          "\\b(?:no|zero) +(?:issues?|findings?|problems?|bugs?|flaws?|defects?|regressions?|vulnerabilit(?:y|ies)|security +risks?)[^.!?;]*?\\bexcept +((?:[1-9][0-9]*|some|several|multiple|" +
            cardinal +
            "))\\b([^.!?;]*)",
          "giu",
        ),
        (match, count, suffix) =>
          match +
          "; " +
          count +
          " findings" +
          (suffix.trim() ? suffix.replace(/^ *, */, " ") : " remain"),
      )
      .replace(
        /\b(no|zero) +((?:issues?|findings?|problems?|bugs?|flaws?|defects?|regressions?|vulnerabilit(?:y|ies)|security +risks?)) +(?:and|or) +(?:issues?|findings?|problems?|bugs?|flaws?|defects?|regressions?|vulnerabilit(?:y|ies)|security +risks?)\b/giu,
        "$1 $2",
      )
      .replace(
        /\b(no|zero) +(?:(?!(?:issues?|findings?|problems?|bugs?|flaws?|defects?|regressions?|vulnerabilit(?:y|ies)|security +risks?|is|are|was|were|has|have|been|get|gets|got|a|an|one|some|several|multiple)\b)[\p{L}-]+ +)+(?:and|or) +(?:(?!(?:issues?|findings?|problems?|bugs?|flaws?|defects?|regressions?|vulnerabilit(?:y|ies)|security +risks?|is|are|was|were|has|have|been|get|gets|got|a|an|one|some|several|multiple)\b)[\p{L}-]+ +)*((?:issues?|findings?|problems?|bugs?|flaws?|defects?|regressions?|vulnerabilit(?:y|ies)|security +risks?)\b)/giu,
        "$1 $2",
      )
      .split(/[.!?;]|(?<![0-9]),|,(?![0-9])|\b(?:and|or|but|however|yet)\b/i)
      .some((clause) => {
        // Negating a resolution preserves the finding, unlike negating its noun.
        clause = clause.replace(
          /\b(?:not|never) +(?:(?:be|been|being|get|gets|got|gotten|getting) +)*(?:resolved|fixed|addressed|cleared|removed|closed|eliminated|harmless|benign)\b|\b(?:is|are|was|were|has|have|had)n['’]t +(?:(?:be|been|being|get|gets|got|gotten|getting) +)*(?:resolved|fixed|addressed|cleared|removed|closed|eliminated|harmless|benign)\b/gi,
          " unresolved ",
        );
        const noun =
          "(?<![\\p{L}\\p{N}_\\p{Pd}])(?:issues?|findings?|problems?|bugs?|flaws?|defects?|regressions?|vulnerabilit(?:y|ies)|security +risks?)(?![\\p{L}\\p{N}_\\p{Pd}])(?! +(?:tests?|reports?)\\b)";
        const headingNoun = noun.replace(
          "(?![\\p{L}\\p{N}_\\p{Pd}])",
          "(?![\\p{L}\\p{N}_-])",
        );
        const isAffirmative = (match, counted = false) => {
          const before = clause.slice(0, match.index);
          const after = clause.slice(match.index + match[0].length);
          if (
            !counted &&
            /^ *(?::|[–—-]) *(?:no|none|zero|0+(?:,000)*)(?: +(?:(?:is|are|was|were|be|been|being|has|have|had|[\p{L}]+ly|now) +)*(?:found|outstanding|exist|exists|remain|remains))? *$/iu.test(
              after,
            )
          )
            return false;
          // Scope negation to this construction, not an unrelated earlier clause.
          if (
            /\b(?:no|zero|not|without|never|cannot)\b|\b[\p{L}]+n['’]t\b/iu.test(
              match[0],
            )
          )
            return false;
          if (
            /(?:\b(?:no|zero|not|without|never|cannot)|\b[\p{L}]+n['’]t)(?: +(?:be|been|being|get|gets|got|gotten|getting|considered))* +$/iu.test(
              before,
            )
          )
            return false;
          if (
            /^\s*nobody +(?:(?:can|could|may|might) +(?:[\p{L}]+ly +)*|(?:is|are) +able +to +)bypass +authentication\b/iu.test(
              match[0],
            )
          )
            return false;
          const matchedNoun = [
            ...match[0].matchAll(new RegExp(noun, "giu")),
          ].at(-1);
          const predicate = matchedNoun
            ? match[0].slice(matchedNoun.index + matchedNoun[0].length)
            : match[0];
          const modifiers = matchedNoun
            ? match[0].slice(0, matchedNoun.index)
            : "";
          const tail = predicate + after;
          const mentionContext =
            /\b(?:mention(?:s|ed|ing)?|discuss(?:es|ed|ing)?) +(?:a|an|one|some|several|multiple|the) +/iu.test(
              modifiers,
            );
          // A negative relative predicate qualifies a mentioned issue, but does
          // not cancel an independent existential/count assertion before it.
          const reportTail = mentionContext
            ? tail.replace(/^ +(?:that|which) +/iu, " ")
            : tail;
          if (!counted && /^ +as +(?:a|an) +example *$/iu.test(tail))
            return false;
          // A short regex match may end at an auxiliary (e.g. "was"). Read the
          // remaining predicate before treating that word as a finding assertion.
          // Negated resolutions have already become "unresolved" above.
          if (
            !counted &&
            /^ +(?:(?:is|are|was|were|has|have|had|do|does|did|be|been|being|get|gets|got|gotten|getting|can|could|may|might|will|would|must|should|still|now|[\p{L}]+ly) +)+(?:not|never) +(?:(?:be|been|being|get|gets|got|gotten|getting|still|now|[\p{L}]+ly) +)*(?:found|[\p{L}]+ed|open|outstanding) *$/iu.test(
              reportTail,
            )
          )
            return false;
          // Absence/resolution is evidence only for an unqualified completed assertion.
          if (
            /^ +(?:do|does|did) +not +(?:exist|exists|remain|remains) *$/iu.test(
              tail,
            )
          )
            return false;
          if (
            /\b(?:resolved|fixed|addressed|cleared|removed|closed|eliminated) +$/iu.test(
              before,
            )
          )
            return false;
          const recurrence =
            /\b(?:reappears?|reappeared|recurs?|recurred|reopens?|reopened|found +again|(?:is|are) +(?:(?:still|now|[\p{L}]+ly) +)*(?:open|outstanding|unresolved)|(?:still +)?(?:persists?|remains?|exists?))\b/iu.test(
              tail,
            ) &&
            !/\b(?:not|never) +(?:reappear|reappeared|recur|recurred|reopen|reopened|persist|remain|exist)\b/iu.test(
              tail,
            );
          if (/^ +fix(?:es)?\b/iu.test(tail) && !recurrence) return false;
          const activeMentionTail =
            /^ +(?:(?:that|which) +)?(?:(?:is|are|was|were|has|have|had|do|does|did|be|been|being|get|gets|got|gotten|getting|can|could|may|might|will|would|must|should) +|(?!(?:as|thus|perhaps)\b)(?:[\p{L}]+s|[\p{L}]+ed|[\p{L}]+ing)\b)/iu.test(
              tail,
            );
          if (mentionContext && !recurrence && !activeMentionTail) return false;
          if (
            /\b(?:resolves?|fix(?:es)?|address(?:es)?|clears?|removes?|closes?|eliminates?|prevents?|avoids?|mitigates?) +(?:a|an) +/iu.test(
              modifiers,
            ) &&
            !recurrence &&
            !tail.trim()
          )
            return false;
          const obligation =
            /\b(?:can|could|may|might|will|would|must|should) +(?:(?:be|been|being|get|gets|got) +)*(?:resolved|fixed|addressed|cleared|removed|closed|eliminated)\b/iu.test(
              tail,
            );
          if (obligation) return true;
          if (
            /\b(?:resolved|fixed|addressed|cleared|removed|closed|eliminated)\b/i.test(
              modifiers,
            ) &&
            !recurrence &&
            !/^ +(?:(?:is|are|was|were|has|have|had|be|been|being|get|gets|got|gotten|getting) +)*(?:can|could|may|might|will|would|must|should) +(?:reappear|recur|reopen)\b/iu.test(
              tail,
            )
          )
            return false;
          if (
            /^(?: +| *(?::|[–—-]) *)(?:(?:that|which) +)?(?:(?:is|are|was|were|has|have|had|be|been|being|get|gets|got|gotten|getting|still|now|already|remains?) +)*(?:resolved|fixed|addressed|cleared|removed|closed|eliminated|harmless|benign) *$/iu.test(
              tail,
            )
          )
            return false;
          return true;
        };
        const counts = [
          ...clause.matchAll(
            new RegExp(
              "(?<![\\p{L}\\p{N}_])[*_~`]*([0-9]+(?:,[0-9]{3})*)[*_~`]* +(?:[\\p{L}-]+ +)*?" +
                noun,
              "giu",
            ),
          ),
        ];
        if (
          counts.some(
            (match) =>
              !/^0+$/.test(match[1].replaceAll(",", "")) &&
              isAffirmative(match, true),
          )
        )
          return true;
        const reporting = clause.replace(
          new RegExp(
            "(?<![\\p{L}\\p{N}_])[*_~`]*0+(?:,000)*[*_~`]* +(?:[\\p{L}-]+ +)*?" +
              noun,
            "giu",
          ),
          (match) => " ".repeat(match.length),
        );
        const cardinalPattern =
          "\\b" + cardinal + " +(?:[\\p{L}-]+ +)*?" + noun;
        if (
          [...reporting.matchAll(new RegExp(cardinalPattern, "giu"))].some(
            (match) => isAffirmative(match, true),
          )
        )
          return true;
        const categoryModifiers =
          "(?:(?:code|security|blocking|critical|high|medium|low|major|minor|unresolved|open|new) +)*";
        const findingSubject =
          "(?:\\b(?:a|an|one|some|several|multiple|this|that|these|those|each|every|another|both|our|your|their|my|his|her|its|[0-9]+) +" +
          // Naming the term/category is presentation. Only category adjectives
          // may intervene: "label validation issue" is still a real finding.
          "(?!(?:words?|terms?|phrases?|labels?|headings?|names?|titles?) +" +
          categoryModifiers +
          noun +
          ")(?:[\\p{L}-]+ +)*?" +
          noun +
          "|\\bthe +" +
          categoryModifiers +
          noun +
          "|(?<![\\p{L}\\p{N}_] )" +
          categoryModifiers +
          noun +
          ")";

        const patterns = [
          "\\b(?:(?:no +(?:(?!(?:is|are|was|were|has|have|had|can|could|may|might)\\b)[\\p{L}-]+ +)*?)?[\\p{L}-]+ +)?(?:(?:can|could|may|might) +(?:[\\p{L}]+ly +)*|(?:is|are) +able +to +)bypass +authentication\\b",
          "\\b(?:is|are) +vulnerable +to\\b",
          "\\bauthentication +(?:can|could|may|might) +be +bypassed\\b",
          "\\b(?:most|every|numerous) +(?:[\\p{L}-]+ +)*?" +
            noun +
            " +(?:(?:is|are|was|were|has|have|had|be|been|being|get|gets|got|gotten|getting|still) +)*(?:found|[\\p{L}]+ed|remains?|exists?)\\b",
          "(?<![\\p{L}\\p{N}_] )\\b(?:the +)?(?:(?:critical|security|authentication|code|blocking|high|medium|low|major|minor|unresolved|open|new) +)+" +
            noun +
            " +(?:(?:is|are|was|were|has|have|had|be|been|being|get|gets|got|gotten|getting|still) +)*(?:(?:is|are|was|were) +[\\p{L}]+|found|[\\p{L}]+ed|[\\p{L}]+s|remains?|exists?)\\b",
          "\\b(?:a|an) +(?:[\\p{L}-]+ +)*?" +
            noun +
            " +(?:(?:can|could|may|might|will|would|must|should) +[\\p{L}-]+|[\\p{L}]+s)\\b",
          "\\bthe +" +
            noun +
            " +(?:(?:is|are|was|were) +[\\p{L}-]+|(?:can|could|may|might|will|would|must|should) +[\\p{L}-]+|[\\p{L}]+s)\\b",
          findingSubject +
            " +(?:(?:is|are|was|were) +[\\p{L}-]+|[\\p{L}]+s)\\b",
          "\\b(?:this|that|these|those) +(?:is|are|was|were) +(?:a|an) +(?:[\\p{L}-]+ +)*?" +
            noun,
          "(?<![\\p{L}\\p{N}_] )\\b(?:(?:a|an|one|some|several|multiple) +)?(?:(?!(?:the|this|that|these|those)\\b)[\\p{L}-]+ +)*?" +
            headingNoun +
            "(?= *(?::|[–—-]) *[^ \\t])",
          "\\b(?:found|introduces|creates|contains|has|[\\p{L}]+ed) +(?:[\\p{L}-]+ +)*?" +
            noun,
          "\\b[\\p{L}]+s +(?:a|an) +(?:[\\p{L}-]+ +)*?" + noun,
          "\\b(?:I|we) +[\\p{L}]+ +(?:a|an) +(?:[\\p{L}-]+ +)*?" + noun,
          findingSubject +
            " +(?:(?:is|are|was|were|has|have|had|be|been|being|get|gets|got|gotten|getting|still) +)*(?:found|[\\p{L}]+ed|remains?|exists?)\\b",
          "\\bthere +(?:still +)?(?:is|are) +(?:[\\p{L}-]+ +)*?" + noun,
          "\\b(?:a|an) +(?:[\\p{L}-]+ +)*?" +
            noun +
            " +(?:(?:is|are|was|were) +[\\p{L}-]+|(?!(?:is|was|has)\\b)[\\p{L}]+s)\\b",
          "\\b(?:this|that|these|those) +" +
            noun +
            " +(?:(?:is|are|was|were) +[\\p{L}-]+|(?!(?:is|was|has)\\b)[\\p{L}]+s)\\b",
          "(?:\\b(?:both|many|all) +|(?<![\\p{L}\\p{N}_] ))(?:issues|findings|problems|bugs|flaws|defects|regressions|vulnerabilities|security +risks)\\b +(?:(?:is|are|was|were) +[\\p{L}-]+|(?!(?:is|was|has)\\b)[\\p{L}]+)\\b",
        ];
        return patterns.some((pattern) =>
          [...reporting.matchAll(new RegExp(pattern, "giu"))].some((match) =>
            isAffirmative(match),
          ),
        );
      }),
  );
}

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
    const structurallyCanonical =
      sectionRows.length === rows &&
      visibleLines.filter((line) => line.includes("|")).length === rows + 2 &&
      parseCodexState(
        source.slice(0, source.length - match[2].length) +
          canonicalVisible.replace(
            /^(\|[^|]*\|[^|]+\|\s*`[a-f0-9]{7,40}`\s*\|)[^|\r\n]*(\|\s*)$/gm,
            (row, prefix, suffix) => {
              const review = prefix.includes("**Code Review**")
                ? state.code_review
                : state.security_review;
              return review?.has_any_findings === true ||
                review?.has_unresolved_findings === true
                ? prefix + " Manual request " + suffix
                : row;
            },
          ),
        head,
        { sectionHeads: true },
      );
    const times = {};
    if (structurallyCanonical) {
      for (const [section, label] of [
        ["code_review", "Code Review"],
        ["security_review", "Security Review"],
      ]) {
        const otherLabel =
          section === "code_review" ? "Security Review" : "Code Review";
        const companion = sectionRows.find((line) =>
          line.includes("**" + otherLabel + "**"),
        );
        const scoped = companion ? visible.replace(companion, "") : visible;
        if (
          !hasVisibleContradiction(scoped) &&
          state[section]?.status === "completed"
        )
          times[section] = structurallyCanonical.times[section];
      }
    }
    return { state, times };
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
    const created = Date.parse(entry.created_at || "");
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
            Number.isFinite(created) &&
            Math.floor(parsed.times[section] / 1000) >=
              Math.floor(created / 1000) &&
            parsed.times[section] < observed + 1000,
          time: Math.floor(
            (review.status === "completed" &&
            Number.isFinite(parsed.times[section]) &&
            Number.isFinite(created) &&
            Math.floor(parsed.times[section] / 1000) >=
              Math.floor(created / 1000) &&
            parsed.times[section] < observed + 1000
              ? parsed.times[section]
              : observed) / 1000,
          ),
        });
      else if (!negativeOnly && cleanReview(review, head)) {
        const completed = parsed.times[section];
        if (
          Number.isFinite(completed) &&
          Number.isFinite(created) &&
          Math.floor(completed / 1000) >= Math.floor(created / 1000) &&
          completed < observed + 1000
        )
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
            entries.every(
              (other) =>
                !other.negative ||
                other.resolved ||
                (entry.time > other.time && entry.observed > other.observed),
            ) &&
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
  const created = Date.parse(entry.created_at || "");
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
      Number.isFinite(created) &&
      Math.floor(parsed.times[section] / 1000) >= Math.floor(created / 1000) &&
      parsed.times[section] < observed + 1000
        ? Math.floor(parsed.times[section] / 1000) * 1000
        : observed,
    ),
  );
};
