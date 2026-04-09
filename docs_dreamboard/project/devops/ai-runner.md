# AI Runner

## Repository Variables

The orchestration layer reads:

- `AI_IMPLEMENTATION_AGENT`
- `AI_REVIEW_AGENT`

If a variable is unset, the workflows fall back to repository defaults:

- implementation: `codex`
- review: `codex`

## Claude Requirements

Claude paths require repository secret:

- `ANTHROPIC_API_KEY`

If the secret is missing and Claude is selected, the workflow fails closed with an explanatory comment instead of silently skipping.

## Review Gate

`AI Review` is a normalization layer on top of native vendor review outputs.

- Codex path waits for native GitHub PR review output from `chatgpt-codex-connector[bot]`
- Claude path waits for a top-level `claude[bot]` comment containing:
  - `AI_REVIEW_AGENT: claude`
  - `AI_REVIEW_SHA: <head sha>`
  - `AI_REVIEW_OUTCOME: pass|advisory|block`

The gate passes on:

- Codex approval
- Codex advisory-only review
- Claude `pass`
- Claude `advisory`

The gate fails on:

- Codex `CHANGES_REQUESTED`
- Codex inline findings with highest severity `P0`, `P1`, or `P2`
- Claude `block`
- setup/runtime failures for the selected backend
