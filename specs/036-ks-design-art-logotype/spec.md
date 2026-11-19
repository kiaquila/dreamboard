# Spec 036: ks-design.art logotype and footer signature

## Problem

The brand mark in the landing header and the editor rail is still the Ember
chrome: `ks·design · lab`, set in the system sans at 11px. The studio site at
`https://ks-design.art` now uses a different logotype, and dreamboard is listed
there as one of its studies, so the two marks no longer match.

The footer signature also names the studio as `ks-design`, while the studio is
now written as `ks-design.art` everywhere else.

## Scope

- Replace the brand mark in both headers with the `ks-design.art` logotype,
  copied 1:1 from the studio header: Manrope 700 caps, the gradient dot standing
  in for the dot of the domain, and `art` set in Caveat at a slight tilt.
- Make the logotype a link to the dreamboard start page, so it behaves like the
  logotype on the studio site.
- Drop the `· lab` suffix that belonged to the old wordmark; keep the
  `study 02 — dream board` tag as its own line.
- Change the footer signature text from `ks-design` to `ks-design.art` in all
  four places. The link target stays `https://ks-design.art`.
- Load Manrope 700 and Caveat 600 from the Google Fonts request the page
  already makes.

## Out of scope

- Changing the studio tag copy, landing copy, or any other chrome.
- Touching the colour palette, the dotted-mountain hero, or editor behaviour.
- Self-hosting the brand fonts.

## Acceptance criteria

1. At 1280px the rendered logotype matches the studio header: the wordmark box
   measures the same width, and font family, size, weight, tracking, colour,
   dot geometry and the `art` transform all read identically.
2. The logotype appears in the landing header and the editor rail, and the
   `study 02 — dream board` tag stays on the landing header row.
3. Clicking the logotype in the editor returns to the start page without a
   page reload, so the live canvas is not dropped back to the stored draft.
   Cmd/Ctrl/middle click still opens the start page in a new tab.
4. The logotype and the study tag share one line without horizontal overflow at
   320px, 375px and 430px, and the rotated portrait editor rail keeps the mark
   clear of the screen edge.
5. All four footer lines read `Designed by ks-design.art · Built with AI
workflows`, with `ks-design.art` still linking to the studio.
6. `pnpm run preflight` passes.
