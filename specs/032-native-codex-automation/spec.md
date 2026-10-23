# Native Codex automation

## Problem

The native connector emits a clean SHA-bound receipt and then edits its mutable
summary to completed with null finding flags. The gate can reject unfamiliar
presentation closings or let that lifecycle-only edit supersede the independent
receipt, requiring an unnecessary second audit.

## Requirements

- Collect all accessible native Codex output across the owner's personal
  repositories and audit their default-branch gate implementations.
- Cover the collected response families with provenance-bearing regressions.
- Treat only independently verified native current-head evidence as approval.
- Preserve head/request binding, negative section history, unresolved thread,
  security, withdrawal and invalidation checks. Unknown or contradictory
  evidence must remain blocking.
- Validate the change on a fresh PR with ordinary native review, without a
  separate audit; require all green gates and resolved threads before an
  unchanged 120-second interval and a normal protected merge.

## Scope

Implementation changes are limited to dreamboard. Other repositories receive a
read-only compatibility audit. Private repository contents stay in local audit
artifacts; public fixtures contain only public source evidence.
