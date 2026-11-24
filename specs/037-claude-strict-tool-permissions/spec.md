# Claude strict tool permissions

## Problem

The updated `anthropics/claude-code-action` defaults to `auto` permission
mode. In that mode, a safety review may approve tool calls outside the
repository-owned `--allowedTools` lists used by the implementation and review
workflows.

## Requirements

- Set an explicit strict permission mode in both GitHub-hosted Claude
  workflows.
- Keep the existing role-specific `--allowedTools` lists unchanged.
- Document why the permission mode is pinned explicitly.
- Preserve the existing dependency updates and all required CI checks.

## Success criteria

Both Claude workflows pass `--permission-mode acceptEdits`, repository
preflight passes, Codex reports no unresolved material findings on the final
head, and all protected-branch gates are green.
