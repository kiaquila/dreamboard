# Plan

## Slice 1: Repository Memory

- add `.specify/memory/constitution.md`
- add `docs_dreamboard/README.md`
- add `docs_dreamboard/adr/README.md`
- add canonical devops playbooks for PR loop, macOS local runners, and delivery

## Slice 2: Local Orchestration

- add scripts for agent selection, worktree creation, prompt preparation, and
  PR publishing
- store local runner state under `.codex/`

## Slice 3: Guardrails

- update baseline checks to require the new memory and orchestration files
- update `PR Guard` to enforce complete feature memory when product code changes

## Validation

- run `npm run ci`
- run the new feature-memory validation script locally against the current diff
- ensure docs and playbooks reflect the actual behavior of the scripts
