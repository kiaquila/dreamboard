# Implementation plan

1. Synchronize the existing PR branch with protected main in a clean existing
   worktree. Preserve the original dependency updates and PR identity.
2. Retarget both Miniflare parent-qualified overrides, regenerate the lockfile,
   and verify the installed dependency graph and unchanged security controls.
3. Update durable security documentation and run the complete local preflight.
4. Push once the scoped fix is ready. Request one native Codex review using
   the full new HEAD SHA. Address genuine new findings on the same PR.
5. Reply to the existing P2 thread with exact source and check evidence, then
   resolve it. Verify the final exact-head required checks and native verdict.
6. Hand off URL, SHA, checks, and any remaining blocker. Do not merge here.
