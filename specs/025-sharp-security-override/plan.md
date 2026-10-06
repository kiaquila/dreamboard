# Plan 025: sharp Security Override

## Approach

Retain `html-validate@11.11.0` and `wrangler@4.127.1` from the Dependabot PR.
Override only the vulnerable Miniflare-to-sharp dependency edge, and exempt
only the fixed `sharp@0.35.4` version from the seven-day release-age rule.

## Changes

1. Add the targeted `miniflare@5.20260828.0-alpha>sharp` pnpm override.
2. Add `sharp@0.35.4` to `minimumReleaseAgeExclude`.
3. Regenerate `pnpm-lock.yaml` with pnpm.
4. Explain the narrow security-exception policy in `README.md` and the durable
   devops documentation.
5. Record the remediation in feature memory for PR Guard.

## Verification

- `rg -n "sharp@0.35.2|sharp: 0.35.2" pnpm-lock.yaml`
- `pnpm install --frozen-lockfile`
- `pnpm run preflight`
- GitHub PR checks after push

## PR #45 Refresh

Update the exact Miniflare selector in the existing pnpm override to
`miniflare@5.20260903.0-alpha>sharp`, regenerate the lockfile, and repeat the
same security and repository verification without broadening the exception.

## PR #48 Refresh

Update the selector again to `miniflare@5.20260911.0-alpha>sharp`, regenerate
the lockfile, and verify that the resolved graph contains only `sharp@0.35.4`.
Keep the exception narrow and document the active protected dependency edge.

## PR #50 Refresh

Retarget the override to `miniflare@5.20260918.0-alpha>sharp` alongside the
Wrangler update, regenerate the lockfile, and verify that the resolved graph
still contains only `sharp@0.35.4`. The refreshed OSV scan also requires
`fast-uri@3.1.7` and a targeted `miniflare@5.20260918.0-alpha>undici@7.29.1`
override; exempt only those fixed versions from the release-age hold.

## PR #52 Refresh

Advance the existing `fast-uri` override to the fixed `3.1.8` release,
remove the stale release-age exception for `3.1.7`, regenerate the lockfile,
and verify that the vulnerable version is absent before rerunning the
repository and GitHub security checks. Advance the targeted Miniflare-to-sharp
override and release-age exception from `sharp@0.35.4` to `sharp@0.35.5` after
the refreshed scan reports GHSA-wq5f-xc86-pv6w.

## PR #53 Refresh

Retarget the sharp and undici overrides to
`miniflare@5.20260926.1-alpha`, regenerate the lockfile, and verify that the
fixed versions remain selected alongside the Dependabot toolchain updates.
