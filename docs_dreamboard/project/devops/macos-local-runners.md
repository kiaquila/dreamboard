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
- Keep prompts tied to one active `specs/<feature-id>/` folder.
- Use the scripts to prepare and publish work, but never bypass GitHub checks.

## Prerequisites

- macOS with `git`, `gh`, and Node.js 24 available
- authenticated GitHub CLI for repository variable updates and PR creation
- Codex app or Claude Code available locally when you want to hand off the
  prepared prompt

## Local State

The scripts keep local orchestration state in `.codex/`:

- `.codex/implementation-agent`
- `.codex/review-agent`
- `.codex/prompts/`

This directory is local-only and gitignored.

## Recommended Flow

1. Select policy.

```bash
node scripts/set-implementation-agent.mjs --implementation codex --review gemini
```

2. Create a new isolated worktree.

```bash
node scripts/new-worktree.mjs --feature 001-process-memory-and-macos-runners
```

3. Change into the created worktree.

4. Generate the implementation prompt and copy it to the clipboard.

```bash
node scripts/start-implementation-worker.mjs \
  --feature 001-process-memory-and-macos-runners \
  --copy
```

5. Run the selected implementation agent using that prompt.

6. Publish the branch and open or reuse a draft PR.

```bash
node scripts/publish-branch.mjs \
  --feature 001-process-memory-and-macos-runners \
  --title "chore: add dreamboard process memory and macOS local runner flow"
```

## Trade-Offs

- The repository prepares prompts and branch/worktree state, but it does not
  force-launch a specific local app.
- Claude review remains unavailable until `ANTHROPIC_API_KEY` is configured in
  GitHub repository secrets.
