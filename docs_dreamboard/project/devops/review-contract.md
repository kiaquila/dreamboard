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
- English-only copy regressions
- build/deploy safety
- maintainability risks in the static app

## Native Codex receipts and wakeups

The trusted gate accepts legacy `Codex Review:` replies and the native
`<!-- codex-review-receipt:v1 -->` envelope from
`chatgpt-codex-connector[bot]`. Receipts require an explicit no-major-issues
result and a reviewed commit of 10-40 hex characters matching the current full
HEAD; abbreviated commits must also resolve through GitHub to that full SHA.
Unbound legacy replies require current-head timeline activation and
request ordering. Duplicate markers, conflicting content, malformed commits,
and unfinished replies cannot pass.

The connector's `codex-pull-request-review-summary` / `codex-review-state:v1`
comments are wakeup signals only, regardless of their JSON verdict or labels.
They never replace a receipt or formal review. Updated issue comments are read
independently of timeline position. All unresolved Codex threads are checked
before success; P0-P2 and untagged findings still block, including older commits.
P3 remains advisory. The gate rejects stale event HEADs and rechecks live HEAD
before success.

`AI Review Wakeup` runs trusted default-branch scripts for native comment
creation/edits, formal review updates, and completion of a PR-linked gate.
Active gates keep polling. A completed gate can be rerun once for evidence
newer than its attempt's start, covering the finish/reply race; the next attempt
starts after that evidence and cannot loop. Wakeups are serialized and recheck
HEAD and run attempt before rerunning. Summary presence and reactions do not
produce success.

When introducing changes to the gate itself, the PR still executes the old
trusted-main scripts. Obtain real native Codex review for the exact HEAD. If
its format is unsupported by main, the existing Gemini fallback can provide
the required `AI Review` through an independent native review of the same HEAD.
Restore Codex selection after merge and validate the new trusted-main parser.
Do not switch checkout to PR code, fabricate a status, or bypass protection.
