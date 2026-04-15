# Plan

## Slice 1: Housekeeping

- add `.omc/` to `.gitignore` so the oh-my-claudecode local state
  (`notepad.md`, `project-memory.json`) stops surfacing as untracked on
  every branch

## Slice 2: Document constraints and collapse workflow policy to skip

- the `Resolve selected review policy` step in
  `.github/workflows/ai-review.yml` now resolves `trigger_mode=skip`
  on every `pull_request` event regardless of the selected backend.
  No backend-specific branches exist in the `pull_request` path.
  `workflow_dispatch` runs continue to honor `inputs.trigger_mode`
  (defaulting to `skip`), so manual dispatches remain the only way
  to reach `trigger_mode=comment` and they are not wired to any of
  the current backends.
- inline comments in the workflow file enumerate the per-backend
  reason (Codex rejects, Gemini silently ignores, Claude gates on
  human author) and cross-reference
  `docs_dreamboard/project/devops/ai-runner.md` §Backend Trigger
  Constraints.
- `scripts/ai-review-gate.mjs` keeps `buildTriggerComment()` for the
  Codex and Gemini branches (reachable only via the explicit
  `workflow_dispatch` comment-mode entry point), and now throws on
  the Claude branch so a future misconfiguration surfaces as a loud
  error instead of a silently ignored bot comment.
- `ensureTriggerComment()` carries a 30-minute same-head dedupe
  guard: it reuses an existing gate-authored trigger comment (by
  hidden `metadataMarker`) **or** a trusted human comment that
  already carries the bare backend trigger keyword
  (`@codex review` / `/gemini review` / `@claude review once`),
  excluding comments authored by any of the reviewer bots
  themselves.

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

- `docs_dreamboard/project/devops/ai-runner.md`: add the
  `§Backend Trigger Constraints` section with the full matrix
  (auto-review on open, auto-review on synchronize, accepts bot
  trigger, manual recovery) and update the Review Gate subsection to
  match
- `docs_dreamboard/project/devops/review-contract.md`: add a
  `§Backend Trigger Constraints` header that summarizes the same
  finding and cross-links to `ai-runner.md`
- `docs_dreamboard/project/devops/ai-pr-workflow.md`: update the
  "Review Contract" section to explicitly say that no backend
  auto-retriggers on `synchronize` and that recovery uses
  `pnpm run review:switch` or a trusted human trigger comment
- `docs_dreamboard/project/devops/macos-local-runners.md`: add a short
  "Fallback review agent" subsection under `Recommended Flow` with the
  `pnpm run review:switch -- --to gemini` invocation and when to use it
  (rate limits, silent backend, unexpected findings)

## Slice 5: Validation

- `pnpm run ci` inside the worktree (check:repo, check:html, build,
  format:check)
- `node scripts/check-feature-memory.mjs --worktree`
- manual smoke:
  - push a trivial commit to an open PR and confirm the gate stays in
    `trigger_mode=skip` (no bot-authored trigger comment is posted and
    the gate passively polls for a same-head native review)
  - run `pnpm run review:switch -- --to gemini` and confirm the
    variable flips, a human-authored `/gemini review` comment appears
    on the PR, and the most recent failed / timed-out / cancelled
    `AI Review` run reruns
- green required checks on the final PR head SHA
