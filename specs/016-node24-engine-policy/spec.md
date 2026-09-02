# Node 24 engine policy

## Goal

Align the declared Node.js engine with the runtime required by the current
validation toolchain.

## Scope

- Require Node.js 24.8 or newer in `package.json`.
- Keep the documented local runner prerequisite aligned with the engine.

## Non-goals

- Changing CI's selected Node major version.
- Updating dependency versions beyond the separate Dependabot PR.
