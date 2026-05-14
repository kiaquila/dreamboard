# Spec 011: fast-uri OSV Remediation

## Problem

The PR branch resolves `fast-uri@3.1.0` through `ajv@8.18.0` in
`pnpm-lock.yaml`. GitHub OSV Scan reports two High vulnerabilities for that
transitive package:

- GHSA-q3j6-qgpj-74h6, fixed in `fast-uri@3.1.1`
- GHSA-v39h-62p7-jpjc, fixed in `fast-uri@3.1.2`

This blocks the PR even though the visible product change is documentation-only.

## Goal

Refresh the pnpm lockfile so the existing dependency graph resolves
`fast-uri@3.1.2` or newer without changing direct dependencies or app behavior.

## Scope

- Update `pnpm-lock.yaml` for the vulnerable transitive package.
- Keep `package.json` unchanged.
- Keep runtime application code unchanged.
- Record the lockfile remediation in feature memory because `pnpm-lock.yaml` is
  a product path enforced by PR Guard.

## Acceptance

- `pnpm-lock.yaml` contains no `fast-uri@3.1.0` references.
- `pnpm run preflight` passes locally after dependencies are installed.
- GitHub `osv-scan` passes on the PR head.
- GitHub `guard` passes with the trusted feature-memory gate.
- Codex AI Review is triggered for the final PR head.
