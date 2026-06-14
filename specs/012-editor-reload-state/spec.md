# Spec 012: editor reload state

## Goal

Keep users in the editor after a browser refresh and restore the local board
draft in the same browser session.

## Scope

- Encode the active editor view in the static app URL.
- Open the editor automatically when the page loads with the editor route.
- Clear the editor route when the user intentionally returns to the landing
  view.
- Continue relying on local draft persistence for canvas objects and uploaded
  images.
- Document the editor route and draft restore contract.

## Non-Goals

- No backend draft storage or account state.
- No framework/router migration.
- No new visible draft status UI.
- No export/download behavior changes.

## Acceptance Criteria

1. Opening the editor updates the URL to an editor route.
2. Refreshing while on the editor route returns to the editor instead of the
   landing view.
3. Refreshing while on the editor route does not flash the landing view before
   the editor appears.
4. A saved local draft restores uploaded images and text objects after refresh.
5. Returning to the landing view clears the editor route so future reloads stay
   on the landing view.
6. Browser back/forward navigation switches between landing and editor routes.
7. `pnpm run ci` passes.
