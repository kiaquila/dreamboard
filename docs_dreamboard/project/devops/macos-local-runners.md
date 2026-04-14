# macOS Local Runners

This document adapts the local worker orchestration pattern to macOS for
`dreamboard`.

## Purpose

Local runners are not GitHub self-hosted runners. They are the repository-owned
macOS helpers for:

- selecting implementation and review policy
- creating isolated worktrees
- preparing high-signal implementation prompts
- publishing the active branch to a draft PR

## Rules

- One task equals one worktree, one branch, and one PR.
- Never run multiple implementation loops inside the main checkout.
- Start each worktree from current `main`.
- Keep worktrees inside the repository at
  `<repoRoot>/.claude/worktrees/<slug>/` so they do not pollute the user's
  `~/projects/` directory.
- Keep prompts tied to one active `specs/<feature-id>/` folder.
- Use the scripts to prepare and publish work, but never bypass GitHub checks.

## Prerequisites

- macOS with `git`, `gh`, and Node.js 24 available
- authenticated GitHub CLI for repository variable updates and PR creation
- Claude Code available locally as the primary implementation agent
- Codex app or Codex CLI available locally only when you want to hand off the
  prepared prompt to Codex as the optional implementation agent

## Local State

The scripts keep local orchestration state in `.claude/`:

- `.claude/implementation-agent`
- `.claude/review-agent`
- `.claude/prompts/`
- `.claude/worktrees/`

This directory is local-only and gitignored.

## Recommended Flow

1. Select policy.

```bash
node scripts/set-implementation-agent.mjs --implementation claude --review codex
```

2. Create a new isolated worktree inside `.claude/worktrees/`.

```bash
node scripts/new-worktree.mjs --feature 004-claude-primary-orchestrator
```

3. Change into the created worktree.

4. Generate the implementation prompt and copy it to the clipboard.

```bash
node scripts/start-implementation-worker.mjs \
  --feature 004-claude-primary-orchestrator \
  --copy
```

5. Run the selected implementation agent using that prompt.

6. Publish the branch and open or reuse a draft PR.

```bash
node scripts/publish-branch.mjs \
  --feature 004-claude-primary-orchestrator \
  --title "chore: swap claude and codex roles and move worktrees inside repo"
```

## Trade-Offs

- The repository prepares prompts and branch/worktree state, but it does not
  force-launch a specific local app.
- Codex implementation and Claude review remain optional paths behind an
  explicit `AI_IMPLEMENTATION_AGENT=codex` or `AI_REVIEW_AGENT=claude`
  override.
