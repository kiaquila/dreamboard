# Implementation plan

1. Rebase the Dependabot branch onto current protected main.
2. Retarget both Miniflare parent-qualified overrides and regenerate the lockfile.
3. Update the exact dependency graph in durable documentation and run local preflight plus a vulnerability scan.
4. Commit and push the scoped fix, then request one native Codex review for the new full HEAD SHA.
5. Reply to and resolve the fixed P1 thread, then hand off remaining GitHub checks without waiting or merging.
