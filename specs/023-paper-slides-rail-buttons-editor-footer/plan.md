# Plan: one paper tone for slides, rail buttons back to height, footer under the editor canvas

## Evidence gathered before editing

- `main` at 1440 x 900 (`#editor`): `#t-upload`, `#t-addtext`, `#t-download`
  measure 40px (`padding: 12px`, 12px label, `line-height: normal`); the
  `<= 900px` rule gave them `min-height: 48px`; the rotated-portrait rule
  collapses them to `padding: 6px 10px` and is untouched by 022
- PR #37 head: the same three buttons measure 58px through
  `.control-group button { min-height: var(--btn-height) }` and
  `.file-input-label { min-height: var(--btn-height) }`
- `--landing-bg` / `--landing-bg-2` are read only by `.landing-view`,
  `.landing-section.bg-1` and `.landing-section.bg-2`; nothing in `src/scripts`
  or `tests/` reads `bg-1` / `bg-2`
- `.landing-section.bg-hero` wins over `.bg-1` / `.bg-2` by source order, so
  slides 1 and 4 already paint `--landing-paper`
- `app.js` sizes the canvas from `.canvas-area` (`clientWidth` /
  `clientHeight` minus its paddings) inside a `ResizeObserver`, so shrinking
  that box is enough; the observer and `syncEditorViewport` run through
  `requestAnimationFrame`, which is why a hidden browser tab measures the
  initial 960 x 640 until it is fronted
- `app.js` does not reference `#appFooter`; `.canvas-area` is queried by
  class, so wrapping it keeps the query valid
- `html-validate:recommended` accepts a second `<footer>` inside `<main>`

## Steps

1. Delete `--landing-bg` / `--landing-bg-2`; add `--editor-btn-height` and
   `--editor-btn-height-touch` next to the `--btn-*` block.
2. Paint `--landing-paper` on `.landing-view` and `.landing-section`; delete
   `.bg-1` / `.bg-2`; drop the background line from `.bg-hero`.
3. Point `.control-group button` and `.file-input-label` at
   `--editor-btn-height`; replace the redundant `border-radius` override in
   the `<= 900px` block with `min-height: var(--editor-btn-height-touch)`;
   after the rebase onto the merged PR #37, point the rotated-portrait rail
   rule (`7aebb89` had raised it to `--btn-height`) at the same touch token.
4. Split the footer rules: `.site-footer` (line, typography, link states),
   `.sticky-footer` (fixed pin, z-index, editor hide), `.editor-footer`
   (`flex: 0 0 var(--footer-height)`, hidden below 900px).
5. Add `.canvas-stage` (column flex, `flex: 1 1 auto; min-width: 0;
min-height: 0; overflow: auto`) above `.canvas-area`; drop `overflow: auto`
   and the bottom padding from `.canvas-area` so the shadow is not clipped at
   the footer and the canvas ends at the slot.
6. `index.html`: drop `bg-1` / `bg-2`; wrap the stage in `.canvas-stage`
   with the editor footer after `.canvas-area`; add `site-footer` to
   `#appFooter`. Run prettier (the wrapped block re-indents).
7. Update `frontend-docs.md`: slide tone, button table and bullets, footer
   section, responsive and mobile notes.
8. Verify in the browser at 1440 x 900 (landing and `#editor`), 844 x 390
   and 390 x 844; run `pnpm run preflight`.

## Risk

Low. No JavaScript changes. The only structural change is one extra flex
column around `.canvas-area`; every mobile rule targets `.canvas-area`,
`.canvas-wrapper` or `.sidebar` and keeps working one level deeper. Moving
the scroll container one level up matters when the canvas hits its 520px
minimum in a very short window: with `min-height: 0` alone the stage shrank
under the canvas and the footer painted over it (Codex P2 on the first
head). The desktop floor `min-height: calc(--editor-canvas-min-height +
--top-gap)` on `.canvas-area` mirrors the `getCanvasTargetSize()` clamp, so
the column grows past the viewport and scrolls stage and footer together. The landing loses two unused tokens
and two classes. Desktop editor is the only
place that gains a footer, and the phone shells were measured unchanged.
