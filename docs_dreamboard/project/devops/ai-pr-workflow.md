# AI Pull Request Workflow

This is the canonical PR loop for `dreamboard`.

## Roles

- Codex owns architecture, repository memory, CI/CD health, and local
  orchestration.
- The selected implementation agent writes scoped code on a feature branch.
- GitHub Actions runs `baseline-checks`, `guard`, and `AI Review`.
- Vercel provides preview deployments for PRs and production deploy on merge to
  `main`.
- A human remains the final merge authority.

## Standard Loop

1. Start from current `main`.
2. Create or update one active `specs/<feature-id>/` folder.
3. Create an isolated macOS worktree for the task.
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
10. Keep fixing the same branch until only human approval and merge remain.

## Hard Gates

- Product changes in `index.html`, `src/`, future app code, or runtime config do
  not start without an active `specs/<feature-id>/` folder.
- Local product edits in the main checkout do not count as completed work.
- If the selected implementation agent path is unavailable, stop and report the
  blocker instead of bypassing the loop.
- A PR is not done while required checks are queued, running, or red.

## Review Contract

- Reviewer selection comes only from `AI_REVIEW_AGENT`.
- Supported review backends are `gemini`, `codex`, and `claude`.
- `AI Review` is the normalized required check regardless of the backend.
- Low-severity-only findings are advisory and non-blocking.
- With no repository override, the pull-request gate defaults to `gemini`.
- When `AI_REVIEW_AGENT=codex`, the pull-request gate waits for native Codex output without posting a bot-authored `@codex review` trigger comment.
- Manual Gemini review commands stay native-only; rerunning the PR-linked
  `AI Review` workflow is enough to reuse same-head Gemini output.

## Merge-Ready Definition

The current PR head SHA is merge-ready only when:

- `baseline-checks` is green
- `guard` is green
- `AI Review` is green
- Vercel preview is healthy for the changed flow
- no blocking review findings remain unresolved
- no merge conflicts remain

## Related Docs

- `docs_dreamboard/project/devops/macos-local-runners.md`
- `docs_dreamboard/project/devops/ai-orchestration-protocol.md`
- `docs_dreamboard/project/devops/vercel-cd.md`
- `docs_dreamboard/project/devops/delivery-playbook.md`
