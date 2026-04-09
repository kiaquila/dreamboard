# Frontend Docs

## Current Architecture

The current application is a static single-file frontend in [index.html](/Users/kristina.kurashova/projects/dreamboard/index.html). It contains:

- landing page markup
- editor markup
- all CSS
- all JavaScript
- i18n dictionaries
- embedded static media

This is acceptable for a prototype, but not ideal for long-term delivery.

## Build Contract

The repository currently keeps a minimal static build layer:

- `npm run build` copies the deployable static app into `dist/`
- Vercel reads `dist/` as the output directory
- `npm run ci` validates repo baseline, HTML, formatting, and build output

## Planned Refactor Direction

The recommended target architecture for the next phase is:

- `Vite + React + TypeScript`
- dedicated components for landing and editor shells
- container-based canvas sizing instead of raw `window.innerWidth - magic-number`
- separated locales/assets/styles

Until that migration happens, all changes should keep the static app functioning and deployable.
