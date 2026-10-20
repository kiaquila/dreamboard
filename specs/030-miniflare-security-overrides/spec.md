# Keep Miniflare security overrides active

Dependabot PR #58 advances Wrangler to 4.149.0 and its exact Miniflare dependency
to 5.20261006.1-alpha. Existing parent-qualified overrides still name the old
Miniflare, leaving the documented security pins inactive.

Retarget both parent selectors to the installed Miniflare and regenerate the
lockfile. Keep sharp at 0.35.5, undici at 7.29.1, all other security overrides,
the seven-day release-age policy, and its exact-version exceptions. Update
README and security documentation to describe the real graph, including that
the new upstream Miniflare already requests these patched versions.

Finish within the original PR #58. Pass local preflight and GitHub required
checks, obtain a native Codex result for the final full HEAD SHA, and resolve
the fixed P2 thread with source and validation evidence. Leave merge to the
supervising chat after its final two-minute readiness check.
