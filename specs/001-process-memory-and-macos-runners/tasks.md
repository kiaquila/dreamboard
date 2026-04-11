# Tasks

- [x] Add process-memory files under `.specify/` and `docs_dreamboard/`
- [x] Add macOS-local orchestration scripts
- [x] Update agent contracts and devops docs
- [x] Harden baseline checks and PR guard
- [x] Run local validation and capture the result in this PR

## Validation

- `npm run ci`
- `node scripts/check-feature-memory.mjs --worktree`
- `node scripts/set-implementation-agent.mjs --implementation codex --review gemini --local-only`
- `node scripts/start-implementation-worker.mjs --feature 001-process-memory-and-macos-runners`
- `node --check scripts/check-feature-memory.mjs`
- `node --check scripts/set-implementation-agent.mjs`
- `node --check scripts/new-worktree.mjs`
- `node --check scripts/start-implementation-worker.mjs`
- `node --check scripts/publish-branch.mjs`
- `ruby -e "require 'yaml'; YAML.load_file('.github/workflows/ci.yml'); YAML.load_file('.github/workflows/pr-guard.yml')"`
