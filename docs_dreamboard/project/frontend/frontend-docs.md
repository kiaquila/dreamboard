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
- the mobile sidebar remains an overlay, while the canvas keeps a safe top offset under the menu trigger

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
- removal of remaining inline action handlers in favor of bound module listeners
- a dedicated mobile editor interaction model instead of desktop controls squeezed into a phone viewport

Until that migration happens, all changes should keep the static app functioning and deployable.
