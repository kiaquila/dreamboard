# Spec: non-blocking mobile orientation hint

## Goal

Make the mobile editor usable immediately in portrait mode while still nudging
users toward landscape orientation when they want a roomier canvas.

## Scope

- remove the blocking portrait-only editor overlay
- replace it with a lightweight, non-blocking orientation hint card
- use a clearer rotation icon and a close button inside that card
- dismiss the hint when the user rotates to landscape, closes it, or interacts
  with the editor
- hide visible draft-save status text while keeping draft persistence active
- adapt the phone landscape editor so the tool panel and canvas use a proper
  horizontal layout
- document the new mobile-editor contract in frontend docs

## Non-Goals

- no wider editor redesign in this slice
- no framework migration
- no persistence or backend changes

## Acceptance Criteria

1. Entering the editor on a phone in portrait no longer blocks the canvas.
2. A subtle orientation hint appears in portrait mobile editor mode without
   preventing interaction with the editor.
3. The hint uses a clearer mobile-rotation icon and a dedicated close button.
4. The hint disappears when the viewport becomes landscape.
5. The hint also disappears after the user taps or otherwise interacts inside
   the editor.
6. Visible “draft saved” status text is removed, while draft persistence
   continues to work.
7. On phone landscape, the editor presents a horizontal layout with the tools
   and canvas arranged for that orientation.
8. Motion respects `prefers-reduced-motion`.
9. Docs describe landscape as a recommendation rather than a hard requirement.
