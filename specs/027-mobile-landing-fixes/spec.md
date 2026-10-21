# Spec 027: Mobile landing slide fixes

## Problem

The mobile landing currently treats the attribution as global chrome. It is
therefore visible on the photo and rules slides, while on the two hero slides
the dotted-mountain canvas draws behind it. The rules slide also overflows an
iPhone 15 Pro Max viewport: its title and final rule cannot be seen together.

## Scope

- Show `Designed by ks-design · Built with AI workflows` on mobile only on
  slides 1 and 4.
- Fade the two mobile hero artworks into their attribution areas by gradually
  reducing both dot density and dot radius, without a horizontal cutoff.
- Make the English rules title and all eight rules fit in a 430x932 CSS-pixel
  portrait viewport without clipping or an internal scrollbar.
- Preserve the existing desktop footer and desktop landing layout.
- Add mobile Playwright assertions and capture all four landing slides.

## Out of scope

- Rewriting the dotted-mountain renderer or changing its source artwork.
- Changing landing copy, branding, button styling, or editor behaviour.
- Publishing or merging the pull request without a follow-up request.

## Acceptance criteria

1. At 430x932, slide 1 has one visible attribution line and its mountain artwork
   dissolves smoothly before the text through progressively fewer, smaller dots.
2. At 430x932, slides 2 and 3 have no visible attribution.
3. At 430x932, slide 4 has one visible attribution line and its mountain artwork
   dissolves smoothly before the text through progressively fewer, smaller dots.
4. The complete rules title and all eight rules are inside slide 3's visible
   bounds at 430x932, with no internal vertical overflow. Item spacing matches
   the compact production rhythm rather than distributing through the page.
5. Desktop keeps the existing fixed landing attribution behaviour.
6. Repository CI and targeted Playwright mobile checks pass.
7. Four final screenshots are written to the Visual Ralph artifact directory.
