# Dependency-only PR guards

## Goal

Allow automated dependency updates to satisfy the PR guard without pretending
they are product features, while retaining baseline validation.

## Scope

- Treat a change limited to dependency fields in `package.json`,
  `pnpm-lock.yaml`, and pinned GitHub Actions `uses:` revisions (including
  action subpaths with unchanged action coordinates) as a
  dependency-only update.
- Exempt only those changes from durable-documentation and feature-memory
  checks.
- Preserve baseline installation and repository validation for all PRs.

## Non-goals

- Exempting source, workflow, runtime, or deployment changes.
- Exempting npm scripts, Node/toolchain settings, or other manifest metadata.
- Weakening package validation or lockfile enforcement.
