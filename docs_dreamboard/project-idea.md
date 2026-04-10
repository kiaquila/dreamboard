# dreamboard

## Product Summary

`dreamboard` is a lightweight personal web app for creating inspirational vision boards from images and text. It combines:

- a landing flow that explains the value of the tool
- a browser editor that lets the user place and style content on a canvas
- export to a shareable image

## Current Product State

The current app is a strong prototype, and the repository is now on a safer refactor path:

- the static app is deployed through Vercel-backed CI/CD
- AI orchestration and review policy now follow the standard repository flow
- the frontend has been split into HTML shell + external CSS/JS modules
- the editor has entered a dedicated mobile adaptation phase with its own phone-first interaction model
- landing artwork is now repository-owned under `src/assets/` instead of living as a root-level loose file
- editor state now survives refresh/return inside the same browser through a local draft snapshot

## Infra Goal

Before refactoring the application itself, the repository must follow the standard delivery path:

1. PR-only changes
2. required checks in GitHub
3. AI review routing through repository policy with Gemini as the default reviewer
4. Vercel preview deploys on PR
5. Vercel production deploys on merge to `main`

## Next Product Goal

After infra stabilization, the next implementation phase should:

- keep improving mobile adaptation for the editor and landing
- continue decomposing the current static app into maintainable units
- prepare the repo for migration to a modular frontend app
