# Spec: auto-retrigger native review on synchronize and one-command fallback

## Goal

Stop losing PR time on two operational frictions observed on PR #9:

1. Pushing a new commit to an open PR does not auto-retrigger the selected
   native reviewer (Codex, Claude), so the `AI Review` gate passively polls
   and times out until a human manually posts `@codex review` / `@claude
review once`. Gemini is the exception because its PR-linked path already
   posts a trigger comment.

2. When the selected review backend is unavailable (rate limits, app outage,
   unexpected silence), switching to a fallback backend requires three manual
   steps (`gh variable set`, `gh pr comment`, `gh run rerun --failed`) and
   institutional memory of which command to use for which backend.

## Scope

- Update `.github/workflows/ai-review.yml` so that on
  `pull_request: synchronize` events (and `opened` / `reopened` /
  `ready_for_review`) the gate posts `/gemini review` for the current
  head SHA when `AI_REVIEW_AGENT=gemini`. Codex auto-retrigger on
  `synchronize` is explicitly out of scope: Codex Cloud rejects
  bot-posted `@codex review` triggers ("trigger did not come from a
  connected human Codex account"), so the gate keeps
  `trigger_mode=skip` for Codex and we document the manual recovery
  path. Claude review stays human-initiated only for the same reason.
- Preserve the existing `manual command → native-only` contract:
  trusted `@codex review` / `/gemini review` / `@claude review once`
  comments posted by humans must NOT be canceled by the auto-trigger.
  Deduplicate Gemini trigger comments by same-head check so the gate
  does not spam multiple trigger comments for the same SHA.
- Add a small repository helper `scripts/switch-review-agent.mjs` that
  takes `--to <codex|gemini|claude>` and performs: (a)
  `gh variable set AI_REVIEW_AGENT --body <agent>`, (b) posts the
  appropriate native trigger comment on the current branch's open PR,
  (c) reruns the failed `AI Review` job for the latest head SHA on that
  PR. Expose as `pnpm run review:switch -- --to gemini`.
- Document the auto-retrigger behavior and the fallback helper in
  `docs_dreamboard/project/devops/ai-runner.md`,
  `docs_dreamboard/project/devops/ai-pr-workflow.md`, and
  `docs_dreamboard/project/devops/macos-local-runners.md`.
- Add `.omc/` to `.gitignore` as housekeeping (oh-my-claudecode local
  state directory that was leaking as untracked on every branch).
- Track the change in `specs/005-ai-review-auto-retrigger-and-fallback/`
  with `spec.md`, `plan.md`, and `tasks.md`.

## Non-Goals

- No changes to application behavior in `index.html` or `src/`.
- No changes to Vercel configuration or Vercel dashboard settings.
- No rename of the required check names (`baseline-checks`, `guard`,
  `AI Review`) or the `AI_REVIEW_OUTCOME` header schema.
- No changes to the `ai-review-gate.mjs` scoring rules for Codex / Gemini
  / Claude findings; only the trigger behavior changes.
- No automatic detection of rate-limit errors — fallback is still
  human-initiated through the helper, not automatic.
- No Codex auto-retrigger on `synchronize`. Codex Cloud's
  human-account requirement on review triggers cannot be satisfied
  from a GitHub Actions workflow without a user PAT, which is not in
  scope for this spec.
- No Playwright or e2e test infrastructure.
- No changes to `.gemini/config.yaml` or `.gemini/styleguide.md`; the
  existing Gemini review configuration is already correct for this
  repository and is not in scope.

## Acceptance Criteria

1. After a push that lands a new head SHA on an open PR with
   `AI_REVIEW_AGENT=gemini`, the `AI Review` workflow run posts a
   single `/gemini review` trigger comment for the current head SHA
   without any human action. Codex and Claude paths remain
   `trigger_mode=skip` by design.
2. If a trusted human comment already triggered a native Gemini review
   for the current head SHA within the last 30 minutes, the workflow
   does not post a duplicate trigger comment on the same SHA during
   the automatic retrigger path.
3. `scripts/switch-review-agent.mjs --to <agent>` flips
   `AI_REVIEW_AGENT` via `gh variable set`, posts the correct native
   trigger comment on the current branch's open PR (resolved via
   `gh pr view --json number`), and reruns the most recent failed
   `AI Review` job on that PR.
4. `pnpm run review:switch -- --to <agent>` invokes the helper and
   exits with code 0 on success.
5. `docs_dreamboard/project/devops/ai-runner.md` and
   `docs_dreamboard/project/devops/ai-pr-workflow.md` describe the
   auto-retrigger step explicitly, and
   `docs_dreamboard/project/devops/macos-local-runners.md` documents
   the fallback helper with an example invocation.
6. `.gitignore` contains `.omc/`, and the repository working tree no
   longer reports `.omc/` as untracked in `git status`.
7. `specs/005-ai-review-auto-retrigger-and-fallback/{spec,plan,tasks}.md`
   exists and the feature-memory gate passes on the PR head SHA via
   `node scripts/check-feature-memory.mjs --worktree`.
8. `baseline-checks`, `guard`, `AI Review`, and the Vercel preview are
   green on the PR head SHA, without a human having to post a manual
   review trigger after the first push.
