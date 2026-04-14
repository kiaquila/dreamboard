# Tasks

## Slice 1 — Housekeeping

- [ ] Add `.omc/` entry to `.gitignore`

## Slice 2 — Auto-retrigger

- [ ] Update `.github/workflows/ai-review.yml` `Resolve selected review policy` step to set `trigger_mode=comment` for Codex on `pull_request` events (keep `skip` only for `workflow_dispatch` with explicit `inputs.trigger_mode=skip`)
- [ ] Teach `scripts/ai-review-gate.mjs` to pick the trigger comment text by selected backend (`@codex review` / `/gemini review` / `@claude review once`)
- [ ] Add same-head dedupe guard in the gate so it does not post a duplicate trigger comment when a trusted human comment for the current head SHA already exists

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
