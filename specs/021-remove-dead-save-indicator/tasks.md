# Tasks: remove the dead save-indicator chain

- [x] Confirm `saveIndicatorMobile` has no definition in `index.html`, `src/`,
      styles, tests, or any build step
- [x] Confirm `#saveIndicator` is equally undefined and trace both removals to
      commit `2851b19` (spec 002)
- [x] Decide removal over restoration and record the rationale in `spec.md`
- [x] Remove both element lookups from `src/scripts/app.js`
- [x] Remove `setSaveStatus()` and `currentSaveStatusKey`
- [x] Remove the five `setSaveStatus(...)` call sites, leaving draft
      persistence branches intact
- [x] Remove the four unused save-status keys from `src/scripts/strings.js`
- [x] Update `docs_dreamboard/project/frontend/frontend-docs.md`
- [x] Run `pnpm run preflight`
- [x] Merge current `main` (topbar removal, Cloudflare stage) and re-verify
      that no save-status symbol survives in `index.html`, `src/` or `tests/`
- [ ] Open the PR and drive it to merge-ready
