// These records can only withdraw authority; they never provide positive proof.
export const invalidationMarker = "codex-review-invalidation";
const actionsBot = (comment) => comment?.user?.login === "github-actions[bot]";
export const hasInvalidationMarker = (body = "") =>
  typeof body === "string" && body.includes(invalidationMarker);
export const isInvalidationMutation = (event) =>
  actionsBot(event.comment) &&
  ["edited", "deleted"].includes(event.action) &&
  (hasInvalidationMarker(event.comment.body) ||
    hasInvalidationMarker(event.changes?.body?.from));

export const invalidationCutoff = (comments, head) => {
  let cutoff = 0;
  for (const comment of comments) {
    if (!actionsBot(comment) || !hasInvalidationMarker(comment.body)) continue;
    const match = comment.body.match(
      /^<!-- codex-review-invalidation:v1 (\{[^\n]+\}) -->\n/,
    );
    let record;
    try {
      record = JSON.parse(match?.[1] || "");
    } catch {
      throw new Error("Malformed native evidence invalidation record.");
    }
    const timestamp = Math.max(
      Date.parse(comment.created_at),
      Date.parse(comment.updated_at || comment.created_at),
    );
    if (
      !/^[a-f0-9]{40}$/.test(record.head_sha || "") ||
      !["issue_comment", "pull_request_review_comment"].includes(
        record.source_event,
      ) ||
      !Number.isSafeInteger(record.source_id) ||
      record.source_id <= 0 ||
      !Number.isFinite(timestamp)
    )
      throw new Error("Invalid native evidence invalidation record.");
    if (record.head_sha === head) cutoff = Math.max(cutoff, timestamp);
  }
  return cutoff;
};
