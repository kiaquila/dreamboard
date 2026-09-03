# Tasks: phone canvas fits the visible viewport

- [x] Reproduce at 430 x 714 in the browser pane; measure the square
      `.editor-view` and the off-screen canvas
- [x] Trace the phone floors in `getCanvasTargetSize()` and the screen-space
      dock geometry in `positionObjectMenu()`
- [x] `app.js`: `updateEditorViewportVars()`, phone fit in
      `getCanvasTargetSize()`, local geometry for dock and popups
- [x] `app.css`: measured viewport vars, `min-height: 0` on the rotated
      shell, screen-edge safe-area insets, wrapper cap
- [x] Verify 430 x 714, 375 x 667, 844 x 390, 1440 x 900; dock and font
      popup at 430 x 714
- [x] Update `docs_dreamboard/project/frontend/frontend-docs.md`
- [x] Run `pnpm run preflight`
- [x] Codex round 1 (two P2): cap `.font-popup` at the fitted canvas height;
      stop reserving the screen-top inset twice on the content-box rail
- [ ] Open the PR and check the stage preview on the iPhone 15 Pro Max
