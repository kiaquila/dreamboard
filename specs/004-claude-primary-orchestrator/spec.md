# Spec: swap Claude ↔ Codex roles and move worktrees inside the repo

## Goal

Make Claude Code the primary orchestrator (architecture, orchestration, CI/CD
health, repository memory) and the default implementation agent for
`dreamboard`. Move Codex to the optional implementation slot and make it the
default review backend on GitHub PRs. Keep Gemini as the fallback review
backend and Claude review as a third-tier option. Fix the worktree location bug
so local worktrees live inside `.claude/worktrees/` instead of
`~/projects/dreamboard-<slug>/`.

## Scope

- rewrite role definitions and default policy in:
  - `.specify/memory/constitution.md`
  - `docs_dreamboard/project/devops/ai-orchestration-protocol.md`
  - `docs_dreamboard/project/devops/ai-pr-workflow.md`
  - `docs_dreamboard/project/devops/ai-runner.md`
  - `docs_dreamboard/project/devops/macos-local-runners.md`
  - `docs_dreamboard/project/devops/review-contract.md`
  - `AGENTS.md`
  - `README.md`
- reorder `review-contract.md` so Codex comes first, Gemini second, Claude
  third
- rename local orchestration state directory from `.codex/` to `.claude/`
  across the affected docs and (in phase 2) the helper scripts
- change `scripts/new-worktree.mjs` so new worktrees are created inside the
  repository at `<repoRoot>/.claude/worktrees/<slug>/` and use `claude/<slug>`
  as the default branch prefix
- update `scripts/set-implementation-agent.mjs`,
  `scripts/start-implementation-worker.mjs`, and `scripts/publish-branch.mjs`
  readers to use `.claude/implementation-agent`, `.claude/review-agent`, and
  `.claude/prompts/`
- update `.github/workflows/*.yml` fallback defaults where the implementation
  and review backend names are hard-coded to move from `codex`/`gemini` to
  `claude`/`codex`
- update `.gitignore` to cover `.claude/`
- update user auto-memory `feedback_worktree_location.md` to record that the
  fix is tracked in this spec

## Non-Goals

- no changes to application behavior in `index.html` or `src/`
- no changes to Vercel configuration or Vercel dashboard settings
- no changes to the required check names (`baseline-checks`, `guard`,
  `AI Review`) or to the `AI_REVIEW_AGENT` / `AI_REVIEW_SHA` /
  `AI_REVIEW_OUTCOME` header schema
- no removal of Codex or Gemini support — only a reordering of defaults
- no new external dependencies
- no rename of repository variables or secrets

## Acceptance Criteria

1. `.specify/memory/constitution.md` §Roles names Claude as the owner of
   architecture, orchestration, CI/CD health, repository memory, and as the
   default implementation agent, with Codex optional and Gemini as the
   fallback review backend.
2. `docs_dreamboard/project/devops/ai-orchestration-protocol.md` declares
   default policy `implementation: claude`, `review: codex`, with Gemini as
   fallback and Claude as a third-tier review option.
3. `docs_dreamboard/project/devops/ai-pr-workflow.md` attributes orchestration
   ownership to Claude and sets the pull-request gate default to Codex.
4. `docs_dreamboard/project/devops/ai-runner.md` uses `.claude/` for local
   state paths and documents Codex as the default review backend plus the
   optional implementation backend.
5. `docs_dreamboard/project/devops/macos-local-runners.md` lists Claude Code as
   the primary prerequisite, `.claude/` for local state, the example command
   as `--implementation claude --review codex`, and shows worktrees being
   created inside `<repoRoot>/.claude/worktrees/<slug>/`.
6. `docs_dreamboard/project/devops/review-contract.md` orders review backend
   sections as Codex → Gemini → Claude and marks Claude as a third-tier option.
7. `AGENTS.md` and `README.md` state the new defaults (`claude` for
   implementation, `codex` for review, `gemini` as fallback).
8. `.gitignore` ignores `.claude/` in addition to the existing `.codex/`
   entry.
9. `scripts/new-worktree.mjs` creates new worktrees at
   `<repoRoot>/.claude/worktrees/<slug>/` and uses `claude/<slug>` as the
   default branch prefix when `--branch` is not supplied.
10. `scripts/set-implementation-agent.mjs`,
    `scripts/start-implementation-worker.mjs`, and `scripts/publish-branch.mjs`
    read and write `.claude/implementation-agent`, `.claude/review-agent`, and
    `.claude/prompts/` instead of the `.codex/...` paths.
11. Any hard-coded fallback default for `AI_IMPLEMENTATION_AGENT` or
    `AI_REVIEW_AGENT` inside `.github/workflows/*.yml` resolves to `claude` /
    `codex`.
12. On the PR head SHA for this feature, `baseline-checks`, `guard`,
    `AI Review`, and the Vercel preview are all green, and
    `node scripts/check-feature-memory.mjs --worktree` passes.
