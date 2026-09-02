# Tasks

- [x] Verify the topbar is unreachable at four viewports and record baseline
      editor geometry.
- [x] Remove the topbar markup and the unreachable sidebar overlay node.
- [x] Remove the topbar and drawer CSS, including
      `--editor-mobile-topbar-height` and its uses.
- [x] Remove the unreachable script lookups, listeners and sidebar functions.
- [x] Re-measure editor geometry and confirm it matches the baseline.
- [x] Update `docs_dreamboard/project/frontend/frontend-docs.md`.
- [x] Merge current `main` after the redesign and English-only work landed,
      then re-apply the removal against the new markup, styles and script.
- [x] Re-measure editor geometry against `main` after that merge.
- [x] Apply the final editor layout during `#editor` bootstrap so removing the
      topbar does not change the pre-module frame.
- [ ] Run `pnpm run preflight` and publish one pull request.
