# Spec: one paper tone for slides, rail buttons back to height, footer under the editor canvas

## Goal

Three follow-ups to the spec 022 button standard, all raised on the PR #37
preview (2026-09-02):

1. Every landing slide takes the background of slide 1, so scrolling never
   flips the tone.
2. The editor rail buttons return to their pre-022 height while keeping the
   black pill style. The landing CTA and the donate link keep the 58px
   standard.
3. The editor shows the same one-line footer as the landing, under the canvas,
   on the same continuous backdrop with no seam, and the canvas ends where the
   footer slot begins.

## Background

- Slides alternated `--landing-bg` (`#ececec`) and `--landing-bg-2`
  (`#f3f3f3`) through `.bg-1` / `.bg-2`, while the two hero slides painted
  `--landing-paper` (`#f4f2ee`) through `.bg-hero`. Three greys on four
  slides.
- Spec 022 put `--btn-height: 58px` on `.control-group button` and
  `.file-input-label`. Before it the rail buttons were `padding: 12px` around
  a 12px label, 40px tall on desktop (measured on `main`), and `min-height:
48px` below 900px. Three 58px slabs stacked in a 320px rail read as a wall.
- The footer `#appFooter` is `position: fixed`, hidden in the editor by
  `body.is-editor-active .sticky-footer` and
  `html[data-initial-view="editor"] .sticky-footer`, and
  `body.is-editor-active .app-container` takes the full `100dvh`. The Fabric
  canvas follows `.canvas-area` through a `ResizeObserver`.

## Scope

- `src/styles/app.css`
  - `.landing-view` and `.landing-section` paint `--landing-paper`; the
    `.bg-1` / `.bg-2` rules and the `--landing-bg*` tokens are deleted;
    `.bg-hero` keeps only its position and header padding
  - new tokens `--editor-btn-height: 40px` and
    `--editor-btn-height-touch: 48px`, read by `.control-group button` and
    `.file-input-label` (desktop) and their `<= 900px` override
  - the footer typography moves to `.site-footer`; `.sticky-footer` keeps only
    the fixed viewport pin; new `.editor-footer` is a `45px` flex row
  - new `.canvas-stage` column that holds `.canvas-area` and `.editor-footer`
    and takes over `overflow: auto`; `.canvas-area` loses its clip and its
    bottom padding on desktop
  - `.editor-footer` is `display: none` below 900px
- `index.html`
  - drop the `bg-1` / `bg-2` classes from the four slides
  - wrap the stage: `<main class="canvas-stage">` holds
    `<div class="canvas-area">` and a second
    `<footer class="site-footer editor-footer">` with the same line as
    `#appFooter`
  - `#appFooter` gets the `site-footer` class
- `docs_dreamboard/project/frontend/frontend-docs.md`

## Decisions

- The footer sits under the canvas column, not under the whole shell: the
  rail stays full height and the footer text centres on the canvas, which is
  what "under the canvas" means visually. The line is a second static footer
  inside the column rather than the fixed one repositioned, because the fixed
  element would need a hardcoded rail width and the column lets the existing
  `ResizeObserver` shrink the canvas by exactly the footer height with no JS
  change.
- No seam. The first cut kept `overflow: auto` on `.canvas-area`, which
  clipped the canvas shadow (`0 10px 40px`) at the footer line and drew a
  visible edge on the backdrop (second review, 2026-09-02). The clip moves to
  the column, so the shadow fades out under the footer text, and the stage's
  bottom padding goes to zero: the canvas ends at the slot, the 12px line sits
  16.5px from the canvas edge and 16.5px from the screen bottom, which is
  exactly how a landing slide meets the same footer.
- Desktop only. Below 900px the phone editor stays a full-bleed shell; a 45px
  line would take more than a tenth of a landscape phone.
- Rail size lives in rail-specific tokens. The site-wide `--btn-height` is
  untouched, so the landing CTA and the donate link do not move.

## Non-Goals

- no change to the object menu or the back control; the rotated-portrait
  rail keeps its 12px type and `0 10px` padding from PR #37 and only takes
  the 48px touch height instead of the 58px standard
- no change to the footer copy, link, or typography
- no footer in the phone editor

## Acceptance Criteria

1. All four `.landing-section` elements and `.landing-view` compute
   `background-color: rgb(244, 242, 238)`; no `bg-1`, `bg-2`,
   `--landing-bg` or `--landing-bg-2` remains in `index.html` or `src/`.
2. At 1440 x 900, `#t-upload`, `#t-addtext` and `#t-download` are 40px tall,
   `#1b1b1b`, radius `999px`, 14px/800 uppercase; at 844 x 390 and in the
   rotated 390 x 844 rail they are 48px; `.cta-btn` is still 58px.
3. At 1440 x 900 in `#editor`, `.editor-footer` is visible, 45px tall, spans
   the canvas column, and its horizontal centre equals the canvas centre; the
   canvas bottom edge equals the footer top; `.canvas-area` computes
   `overflow: visible` so the canvas shadow is not clipped at the line;
   `#appFooter` stays hidden.
4. Below 900px `.editor-footer` is hidden and the phone shell is unchanged.
5. `pnpm run preflight` is green and the frontend docs describe the slide
   tone, the rail heights and the two footer placements.
