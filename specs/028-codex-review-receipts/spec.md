# Codex native review receipt compatibility

The native connector now prefixes no-findings replies with
`<!-- codex-review-receipt:v1 -->` and includes a reviewed commit. The old
required gate rejects that prefix and never wakes after late review output.

Accept trusted current-head receipts and preserve legacy and formal review
support. Reject malformed, contradictory, unfinished, spoofed, and stale
receipts. Structured summaries, reactions, and completion labels are wakeup
signals only. Preserve P0-P2 blocking and P3 advisory policy, including
unresolved findings from earlier commits. A request marker cannot clear findings.
Unknown receipt-like responses must still wake reevaluation and supersede older
positive evidence. An unprovable timestamp tie must not prefer positive proof.
Accept the observed standalone "Bravo." encouragement after the exact positive
verdict; additional contradictory verdict text must still fail closed.
Supported receipts with non-current SHA bindings must also supersede older
current-head positives, even when timeline data is unavailable.
Persisted setup failures and withdrawn replies must also supersede older proof
without timeline access. Read issue comments and formal reviews before accepting
either source; a newer nonpassing reply cannot be hidden by an older formal pass.
Order formal edits by persisted update time and fail closed on ambiguous ties.

Comment creation and edits must wake completed gates without interrupting
active polling, looping reruns, or evaluating a new push under an old check.
Edits that withdraw recognized evidence must invalidate the previous result
through reevaluation, including edits arriving during an active gate.
Receipt deletion must invalidate a prior success using the deletion webhook
itself, since deleted comments do not survive in API scans. Cancel and rerun
an active gate to close its final-read/deletion race. Receipt withdrawals and
formal review updates require the same immediate cancellation and reevaluation;
an eventual completion wakeup cannot close a transient false-success window.
New recognized nonpassing replies require the same invalidation. Evidence tied
with an attempt start must be reevaluated after a later-second boundary, rather
than treated as already evaluated or replayed indefinitely.
When a same-second edit/dismissal tie has no observable order, fail explicitly
and require fresh native evidence; never infer edit order from comment creation.
Keep execution pinned to the trusted default branch.
Each invalidation webhook must reach the router independently. A later gate
completion must not replace a pending deletion or withdrawal in an Actions
concurrency group. Guard overlapping mutations with the current HEAD and run
attempt rather than a shared, lossy pending-event slot.
The wakeup lookup must inspect all workflow-run pages before filtering by
current HEAD and PR association; other PRs sharing a SHA must not hide its run.

Reviewer switching must reevaluate the new policy even when a previous backend
is still active. Cancel and await that attempt before rerunning the latest
PR-linked same-head gate; reject HEAD/attempt changes and cancellation timeouts.
Resolve the target run by its pull-request association as well as HEAD, including
paginated results, so another PR on the same commit cannot be cancelled or rerun.

Native inline review-comment creation, edits, and deletion must invalidate the
current gate, including findings on older commits. Completion scans must retain
inline update timestamps so a mutation racing gate completion is reevaluated.
