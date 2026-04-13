# Plan

## Slice 1: Lockfile and package manager pin

- run `pnpm import` against the current `package-lock.json` to generate
  `pnpm-lock.yaml` with identical resolved versions
- delete `package-lock.json`
- pin `"packageManager": "pnpm@<version>"` in `package.json`
- add `"engines": { "node": ">=20", "pnpm": ">=10.16" }` in `package.json`
- run `pnpm install --frozen-lockfile` and confirm no lockfile diff

## Slice 2: pnpm-workspace.yaml + supply-chain gate

- create `pnpm-workspace.yaml` at the repo root
- add `minimumReleaseAge: 10080` as the only setting for now
- verify with `pnpm config get minimumReleaseAge` inside the worktree

## Slice 3: Scripts and CI rewrite

- grep `scripts/*.mjs` for any `npm` invocation and replace with the pnpm
  equivalent; `publish-branch.mjs`, `new-worktree.mjs`,
  `start-implementation-worker.mjs`, `ai-review-gate.mjs`,
  `check-static-baseline.mjs`, and `build-static.mjs` are the likely
  touchpoints
- update every `.github/workflows/*.yml` job that installs or runs node tools
  to use `pnpm/action-setup@v4` before `actions/setup-node@v4` with
  `cache: 'pnpm'`, and replace `npm ci` / `npm run …` calls with
  `pnpm install --frozen-lockfile` / `pnpm run …`
- keep `package.json` script names stable; only the outer invocation shell
  changes

## Slice 4: Vercel confirmation

- rely on Vercel auto-detection from `pnpm-lock.yaml`
- open the PR, wait for the preview build, and smoke-check the editor and
  landing against the live production site
- only touch Vercel dashboard settings if the preview build fails

## Slice 5: Documentation

- update `README.md` Getting Started and Scripts sections to pnpm
- update `AGENTS.md` and `CLAUDE.md` tooling references
- update `docs_dreamboard/README.md` and any referenced devops doc that
  names `npm`
- add a short paragraph in `README.md` (or a new short section) that
  documents `minimumReleaseAge: 10080` and links to pnpm docs

## Validation

- `pnpm run ci`
- `node scripts/check-feature-memory.mjs --worktree`
- manual comparison of Vercel preview vs production on mobile and desktop
- green required checks on the PR head SHA
