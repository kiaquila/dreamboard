# Spec: remove the unreachable editor mobile topbar

## Problem

`index.html` still carries an `.editor-mobile-topbar` block inside
`#editorView`, with a back button, a brand label, a burger menu button and a
language button. That topbar can never render:

- `src/scripts/app.js` shows the editor only through `showEditorShell()`, and
  that function always also adds `is-editor-active` to `<body>`.
- `src/styles/app.css` hides `.editor-mobile-topbar` with `display: none` in
  the base rule, so it is invisible above 900px.
- Below 900px an earlier media block sets `display: flex`, but a later
  `@media (max-width: 900px)` block sets
  `body.is-editor-active .editor-mobile-topbar { display: none; }`.

Because the editor view is only visible while `is-editor-active` is set, both
branches resolve to `display: none`. Browser verification at 1440x900,
768x1024, 390x844 and 844x390 returns `display: none` and a 0x0 rect in every
case; removing `is-editor-active` by hand in the console makes the same node
render as a 74px bar, which confirms the class is the only thing hiding it.

The block is leftover from the phone-landscape editor refactor (spec 002),
which replaced the mobile drawer layout with a permanent left tool rail.

## Goal

Delete the unreachable topbar and the mobile sidebar drawer machinery that
existed only to serve it, without changing any rendered layout.

## Scope

- `index.html`: remove the `.editor-mobile-topbar` block
  (`editorBackBtnMobile`, `.editor-mobile-brand`, `.editor-mobile-actions`,
  `mobileMenuBtn`, `langBtnEditorMobile`) and the now-unreachable
  `#sidebarOverlay` node.
- `src/styles/app.css`: remove `.editor-mobile-topbar`,
  `.editor-mobile-actions`, `.editor-mobile-brand`, `.editor-mobile-lang`,
  `.topbar-icon-btn`, `.topbar-back-btn`, `.mobile-menu-btn`,
  `.sidebar-overlay`, the drawer-only `.sidebar` / `.sidebar::before` /
  `.sidebar.is-open` declarations, and the
  `--editor-mobile-topbar-height` custom property together with every
  declaration that consumed it. Also drop the never-referenced
  `--editor-mobile-header-offset`.
- `src/scripts/app.js`: remove the `editorBackButtonMobile`,
  `editorMobileLangButton`, `mobileMenuBtn` and `sidebarOverlay` element
  lookups, their listeners, `syncMenuButtonState()`, `openSidebar()`,
  `closeSidebar()` and every `closeSidebar()` call site, plus the topbar-only
  branches in `applyStaticTranslations()`.
- `docs_dreamboard/project/frontend/frontend-docs.md`: describe the mobile
  editor chrome as the sidebar rail only, with no separate mobile topbar.

## Non-Goals

- No visual redesign of the mobile or desktop editor.
- No change to the rotate hint, draft persistence, or export behavior.
- No reintroduction of a mobile drawer or bottom sheet.

## Retained behavior

Every action the dead topbar duplicated is still reachable from the sidebar
header, which is permanently visible in the mobile editor
(`position: relative`, ~249px wide at 844x390):

- back to landing: `#editorBackBtn`
- language switch: `#langBtnEditor`
- tools: the sidebar rail itself, always on screen, so no opener is needed

## Acceptance Criteria

1. `index.html` contains no `editor-mobile-topbar`, `mobileMenuBtn`,
   `editorBackBtnMobile`, `langBtnEditorMobile` or `sidebarOverlay`.
2. `src/scripts/app.js` has no unreachable sidebar-drawer functions left.
3. `src/styles/app.css` has no `--editor-mobile-topbar-height` and no
   `.editor-mobile-*` / `.sidebar-overlay` rules.
4. The editor renders identically before and after at 1440x900, 768x1024,
   390x844 and 844x390: same sidebar rail geometry, same canvas box, same
   rotate hint position.
5. Back to landing and the language switch still work in the mobile editor.
6. `pnpm run preflight` is green.

## Verification

- Browser diff of computed geometry for `.app-container`, `.sidebar`,
  `.canvas-area`, `.canvas-wrapper` and `.editor-rotate-hint` at the four
  viewports above, before and after the change.
- Manual click-through of `#editorBackBtn` and `#langBtnEditor` at 844x390.
- `pnpm run preflight` locally; `baseline-checks`, `guard` and `AI Review`
  green on the pull request, plus a healthy Vercel preview of the editor.
