# Spec: document review backend trigger constraints and ship a one-command fallback

## Goal

Stop losing PR time on two operational frictions observed on PR #9 and
confirmed on PR #10:

1. **Auto-retrigger of native review on `synchronize` is not achievable
   from a stock GitHub Actions workflow.** All three supported review
   backends reject bot-authored trigger comments: Codex Cloud fails
   fast with "trigger did not come from a connected human Codex
   account", Gemini Code Assist silently ignores bot-posted
   `/gemini review`, and `claude-review.yml` gates on trusted
   `author_association`. This is documented once in durable docs so
   the next repo that adopts this pattern does not rediscover it the
   hard way.

2. When the selected review backend is unavailable (rate limits, app
   outage, unexpected silence), switching to a fallback backend
   requires three manual steps (`gh variable set`, `gh pr comment`,
   `gh run rerun --failed`) and institutional memory of which command
   to use for which backend. Ship a single-command helper that does
   all three as the current `gh` user (so the trigger comment is
   human-authored and therefore trusted).

## Scope

- Collapse the `Resolve selected review policy` step in
  `.github/workflows/ai-review.yml` so that every `pull_request` event
  sets `trigger_mode=skip` regardless of the selected backend. Inline
  comments in the workflow enumerate the reason per backend (Codex
  rejects, Gemini ignores, Claude gates on human author_association)
  and link to the constraint table in durable docs.
- Keep `trigger_mode=comment` reachable only via `workflow_dispatch`
  with an explicit `inputs.trigger_mode=comment`, so the
  `ensureTriggerComment` code path remains available for manual
  dispatches and for future backends that accept bot-posted triggers.
- Keep the 30-minute same-head dedupe guard in `ensureTriggerComment`
  so repeated manual dispatches on the same head SHA reuse the
  existing trigger comment instead of spamming the PR.
- Document the constraint matrix in
  `docs_dreamboard/project/devops/ai-runner.md` (§Backend Trigger
  Constraints) and
  `docs_dreamboard/project/devops/review-contract.md` (§Backend
  Trigger Constraints). Cross-link from
  `docs_dreamboard/project/devops/ai-pr-workflow.md`.
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
- No auto-retrigger of native review on `synchronize` for any
  backend. All three reject bot-authored triggers (Codex fails fast,
  Gemini silently ignores, Claude gates on trusted
  `author_association`), and bypassing this would require either a
  user PAT in repository secrets or a dedicated service account with
  trusted author_association. Both are out of scope.
- No Playwright or e2e test infrastructure.
- No changes to `.gemini/config.yaml` or `.gemini/styleguide.md`; the
  existing Gemini review configuration is already correct for this
  repository and is not in scope.

## Acceptance Criteria

1. On every `pull_request` event (regardless of
   `AI_REVIEW_AGENT`), the `Resolve selected review policy` step in
   `.github/workflows/ai-review.yml` resolves `trigger_mode=skip` and
   the gate does not post any trigger comment. Inline comments in the
   workflow file enumerate the per-backend reason.
2. When the gate is dispatched via `workflow_dispatch` with
   `inputs.trigger_mode=comment` and a trigger comment for the
   current head SHA already exists within the last 30 minutes, the
   gate reuses the existing comment instead of posting a duplicate.
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
