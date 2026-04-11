# Plan

## Slice 1: Mobile Orientation UX

- replace the full-screen rotate overlay with a floating hint component
- stop relying on hard orientation-lock behavior during editor entry
- hide the hint on editor interaction or when the phone rotates

## Slice 2: Copy and Motion

- rewrite rotate-hint copy so it reads as a recommendation, not a blocker
- use a subtle phone-rotation animation for the icon only
- disable non-essential motion when `prefers-reduced-motion` is enabled

## Slice 3: Documentation

- update frontend docs to reflect the non-blocking mobile editor behavior
- sync the high-level project summary with the new mobile interaction model

## Slice 4: Review Flow Alignment

- ensure PR-linked `AI Review` no longer skips when `AI_REVIEW_AGENT=codex`
- keep the existing draft guard while letting the selected backend run through
  the normal PR workflow

## Validation

- run `npm run ci`
- run `node scripts/check-feature-memory.mjs --worktree`
- smoke-check the editor entry flow on mobile viewport assumptions
