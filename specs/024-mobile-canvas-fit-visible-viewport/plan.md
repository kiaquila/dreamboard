# Plan: phone canvas fits the visible viewport

## Evidence gathered before editing

- `main` at 430 x 714 (`#editor`, browser pane): `.editor-view` client rect
  `x: -284, w: 714, h: 714`; `.canvas-container` `x: -270, w: 686, h: 507`;
  Fabric canvas 507 x 686. The `min-height: 100dvh` of the base
  `.editor-view` wins over the rotated rule's `height: 100dvw`.
- `getCanvasTargetSize()` floors phones at 280 x 360; the rotated column is
  `innerWidth - 28` tall, 347px on a 375px phone.
- `positionObjectMenu()` mobile branch: `canvasRect.width` 402 /
  `canvasRect.height` 507 (screen space) for a 507 x 402 canvas; the dock
  landed at `left: 145; top: 111` and ran 22px past the canvas' right edge.
- The drag handler (`toLocalDelta`) already converts screen deltas for the
  rotated shell, so it stays as is.
- Browser pane caveat: a hidden pane tab fires neither `requestAnimationFrame`
  nor `ResizeObserver`, so the canvas reads its 960 x 640 default until the
  tab is fronted and painted (a screenshot forces a frame); the popups also
  position inside `requestAnimationFrame`.

## Steps

1. `app.js`: add `updateEditorViewportVars()`; call it first in
   `syncEditorViewport()` and once at boot.
2. `app.js`: split `getCanvasTargetSize()` into the phone fit (120px floor)
   and the desktop 420 x 520 minimum.
3. `app.js`: add `getLocalCanvasSize()` / `getLocalRect()`; fold the two
   popup positioners into `positionAnchoredPopup(popup, anchorButton)`;
   switch the mobile dock branch to local geometry and move the client-rect
   reads into the desktop branch.
4. `app.css`: point the phone editor heights at `var(--editor-vh, 100dvh)`;
   in the rotated block set `min-height: 0`, size and translate from the two
   vars, move the safe-area insets to the screen's edges, cap the wrapper
   height at `var(--editor-vw, 100dvw) - 28px`.
5. Verify at 430 x 714, 375 x 667, 844 x 390 and 1440 x 900; with a text
   selected, check the dock and the font popup at 430 x 714.
6. Update `frontend-docs.md`; run `pnpm run preflight`; open the PR for the
   on-device check on the stage preview.

## Risk

Low to medium. The CSS custom properties fall back to the previous `dvh` /
`dvw` values, so a page without the script lays out as before. The phone
floor change only lowers sizes on phones narrower than 388px in the rotated
shell or shorter than 388px in landscape. The popup refactor keeps the same
placement rule (below the menu when there is room, else above; centred on the
anchor button; clamped 10px inside the canvas) and only swaps the geometry
source, which is identical to the old one when nothing is transformed, so the
desktop menu is unchanged. Android Chrome shrinks `innerHeight` for the
keyboard exactly as it shrank `dvh`, so keyboard behaviour there is
unchanged.
