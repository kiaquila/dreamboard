# Tasks

## Phase 1 — Documentation (this PR)

- [x] Update `.specify/memory/constitution.md` §Roles and §macOS Local Runner Contract
- [x] Rewrite `docs_dreamboard/project/devops/ai-orchestration-protocol.md` defaults and execution surface order
- [x] Rewrite `docs_dreamboard/project/devops/ai-pr-workflow.md` orchestration ownership and gate default
- [x] Rewrite `docs_dreamboard/project/devops/ai-runner.md` local state paths and backend requirements
- [x] Rewrite `docs_dreamboard/project/devops/macos-local-runners.md` prerequisites, local state, example command, and worktree path
- [x] Reorder `docs_dreamboard/project/devops/review-contract.md` sections (Codex → Gemini → Claude)
- [x] Update `AGENTS.md` onboarding defaults and review guidelines
- [x] Update `README.md` workflow defaults line
- [x] Add `.claude/` entry to `.gitignore`
- [x] Update `feedback_worktree_location.md` auto-memory with reference to this spec

## Phase 2 — Implementation (follow-up slice in the same PR or a follow-up PR)

- [x] Rewrite `scripts/new-worktree.mjs` to target `<repoRoot>/.claude/worktrees/<slug>/` and `claude/<slug>` as the default branch prefix
- [x] Rename `.codex/` local state to `.claude/` in `scripts/set-implementation-agent.mjs` and `scripts/start-implementation-worker.mjs` (`publish-branch.mjs` does not read that state)
- [x] Print a deprecation notice in `scripts/start-implementation-worker.mjs` when legacy `.codex/` state is detected
- [x] Update `.github/workflows/ai-review.yml` and `.github/workflows/ai-command-policy.yml` fallback defaults from `codex`/`gemini` to `claude`/`codex`
- [ ] Run `pnpm run ci` and paste the result in this PR
- [ ] Run `node scripts/check-feature-memory.mjs --worktree` and paste the result in this PR
- [ ] Open or update the PR and wait for `baseline-checks`, `guard`, `AI Review`, and Vercel preview to be green on the same head SHA

## Validation

- `pnpm run ci`
- `node scripts/check-feature-memory.mjs --worktree`
- manual: `node scripts/new-worktree.mjs --feature 999-test-path` lands under `<repoRoot>/.claude/worktrees/999-test-path/`
