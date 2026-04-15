# AI Runner

## Repository Variables

The orchestration layer reads:

- `AI_IMPLEMENTATION_AGENT`
- `AI_REVIEW_AGENT`

If a variable is unset, the workflows fall back to repository defaults:

- implementation: `claude`
- review: `codex`

Local macOS helper scripts may also store the current selection under:

- `.claude/implementation-agent`
- `.claude/review-agent`

## Backend Requirements

- `claude` is the default implementation agent. The user runs it from a local
  Claude Code terminal session, and no additional GitHub secret is required
  for the default implementation path. When `claude` is used as a third-tier
  review backend through the `@claude` GitHub app, `ANTHROPIC_API_KEY` must be
  configured in repository secrets.
- `codex` is the default review backend and the optional implementation
  backend. Native Codex PR review needs no repository secret; Codex
  implementation requires the Codex app or Codex CLI to be available locally
  when you hand off the prepared prompt.
- `gemini` is the fallback review backend and runs natively on GitHub pull
  requests without additional setup.

If a selected backend is missing its requirements, the workflow fails closed
with an explanatory comment instead of silently skipping.

## Review Gate

`AI Review` is a normalization layer on top of native vendor review outputs.

- Codex path waits for native GitHub PR review output from
  `chatgpt-codex-connector[bot]` (default). Codex Cloud rejects review
  triggers posted by GitHub bots — the connector replies with "trigger
  did not come from a connected human Codex account" — so the gate
  cannot auto-retrigger Codex on `synchronize`. On fresh PR open and
  ready-for-review, Codex Cloud auto-reviews on its own; after a new
  push on an already-reviewed PR, a human must post `@codex review`
  from a Codex-connected account, or switch backend via
  `pnpm run review:switch -- --to gemini`.
- Gemini path waits for native GitHub PR review output from
  `gemini-code-assist[bot]` and classifies inline review comments by
  `Critical`, `High`, `Medium`, and `Low` severity markers. The gate
  posts `/gemini review` on every `pull_request` event for the current
  head SHA when `AI_REVIEW_AGENT=gemini`, so Gemini re-reviews new
  commits automatically.
- Claude path waits for a top-level `claude[bot]` comment containing:
  - `AI_REVIEW_AGENT: claude`
  - `AI_REVIEW_SHA: <head sha>`
  - `AI_REVIEW_OUTCOME: pass|advisory|block`
    Claude review is human-initiated only: a trusted
    `@claude review once` comment dispatches `claude-review.yml`. Bot-posted
    triggers are ignored by that workflow, so the gate does not auto-post
    `@claude review once`.

Each trigger comment carries a hidden metadata marker
`<!-- ai-review-gate:agent=<agent>;sha=<head> -->`. When the gate would
post a new trigger comment, it first scans PR comments from the last 30
minutes for a matching marker and reuses the existing comment instead of
posting a duplicate. This prevents trigger-comment spam on workflow
reruns and on repeated `pull_request` events for the same head SHA.

The gate passes on:

- Codex approval
- Codex advisory-only review
- Gemini approval
- Gemini advisory-only review
- Claude `pass`
- Claude `advisory`

The gate fails on:

- Codex `CHANGES_REQUESTED`
- Codex inline findings with highest severity `P0`, `P1`, or `P2`
- Gemini `CHANGES_REQUESTED`
- Gemini inline findings with highest severity `Critical`, `High`, or `Medium`
- Claude `block`
- setup/runtime failures for the selected backend

## Feature Memory Gate

`guard` is also responsible for ensuring that product-code changes do not land
without a complete `specs/<feature-id>/` update.

For `dreamboard`, product-code paths are:

- `index.html`
- `package.json` and `package-lock.json`
- `.htmlvalidate.json`
- `.github/workflows/`
- `scripts/`
- `src/`
- future `app/`, `public/`, and `assets/` folders
- `vercel.json`

## Gemini Operational Note

Manual Gemini comments such as `/gemini review` or `@gemini-code-assist review`
stay native-only in this repository.

- they do not dispatch `ai-review.yml`
- this avoids canceling the PR-linked `AI Review` check
- if Gemini has already reviewed the current PR head SHA, rerunning the
  PR-linked `AI Review` check is enough for the gate to accept that same-head
  review output
