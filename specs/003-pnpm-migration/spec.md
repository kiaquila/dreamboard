# Spec: migrate dreamboard from npm to pnpm

## Goal

Adopt pnpm as the sole package manager for dreamboard so the repository can
enforce a minimum release age on installed dependencies as a supply-chain
protection, without changing any runtime behavior of the app.

## Scope

- replace `package-lock.json` with `pnpm-lock.yaml` using `pnpm import` to
  preserve exact resolved versions
- pin the pnpm version through `packageManager` in `package.json` so
  `corepack` gives every contributor the same pnpm
- add `engines` to `package.json` so local and CI environments fail fast on
  unsupported Node or pnpm versions
- create `pnpm-workspace.yaml` at the repo root containing
  `minimumReleaseAge: 10080` (7 days in minutes) as the canonical pnpm
  configuration location
- rewrite every `npm`, `npm ci`, `npm install`, and `npm run …` invocation
  inside `scripts/*.mjs` and `.github/workflows/*.yml` to the pnpm equivalent
- switch GitHub Actions jobs to `pnpm/action-setup` before
  `actions/setup-node@v4` and use `cache: 'pnpm'`
- verify that Vercel preview and production deploys still succeed through its
  automatic pnpm detection (no Vercel dashboard changes unless required)
- synchronize durable docs: `README.md`, `AGENTS.md`, `CLAUDE.md`,
  `docs_dreamboard/README.md`, and any doc under
  `docs_dreamboard/project/devops/` that mentions `npm` commands

## Non-Goals

- no dependency version upgrades; `pnpm import` must preserve the current
  resolved versions
- no migration to a pnpm workspace monorepo (single package stays single)
- no switch to `hoisted` node-linker unless a concrete tool in the repo
  breaks on the default symlinked layout
- no changes to application code under `src/` or `index.html`
- no changes to review policy or AI workflows beyond the agent/path rename
- no renaming of existing repository variables or secrets

## Acceptance Criteria

1. `package-lock.json` is deleted and `pnpm-lock.yaml` exists at the repo
   root with the same resolved package versions as the previous lockfile.
2. `package.json` declares `"packageManager": "pnpm@<pinned-version>"` and
   `"engines": { "node": ">=20", "pnpm": ">=10.16" }`.
3. `pnpm-workspace.yaml` exists at the repo root and contains
   `minimumReleaseAge: 10080`.
4. No file in the repository runs `npm ci`, `npm install`, or `npm run …`
   except documentation that explicitly discusses the former toolchain.
5. `pnpm run ci` is green locally on a clean checkout with only `pnpm install
--frozen-lockfile` as bootstrap.
6. On the PR for this feature, `baseline-checks`, `guard`, `AI Review`, and
   the Vercel preview all report success against the same head SHA.
7. The Vercel preview deployed from the PR renders the editor and landing
   identically to current production (manual smoke check).
8. `README.md`, `AGENTS.md`, `CLAUDE.md`, and `docs_dreamboard/README.md` all
   reference pnpm commands and explain the `minimumReleaseAge` rule in one
   paragraph each.
9. `node scripts/check-feature-memory.mjs --worktree` passes from inside the
   worktree.
