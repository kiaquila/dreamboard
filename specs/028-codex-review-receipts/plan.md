# Implementation plan

1. Parse the known receipt envelope and exact positive result, requiring a
   matching 10-40 character SHA. Keep unbound legacy replies behind timeline
   activation and request boundaries.
2. Fetch edited issue comments separately, inspect unresolved Codex threads,
   and recheck the live full HEAD before publishing success.
3. Add a trusted default-branch wakeup workflow and runtime router for native
   comments, formal reviews, and gate completion. Keep webhook deliveries
   independent so concurrency queuing cannot drop transient invalidations.
   Guard overlapping mutations by HEAD and attempt; allow at most one
   follow-up attempt for evidence newer than that attempt's start.
   Persist deleted evidence as negative issue-comment records, require a new
   native assessment after the boundary, and repair mutated records. Validate
   help-footer bodies against known native templates before removing them.
4. Exercise the actual gate with mocked GitHub responses, plus workflow and
   router behavior. Run the repository preflight.
5. Request native Codex review as the authenticated owner for every new HEAD.
   For initial rollout, first try the existing formal-review path. A native Codex task may also independently audit the exact full diff from its git checkout and return a genuine legacy-format assessment; verify live HEAD, threads, and checks externally before merge when that environment lacks live GitHub access. Never turn an unverified metadata copy into a positive result. If Codex
   emits only the new receipt, use an already-supported fallback (Gemini, or configured Claude if Gemini
   is unavailable) with a real native review and the unchanged trusted-main required gate,
   while retaining native Codex review of the same exact HEAD. Restore the
   Codex policy after merge. Never execute PR gate scripts with elevated
   credentials, manufacture a check, or bypass branch protection.
6. Verify all required checks and threads, wait a full stable 120 seconds,
   merge with the expected HEAD, then verify the merged default-branch gate.

## Modern state implementation

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

Strict valid same-head structured finding flags latch per review section across repeated requests. Only a strictly newer canonical completed false/false result for that section clears its latch; security null, code-only/formal/static positives and equal-second completions cannot clear security findings. Malformed or untrusted history does not create permanent latches.
