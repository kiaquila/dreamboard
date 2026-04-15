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

## Backend Trigger Constraints

None of the supported review backends accept bot-posted trigger comments
on `pull_request` events. This matrix is the single source of truth for
why `ai-review.yml` keeps `trigger_mode=skip` on every `pull_request`
event regardless of the selected backend, and it is the setup guidance
to copy to any future repository that adopts this AI review pattern.

| Backend                                | Auto-review on `opened` / `ready_for_review` | Auto-review on `synchronize` | Accepts bot-posted trigger comment                                                                                          | Manual recovery path                                                                 |
| -------------------------------------- | -------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Codex (`chatgpt-codex-connector[bot]`) | yes (Codex Cloud auto-reviews on PR open)    | no                           | **no** — connector replies "trigger did not come from a connected human Codex account" and the gate fails fast              | trusted human posts `@codex review`, or run `pnpm run review:switch -- --to <other>` |
| Gemini (`gemini-code-assist[bot]`)     | yes when the GitHub App is installed         | no                           | **no** — silently ignored, the gate times out after 20 minutes                                                              | trusted human posts `/gemini review` (responses arrive within ~2 minutes)            |
| Claude (`claude[bot]`)                 | no                                           | no                           | **no** — `claude-review.yml` gates on `author_association in (OWNER, MEMBER, COLLABORATOR)` and drops bot-authored comments | trusted human posts `@claude review once`                                            |

Consequences for orchestration design:

- Auto-retrigger on `synchronize` is not achievable from within a stock
  GitHub Actions workflow. A user PAT from a Codex-connected account or
  a dedicated service account with trusted `author_association` would
  be required to bypass this, and neither is in scope for `dreamboard`.
- Codex Cloud's on-open auto-review covers the initial PR review for
  free. Every subsequent push needs a manual trigger or a backend
  switch.
- The `pnpm run review:switch` helper is the canonical one-shot
  recovery path: it flips `AI_REVIEW_AGENT`, posts the correct native
  trigger comment on behalf of the current user (via `gh` CLI, so the
  comment is human-authored and trusted), and reruns the most recent
  failed `AI Review` job on the current head SHA.

## Review Gate

`AI Review` is a normalization layer on top of native vendor review outputs.

- Codex path waits for native GitHub PR review output from
  `chatgpt-codex-connector[bot]` (default). Codex Cloud auto-reviews on
  PR open and ready-for-review; on `synchronize` after a new push a
  human must post `@codex review` or switch backends via
  `pnpm run review:switch`.
- Gemini path waits for native GitHub PR review output from
  `gemini-code-assist[bot]` and classifies inline review comments by
  `Critical`, `High`, `Medium`, and `Low` severity markers. Gemini
  responds only to human-authored `/gemini review` comments on an
  already-open PR; it ignores bot-posted triggers on `synchronize`.
- Claude path waits for a top-level `claude[bot]` comment containing:
  - `AI_REVIEW_AGENT: claude`
  - `AI_REVIEW_SHA: <head sha>`
  - `AI_REVIEW_OUTCOME: pass|advisory|block`
    Claude review is human-initiated only: a trusted
    `@claude review once` comment dispatches `claude-review.yml`. Bot-posted
    triggers are ignored by that workflow, so the gate never auto-posts
    `@claude review once`.

When the gate does post a trigger comment (only possible via
`workflow_dispatch` with `inputs.trigger_mode=comment`), each comment
carries a hidden metadata marker
`<!-- ai-review-gate:agent=<agent>;sha=<head> -->`. The gate scans PR
comments from the last 30 minutes for a matching marker and reuses the
existing comment instead of posting a duplicate. This prevents trigger
spam on repeated manual dispatches against the same head SHA.

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
