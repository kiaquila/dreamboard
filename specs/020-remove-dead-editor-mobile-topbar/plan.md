# Plan

1. Confirm in a browser that `.editor-mobile-topbar` computes to
   `display: none` at desktop, tablet, phone portrait and phone landscape, and
   capture the baseline geometry of the editor layout at those viewports.
2. Trace every consumer of the topbar in markup, styles and script, and prove
   that no other control opens the mobile sidebar.
3. Remove the topbar markup, then the CSS it owned, then the script lookups and
   listeners that become unreachable.
4. Remove the sidebar drawer leftovers that only the topbar burger could reach:
   overlay node, `openSidebar` / `closeSidebar` / `syncMenuButtonState`, and the
   drawer-only positioning declarations that
   `body.is-editor-active .sidebar` already overrode.
5. Re-measure the same geometry in the browser and diff it against the baseline
   to prove the render is unchanged.
6. Update the frontend docs so the mobile editor chrome is described as the
   sidebar rail only.
7. Run `pnpm run preflight`, then open one pull request.
