# Review Contract

## Codex Review

- Native GitHub PR review surface
- Inline findings must carry `P0` to `P3`
- `P3`-only findings are advisory
- `P0` to `P2` findings block merge

## Gemini Review

- Native GitHub PR review surface from `gemini-code-assist[bot]`
- Inline findings are expected to carry `Critical`, `High`, `Medium`, or `Low`
- `Low`-only findings are advisory
- `Critical`, `High`, and `Medium` findings block merge

## Claude Review

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
- i18n regressions
- build/deploy safety
- maintainability risks in the static app
