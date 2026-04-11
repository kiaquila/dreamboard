# Plan

## Slice 1: Mobile Orientation UX

- replace the full-screen rotate overlay with a floating hint component
- stop relying on hard orientation-lock behavior during editor entry
- hide the hint on editor interaction or when the phone rotates
- add an explicit close action inside the hint card

## Slice 2: Copy and Motion

- rewrite rotate-hint copy so it reads as a recommendation, not a blocker
- use a clearer phone-rotation icon and a subtle animation for the icon only
- disable non-essential motion when `prefers-reduced-motion` is enabled

## Slice 3: Mobile Landscape Layout

- remove visible save-status text from the editor shell while keeping draft
  persistence
- adapt mobile landscape so the sidebar and canvas sit in a proper horizontal
  arrangement
- force viewport and canvas recalculation on device rotation

## Slice 4: Documentation

- update frontend docs to reflect the non-blocking mobile editor behavior
- sync the high-level project summary with the new mobile interaction model

## Validation

- run `npm run ci`
- run `node scripts/check-feature-memory.mjs --worktree`
- smoke-check the editor entry flow on mobile viewport assumptions
