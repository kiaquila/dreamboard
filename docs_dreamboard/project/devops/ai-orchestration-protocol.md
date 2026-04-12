# AI Orchestration Protocol

## Canonical Delivery Contract

`dreamboard` uses a PR-only delivery model.

Repository memory is split into:

- `.specify/` for process constitution
- `docs_dreamboard/` for durable product and devops context
- `specs/<feature-id>/` for active feature intent, plan, and task state

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

## Local macOS Orchestration

Implementation work is prepared locally through repository-owned macOS helpers:

- `scripts/set-implementation-agent.mjs`
- `scripts/new-worktree.mjs`
- `scripts/start-implementation-worker.mjs`
- `scripts/publish-branch.mjs`

One task should map to one worktree, one branch, and one PR.

## Native Execution Surface

- Codex implementation: start the task from Codex app or Codex web against the repository branch
- Codex review: `@codex review` on a top-level PR comment
- Claude implementation: `@claude <task brief>` on a trusted issue/PR comment
- Claude review: `@claude review once` on a top-level PR comment
- Gemini review: `/gemini review` on a top-level PR comment

Review normalization behavior:

- `gemini` is the default automatic pull-request reviewer
- pull-request `AI Review` runs support both `gemini` and `codex`; `codex`
  uses passive same-head detection on PR events instead of a bot-authored
  trigger comment
- trusted human review commands dispatch the shared `AI Review` gate via `workflow_dispatch` for `codex` and `claude`
- manual Gemini comments stay native-only to avoid canceling the PR-linked `AI Review` check
- the gate may reuse an existing same-head native review when a PR-linked `AI Review` run is rerun

Only trusted actors may trigger AI workflows:

- `OWNER`
- `MEMBER`
- `COLLABORATOR`
