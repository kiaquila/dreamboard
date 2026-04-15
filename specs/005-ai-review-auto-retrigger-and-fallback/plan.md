# Plan

## Slice 1: Housekeeping

- add `.omc/` to `.gitignore` so the oh-my-claudecode local state
  (`notepad.md`, `project-memory.json`) stops surfacing as untracked on
  every branch

## Slice 2: Auto-retrigger for Gemini only

- update the `Resolve selected review policy` step in
  `.github/workflows/ai-review.yml`:
  - `workflow_dispatch` runs respect `inputs.trigger_mode` (defaults
    to `skip`)
  - Codex stays on `trigger_mode=skip` with an inline comment noting
    that Codex Cloud rejects bot-posted triggers
  - Claude stays on `trigger_mode=skip` because `claude-review.yml`
    gates on trusted-author issue_comment events
  - Gemini (the only backend that accepts bot-posted triggers on
    `synchronize`) falls through to `trigger_mode=comment`
- `scripts/ai-review-gate.mjs` already picks the trigger comment text
  by selected backend via `buildTriggerComment()`; no changes there
- add a same-head dedupe guard in `ensureTriggerComment()`: before
  posting a Gemini trigger comment, look for an existing gate comment
  with the current head SHA's `metadataMarker` within the last 30
  minutes; reuse the existing comment instead of posting a duplicate

## Slice 3: Fallback helper `scripts/switch-review-agent.mjs`

- new helper script:
  - parses `--to <codex|gemini|claude>` required arg
  - optional `--pr <number>` (defaults to the PR for the current
    branch via `gh pr view --json number`)
  - optional `--rerun` flag (default true) to rerun failed `AI Review`
    runs on the latest head SHA of the target PR
  - executes: (a) `gh variable set AI_REVIEW_AGENT --body <agent>`,
    (b) `gh pr comment <number> --body <trigger>` with the native
    trigger text for the new backend, (c) `gh run rerun <id> --failed`
    for the most recent failed AI Review run on that PR head SHA
  - prints a human-readable summary of each step
- expose as `review:switch` script in `package.json` so the common
  call is `pnpm run review:switch -- --to gemini`

## Slice 4: Documentation

- `docs_dreamboard/project/devops/ai-runner.md`: describe the
  auto-retrigger step in the `Review Gate` section, including the
  same-head dedupe behavior
- `docs_dreamboard/project/devops/ai-pr-workflow.md`: update the
  "Review Contract" section to note that `AI Review` posts the trigger
  comment itself on every `synchronize` event, so humans no longer
  need to manually post `@codex review` on new commits
- `docs_dreamboard/project/devops/macos-local-runners.md`: add a short
  "Fallback review agent" subsection under `Recommended Flow` with the
  `pnpm run review:switch -- --to gemini` invocation and when to use it
  (rate limits, silent backend, unexpected findings)

## Slice 5: Validation

- `pnpm run ci` inside the worktree (check:repo, check:html, build,
  format:check)
- `node scripts/check-feature-memory.mjs --worktree`
- manual smoke:
  - push a trivial whitespace commit to the open PR and confirm the
    `AI Review` run posts `@codex review` automatically without human
    interaction
  - run `pnpm run review:switch -- --to gemini` and confirm the
    variable flips, a `/gemini review` comment appears on the PR, and
    the most recent failed `AI Review` run reruns
- green required checks on the final PR head SHA
