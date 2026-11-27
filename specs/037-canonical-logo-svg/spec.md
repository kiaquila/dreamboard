# Spec 037: Canonical logo SVGs

## Problem

Independent font rendering and mobile logo scaling drift from the approved KS master.

## Scope

Use the approved outlined `ks-design.art` SVGs in the landing and editor headers.
Preserve home-link behavior, draft state, the study label, and editor interactions.
Keep both theme variants byte-identical to KS exports; use dark ink on the current light surfaces.

## Acceptance criteria

- Both logos render at 121 × 20 CSS px on desktop and phones.
- No local font, tracking, opacity, or logo path overrides.
- The narrow editor header adapts around the logo without clipping or shrinking it.
- Desktop, phone portrait and phone landscape are visually checked.
- HTML, build, formatting, tests and feature-memory checks pass.
