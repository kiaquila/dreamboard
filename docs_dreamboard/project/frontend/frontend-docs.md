# Frontend Docs

## Current Architecture

The current application is still a static frontend, but it is no longer entirely monolithic. The current delivery structure is:

- [index.html](/Users/kristina.kurashova/projects/dreamboard/index.html) for the app shell and semantic markup
- [app.css](/Users/kristina.kurashova/projects/dreamboard/src/styles/app.css) for the full visual layer
- [app.js](/Users/kristina.kurashova/projects/dreamboard/src/scripts/app.js) for landing and editor orchestration
- [i18n.js](/Users/kristina.kurashova/projects/dreamboard/src/scripts/i18n.js) for locale dictionaries
- [landing-photo.js](/Users/kristina.kurashova/projects/dreamboard/src/scripts/landing-photo.js) for the embedded landing media asset

This keeps the repo deployable as a static site while making future extraction to components and a typed frontend stack much safer.

## Responsive Behavior

The editor now uses container-based canvas sizing instead of raw viewport math:

- the editor shell owns the available space
- the Fabric canvas resizes from the `.canvas-area` container
- a `ResizeObserver` keeps the canvas in sync with footer height and viewport changes
- the mobile editor now uses a dedicated interaction shell instead of a desktop left rail squeezed into phone width

## Mobile Editor Model

The current static app now treats phone layouts as a separate editor mode:

- a fixed mobile top bar keeps the primary entry points reachable
- tool controls open as a bottom sheet instead of an off-canvas desktop sidebar
- the canvas reserves safe space for the top bar and sticky footer
- the object menu docks near the bottom of the canvas on mobile instead of chasing the selected object into cramped positions

## Build Contract

The repository keeps a static build layer:

- `npm run build` copies [index.html](/Users/kristina.kurashova/projects/dreamboard/index.html) and the full [`src/`](/Users/kristina.kurashova/projects/dreamboard/src) tree into `dist/`
- Vercel reads `dist/` as the output directory
- `npm run ci` validates repo baseline, HTML, formatting, and build output

## Planned Refactor Direction

The recommended target architecture for the next phase is:

- `Vite + React + TypeScript`
- dedicated components for landing and editor shells
- extracted locales, assets, and editor services
- extraction of the mobile editor shell into dedicated components instead of shared static DOM branches
- stronger visual and interaction parity between landing and editor on small screens

Until that migration happens, all changes should keep the static app functioning and deployable.
