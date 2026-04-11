# dreamboard Process Constitution

## Purpose

This repository uses a lightweight spec-driven and AI-assisted delivery model.
The goal is to make frontend work resumable, reviewable, and safe to ship
through Vercel without relying on hidden session memory.

## Non-Negotiable Rules

1. Repository memory over session memory.
   Durable intent and operating rules live in `.specify/`, `docs_dreamboard/`,
   `specs/`, workflows, and tests.
2. Specs before product code.
   Before changing the landing page, editor behavior, build contract, or deploy
   behavior, create or update one active `specs/<feature-id>/` folder with
   `spec.md`, `plan.md`, and `tasks.md`.
3. Pull requests only.
   Product changes land through pull requests with green required checks.
4. One worker, one worktree, one branch, one PR.
   Local implementation loops must run in isolated macOS worktrees instead of
   the main checkout.
5. Merge-ready means the full loop is green.
   A task is done only when the current PR head SHA has green
   `baseline-checks`, `guard`, and `AI Review`, no unresolved blocking review
   findings, and a healthy Vercel preview for the changed scope.
6. Production changes come from Git only.
   No direct edits in Vercel or the browser; production updates happen only
   through merge to `main` and Vercel Git integration.
7. Documentation moves with behavior.
   Changes to app behavior, orchestration, CI/CD, or architecture must update
   durable docs in the same PR.
8. Mobile-first quality bar.
   The site must remain usable on iPhone-sized screens, keep editor state safe,
   and preserve export/download behavior.

## Memory Layers

- `.specify/`
  Process constitution and future reusable templates.
- `docs_dreamboard/`
  Durable product, frontend, deployment, and orchestration context.
- `specs/<feature-id>/`
  Active feature intent, implementation plan, and execution state.

## Roles

- User
  Sets goals, approves product direction, and remains the final merge authority.
- Codex
  Owns architecture, orchestration, CI/CD health, repository memory, and can be
  the selected implementation agent.
- Claude
  Optional implementation or review agent when the repository secret
  `ANTHROPIC_API_KEY` is configured.
- Gemini
  Default native review backend on GitHub.
- GitHub Actions + Vercel
  Execute required checks, review normalization, previews, and production
  deployment.

## Standard Feature Loop

1. Sync from current `main`.
2. Create or update one active `specs/<feature-id>/` folder.
3. Select the implementation and review policy for the task.
4. Create an isolated macOS worktree and branch.
5. Generate the implementation prompt from repository memory.
6. Implement the scoped change on that branch only.
7. Update `tasks.md`, tests, and durable docs.
8. Open or update the same PR.
9. Wait for `baseline-checks`, `guard`, `AI Review`, and Vercel preview.
10. Iterate on the same branch until the PR is merge-ready.

## macOS Local Runner Contract

- Local orchestration is repository-owned and documented in
  `docs_dreamboard/project/devops/macos-local-runners.md`.
- Local agent selection state is stored under `.codex/` and is gitignored.
- Scripts may prepare prompts, worktrees, and PR publishing, but they must not
  bypass the PR loop or GitHub checks.
