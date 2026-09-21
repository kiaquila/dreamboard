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
