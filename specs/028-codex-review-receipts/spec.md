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
Accept the observed standalone "Bravo." and "Hooray!" encouragements after the exact positive
verdict; additional contradictory verdict text must still fail closed.
Accept the observed exact follow-up question and the exact native task-link
footer, without permitting arbitrary questions, prose, domains, or duplicate links.
Strip only exact known native help-template bodies; conflicting or unknown text
inside the footer must not become positive evidence.
Persist deletions as current-head negative records owned by GitHub Actions.
Older receipts or formal approvals cannot regain authority after reevaluation:
a newly created native assessment must be strictly newer than the record.
Record mutations must recreate the negative boundary, never clear it.
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

## Strict native structured state

Support unseen friendly closings through independent official structured proof,
not an open-ended prose verdict. Validate one closed-schema native v1 snapshot,
full current head, completed clean code/security state and matching visible table.
Use mutable update time and request/head boundaries; newer malformed, stale,
pending or negative state invalidates old clean state, including timestamp ties.
Keep standalone receipts strict: unknown later/equal receipts stay pending until
a newer strict clean summary. Preserve exact SHA resolution and finding vetoes. Preserve blocking threads, formal
review and final-head checks. Regression coverage exercises actual gates, both
arrival orders, schemas, freshness, spoofing, contradictions and native blockers.
Run full preflight and obtain current-head native review before protected merge.

Static clean receipts use immutable creation time for approval ordering and current-request/head freshness. Editing a receipt cannot renew approval; unknown, pending and negative edits retain update time to invalidate older proof. Strict structured approvals continue to use code-row completion time.

Strict valid same-head structured finding flags latch per review section across repeated requests. A strictly newer canonical completed false/false result clears its section latch; the resolved-code recovery described below is the only additional path; security null, code-only/formal/static positives and equal-second completions cannot clear security findings. Malformed or untrusted history does not create permanent latches.

Completed negative state uses section completion authority only when the entire native summary is canonical. Unknown presentation always retains server observation time; a recognized companion-section edit can preserve the section clock.

The history guard covers strict snapshots present in the current REST issue-comment/timeline response. GitHub exposes only the current body of a mutable comment; this contract does not retain unseen prior revisions. Lifecycle fixtures use distinct persisted comment IDs. Native inline findings and unresolved review-thread guards remain authoritative. Durable webhook revision capture is outside this change.

Historical negative latching and clearing match the affected section’s exact head and canonical row independently of the other section’s head. This partial historical evidence never grants whole-PR approval or suppresses current pending signals.

Resolved historical code findings may recover only through an explicitly
completed current-head snapshot with no unresolved code findings and a separate,
strictly later SHA-bound native clean assessment. Require immutable receipt
creation after the latest negative snapshot observation and the current request.
Never extend this code-only recovery to security findings or unresolved threads.

Historical negative snapshots accept multiline machine JSON and line-preserving nonprotocol HTML comments with unique leading markers, closed fields, duplicate-key rejection and exact affected-section head. Only complete canonical bodies supply section clocks. Unknown presentation retains explicit negatives at server observation time, never clean or recovery authority.

Protocol-marker uniqueness counts actual HTML comment markers. The only supported canonical trigger label is `Manual request`; bare marker words or any other label cannot supply canonical completion authority.

Negative completion ordering considers only affected sections bound to the current full head. Protocol marker lines indented as Markdown code (four spaces or a tab) are examples, not live structured snapshots.

A strict leading live snapshot may retain only explicit current-head negative facts when followed solely by trailing Markdown-indented protocol example blocks. Multiline blocks require four spaces or a tab on every line, including the closing marker; partially unindented blocks remain invalid. This fallback cannot approve, clear history, or retire the original body’s observed pending timestamp. Whole indented envelopes remain examples.

Negative-only fallback snapshots cannot establish resolved-code recovery, even
when their leading record says all findings are resolved and a later clean
receipt exists. Recovery requires a complete canonical snapshot.

Reject embedded-BOM/comment-prefixed code headings and preserve comment line breaks. Replace open-ended Markdown/English warning interpretation with closed canonical presentation: exact native rows, known help footer and Manual request trigger. Any unknown appended text, including benign English, keeps negative observation time. Actual-gate regressions retain every prior warning/neutral case as fail-closed history and require fresh canonical recovery.

## Canonical presentation boundary

The natural-language/rendering projection is superseded by a closed native
presentation boundary. Complete canonical summaries retain section completion
authority; negative-only leading envelopes with unknown text retain observation
time and cannot clear or establish recovery. Unknown trigger labels also fail
closed. No free-form text is classified as harmless to reuse an old negative
clock. All stale, malformed, section-specific, strict-later receipt, security and
unresolved-thread requirements remain in force.

Canonical native table blocks permit at most three leading ASCII spaces. Four-space, tab, or other leading whitespace cannot be normalized into canonical clock or clearing authority; negative envelopes retain observation time.

Canonical content retains separate heading/intro/table blocks and contiguous table rows. Internal blank or removed-comment lines, missing paragraph boundaries and non-ASCII whitespace-only lines cannot provide canonical completion or clearing authority. Extra genuine blank lines between native blocks remain supported.

Negative-only retention depends on the live leading closed machine envelope, not a later heading. Prose before the heading, missing/quoted/fenced/indented headings and later protocol examples cannot discard explicit current-head negative flags. Only complete canonical bodies can supply clocks, clearing or resolved recovery. Whole-comment code/quote framing and indented leading machine records remain ineligible.

Comment normalization distinguishes visible table pipes from pipes inside HTML comments using an offset/line-preserving comment mask. Invisible pipe-bearing separators between live machine markers do not discard negative flags; raw table comments still cannot assemble canonical clocks or SHA fields.

Metadata liveness is validated in the original HTML context after masking hidden comments. Same-line separators and padded comment prefixes cannot discard negative flags; actual first-element code indentation remains ineligible. This history-only normalization never grants whole-PR approval.
