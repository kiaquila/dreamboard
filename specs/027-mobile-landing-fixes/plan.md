# Plan 027: Mobile landing slide fixes

## Approach

1. Keep the existing fixed footer as the desktop implementation.
2. Add a reusable hero attribution inside slides 1 and 4 and expose it only on
   mobile; hide the fixed landing footer on mobile.
3. Keep each mobile hero canvas at full slide height, make the attribution
   background transparent, and apply a deterministic bottom fade in the dot
   field that reduces density and radius before the text begins.
4. Remove the round-2 full-height rules distribution and reuse the production
   layout rhythm; mobile slides 2 and 3 still omit attribution, giving the rules
   at least as much usable height as production.
5. Lock the result with Playwright layout assertions at 430x932 and capture the
   four slide states.
6. Update frontend documentation and run repository CI.

## Visual verification

- Viewport: 430x932 CSS px, device scale factor 3, mobile/touch context.
- Route: `/`, English locale, fresh storage.
- State: one screenshot after scrolling each section into view and allowing
  the mountain animation to settle.
- Production baseline: `.omx/artifacts/visual-ralph/027-mobile-landing-fixes/round-3/reference-production/`.
- Output: `.omx/artifacts/visual-ralph/027-mobile-landing-fixes/round-3/final/`.
- Pass threshold: Visual Ralph score at least 90 against the requested layout
  constraints and the production rules baseline.
