# Codex collapsible summary compatibility

## Problem

Codex now wraps the structured pull-request review summary in an outer
`<details>` block with a status-bearing `<summary>` line. The trusted parser on
`main` only recognizes the older Markdown `## Codex Review Summary` heading.
It therefore treats a valid clean lifecycle as newer pending evidence, hides a
valid SHA-bound clean receipt, and leaves the required `AI Review` check red.

## Requirements

- Accept the exact native collapsible wrapper without weakening the closed
  typed-state schema, table, timestamp, help-footer, actor, SHA, and freshness
  checks.
- Require the wrapper status to match the typed active review state.
- Preserve support for the legacy Markdown-heading presentation.
- Reject wrapper attributes, status mismatches, trailing prose, malformed
  nesting, and unknown presentation text.
- Prove both clean structured approval and null/null lifecycle pairing through
  the real gate regression harness.
- Keep negative history, unresolved findings, request boundaries, and final
  live-HEAD validation unchanged.

## Recovery target

After this compatibility change reaches protected `main`, rerunning the
existing PR-linked gate for Dependabot PR #70 must consume its persisted native
receipt and collapsible lifecycle without posting synthetic review evidence or
replacing the required check.
