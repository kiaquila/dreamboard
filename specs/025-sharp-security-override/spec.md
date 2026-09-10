# Spec 025: sharp Security Override

## Problem

The dependency update in PR #43 resolves `sharp@0.35.2` through
`miniflare@5.20260828.0-alpha`. GitHub OSV Scan reports the High-severity
GHSA-rgj7-g3m4-5g8c vulnerability for that version. The fixed
`sharp@0.35.4` release is newer than the repository's seven-day
`minimumReleaseAge` window, so pnpm rejects it without an explicit exception.

## Goal

Keep the mature direct dependency versions from the Dependabot update while
forcing the affected Miniflare edge to the fixed `sharp@0.35.4` release.

## Scope

- Add a targeted pnpm override for Miniflare's `sharp` dependency.
- Add a version-specific minimum-release-age exception for `sharp@0.35.4`.
- Refresh `pnpm-lock.yaml` without changing application runtime behavior.
- Document the security exception in the repository README.

## Acceptance

- `pnpm-lock.yaml` contains no `sharp@0.35.2` references.
- `pnpm install --frozen-lockfile` passes with the repository's normal policy.
- `pnpm run preflight` passes locally.
- GitHub `guard`, `osv-scan`, and `AI Review` pass on the final PR head.
- No blocking review threads remain unresolved.
