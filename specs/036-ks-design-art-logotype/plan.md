# Plan 036: ks-design.art logotype and footer signature

## Approach

1. Read the live studio header markup and stylesheet, and take the logotype
   rules verbatim: `.brand`, `.brand-dot`, `.brand-art` and the `--brand-dot`
   gradient, plus the display and hand font stacks they resolve against.
2. Replace the `.brand-tag` wordmark in both headers with the studio's
   `a.brand > .brand-word` markup. Keep `.brand-tag` for the study tag, which is
   dreamboard chrome and not part of the logotype.
3. Add `Manrope:wght@700` and widen Caveat to `400;600;700` in the existing
   Google Fonts request, so the mark resolves the same faces the studio does.
   No new origin is introduced.
4. Express every logotype metric in `em` so one `font-size` on `.brand`
   rescales the whole mark, then step that size down on phone headers and
   again in the editor rail.
5. Give the link a tap-target padding with a matching negative margin, so the
   hit area grows without moving the measured header height. Zero it in the
   rotated portrait rail, where the padding reads as horizontal space and would
   push the tilted `art` against the screen edge.
6. Intercept a plain left click on the logotype and call the existing
   `goToLanding()` instead of letting the browser reload; leave modified clicks
   to the browser.
7. Change the four footer signature labels to `ks-design.art`.

## Verification

- Compare computed styles and the wordmark bounding box against
  `https://ks-design.art` in the same browser at 1280x800.
- Check header layout and document scroll width at 320px, 375px and 430px, on
  the landing and in the portrait editor rail.
- Click the logotype in the editor and confirm the view switches without a
  navigation.
- Run `pnpm run preflight`.
