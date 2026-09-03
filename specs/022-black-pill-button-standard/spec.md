# Spec: black pill button standard, centred hero, study 02

## Goal

Make one button the standard for the whole site, landing and editor alike: a
plain black pill, larger and more elongated than the current yellow CTA. Fix
that standard in design tokens. In the same slice, drop the hero copy on slides
1 and 4 so title and button read as one centred block, keep only the
`ks·design · lab` tag in the editor, and rename the landing study tag to
`study 02 — dream board`.

## Background

The landing CTA was a 54px Pantone-yellow pill with a drop shadow, the editor
used a separate `--volcanic-grass` button style with a 20px radius, the
download button was yellow, and the donate link was yet another yellow pill.
Four button idioms for one small app.

The client reviewed four local galleries (30 colour harmonies, opaque glass,
backlit frosted glass, Reboot-style light bar, then a plain-black matrix of
5 radii x 4 sizes) and picked plain-black matrix variant 01, "Pill · S":
`160 x 58px`, radius `999px`, `#1b1b1b`, white 14px/800 uppercase text, no
shadow, hover `#2e2e2e`. Decision date 2026-09-02.

## Scope

- add `--btn-*` tokens to `:root` in `src/styles/app.css` and rebuild
  `.cta-btn`, the global `button` rule, `.file-input-label`, `#t-download`,
  `.editor-home-btn`, `.object-menu .om-btn`, `#om-fontFamilyBtn`,
  `.om-texttool-btn`, `.om-color-btn`, `.editor-rotate-close`,
  `.donate-modal-close`, `.donate-matecito-link` and the mobile overrides on
  those tokens
- centre the hero block on slides 1 and 4 (`.landing-section.bg-hero
.hero-center`), with a larger upward bias on phones so the button stays above
  the mountain skyline
- `index.html`: remove the study tag from the editor sidebar brand mark; rename
  the landing tag to `study 02 — dream board`
- update `docs_dreamboard/project/frontend/frontend-docs.md`

## Button standard

| Token             | Value     | Meaning                                           |
| ----------------- | --------- | ------------------------------------------------- |
| `--btn-bg`        | `#1b1b1b` | fill, the same ink as the hero dots               |
| `--btn-bg-hover`  | `#2e2e2e` | hover fill                                        |
| `--btn-bg-active` | `#111111` | pressed fill                                      |
| `--btn-fg`        | `#ffffff` | text and icon colour                              |
| `--btn-radius`    | `999px`   | full pill on every button, circle on icon buttons |
| `--btn-height`    | `58px`    | text buttons                                      |
| `--btn-min-width` | `160px`   | text buttons, keeps short labels elongated        |
| `--btn-padding-x` | `28px`    | text buttons                                      |
| `--btn-font-size` | `14px`    | DM Sans 800 uppercase                             |

Rules:

- every text button (landing CTA, sidebar tools, donate link) takes the full
  standard: black pill, 58px tall, at least 160px wide, no shadow, no glow
- icon-only buttons (editor back, object-menu tools) keep their compact size
  and take the black fill and full rounding
- two exceptions keep a non-black fill but take the pill shape: the font
  picker (`#om-fontFamilyBtn`, a value control that must show the current font
  name) and the close buttons on the two dark glass overlays (rotate hint,
  donate modal), where a black fill would vanish against the panel
- `--pantone-yellow` stays only for the star bullets on slide 3;
  `--volcanic-grass` stays for the slide-3 title and popup check icons

## Non-Goals

- no change to button copy, ids, or JavaScript behaviour
- no change to the dotted-mountain canvas, footer, or brand mark typography
- no redesign of the object menu layout or the font popup list

## Acceptance Criteria

1. No button on the landing or in the editor renders a colour other than
   `--btn-bg` / `--btn-bg-hover` / `--btn-bg-active`, except the three
   documented exceptions; every button has `border-radius: 999px`.
2. The landing CTA measures 160 x 58px with a short label and has no
   box-shadow.
3. On slides 1 and 4 the title + button block is vertically centred on
   desktop; on a 390 x 844 phone the button sits above the mountain skyline.
4. The editor sidebar shows only `ks·design · lab`; the landing header shows
   `ks·design · lab` and `study 02 — dream board`; no `study 01` string remains
   in `index.html` or `src/`.
5. `pnpm run preflight` is green and frontend docs describe the standard.
