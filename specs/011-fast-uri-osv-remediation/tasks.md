# Tasks 011: fast-uri OSV Remediation

## Lockfile

- [x] Update `fast-uri` in `pnpm-lock.yaml` from `3.1.0` to `3.1.2`.
- [x] Confirm no `fast-uri@3.1.0` references remain.
- [x] Keep `package.json` unchanged.

## Feature Memory and Docs

- [x] Add `spec.md`, `plan.md`, and `tasks.md` for the remediation.
- [x] Document that `pnpm-lock.yaml` and `pnpm-workspace.yaml` are product
      paths in the AI runner feature-memory gate notes.

## Verification

- [x] Run `pnpm install --frozen-lockfile`.
- [x] Run `pnpm run preflight`.
- [ ] Confirm GitHub `guard`, `osv-scan`, and `AI Review` pass on the final PR
      head.
