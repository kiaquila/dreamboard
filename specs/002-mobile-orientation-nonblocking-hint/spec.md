# Spec: non-blocking mobile orientation hint

## Goal

Make the mobile editor usable immediately in portrait mode while still nudging
users toward landscape orientation when they want a roomier canvas.

## Scope

- remove the blocking portrait-only editor overlay
- replace it with a lightweight, non-blocking orientation hint
- dismiss the hint when the user rotates to landscape or interacts with the
  editor
- align the PR-linked review gate with the selected `codex` review backend so
  this slice can complete through the standard repository flow
- document the new mobile-editor contract in frontend docs

## Non-Goals

- no wider editor redesign in this slice
- no framework migration
- no persistence or backend changes

## Acceptance Criteria

1. Entering the editor on a phone in portrait no longer blocks the canvas.
2. A subtle orientation hint appears in portrait mobile editor mode without
   preventing interaction with the editor.
3. The hint disappears when the viewport becomes landscape.
4. The hint also disappears after the user taps or otherwise interacts inside
   the editor.
5. Motion respects `prefers-reduced-motion`.
6. Docs describe landscape as a recommendation rather than a hard requirement.
