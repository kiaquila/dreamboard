# dreamboard

Personal visual goal-board creator: a canvas-based editor where you place
images and text, style objects, and export the result as a composed dream
board.

**Live:** deployed to Vercel via Git integration on every push to `main`.

## Stack

- Static single-file web app (`index.html`) with assets under `src/`
- Canvas editor built on [Fabric.js](https://fabricjs.com/) (v5.3.1, via CDN)
- Build: `scripts/build-static.mjs` → `dist/index.html`
- Hosting: Vercel (Git integration, preview deploys for PRs)
- CI: GitHub Actions (`baseline-checks`, `guard`, `AI Review`)

## Getting started

```bash
npm install
npm run build        # produce dist/index.html
npm run ci           # baseline + html-validate + build + prettier check
```

Open `index.html` directly in a browser, or serve `dist/` with any static
server to preview the build.

## Scripts

| Command                        | Purpose                                                |
| ------------------------------ | ------------------------------------------------------ |
| `npm run build`                | Build static `dist/index.html` for Vercel              |
| `npm run check:repo`           | Repository baseline checks                             |
| `npm run check:html`           | HTML validation via `html-validate`                    |
| `npm run check:feature-memory` | Enforce `specs/<feature-id>/` for product changes      |
| `npm run format:check`         | Prettier check across tracked files                    |
| `npm run ci`                   | Full local CI pipeline                                 |
| `npm run worktree:new`         | Create a new local worktree for an implementation loop |
| `npm run pr:publish`           | Push current branch and open/reuse a PR                |

## Repository layout

```
dreamboard/
├── index.html                  # App shell (landing + editor)
├── src/                        # Styles, scripts, assets
├── scripts/                    # Build and orchestration helpers
├── specs/<feature-id>/         # Per-feature spec.md / plan.md / tasks.md
├── docs_dreamboard/            # Durable docs, ADRs, devops contracts
├── .specify/memory/            # Constitution and process rules
├── .github/workflows/          # CI, guard, AI review, deploy policy
├── vercel.json                 # Vercel build/output configuration
└── AGENTS.md / CLAUDE.md       # Agent onboarding
```

## Workflow

- All changes land through pull requests — no direct edits to `main` or in
  Vercel.
- Product-code work starts from an active `specs/<feature-id>/` folder and
  runs in its own worktree / branch / PR.
- Required checks: `baseline-checks`, `guard`, `AI Review`.
- Agent policy is repository-driven via `AI_IMPLEMENTATION_AGENT` and
  `AI_REVIEW_AGENT` (defaults: `codex` for implementation, `gemini` for review).

See [`AGENTS.md`](./AGENTS.md) for the full onboarding route and
[`docs_dreamboard/README.md`](./docs_dreamboard/README.md) for the durable docs
index.

## License

Personal project — all rights reserved unless stated otherwise.
