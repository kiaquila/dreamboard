# Plan: black pill button standard, centred hero, study 02

## Evidence gathered before editing

- `src/styles/app.css` has four button idioms: `.cta-btn` (yellow pill,
  shadow), global `button` (volcanic grass, 20px radius, opacity hover),
  `#t-download` (yellow), `.donate-matecito-link` (literal `#fedd00`)
- `--border-radius: 8px` is declared and never read; left untouched, out of
  scope
- `--pantone-yellow` is also read by `.rules-list li::before` (slide-3 star
  bullets), so the token stays after the CTA stops using it
- `--volcanic-grass` is also read by `.rules-title` and
  `.font-popup .font-check svg`, so it stays too
- the global `button { padding: 12px }` reaches every icon button; the new
  global rule sets horizontal padding only and every icon button already sets
  `padding: 0` except `.donate-modal-close`, which gets it
- `button:hover { opacity: 0.9 }` would fight the new background hover on the
  transparent object-menu buttons, so the colour button and the font picker
  get explicit hover fills
- hero copy sits at `padding-top: clamp(24px, 10vh, 140px)` inside
  `.hero-center` with `justify-content: flex-start`; the mountain band is
  bottom-anchored and on phones takes 62% of the height, so plain centring
  would drop the button onto the skyline on a 390 x 844 viewport
- `study 01 — dream board` appears twice in `index.html` (landing header,
  editor sidebar) and once in `frontend-docs.md`; specs/015 is history and is
  left as is
- `tests/` has no button or brand-tag coverage; the gates are
  `check-static-baseline`, `html-validate`, `build`, `prettier`, feature
  memory and docs coverage

## Steps

1. Add the `--btn-*` tokens to `:root` with a comment recording the decision.
2. Rebuild `.cta-btn` on the tokens: 58px, min-width 160px, pill, black, white
   text, no shadow, background hover and active.
3. Rebuild the global `button` rule and `.file-input-label` on the tokens;
   give `.control-group button` the standard min-height; delete the
   `#t-download` yellow override.
4. Move the icon buttons (`.editor-home-btn`, `.om-btn`, `.om-icon-btn`,
   `.om-color-btn`, `.om-texttool-btn`) to the black fill / ink glyph colour
   and `--btn-radius`; keep their sizes.
5. Pill the font picker and the two glass-overlay close buttons via
   `--btn-radius`, keep their fills, add explicit hover fills where the global
   hover would leak.
6. Rebuild `.donate-matecito-link` on the tokens.
7. Replace the mobile radius overrides (`24px`, `14px`) with `--btn-radius`.
8. Centre `.landing-section.bg-hero .hero-center` with
   `padding-bottom: clamp(24px, 8vh, 96px)`; below 900px use
   `clamp(60px, 18vh, 160px)` so the phone button clears the skyline.
9. `index.html`: drop the editor study tag, rename the landing tag to
   `study 02 — dream board`.
10. Update `frontend-docs.md`: button standard section, hero placement line,
    brand chrome paragraph.
11. Verify in the browser at 1440 x 900 and 390 x 844, then run
    `pnpm run preflight`.

## Risk

Low to medium. The global `button` rule changes padding and hover for every
button, so each icon button was checked for an explicit `padding: 0` and an
explicit hover fill. Layout of the object menu and sidebar is unchanged
because heights stay the same (40px tools, 44px back) or only grow inside a
column that already stretches (sidebar tools 58px).
