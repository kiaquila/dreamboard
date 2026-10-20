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
