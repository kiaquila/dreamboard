# Tasks

## Slice 1 — Housekeeping

- [ ] Add `.omc/` entry to `.gitignore`

## Slice 2 — Auto-retrigger

- [ ] Update `.github/workflows/ai-review.yml` `Resolve selected review policy` step to set `trigger_mode=comment` for Gemini only on `pull_request` events; keep `skip` for Codex (bot triggers rejected by Codex Cloud) and Claude (`claude-review.yml` gates on trusted-author events)
- [ ] Add same-head dedupe guard in `ensureTriggerComment()` so Gemini trigger comments are reused when the current head SHA marker already exists within the last 30 minutes

## Slice 3 — Fallback helper

- [ ] Create `scripts/switch-review-agent.mjs` with `--to`, optional `--pr`, optional `--rerun` (default true)
- [ ] Wire steps: `gh variable set AI_REVIEW_AGENT --body <agent>` → `gh pr comment <pr> --body <trigger>` → `gh run rerun <id> --failed`
- [ ] Add `review:switch` script to `package.json`

## Slice 4 — Documentation

- [ ] Update `docs_dreamboard/project/devops/ai-runner.md` Review Gate section with the auto-retrigger behavior
- [ ] Update `docs_dreamboard/project/devops/ai-pr-workflow.md` Review Contract section to remove the manual `@codex review` step
- [ ] Add a "Fallback review agent" subsection to `docs_dreamboard/project/devops/macos-local-runners.md` with `pnpm run review:switch -- --to gemini` example

## Slice 5 — Validation

- [ ] `pnpm run ci` inside the worktree
- [ ] `node scripts/check-feature-memory.mjs --worktree`
- [ ] Push a whitespace commit and confirm auto-retrigger works without manual intervention
- [ ] Dry-run `pnpm run review:switch -- --to gemini` and confirm variable flip + trigger comment + rerun
- [ ] Open PR, wait for `baseline-checks`, `guard`, `AI Review`, and Vercel preview to be green on the same head SHA
