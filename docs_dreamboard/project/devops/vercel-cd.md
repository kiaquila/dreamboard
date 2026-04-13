# Vercel CD

## Deploy Model

This repository uses **Vercel Git integration** as the canonical CD layer.

- Pull requests create Vercel preview deployments
- Merge to `main` creates a Vercel production deployment
- GitHub Actions remain the canonical CI and AI-review layer

This is intentionally different from `vb-influencer`, which deploys to EC2 through a GitHub Actions workflow. For `dreamboard`, Vercel-native Git deploys are the simpler and safer fit because the app is a static frontend.

## Connected Project

Current Vercel project:

- name: `dreamboard`
- team: `ks_aquila's projects`

## Build Contract

The repository declares:

- `buildCommand`: `pnpm run build`
- `outputDirectory`: `dist`

`pnpm run build` must always produce a deployable static artifact under `dist/`.

Vercel auto-detects pnpm from `pnpm-lock.yaml` and uses the version pinned in `packageManager` (see [`../../README.md`](../../README.md#supply-chain)). No Vercel dashboard overrides required.

The repository also keeps Gemini review configuration in `.gemini/` so review behavior stays versioned together with the app and workflow contract.

## Operational Rule

Do not treat manual dashboard edits as the delivery path. Product behavior should change through:

1. repository change
2. PR checks
3. merge to `main`
4. Vercel production deploy from the merged commit

Preview validation and post-merge smoke are documented in
`docs_dreamboard/project/devops/delivery-playbook.md`.
