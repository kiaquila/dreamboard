# Setup Node v7 workflow contract

## Goal

Upgrade the CI and PR Guard Node setup action to v7 while keeping the workflow
runtime aligned with the repository's Node 24 policy.

## Scope

- Pin `actions/setup-node` v7.0.0 in CI and PR Guard.
- Retain the explicit Node 24 selection used by both workflows.
- Record the action/runtime relationship in the durable AI PR workflow guide.

## Non-goals

- Change the declared Node engine or selected Node major.
- Modify dependency installation, cache behavior, or workflow permissions.
