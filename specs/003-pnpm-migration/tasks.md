# Tasks

- [x] Run `pnpm import` to generate `pnpm-lock.yaml` from `package-lock.json`
- [x] Delete `package-lock.json`
- [x] Pin `packageManager` and add `engines` in `package.json`
- [x] Run `pnpm install --frozen-lockfile` and verify no lockfile diff
- [x] Create `pnpm-workspace.yaml` with `minimumReleaseAge: 10080`
- [x] Replace every `npm …` invocation in `scripts/*.mjs` with the pnpm equivalent
- [x] Rewrite `.github/workflows/*.yml` jobs to use `pnpm/action-setup@v4` and pnpm commands
- [x] Update `README.md` Getting Started and Scripts sections for pnpm
- [x] Update `AGENTS.md`, `CLAUDE.md`, and affected `docs_dreamboard/` docs for pnpm
- [x] Document `minimumReleaseAge: 10080` rationale in README
- [x] Run `pnpm run ci` inside the worktree and paste the result in this PR
- [x] Run `node scripts/check-feature-memory.mjs --worktree` and paste the result in this PR
- [ ] Open PR via `pnpm run pr:publish` (after Slice 3 makes the script pnpm-aware)
- [ ] Wait for Vercel preview, baseline-checks, guard, AI Review to be green on the same head SHA
- [ ] Smoke-check the Vercel preview against production on desktop and mobile

## Validation

- `pnpm run ci`
- `node scripts/check-feature-memory.mjs --worktree`
