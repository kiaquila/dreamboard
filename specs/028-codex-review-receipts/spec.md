# Codex native review receipt compatibility

The native connector now prefixes no-findings replies with
`<!-- codex-review-receipt:v1 -->` and includes a reviewed commit. The old
required gate rejects that prefix and never wakes after late review output.

Accept trusted current-head receipts and preserve legacy and formal review
support. Reject malformed, contradictory, unfinished, spoofed, and stale
receipts. Structured summaries, reactions, and completion labels are wakeup
signals only. Preserve P0-P2 blocking and P3 advisory policy, including
unresolved findings from earlier commits. A request marker cannot clear findings.

Comment creation and edits must wake completed gates without interrupting
active polling, looping reruns, or evaluating a new push under an old check.
Keep execution pinned to the trusted default branch.
