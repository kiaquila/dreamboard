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
