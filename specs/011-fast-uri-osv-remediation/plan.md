# Plan 011: fast-uri OSV Remediation

## Approach

Use pnpm to refresh only the affected transitive package in the lockfile. The
direct dependency set remains unchanged, which keeps the patch focused on the
security finding reported by OSV Scan.

## Changes

1. Run `pnpm update fast-uri --lockfile-only`.
2. Verify the lockfile now resolves `fast-uri@3.1.2`.
3. Add feature-memory files for the lockfile remediation so PR Guard can
   evaluate the product-path change.
4. Update the devops runner documentation to list `pnpm-lock.yaml` and
   `pnpm-workspace.yaml` as feature-memory product paths.

## Verification

- `rg -n "fast-uri" pnpm-lock.yaml`
- `git diff --check`
- `pnpm install --frozen-lockfile`
- `pnpm run preflight`
- GitHub PR checks after push
