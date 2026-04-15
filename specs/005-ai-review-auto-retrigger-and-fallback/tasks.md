# Tasks

## Slice 1 — Housekeeping

- [ ] Add `.omc/` entry to `.gitignore`

## Slice 2 — Auto-retrigger

- [ ] Collapse `.github/workflows/ai-review.yml` `Resolve selected review policy` step so every `pull_request` event resolves `trigger_mode=skip`, with inline comments enumerating the per-backend reason (Codex rejects, Gemini ignores, Claude gates on human author)
- [ ] Keep the same-head dedupe guard in `ensureTriggerComment()` so explicit `workflow_dispatch` runs with `inputs.trigger_mode=comment` do not post duplicate triggers for the same head SHA

## Slice 3 — Fallback helper

- [ ] Create `scripts/switch-review-agent.mjs` with `--to`, optional `--pr`, optional `--rerun` (default true)
- [ ] Wire steps: `gh variable set AI_REVIEW_AGENT --body <agent>` → `gh pr comment <pr> --body <trigger>` → `gh run rerun <id> --failed`
- [ ] Add `review:switch` script to `package.json`

## Slice 4 — Documentation

- [ ] Add `§Backend Trigger Constraints` section to `docs_dreamboard/project/devops/ai-runner.md` with the full backend × event matrix
- [ ] Add `§Backend Trigger Constraints` section to `docs_dreamboard/project/devops/review-contract.md` summarizing the finding
- [ ] Update `docs_dreamboard/project/devops/ai-pr-workflow.md` Review Contract section to state that no backend auto-retriggers on `synchronize` and document the `pnpm run review:switch` recovery path
- [ ] Add a "Fallback review agent" subsection to `docs_dreamboard/project/devops/macos-local-runners.md` with `pnpm run review:switch -- --to gemini` example

## Slice 5 — Validation

- [ ] `pnpm run ci` inside the worktree
- [ ] `node scripts/check-feature-memory.mjs --worktree`
- [ ] Push a whitespace commit and confirm auto-retrigger works without manual intervention
- [ ] Dry-run `pnpm run review:switch -- --to gemini` and confirm variable flip + trigger comment + rerun
- [ ] Open PR, wait for `baseline-checks`, `guard`, `AI Review`, and Vercel preview to be green on the same head SHA
