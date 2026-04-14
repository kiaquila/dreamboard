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

- `claude`
- `codex`
- `gemini`

Default policy in this repository:

- implementation: `claude`
- review: `codex`

Claude is the canonical default implementation agent because it owns
architecture, orchestration, CI/CD health, and repository memory for this
repository, and is driven from the user's local Claude Code terminal session.

Codex is the canonical default review backend because it runs natively on
GitHub pull requests and emits `P0`–`P3` inline severity markers.

Gemini stays available as the fallback review backend when
`AI_REVIEW_AGENT=gemini` is set. Claude review is a third-tier option behind
an explicit `AI_REVIEW_AGENT=claude` override and still requires
`ANTHROPIC_API_KEY` when used.

## Local macOS Orchestration

Implementation work is prepared locally through repository-owned macOS helpers:

- `scripts/set-implementation-agent.mjs`
- `scripts/new-worktree.mjs`
- `scripts/start-implementation-worker.mjs`
- `scripts/publish-branch.mjs`

One task should map to one worktree, one branch, and one PR. Worktrees are
created inside `<repoRoot>/.claude/worktrees/<slug>/` so they stay inside the
repository and do not pollute the user's `~/projects/` directory.

## Native Execution Surface

- Claude implementation: launched from a local Claude Code terminal session
  against the feature worktree; can dispatch other local agents via CLI when
  needed
- Codex implementation: started from Codex app or Codex web against the
  repository branch (optional)
- Codex review: native GitHub PR review from `chatgpt-codex-connector[bot]`
- Gemini review: `/gemini review` on a top-level PR comment (fallback)
- Claude review: `@claude review once` on a top-level PR comment (third-tier)

Review normalization behavior:

- `codex` is the default automatic pull-request reviewer and uses passive
  same-head detection on PR events instead of a bot-authored trigger comment
- pull-request `AI Review` runs support both `codex` and `gemini`
- manual Gemini and Codex review comments stay native-only to avoid canceling
  the PR-linked `AI Review` check
- trusted human review commands dispatch the shared `AI Review` gate via
  `workflow_dispatch` only for `claude`
- the gate may reuse an existing same-head native review when a PR-linked
  `AI Review` run is rerun

Only trusted actors may trigger AI workflows:

- `OWNER`
- `MEMBER`
- `COLLABORATOR`
