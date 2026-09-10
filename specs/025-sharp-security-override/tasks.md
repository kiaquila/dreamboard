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
