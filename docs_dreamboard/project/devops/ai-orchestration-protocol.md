# AI Orchestration Protocol

## Canonical Delivery Contract

`dreamboard` uses a PR-only delivery model.

Required GitHub checks:

- `baseline-checks`
- `guard`
- `AI Review`

Agent routing is controlled by repository variables:

- `AI_IMPLEMENTATION_AGENT`
- `AI_REVIEW_AGENT`

## Supported Agents

- `codex`
- `claude`
- `gemini`

Default policy in this repository:

- implementation: `codex`
- review: `gemini`

Gemini is the canonical default review backend for this repository because it is already installed on GitHub and runs natively on pull requests.

Claude remains supported as an optional backend when `ANTHROPIC_API_KEY` is configured and the repository variable is switched.

## Native Execution Surface

- Codex implementation: start the task from Codex app or Codex web against the repository branch
- Codex review: `@codex review` on a top-level PR comment
- Claude implementation: `@claude <task brief>` on a trusted issue/PR comment
- Claude review: `@claude review once` on a top-level PR comment
- Gemini review: `/gemini review` on a top-level PR comment

Only trusted actors may trigger AI workflows:

- `OWNER`
- `MEMBER`
- `COLLABORATOR`
