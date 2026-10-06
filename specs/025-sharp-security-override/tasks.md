# Tasks 025: sharp Security Override

## Dependency Remediation

- [x] Add the targeted Miniflare-to-sharp override.
- [x] Add the version-specific `minimumReleaseAgeExclude` entry.
- [x] Regenerate the lockfile with `sharp@0.35.4`.
- [x] Confirm no `sharp@0.35.2` references remain.

## Feature Memory and Docs

- [x] Add `spec.md`, `plan.md`, and `tasks.md` for the remediation.
- [x] Document the security exception in `README.md` and the durable devops
      documentation.

## Verification

- [x] Run `pnpm install --frozen-lockfile`.
- [x] Run the complete local CI pipeline.
- [ ] Confirm GitHub `guard`, `osv-scan`, and `AI Review` pass on the final PR
      head.
- [ ] Confirm all review threads are resolved.

## PR #45 Refresh

- [x] Retarget the Miniflare-to-sharp override to `5.20260903.0-alpha`.
- [x] Regenerate the lockfile without `sharp@0.35.2`.
- [x] Re-run local preflight on the refreshed PR head.
- [ ] Confirm GitHub gates pass on the refreshed PR head.

## PR #48 Refresh

- [x] Retarget the Miniflare-to-sharp override to `5.20260911.0-alpha`.
- [x] Regenerate the lockfile without `sharp@0.35.2`.
- [x] Run the complete local CI pipeline on the refreshed PR head.
- [ ] Confirm GitHub gates pass on the refreshed PR head.
- [ ] Confirm all review threads are resolved.

## PR #50 Refresh

- [x] Retarget the Miniflare-to-sharp override to `5.20260918.0-alpha`.
- [x] Update the `fast-uri` override to `3.1.7`.
- [x] Add the targeted Miniflare-to-undici override at `7.29.1`.
- [x] Exempt only the fixed security releases from the release-age hold.
- [x] Regenerate the lockfile without `sharp@0.35.2`.
- [x] Run the complete local CI pipeline on the refreshed PR head.
- [ ] Confirm GitHub gates pass on the refreshed PR head.
- [ ] Confirm all review threads are resolved.

## PR #52 Refresh

- [x] Update the `fast-uri` override to `3.1.8`.
- [x] Remove the stale `fast-uri@3.1.7` release-age exception.
- [x] Regenerate the lockfile without `fast-uri@3.1.7`.
- [x] Advance the targeted sharp override and exception to `0.35.5`.
- [x] Regenerate the lockfile without vulnerable `sharp@0.35.4`.
- [x] Run the complete local CI pipeline on the refreshed PR head.
- [ ] Confirm GitHub gates pass on the refreshed PR head.
- [ ] Confirm all review threads are resolved.

## PR #53 Refresh

- [x] Retarget both Miniflare security overrides to `5.20260926.1-alpha`.
- [x] Regenerate the lockfile with `sharp@0.35.5` and `undici@7.29.1`.
- [x] Run the complete local preflight on the refreshed PR head.
- [ ] Confirm GitHub gates pass on the refreshed PR head.
- [ ] Confirm all review threads are resolved.
