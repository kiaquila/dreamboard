# Spec 015: Ember brand chrome and English-only app

## Goal

Retire the `DREAM BOARD` wordmark in favour of the studio chrome already used on
`ember.ks-design.art`, reduce the app to a single language (English), and
tighten two landing headlines.

## Scope

- Replace the wordmark on landing, editor sidebar, and editor mobile topbar with
  the Ember `ks·design · lab` + `study 01 — dream board` mark, matching the
  original typeface, size, letter-spacing, colours, and gradient dot.
- Remove the language switcher from every shell.
- Remove the RU and ES dictionaries, the `dreamboard_locale` cookie, and the
  locale boot script, keeping the editor-route boot behaviour intact.
- Collapse the locale dictionaries into a single English copy module.
- Remove language switching from repository docs and review contracts.
- Shorten the hero headline to `Create your vision board for free`.
- Change the closing headline to `It's time to make dreams come true`.

## Non-Goals

- No new framework, routing layer, or backend.
- No change to canvas, export, or draft-persistence behaviour.
- No redesign of the landing slides beyond the two headline strings.
- No change to how narrow the rotated portrait editor rail is.
- No change to the footer landed in the previous hero PR.

## Acceptance Criteria

1. No `DREAM BOARD` wordmark renders anywhere in the app.
2. Landing and editor both show the Ember mark, and its computed font stack,
   size, letter-spacing, colours, and dot gradient match the Ember original.
3. Every visible tag stays on one line at every supported viewport, landing
   header and editor rail alike, down to 320px in both orientations.
4. No language switcher exists in the DOM, the stylesheet, or the scripts.
5. `src/scripts/` contains no locale dictionaries and no locale cookie code.
6. The document still exposes exactly one `h1`.
7. Reloading on `#editor` still boots straight into the editor and restores the
   local draft.
8. The hero reads `Create your vision board for free` and the closing slide
   reads `It's time to make dreams come true`.
9. `pnpm run ci` passes.
