# Spec 038: Restore the logo without a hyphen

## Scope

Use the approved original `ks design.art` lettering in both Dreamboard headers.
Copy the light and dark SVG exports from the KS master unchanged. Keep domain
URLs and filenames unchanged. Preserve home navigation, draft state and the
existing editor layout, including portrait rotation.

## Acceptance criteria

- Both header images use the native 118 × 20 CSS px size on every viewport.
- The alt text and SVG title read `ks design.art`.
- Geometry and hashes match KS; the dark variant changes ink only.
- Desktop and phone portrait/landscape rendering and home navigation pass.
- Feature memory, HTML, formatting, build and tests pass.
