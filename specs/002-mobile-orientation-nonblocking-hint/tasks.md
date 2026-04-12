# Tasks

- [x] Replace the blocking rotate overlay with a non-blocking orientation hint
- [x] Remove hard reliance on landscape locking during editor entry
- [x] Replace the current rotate icon with a clearer rotation cue and add a close button
- [x] Remove visible draft-save status text while keeping persistence logic intact
- [x] Adapt the mobile landscape editor to a true horizontal layout and resize flow
- [x] Update localized hint copy, spacing, and visual styling
- [x] Sync frontend docs and project summary with the new editor model
- [x] Align the AI Review workflow follow-up with the repository review-agent contract
- [x] Run validation and capture the result in this PR

## Validation

- `npm run ci`
- `node scripts/check-feature-memory.mjs --worktree`
