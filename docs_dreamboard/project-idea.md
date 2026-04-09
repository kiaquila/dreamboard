# dreamboard

## Product Summary

`dreamboard` is a lightweight personal web app for creating inspirational vision boards from images and text. It combines:

- a landing flow that explains the value of the tool
- a browser editor that lets the user place and style content on a canvas
- export to a shareable image

## Current Product State

The current app is a strong prototype, but not yet a maintainable production-grade frontend:

- the entire product lives in one `index.html`
- landing, editor, i18n, styles, and Fabric.js logic are mixed together
- mobile adaptation exists only partially
- there is no modular build system yet

## Infra Goal

Before refactoring the application itself, the repository must follow the standard delivery path:

1. PR-only changes
2. required checks in GitHub
3. AI review routing through repository policy with Gemini as the default reviewer
4. Vercel preview deploys on PR
5. Vercel production deploys on merge to `main`

## Next Product Goal

After infra stabilization, the next implementation phase should:

- improve mobile adaptation for the editor
- split the current monolithic page into maintainable units
- prepare the repo for migration to a modular frontend app
