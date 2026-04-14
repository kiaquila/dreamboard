# Plan

## Slice 1: Documentation swap (this PR, phase 1)

- rewrite role definitions and default policy in the six devops docs plus
  `.specify/memory/constitution.md`, `AGENTS.md`, and `README.md`
- reorder `docs_dreamboard/project/devops/review-contract.md` sections so
  Codex comes first, Gemini second, Claude third
- update `.gitignore` to cover `.claude/`
- update the user auto-memory note `feedback_worktree_location.md` to record
  that this spec is where the worktree location fix is tracked

## Slice 2: Worktree location fix (phase 2)

- rewrite `scripts/new-worktree.mjs` so the worktree path is computed as
  `resolve(repoRoot, '.claude/worktrees', slug)` instead of
  `resolve(dirname(repoRoot), options.path || `dreamboard-${slug}`)`
- change the default branch prefix from `codex/<slug>` to `claude/<slug>`
  when `--branch` is not supplied
- ensure `.claude/worktrees/` is created on demand and that existing entries
  are detected with a clear error message
- keep `--path` as an explicit override for unusual cases

## Slice 3: Local state rename (phase 2)

- `scripts/set-implementation-agent.mjs`,
  `scripts/start-implementation-worker.mjs`, and `scripts/publish-branch.mjs`
  read and write `.claude/implementation-agent`, `.claude/review-agent`, and
  `.claude/prompts/` instead of the `.codex/...` paths
- if a legacy `.codex/implementation-agent` or `.codex/review-agent` file
  exists, print a one-line deprecation notice and migrate on first run
- remove `.codex/` from `.gitignore` only once the scripts stop writing to it

## Slice 4: GitHub workflow defaults (phase 2)

- any `.github/workflows/*.yml` step that hard-codes a fallback default for
  `AI_IMPLEMENTATION_AGENT` or `AI_REVIEW_AGENT` updates from `codex`/`gemini`
  to `claude`/`codex`
- no rename of the `AI Review` job, its required check name, or its header
  schema
- trusted human review commands still only use `workflow_dispatch` for
  `claude`; `codex` and `gemini` stay native-only

## Slice 5: Validation

- `pnpm run ci` inside the worktree
- `node scripts/check-feature-memory.mjs --worktree`
- manual smoke check: `node scripts/new-worktree.mjs --feature 999-test-path`
  creates the worktree under `<repoRoot>/.claude/worktrees/999-test-path/`
  and leaves `~/projects/` untouched
- green required checks on the PR head SHA
- healthy Vercel preview for the unchanged editor and landing flows
