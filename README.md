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

This project uses **pnpm** (pinned via `packageManager` in `package.json`).
The easiest way to get the right version is Node's built-in
[`corepack`](https://nodejs.org/api/corepack.html):

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run build        # produce dist/index.html
pnpm run ci           # baseline + html-validate + build + prettier check
```

Open `index.html` directly in a browser, or serve `dist/` with any static
server to preview the build.

## Scripts

| Command                         | Purpose                                                |
| ------------------------------- | ------------------------------------------------------ |
| `pnpm run build`                | Build static `dist/index.html` for Vercel              |
| `pnpm run check:repo`           | Repository baseline checks                             |
| `pnpm run check:html`           | HTML validation via `html-validate`                    |
| `pnpm run check:feature-memory` | Enforce `specs/<feature-id>/` for product changes      |
| `pnpm run format:check`         | Prettier check across tracked files                    |
| `pnpm run ci`                   | Full local CI pipeline                                 |
| `pnpm run worktree:new`         | Create a new local worktree for an implementation loop |
| `pnpm run pr:publish`           | Push current branch and open/reuse a PR                |

## Supply chain

`pnpm-workspace.yaml` sets `minimumReleaseAge: 10080` (7 days, expressed in
minutes). Any newly published version of a dependency — direct or transitive
— must exist on the registry for at least 7 days before pnpm will install it.
This reduces exposure to supply-chain attacks that rely on freshly published
compromised versions being pulled in immediately.

See [pnpm docs on `minimumReleaseAge`](https://pnpm.io/settings#minimumreleaseage)
for details.

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
  `AI_REVIEW_AGENT` (defaults: `claude` for implementation, `codex` for
  review, with `gemini` as the fallback review backend).

See [`AGENTS.md`](./AGENTS.md) for the full onboarding route and
[`docs_dreamboard/README.md`](./docs_dreamboard/README.md) for the durable docs
index.

## License

Released under the [MIT License](./LICENSE). © 2026 Kristina Aquila.
