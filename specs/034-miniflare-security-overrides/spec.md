# Keep Miniflare security overrides active

Dependabot PR #67 advances Wrangler to 4.151.1 and its exact Miniflare
dependency to 5.20261012.1-beta. The existing parent-qualified overrides name
the previous Miniflare release, so the lockfile falls back to vulnerable
`undici@7.29.1` and fails the required OSV scan.

Retarget both Miniflare selectors to the installed release and regenerate the
lockfile. Preserve `sharp@0.35.5`, `undici@7.30.1`, all other targeted security
overrides, and the seven-day release-age policy with its exact exceptions.

Finish within PR #67. Pass local preflight and GitHub required checks, obtain a
native Codex result for the final full HEAD SHA, and resolve the fixed P1 thread.
Merge and final waiting remain outside this implementation run.
