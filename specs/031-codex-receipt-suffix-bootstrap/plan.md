# Plan

1. Fetch current main; check open PRs and related worktree files for overlap.
2. Use an isolated in-repository worktree based on main, with one branch and PR.
3. Add the two observed literal suffixes and security-boundary regressions.
4. Update the durable review contract; pass frozen install and local preflight.
5. Open a normal ready-for-review PR and obtain genuine native Codex review.
6. Require exact-HEAD green checks, clean native verdict, no unresolved threads,
   and mergeability; verify again after at least 120 seconds and merge with an
   expected-HEAD guard. Stop if the old gate rejects this PR's native format.
7. After a legitimate merge, rerun only PR #57's failed AI Review. If strict
   protection requires integration of main, merge it and obtain one native
   review of the changed HEAD, then repeat the same merge and audit conditions.
