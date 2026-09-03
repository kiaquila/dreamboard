# Frontend Docs

## Current Architecture

The current application is still a static frontend, but it is no longer entirely monolithic. The current delivery structure is:

- [index.html](/Users/kristina.kurashova/projects/dreamboard/index.html) for the app shell and semantic markup
- [app.css](/Users/kristina.kurashova/projects/dreamboard/src/styles/app.css) for the full visual layer
- [app.js](/Users/kristina.kurashova/projects/dreamboard/src/scripts/app.js) for landing and editor orchestration
- [view-boot.js](/Users/kristina.kurashova/projects/dreamboard/src/scripts/view-boot.js) for marking the initial view before the main module runs
- [draft-store.js](/Users/kristina.kurashova/projects/dreamboard/src/scripts/draft-store.js) for browser-side draft persistence
- [strings.js](/Users/kristina.kurashova/projects/dreamboard/src/scripts/strings.js) for the single English copy source
- [landing-photo.js](/Users/kristina.kurashova/projects/dreamboard/src/scripts/landing-photo.js) for the embedded landing media asset
- [hero-mountains.js](/Users/kristina.kurashova/projects/dreamboard/src/scripts/hero-mountains.js) for the dotted-mountain hero canvas (see [Hero dotted mountains](#hero-dotted-mountains))
- [`src/assets/images/landing/`](/Users/kristina.kurashova/projects/dreamboard/src/assets/images/landing) for repository-owned landing artwork (currently the halftone mountain tone source)
- `src/assets/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` for browser tab and iOS home-screen icons (see [Favicon assets](#favicon-assets))

This keeps the repo deployable as a static site while making future extraction to components and a typed frontend stack much safer.

## Favicon assets

Dreamboard ships three icon artifacts under `src/assets/`:

- `favicon.svg` — scalable source of truth, planet-style sphere: three stacked radial gradients (cyan→blue body, warm green-yellow upper-left rim, dark lower-right terminator) plus a rotated `feTurbulence` cloud-streak overlay; transparent background, sphere fills the viewBox
- `favicon-32.png` — 32×32 legacy fallback for browsers without SVG-icon support
- `apple-touch-icon.png` — 180×180 PNG with alpha for iOS "Add to Home Screen"

`index.html` references all three via `<link rel>` tags right after `<title>`. PNG artifacts are pre-rendered from the SVG using macOS built-in tools (`qlmanage -t -s <size>` and `sips -z`) and committed to the repo; the static build copies them as-is. Regenerate PNGs only when `favicon.svg` changes.

## Hero dotted mountains

Hero slides 1 and 4 no longer use a photo background. `hero-mountains.js` mounts a `<canvas class="hero-dots">` behind the hero content and builds the artwork from dots:

- the tone source is `src/assets/images/landing/hero-mountains-halftone.jpg` (1200x675, a compressed copy of the "Halftone Alpine Serenity" wallpaper); it is drawn to cover the section width, anchored to the bottom, and on tall phone viewports it keeps at least 62% of the height
- the section is split into a square grid (`width / 176`, clamped to 4..16 px); every cell becomes one dot whose radius follows the averaged darkness of the pixels under it, so the far ridges stay faint and the shadow faces read almost solid
- dots are drawn from cached circle sprites grouped by 12 alpha levels, which keeps a 1440x900 frame (about 7.6k dots) cheap enough for 60 fps
- when a hero slide is at least half visible (IntersectionObserver with an explicit `intersectionRatio >= 0.5` check, so the initial observation of a sliver does not start it), the dots assemble over 2.6 s from the summits downward ("snowcap"): each dot's delay grows with its depth below the skyline of its column, then it fades in, grows from zero and lifts 6 px into place
- `prefers-reduced-motion: reduce` skips the animation and paints the final frame
- the field is built lazily from the canvas' CSS size when a slide is about to play and rebuilt on resize (debounced 200 ms); a hidden landing (boot straight into `#editor`, or a resize while the editor is open) reports a zero-size canvas and is measured again when the slide is shown; the paper colour is `--landing-paper` (`#f4f2ee`), ink is `--landing-ink` (`#1b1b1b`)

To regenerate the tone source from a new artwork, downscale it with `sips -s format jpeg -s formatOptions 72 -Z 1200 <source> --out src/assets/images/landing/hero-mountains-halftone.jpg`; only luminance matters, so a small JPEG is enough.

Hero copy (title + CTA) is one block centred vertically on the slide with a small upward bias, `padding-bottom: clamp(24px, 8vh, 96px)` on desktop and `clamp(60px, 18vh, 160px)` below 900px, so on a portrait phone the button stays above the mountain skyline (the band takes 62% of the height there). The hero sections always reserve `--landing-header-h` on top, including the phone layout where other slides flatten their padding, so a short landscape viewport does not push the headline under the brand controls.

## Button standard

Since spec `022-black-pill-button-standard` (2026-09-02) the site has one button: a plain black pill, larger and more elongated than the old yellow CTA. The client picked it from a local matrix of 5 radii x 4 sizes (variant 01, "Pill · S"). The standard lives in `:root` as `--btn-*` tokens in `app.css`:

| Token                                                  | Value                                                |
| ------------------------------------------------------ | ---------------------------------------------------- |
| `--btn-bg` / `--btn-bg-hover` / `--btn-bg-active`      | `#1b1b1b` (the hero-dot ink) / `#2e2e2e` / `#111111` |
| `--btn-fg`                                             | `#ffffff`                                            |
| `--btn-radius`                                         | `999px`                                              |
| `--btn-height` / `--btn-min-width` / `--btn-padding-x` | `58px` / `160px` / `28px`                            |
| `--btn-font-size` / `--btn-font-weight`                | `14px` / `800`, DM Sans, uppercase                   |

How it is applied:

- text buttons take the full standard: the landing CTA (`.cta-btn`), the editor sidebar tools (global `button`, `.control-group button`, `.file-input-label`), and the donate link (`.donate-matecito-link`); none of them carries a shadow, glow or gradient
- icon-only buttons keep their compact size (44px back control, 40px object-menu tools) and take the black fill, white glyph and full rounding; the transparent text tools (`.om-texttool-btn`, `.om-color-btn`) draw their glyph in `--btn-bg` and get a light grey hover fill
- three controls keep a non-black fill but take the pill shape: the font picker `#om-fontFamilyBtn` (a value control that must show the current font name, stays white) and the close buttons on the two dark glass overlays (rotate hint, donate modal, stay translucent white)
- hover and active are background swaps, never opacity, so the old `button:hover { opacity }` idiom is gone
- `--pantone-yellow` now only colours the slide-3 star bullets; `--volcanic-grass` only the slide-3 title and the font-popup check icon

Any new button starts from the tokens. A different size is a spec change, not a local override.

## Landing footer

The sticky footer keeps its fixed 45px slot (slides reserve that height) but is now a single quiet line in the Ember style: transparent background, DM Sans 12px with 0.06em tracking, muted colour, and the `ks-design` link underlined with a hairline that turns gold on hover. The footer text is a brand line and is intentionally not localised.

## Repository Memory and Feature Loop

Frontend work now follows the repository memory contract:

- process rules live in `.specify/memory/constitution.md`
- durable frontend and delivery context lives in `docs_dreamboard/`
- active implementation scope lives in `specs/<feature-id>/`

UI or editor changes should start by updating the active feature folder before
touching product code.

## Responsive Behavior

The editor now uses container-based canvas sizing instead of raw viewport math:

- the editor shell owns the available space
- the Fabric canvas resizes from the `.canvas-area` container
- a `ResizeObserver` keeps the canvas in sync with footer height and viewport changes
- the mobile editor now uses a dedicated interaction shell instead of a desktop left rail squeezed into phone width

## Mobile Editor Model

The current static app now treats phone layouts as a separate editor mode:

- the mobile editor chrome lives in the permanently visible sidebar rail; there is no separate mobile top bar
- tool controls sit in that always-on rail, so there is no burger button, bottom sheet or off-canvas drawer to open
- back to the landing page is reachable from the sidebar header
- the canvas reserves safe space for the sticky footer and the device safe-area insets
- the object menu docks near the bottom of the canvas on mobile instead of chasing the selected object into cramped positions
- portrait phone editor remains usable; landscape is now a recommendation surfaced through a non-blocking floating hint card instead of a hard gate, because mobile web orientation locks are not reliable enough to block entry
- phone landscape switches into a true side-by-side shell so the tools and canvas use the wider viewport instead of reusing the portrait bottom-sheet layout
- editor return controls are icon-only, with tooltips instead of visible labels to keep the shell visually lighter

## Brand Chrome

The app has no wordmark of its own. Landing and editor both carry the studio
chrome transplanted from `ember.ks-design.art`: a `ks·design · lab` tag and,
on the landing only, a `study 02 — dream board` tag (renamed from `study 01`
in spec 022), rendered as `.brand-mark` with `.brand-tag` children.

The mark is a faithful copy of the Ember original, not a re-interpretation:

- typeface is the Ember system stack (`--brand-font`), not the app's DM Sans
- 11px, uppercase, `0.22em` letter-spacing, `--brand-muted` on the tag and
  `--brand-ink` on the `strong` half
- the dot between `ks` and `design` is the same indigo-to-cyan gradient
  (`--brand-dot-a` / `--brand-dot-b`) with a `visually-hidden` space after it so
  screen readers still hear two words

Layout differs by shell because the space does:

- landing uses the Ember arrangement, both tags on one row, pushed apart
- the editor sidebar shows the `ks·design · lab` tag alone (spec 022 dropped
  the study tag from the editor), stacked and shrunk, because the rail shares
  its width with the back control
- below 360px the landing tags shrink so the row never wraps
- the rotated portrait editor rail leaves roughly 104px for the mark, which no
  readable size fits, so it shows the `ks·design · lab` tag alone

No tag is ever allowed to wrap. Any change to the tag text or to the rail width
needs re-measuring: the widest tag against the space its shell actually gives
it, at 320px in both orientations as well as at desktop.

The landing hero heading is the document `h1`. Removing the old wordmark removed
the only `h1`, and the hero title is the page's real top-level heading.

## Language

The app ships English only. There is no locale switcher, no locale cookie, no
locale dictionaries, and no `navigator.language` sniffing. All user-visible copy
lives in one place, `src/scripts/strings.js`, and `index.html` declares
`lang="en"` statically.

## View Boot

A small same-origin boot script runs at the top of `<body>`, before any editor
markup is parsed or painted. When the URL already carries the `#editor` route
it marks the document with `data-initial-view="editor"` and adds
`is-editor-active` to `<body>`.

It sits in `<body>` rather than `<head>` because it needs `document.body` to
exist. The editor shell is styled through `body.is-editor-active`, and
`app.js` is a deferred module, so without that class the first paint of a
direct `#editor` load would use the pre-active mobile layout and then snap to
the final one. See [Editor Reload Route](#editor-reload-route).

## Build Contract

The repository keeps a static build layer:

- `pnpm run build` copies [index.html](/Users/kristina.kurashova/projects/dreamboard/index.html) and the full [`src/`](/Users/kristina.kurashova/projects/dreamboard/src) tree into `dist/`
- Vercel and Cloudflare Workers Static Assets read `dist/` as the output directory
- `pnpm run ci` validates repo baseline, HTML, formatting, and build output

## Draft Persistence

The current editor now preserves the working board as a browser draft:

- the draft snapshot stores a Fabric JSON representation of all non-placeholder user objects
- the primary storage layer is IndexedDB, which is a better fit than `localStorage` for image-heavy boards and structured data
- `localStorage` remains only as a lightweight fallback when IndexedDB is unavailable
- save operations are debounced during editing and flushed again on `visibilitychange` / `pagehide`
- the draft is restored automatically the next time the editor opens in the same browser
- draft persistence is intentionally silent in the UI; the app keeps autosaving without a visible “draft saved” badge
- the save-status elements and the JavaScript that drove them are fully removed, not hidden: there is no `#saveIndicator` markup, no `setSaveStatus()` helper, and no save-status copy keys
- reintroducing a save indicator therefore means adding markup, styles, and a status helper together, in a slice that revisits the silent-persistence decision

## Editor Reload Route

The static app now treats `#editor` as the editor route:

- entering the editor from landing controls pushes `#editor` into the URL
- the boot script marks `#editor` before the first paint, so the landing view
  does not flash during refresh and the mobile editor paints its final layout
  straight away
- refreshing a browser tab while `#editor` is present opens the editor shell
  immediately and then restores the local draft
- editing controls and canvas interactions stay locked until draft restore
  completes, so slow image-heavy drafts cannot overwrite new edits made during
  bootstrap
- browser back and forward navigation keep the visible view synchronized with
  the hash route
- using the editor home/back controls clears `#editor`, so a later reload stays
  on the landing view
- canvas contents still come from local draft persistence; the route stores only
  the active view, not board data

This keeps persistence local-first without introducing backend state or breaking the static deploy model.

## Planned Refactor Direction

The recommended target architecture for the next phase is:

- `Vite + React + TypeScript`
- dedicated components for landing and editor shells
- extracted copy, assets, and editor services
- extraction of the mobile editor shell into dedicated components instead of shared static DOM branches
- stronger visual and interaction parity between landing and editor on small screens

Until that migration happens, all changes should keep the static app functioning and deployable.
