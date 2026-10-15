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
Edits that withdraw recognized evidence must invalidate the previous result
through reevaluation, including edits arriving during an active gate.
When a same-second edit/dismissal tie has no observable order, fail explicitly
and require fresh native evidence; never infer edit order from comment creation.
Keep execution pinned to the trusted default branch.
