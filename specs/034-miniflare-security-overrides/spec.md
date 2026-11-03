# Keep Miniflare security overrides active

Dependabot PR #69 advances Wrangler to 4.152.0 and its exact Miniflare
dependency to 5.20261019.2-beta. The existing parent-qualified overrides name
the previous Miniflare release, so the lockfile falls back to vulnerable
`undici@7.29.1` and fails the required OSV scan.

Retarget both Miniflare selectors to the installed release and regenerate the
lockfile. Preserve `sharp@0.35.5`, `undici@7.30.1`, all other targeted security
overrides, and the seven-day release-age policy with its exact exceptions.

Finish within PR #69. Pass local preflight and GitHub required checks, obtain a
native Codex result for the final full HEAD SHA, resolve the fixed P1 thread,
then complete the required pre-merge wait and merge verification.
