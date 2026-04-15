# Review Contract

## Backend Trigger Constraints

All three supported review backends require a **human-authored** trigger
on `pull_request: synchronize` events. Bot-posted trigger comments from
GitHub Actions (`github-actions[bot]`) are rejected silently or with an
explicit error by every backend:

- **Codex** — the connector replies "trigger did not come from a
  connected human Codex account" and the `AI Review` gate fails fast.
- **Gemini** — `gemini-code-assist[bot]` silently ignores bot-posted
  `/gemini review` comments; the gate times out after 20 minutes.
- **Claude** — `claude-review.yml` gates on `author_association in
(OWNER, MEMBER, COLLABORATOR)` and drops anything authored by a bot.

Codex Cloud's on-open auto-review (on `opened` and `ready_for_review`)
and Gemini Code Assist's on-open auto-review cover the initial review
for free, but every new push on an already-open PR needs a manual
trigger. The canonical recovery path is
`pnpm run review:switch -- --to <agent>`, which flips the repository
variable, posts the correct native trigger comment as the current `gh`
user (human-authored, therefore trusted), and reruns the most recent
failed `AI Review` job.

See `docs_dreamboard/project/devops/ai-runner.md` for the full matrix.

## Codex Review

- Default review backend for `dreamboard`
- Native GitHub PR review surface from `chatgpt-codex-connector[bot]`
- Inline findings must carry `P0` to `P3`
- `P3`-only findings are advisory
- `P0` to `P2` findings block merge

## Gemini Review

- Fallback review backend, used when `AI_REVIEW_AGENT=gemini`
- Native GitHub PR review surface from `gemini-code-assist[bot]`
- Inline findings are expected to carry `Critical`, `High`, `Medium`, or `Low`
- `Low`-only findings are advisory
- `Critical`, `High`, and `Medium` findings block merge

## Claude Review

- Third-tier review backend, used only when `AI_REVIEW_AGENT=claude`
- Final result is a top-level comment, not a formal GitHub review state
- The comment must start with:

```text
AI_REVIEW_AGENT: claude
AI_REVIEW_SHA: <head sha>
AI_REVIEW_OUTCOME: pass|advisory|block
```

- `pass` and `advisory` are non-blocking
- `block` is merge-blocking

## Repository Focus

For `dreamboard`, reviewers should prioritize:

- mobile layout regressions
- canvas/editor correctness
- export behavior
- draft persistence and state safety
- i18n regressions
- build/deploy safety
- maintainability risks in the static app
