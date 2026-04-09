# AGENTS.md — dreamboard

> Universal onboarding document for any AI agent (Claude Code, Codex, Gemini CLI, Cursor, etc.)

## What Is dreamboard?

**dreamboard** is a personal visual goal-board creator. It combines a marketing landing page and a canvas-based editor where a user can place images and text, style objects, and export the result as a composed dream board.

**Current implementation:** static single-file web app  
**Core editor dependency:** Fabric.js  
**Deploy target:** Vercel via Git integration  
**Owner:** personal project, single user

## Current Phase & Status

| Area                          | Status                                             |
| ----------------------------- | -------------------------------------------------- |
| Product prototype             | COMPLETE                                           |
| Static landing + editor       | COMPLETE                                           |
| Mobile adaptation             | PARTIAL — needs redesign                           |
| Frontend architecture cleanup | UPCOMING                                           |
| CI / AI review orchestration  | COMPLETE after infra PR                            |
| Production deploy flow        | COMPLETE via Vercel Git integration after infra PR |

## Project Structure

```
dreamboard/
├── index.html                          # Current app: landing + editor + styles + scripts
├── package.json                        # Repo tooling for CI and Vercel build
├── vercel.json                         # Vercel build/output configuration
├── scripts/
│   ├── build-static.mjs                # Static build to dist/
│   ├── check-static-baseline.mjs       # Repository baseline checks
│   ├── resolve-pr-context.mjs          # Pull request context resolver for workflows
│   └── ai-review-gate.mjs              # Review gate for Codex/Claude
├── docs_dreamboard/
│   ├── project-idea.md                 # Product overview and roadmap
│   └── project/
│       ├── frontend/frontend-docs.md   # Frontend architecture notes
│       └── devops/                     # CI/CD and orchestration contract
└── .github/workflows/                  # CI, guard, AI review, Claude, deploy policy
```

## Delivery Workflow

- All code changes land through pull requests.
- Required GitHub checks are `baseline-checks`, `guard`, and `AI Review`.
- Vercel handles preview deployments for pull requests and production deployment for `main` through Git integration.
- Durable workflow docs live under `docs_dreamboard/project/devops/`.
- Agent selection is policy-driven through repository variables:
  - `AI_IMPLEMENTATION_AGENT`
  - `AI_REVIEW_AGENT`
- Default policy for this repository is:
  - implementation: `codex`
  - review: `gemini`
- Gemini review is the default because it is installed on the repository and can run natively on GitHub PRs.
- Claude paths remain available but require `ANTHROPIC_API_KEY` to be configured before switching policy.
- Trusted human review commands also dispatch the shared `AI Review` normalization workflow, so `gemini`, `codex`, and `claude` can all be routed through the same gate contract.
- Only trusted repository actors may trigger AI workflows.
- Trusted actors are `OWNER`, `MEMBER`, and `COLLABORATOR`.

## Review Guidelines

- Codex review uses native GitHub PR review output plus `P0-P3` inline severity badges.
- Claude review uses a top-level `claude[bot]` comment with marker lines, not a formal GitHub PR review.
- Gemini review uses native GitHub PR review output from `gemini-code-assist[bot]` plus inline severity markers such as `Critical`, `High`, `Medium`, and `Low`.
- When a Claude review request includes `AI_REVIEW_AGENT`, `AI_REVIEW_SHA`, and `AI_REVIEW_OUTCOME`, preserve those lines exactly at the start of the final top-level Claude comment.
- `AI_REVIEW_OUTCOME=pass` means no material findings.
- `AI_REVIEW_OUTCOME=advisory` means advisory-only findings that should not block merge.
- `AI_REVIEW_OUTCOME=block` means at least one finding should block merge.

## Key Rules

### 1. Repository is the source of truth

No direct production edits in Vercel or the browser. Product changes must be made in git, reviewed in a PR, and deployed from the reviewed branch or merge commit.

### 2. Keep durable docs in sync

When updating `index.html`, `scripts/`, workflow behavior, or deployment configuration, update at least one relevant file under `docs_dreamboard/`, `AGENTS.md`, or `CLAUDE.md`.

### 3. Preserve static-site deployability

Even while the app is still a single-file prototype, changes must keep `npm run build` producing a deployable `dist/index.html` artifact for Vercel.

### 4. Gemini review config is repository-owned

Gemini review behavior is configured through `.gemini/config.yaml` and `.gemini/styleguide.md`. Keep those files in sync with the repository review contract.

### 5. Frontend changes should improve mobile, not patch around it

Avoid adding more fixed-size offsets and viewport hacks unless strictly necessary. Prefer layout systems that can survive later migration to a modular frontend app.

## Reading Route — Implementing a Change

1. `docs_dreamboard/project-idea.md`
2. `docs_dreamboard/project/frontend/frontend-docs.md`
3. `docs_dreamboard/project/devops/ai-orchestration-protocol.md`
4. `index.html`
5. Existing workflows and scripts
