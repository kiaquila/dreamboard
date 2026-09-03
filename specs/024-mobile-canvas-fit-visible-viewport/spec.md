# Spec: phone canvas fits the visible viewport

## Goal

On a phone the whole Fabric canvas is on screen, in both orientations, in
Safari and in in-app browsers. Nothing of it runs under a toolbar or off an
edge, and the object menu and its popups stay on the canvas too.

## Background

Reported on an iPhone 15 Pro Max in an in-app Safari view (2026-09-03): the
far end of the canvas is cut off by the bottom toolbar and cannot be scrolled
into view. Three causes were found on `main`:

- In the rotated portrait shell (`(max-width: 900px) and (orientation:
portrait)`), `body.is-editor-active .editor-view` sets `width: 100dvh;
height: 100dvw` but inherits `min-height: 100dvh` from the base
  `.editor-view`. The floor wins over the height, the box is `100dvh` square,
  and after the quarter turn its far side sits `100dvh - 100dvw` off the left
  of the screen. At 430 x 714 the canvas was 507 x 686 with 270px of it
  outside the viewport.
- The phone shell is sized from `dvh` / `dvw`. In-app browsers and Safari with
  a collapsible toolbar can report a `100dvh` taller than the visible area, and
  the canvas owns every touch (`touch-action: none`), so anything laid out past
  the visible height has no way to scroll into view.
- `getCanvasTargetSize()` floors the phone canvas at 280 x 360. In the
  rotated shell the canvas height is the screen width minus 28px, which is
  347px on a 375px phone, so the floor overflowed the column by 13px.
- The mobile dock and the font / colour popups are positioned from
  `getBoundingClientRect()`, whose width and height swap places inside the
  rotated shell, so the dock landed mid-canvas and ran past its right edge.

## Scope

- `src/scripts/app.js`
  - `updateEditorViewportVars()` writes `--editor-vw` / `--editor-vh` from
    `innerWidth` / `innerHeight` at boot and from every `syncEditorViewport`
    call (`resize`, `orientationchange`, `visualViewport.resize`, editor entry)
  - `getCanvasTargetSize()` gives the phone canvas the measured column with
    only a 120px degenerate-measurement floor; desktop keeps 420 x 520
  - `positionObjectMenu()` (mobile branch), `positionColorPopup()` and
    `positionFontPopup()` read local wrapper geometry (`canvas.getWidth()` /
    `getHeight()`, `offsetLeft` / `offsetTop` / `offsetWidth` / `offsetHeight`)
    through a shared `positionAnchoredPopup()`
- `src/styles/app.css`
  - phone editor (`<= 900px`, `body.is-editor-active`): `.app-container`
    height, `.sidebar` max-height and `.canvas-wrapper` max-height read
    `var(--editor-vh, 100dvh)`
  - rotated portrait shell: `.editor-view` takes `width: var(--editor-vh,
100dvh); height: var(--editor-vw, 100dvw); min-height: 0` and translates by
    `var(--editor-vw, 100dvw)`; the sidebar carries the screen-top safe-area
    inset on its left edge and grows by it; `.canvas-area` carries the
    screen-bottom inset on its right edge; `.canvas-wrapper` is capped at
    `var(--editor-vw, 100dvw) - 28px`
- `docs_dreamboard/project/frontend/frontend-docs.md`

## Decisions

- Fit, not scroll. The canvas keeps `touch-action: none` so Fabric owns drags,
  which means a scroll container around it can only be scrolled from the 14px
  gutters. A canvas that always fits the visible column needs no scroll at
  all, and the desktop keeps its existing `.canvas-stage` scroll for windows
  shorter than the 520px minimum.
- Measured viewport over `dvh`. `innerWidth` / `innerHeight` are the visible
  layout viewport in every mobile browser and, unlike `visualViewport`, do not
  shrink for the iOS keyboard, so an in-progress text edit does not resize the
  canvas. `dvh` / `dvw` stay as CSS fallbacks for a page without the script.
- Safe-area insets follow the screen. In the rotated shell the box's top edge
  is the screen's right edge, so the previous top / bottom insets on the rail
  and the column padded the wrong sides. The screen-top inset now pads the
  rail's left edge, the screen-bottom inset the column's right edge.
- Local geometry for the dock. Offsets against `.canvas-wrapper` describe the
  same plane the menu is positioned in, in both orientations; client rects do
  not once the wrapper is transformed. The existing drag handler already
  converted deltas for the rotated shell, so the positioning now matches it.

## Non-Goals

- no change to the rotated-portrait approach itself (spec 002), to the rail
  contents, or to the landscape shell layout
- no scaling of restored draft objects to the new canvas size; object
  coordinates stay absolute, as before
- no change to the desktop editor

## Acceptance Criteria

1. At 430 x 714 in `#editor` the `.editor-view` box is 714 x 430 before the
   turn (`min-height` computes `0px`), its client rect is exactly the
   viewport, and the Fabric canvas is 507 x 402 with its container rect inside
   `[14, 416] x [193, 700]`.
2. At 375 x 667 the canvas is 461 x 347, entirely inside the viewport; no
   phone size floors the canvas above the measured column.
3. At 844 x 390 the canvas is 567 x 362 inside the viewport; at 1440 x 900 the
   canvas is unchanged from `main` (1029 x 835, bottom at the footer top).
4. At 430 x 714 with a text selected, the mobile dock lies along the far
   (screen-left) edge of the canvas, centred on it, fully inside the canvas
   rect; the font popup opens fully inside the canvas rect.
5. `--editor-vw` / `--editor-vh` equal `innerWidth` / `innerHeight` after
   boot and after a `resize` event.
6. `pnpm run preflight` is green and the frontend docs describe the measured
   viewport, the fit rule and the local dock geometry.
