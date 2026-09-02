# Spec: remove the dead save-indicator chain

## Goal

Delete the editor save-status display code that has had no DOM to act on since
spec `002-mobile-orientation-nonblocking-hint`, without changing draft
persistence behavior.

## Background

Commit `2851b19` ("fix: make mobile orientation hint non-blocking") removed both
save-status elements from `index.html`:

- `<p class="save-indicator" id="saveIndicator" aria-live="polite">`
- `<span class="save-indicator-chip" id="saveIndicatorMobile" aria-live="polite">`

The matching CSS classes were dropped in the same slice. The JavaScript that
drove them was left behind, so `src/scripts/app.js` still resolves two element
lookups that are permanently `null`.

`pnpm run build` is a plain file copy, so no build step reintroduces the markup.

## Scope

- remove the `saveIndicator` and `saveIndicatorMobile` element lookups
- remove `setSaveStatus()` and its five call sites
- remove the `currentSaveStatusKey` module variable
- remove the four save-status copy keys from `src/scripts/strings.js`
- update frontend docs to record that the DOM hooks are gone, not just hidden

## Non-Goals

- no change to draft persistence, debouncing, or restore behavior
- no reintroduction of a visible or mobile save indicator
- no wider editor refactor

## Rationale for removal over restoration

Spec 002 made draft persistence deliberately silent, and
`docs_dreamboard/project/frontend/frontend-docs.md` already states that the app
autosaves "without a visible draft saved badge". Restoring the markup would
reverse a landed product decision. Independently, `setSaveStatus()` set
`node.hidden = true` on every branch, so even restored markup could never
become visible.

## Acceptance Criteria

1. No reference to `saveIndicator` or `saveIndicatorMobile` remains in the
   repository.
2. `setSaveStatus`, `currentSaveStatusKey`, and the `saveIdle` / `saveSaving` /
   `saveSaved` / `saveError` copy keys are gone.
3. Draft autosave, debounce, flush, and restore behavior are unchanged.
4. `pnpm run preflight` is green.
5. Frontend docs describe the current state of the save-status code.
