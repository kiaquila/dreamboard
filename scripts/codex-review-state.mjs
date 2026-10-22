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

// HTML raw blocks accept semicolonless numeric references; Markdown does not.
// Add the terminator only after literal code is shielded and before structural
// HTML/link tokenization, so decoded entities can never create source markers.
const htmlNumericReferences = (source) => {
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
        tableActive ||
        block ||
        !content.trim() ||
        /^ {0,3}(?:#{1,6}(?:[ \t]|$)|`{3,}|~{3,}|(?:[-*_][ \t]*){3,}$|\|)/.test(
          content,
        )
          ? null
          : context.frames;
      if (!block) return line;
      const text = line.replace(/&#(?:x[0-9a-f]+|[0-9]+);?/gi, (entity) =>
        entity.endsWith(";") ? entity : entity + ";",
      );
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
    const before = [...text.slice(0, match.index)].at(-1) || "";
    const after = [...text.slice(match.index + match[0].length)][0] || "";
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
  for (let closeIndex = 0; closeIndex < runs.length; closeIndex += 1) {
    const closer = runs[closeIndex];
    if (!closer.close) continue;
    for (
      let openIndex = closeIndex - 1;
      openIndex >= 0 &&
      closer.length - closer.usedClose >= (closer.character === "~" ? 2 : 1);
      openIndex -= 1
    ) {
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
  }
  return text
    .split("")
    .map((character, index) => (removed.has(index) ? "" : character))
    .join("");
}

const renderedVisibleText = (text, formatSeparator = "") => {
  const literal = protectLiteralCode(text);
  const raw = withoutHtmlComments(htmlNumericReferences(literal.text));
  const projected = activeMarkdownEmphasis(
    visibleLinkLabels(htmlTagText(raw, formatSeparator)),
  )
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
    .replace(/\p{Default_Ignorable_Code_Point}/gu, formatSeparator);
  return literal.restore(projected);
};
function hasPositiveFindingStatement(text) {
  const paragraphs = String(text)
    .replace(/\r\n/g, "\n")
    .split(/[\r\n][ \t\f\v]*[\r\n]/);
  return paragraphs.some((paragraph) =>
    paragraph
      .replace(/[ \t\r\n\f\v]+/g, " ")
      .split(/[.!?;,]|\b(?:and|or|but|however|yet)\b/i)
      .some((clause) => {
        if (
          /\b(?:no|zero|not|without|never|cannot)\b|\b[\p{L}]+n['’]t\b/iu.test(
            clause,
          ) ||
          /\b(?:resolved|fixed|addressed|cleared|removed|closed)\b/i.test(
            clause,
          )
        )
          return false;
        const noun =
          "(?<![\\p{L}\\p{N}_\\p{Pd}])(?:issues?|findings?|problems?|bugs?)(?![\\p{L}\\p{N}_\\p{Pd}])";
        if (!new RegExp(noun, "iu").test(clause)) return false;
        const counts = [
          ...clause.matchAll(
            new RegExp(
              "(?<![\\p{L}\\p{N}_])[*_~`]*([0-9]+)[*_~`]* +(?:[\\p{L}-]+ +)*?" +
                noun,
              "giu",
            ),
          ),
        ];
        if (counts.some((match) => !/^0+$/.test(match[1]))) return true;
        const reporting = clause.replace(
          new RegExp(
            "(?<![\\p{L}\\p{N}_])[*_~`]*0+[*_~`]* +(?:[\\p{L}-]+ +)*?" + noun,
            "giu",
          ),
          "",
        );
        const reportPrefix = new RegExp(
          "\\b(?:found|[\\p{L}]+ed) +(?:[\\p{L}-]+ +)*?" + noun,
          "iu",
        );
        const reportSubject = new RegExp(
          "(?:(?:a|an|one|some|several|multiple|[0-9]+) +)?" +
            noun +
            " +(?:(?:is|are|was|were|has|have|been) +)*(?:found|[\\p{L}]+ed|remains?|exists?)\\b",
          "iu",
        );
        const existential = new RegExp(
          "\\bthere +(?:is|are) +(?:[\\p{L}-]+ +)*?" + noun,
          "iu",
        );
        return (
          reportPrefix.test(reporting) ||
          reportSubject.test(reporting) ||
          existential.test(reporting)
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
            "$1 Manual request $2",
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
