# Plan: remove the dead save-indicator chain

## Evidence gathered before editing

- `git grep saveIndicatorMobile` matches only `src/scripts/app.js` (declaration
  and single use)
- `grep -n saveIndicator index.html` returns nothing, so `#saveIndicator` is
  equally undefined
- `src/styles/app.css` has no `.save-indicator` or `.save-indicator-chip` rules
- `tests/` has no save-status coverage
- `scripts/build-static.mjs` only copies `index.html` and `src/`, so no
  generated markup can supply either id
- `git log -S` traces both removals to `2851b19` (spec 002, PR #6)

## Dead-code chain

1. `saveIndicator` / `saveIndicatorMobile` resolve to `null`
2. `setSaveStatus()` computes a label and iterates those two null nodes, so its
   whole body is inert
3. `currentSaveStatusKey` is written only by `setSaveStatus()` and read only to
   pass straight back into `setSaveStatus()` from `applyStaticCopy()`
4. the four `save*` copy keys are consumed only by that inert label lookup

Every link is dead, so the chain is removed as a unit rather than trimmed.

## Steps

1. Delete both element lookups near the top of `src/scripts/app.js`.
2. Delete the `setSaveStatus()` function and `currentSaveStatusKey`.
3. Delete the five `setSaveStatus(...)` call sites in `applyStaticCopy()`,
   `persistDraftSnapshot()`, `scheduleDraftSave()`, and `bootstrapDraftState()`,
   keeping every surrounding persistence branch intact.
4. Delete the four save-status keys from `src/scripts/strings.js`.
5. Update `docs_dreamboard/project/frontend/frontend-docs.md`.
6. Run `pnpm run preflight`.

## Risk

Low. The removed code has no observable effect. The persistence calls it sat
next to (`writeDraftSnapshot`, `readDraftSnapshot`, `restoreDraftSnapshot`, the
debounce timer, and the `suppressDraftPersistence` guards) are untouched, and
the `console.error` in the save failure path stays.
