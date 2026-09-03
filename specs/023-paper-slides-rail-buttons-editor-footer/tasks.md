# Tasks: one paper tone for slides, rail buttons back to height, footer under the editor canvas

- [x] Measure the pre-022 rail button height on `main` (40px desktop, 48px
      phone) and the PR #37 height (58px)
- [x] Inventory readers of `--landing-bg*`, `bg-1` / `bg-2`, `#appFooter`
      and `.canvas-area`
- [x] Paint every slide and `.landing-view` with `--landing-paper`; delete
      `.bg-1` / `.bg-2` and the two tokens
- [x] Add `--editor-btn-height` / `--editor-btn-height-touch`; point the
      rail buttons at them, desktop and `<= 900px`
- [x] Split `.sticky-footer` into `.site-footer` + `.sticky-footer`; add
      `.editor-footer` and the `.canvas-stage` column
- [x] `index.html`: drop slide classes, wrap the stage, add the editor
      footer, tag `#appFooter` with `site-footer`
- [x] Update `docs_dreamboard/project/frontend/frontend-docs.md`
- [x] Verify landing and editor at 1440 x 900, editor at 844 x 390 and
      390 x 844
- [x] Second review: move the clip to `.canvas-stage`, zero the stage bottom
      padding, confirm the shadow is no longer cut at the footer line
- [x] Rebase onto merged PR #37; bring the rotated-portrait rail (58px since
      `7aebb89`) to the 48px touch height
- [x] Codex P2: add the desktop `.canvas-area` floor so a short window
      scrolls stage and footer instead of overlapping them
- [ ] Run `pnpm run preflight`
- [ ] Open the PR (stacked on PR #37 until it merges) and drive it to
      merge-ready
