# Spec 010: default English cookie locale

> Superseded by `specs/015-ember-brand-english-only/`. The app is now
> English-only: the locale switcher, the `dreamboard_locale` cookie, and the
> RU/ES dictionaries described below no longer exist. Kept as a record of how
> the English-first default was reached.

## Goal

Make English the no-preference first render for the static app, and persist an
explicit user language choice in a cookie so repeat visits render in the chosen
language without a visible Russian-to-English or English-to-other-language text
swap.

## Scope

- Change the static HTML shell to English-first content and metadata.
- Stop selecting the initial language from `navigator.language`.
- Store explicit language changes in a first-party cookie.
- Use the cookie as the source of truth for known locale preference.
- Prevent saved editor drafts from silently overriding the chosen UI locale.
- Document the locale boot behavior in frontend docs.

## Non-Goals

- No backend, account, or server-side locale negotiation.
- No new framework or routing layer.
- No changes to the available locale dictionaries.
- No product copy rewrite beyond aligning existing static fallback copy with
  the existing English dictionary.

## Acceptance Criteria

1. A first-time visitor with no locale cookie sees English content on first
   paint, regardless of browser language.
2. The app does not auto-switch from English based on `navigator.language`.
3. When the user clicks the language toggle, the selected locale is written to a
   cookie.
4. On a repeat visit with a valid locale cookie, the app initializes to that
   locale.
5. A saved draft can restore canvas content without changing the UI locale.
6. `pnpm run ci` passes.
