# Tasks

- [x] Reproduce the receipt prefix regression on current origin/main.
- [x] Implement receipt parsing, edited-comment retrieval, and HEAD guards.
- [x] Preserve unresolved finding and severity enforcement.
- [x] Add trusted native-event wakeup and bounded requeue.
- [x] Add actual gate, workflow-filter, and runtime-router regression coverage.
- [x] Complete local preflight with locked dependencies (188 tests).
- [x] Address native P1 on dismissed-review wakeups using persisted update times.
- [x] Address native P2 on equal receipt/dismissal timestamps using timeline ordering.
- [x] Address native P2 on timeline outages: bound receipts do not require timeline data.
- [x] Address native P1 on edits withdrawing recognized comment evidence.
- [x] Make ambiguous same-second old edits fail explicitly and recover with fresh evidence.
- [x] Invalidate deleted receipt evidence, including deletion during active completion.
- [x] Cancel active gates on receipt withdrawals and formal review changes before reevaluation.
- [x] Invalidate new nonpassing replies and requeue equal-second evidence without looping.
- [x] Route unknown receipt markers and prevent older positives from surviving them.
- [x] Make wrong-head supported receipts supersede older positives without timeline data.
- [x] Include persisted setup failures during timeline outages and compare both review sources before success.
- [x] Cancel and requeue an active previous backend when switching review policy.
- [x] Filter reviewer-switch runs by the target PR association across result pages.
- [x] Accept the observed native positive suffix "Keep them coming!" and replay the real GitHub receipt offline.
- [x] Invalidate native inline mutations and cover persisted inline edits at completion.
- [x] Reproduce and accept the 2026-10-20 native "Bravo." suffix while rejecting appended conflicting verdicts.
- [x] Reproduce and accept the later native "Hooray!" suffix while rejecting appended conflicting verdicts.
- [x] Reproduce the native P1 pending-event replacement race and preserve independent invalidation deliveries.
- [x] Reproduce the native P2 workflow-run pagination gap through the real wakeup CLI and select only the target PR across pages.
- [x] Address native P1 deletion replay with persisted negative records, strict assessment creation boundaries, and record-mutation recovery.
- [x] Address native P2 hidden footer verdicts with exact native-template validation and hostile-footer regressions.
- [x] Accept the observed exact native follow-up question and service-owned task-link footer while rejecting appended findings and unknown links.
- [ ] Obtain native reviews for the final HEAD.
- [ ] Verify required gates, resolved threads, and the stable 120-second window.
- [ ] Merge and confirm trusted-main deployment of the new gate.

## Structured-state compatibility

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

Historical negative snapshots accept multiline machine JSON and presentation-only nonprotocol HTML comments, retaining unique protocol markers, closed fields, duplicate-key rejection, exact affected-section head and visible-row validation. This formatting tolerance never grants affirmative review authority.

- [x] Verify resolved code history can recover only after a separate fresh native
      assessment, without allowing code receipts to clear security findings.
- [x] Reject resolved-code recovery from negative-only trailing-example snapshots;
      reproduce the unsafe pass and verify the fix with full preflight (312 tests).
- [x] Reproduce native P1 on trailing multiline protocol examples: retain code and
      security negatives with space/tab/CRLF indentation, reject partial blocks,
      and preserve clean-state and resolved-code recovery vetoes. Full preflight:
      322 tests passed.

- [x] Preserve explicit findings from a strict leading envelope independently of trailing presentation; keep complete-body clean/clear validation strict.

- [x] Reject embedded-BOM/comment-prefixed code headings and rendered whitespace-entity warnings; preserve comment line breaks so split completion fields cannot clear historical findings. Exact actual-gate regressions cover each case.

- [x] Reproduce native assertion-negation P1 and reporting-verb P2 in the actual
      gate. Preserve positive counts alongside unrelated negative assertions
      and trailing qualifiers, and restrict report predicates to finding verbs.

- [x] Reproduce native flagged/raised P1 and preserve common explicit triage and
      verification reports without restoring arbitrary words ending in -ed.
- [x] Reproduce native get-passive P1 and documented-word P2 in the actual gate;
      recognize passive reports and resolutions, retain negated-resolution
      findings, and verify metalinguistic subjects remain presentation only.
