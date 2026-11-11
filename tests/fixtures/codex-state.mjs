export const cleanStateBody = (head, transform = (state) => state) => {
  const clean = {
    commit_sha: head,
    has_any_findings: false,
    has_unresolved_findings: false,
    status: "completed",
  };
  const state = transform({
    code_review: { ...clean },
    security_review: {
      commit_sha: null,
      has_any_findings: null,
      has_unresolved_findings: null,
      status: null,
    },
  });
  return `<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 ${JSON.stringify(state)} -->\n\n## Codex Review Summary\n\nThis comment shows the latest Codex review activity on this pull request.\n\n| Review | Status | Commit | Review trigger |\n| --- | --- | --- | --- |\n| 📝 **Code Review** | ✅ **Completed** <relative-time datetime="2026-10-20T12:02:00Z">2026-10-20T12:02:00Z</relative-time> | \`${head.slice(0, 7)}\` | Manual request |`;
};
export const presentationReceipt = (
  head,
  closing = "The tiny confetti parade continues!",
) =>
  `<!-- codex-review-receipt:v1 -->\n\nCodex Review: Didn't find any major issues. ${closing}\n\n**Reviewed commit:** \`${head}\``;

export const collapsibleStateBody = (
  body,
  status = "✅ Completed",
  footer = "",
) => {
  const heading = "## Codex Review Summary";
  const headingIndex = body.indexOf(heading);
  if (headingIndex < 0) throw new Error("Missing Codex summary heading.");
  const metadata = body.slice(0, headingIndex).trimEnd();
  const presentation = body.slice(headingIndex + heading.length).trimStart();
  return `${metadata}\n\n<details>\n<summary><strong>Codex Review Summary</strong>: ${status}</summary>\n\n${presentation}${footer ? `\n\n${footer}` : ""}\n\n</details>`;
};

export const summaryHelpFooter = `<details> <summary>ℹ️ About Codex in GitHub</summary>
<br/>

[Your team has set up Codex to review pull requests in this repo](https://chatgpt.com/codex/cloud/settings/general). Reviews are triggered when you
- Open a pull request for review
- Mark a draft as ready
- Comment "@codex review" or "@codex security review".

Codex reacts with 👀 while any review is running, comments if it has suggestions, and reacts with 👍 once all reviews finish with no findings.

</details>`;
