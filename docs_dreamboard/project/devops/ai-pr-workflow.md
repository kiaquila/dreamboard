# AI Pull Request Workflow

This is the canonical PR loop for `dreamboard`.

## Roles

- Claude owns architecture, repository memory, CI/CD health, and local
  orchestration, and is the default implementation agent.
- The selected implementation agent writes scoped code on a feature branch.
- GitHub Actions runs `baseline-checks`, `guard`, and `AI Review`.
- Vercel provides preview deployments for PRs and does not deploy `main`.
- Cloudflare Workers Builds provides an additional isolated staging URL for
  every PR; the stable Cloudflare Worker is staging, not production.
- The `cz` production host publishes protected `main` after exact-SHA `CI` and
  `OSV Scan` workflow runs from a `main` push pass; manually dispatched runs
  cannot satisfy the production gate.
- A human remains the final merge authority.

## Standard Loop

1. Start from current `main`.
2. Create or update one active `specs/<feature-id>/` folder.
3. Create an isolated macOS worktree for the task under
   `<repoRoot>/.claude/worktrees/<slug>/`.
4. Select the implementation and review agents for the branch.
5. Generate the implementation prompt from repository memory.
6. Implement only the scoped change on that branch.
7. Update `tasks.md`, docs, and tests or validation notes in the same PR.
8. Open or update the same PR.
9. Wait for:
   - `baseline-checks`
   - `guard`
   - `AI Review`
   - healthy Vercel preview deployment
   - healthy Cloudflare Workers preview deployment
10. Keep fixing the same branch until only human approval and merge remain.

## Hard Gates

- Product changes in `index.html`, `src/`, future app code, or runtime config do
  not start without an active `specs/<feature-id>/` folder.
- Dependency-only updates are exempt from product documentation and feature
  memory, while still running the full repository baseline. The guard verifies
  that `package.json` changes are limited to dependency fields, and it accepts
  GitHub Actions updates only when a pinned `uses:` revision changes while its
  action coordinate, including any action subpath, remains unchanged.
- Local product edits in the main checkout do not count as completed work.
- If the selected implementation agent path is unavailable, stop and report the
  blocker instead of bypassing the loop.
- A PR is not done while required checks are queued, running, or red.
- Gate scripts (`scripts/check-feature-memory.mjs`,
  `scripts/check-static-baseline.mjs`, `scripts/resolve-pr-context.mjs`,
  `scripts/ai-review-gate.mjs`) execute only from `default_branch` via
  pinned `actions/checkout` v7 with explicit `ref:`. PR Guard uses a two-checkout pattern
  (`.gate-trusted/` for trusted scripts, workspace root for PR content), so a
  PR cannot tamper with gate logic to bypass required checks.
- CI and PR Guard pin `actions/setup-node` v7 and explicitly select Node 24,
  matching the repository's declared Node 24.8-or-newer runtime policy.

## Review Contract

- Reviewer selection comes only from `AI_REVIEW_AGENT`.
- Supported review backends are `codex`, `gemini`, and `claude`.
- `AI Review` is the normalized required check regardless of the backend.
- Low-severity-only findings are advisory and non-blocking.
- With no repository override, the pull-request gate defaults to `codex`.
- The gate uses `trigger_mode=skip` and passively waits for same-head native
  evidence. Codex's external Automatic review / Review trigger settings control
  which PR lifecycle events start review; bot-authored trigger comments cannot
  replace those settings.
- A native clean receipt or explicit clean structured state passes automatically
  through the PR-linked gate and wakeup. No separate audit task is required.
  If native review has not started, the owner may post `@codex review`; after a
  push, require new current-head evidence. See
  `docs_dreamboard/project/devops/review-contract.md` for the full contract.
- Manual Gemini and Codex review commands stay native-only so they do not
  cancel the PR-linked `AI Review` check.
- Rerunning the PR-linked `AI Review` workflow is enough to reuse same-head
  Codex or Gemini output.

## Merge-Ready Definition

The current PR head SHA is merge-ready only when:

- `baseline-checks` is green
- `guard` is green
- `AI Review` is green
- Vercel preview is healthy for the changed flow
- Cloudflare Workers preview is healthy for the changed flow
- no blocking review findings remain unresolved
- no merge conflicts remain

## Related Docs

- `docs_dreamboard/project/devops/macos-local-runners.md`
- `docs_dreamboard/project/devops/ai-orchestration-protocol.md`
- `docs_dreamboard/project/devops/vercel-cd.md`
- `docs_dreamboard/project/devops/cloudflare-stage.md`
- `docs_dreamboard/project/devops/delivery-playbook.md`
