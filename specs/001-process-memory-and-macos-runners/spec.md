# Spec: dreamboard process memory and macOS local runners

## Goal

Bring `dreamboard` closer to the structured development model used in
`flatscanner-demo`, while adapting it to a static Vercel site and local macOS
worktree orchestration.

## Scope

- add a repository memory layer through `.specify/`, `docs_dreamboard/README`,
  ADR index, and durable devops playbooks
- add one active feature-memory folder under `specs/`
- add macOS-local orchestration scripts for agent selection, worktree creation,
  prompt preparation, and PR publishing
- harden repository checks so product changes require feature memory

## Non-Goals

- no framework migration yet
- no self-hosted GitHub Actions runner
- no production UI behavior changes in this slice
- no switch to Claude review until repository secrets are configured

## Acceptance Criteria

1. The repository contains a documented process constitution and docs index.
2. The repository contains one complete `specs/<feature-id>/` folder for this
   slice.
3. macOS-local orchestration scripts exist and are documented.
4. `baseline-checks` validates the new baseline files.
5. `guard` fails when product code changes without a complete feature-memory
   update in the same PR.
