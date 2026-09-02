# Plan 015: Ember brand chrome and English-only app

## Brand mark

The Ember chrome is transplanted rather than re-drawn. Its values are read from
the live page and reproduced as tokens in `:root`:

| Token                             | Value                   |
| --------------------------------- | ----------------------- |
| `--brand-font`                    | Ember system sans stack |
| `--brand-ink` / `--brand-muted`   | `#2a2722` / `#807b72`   |
| `--brand-dot-a` / `--brand-dot-b` | `#818cf8` / `#22d3ee`   |

Markup mirrors Ember exactly, including the `visually-hidden` space that keeps
`ks design` two words for screen readers despite the gradient dot sitting
between them.

`.brand-mark` is the row arrangement used on landing. `.brand-mark-stacked` is
the column variant for the editor rail, which is roughly 220px wide and shares
that width with the back control. Two breakpoints keep the mark on one line:
tags drop to 9px inside the editor rail below 900px, and the landing tags drop
to 9px below 360px.

## Removing the language layer

`locale-boot.js` did two jobs: reading the locale cookie and marking the initial
view for the `#editor` route. Only the second job survives, so the file becomes
`view-boot.js` and exposes `window.__dreamboardViewBoot`.

`i18n.js` becomes `strings.js`, exporting a single `strings` object with the
English copy. `app.js` reads `strings` directly, so `currentLang`, `LANG_KEYS`,
`toggleLang`, `writeLocaleCookie`, and `revealLocaleBoot` all disappear.
`applyLanguageUI` becomes `applyStaticCopy`, since it now applies fixed copy
rather than switching between dictionaries.

The `html[data-locale-pending]` visibility gate in CSS existed only to hide a
locale swap on first paint, so it goes too. `index.html` keeps a static
`lang="en"`.

## Heading semantics

The wordmark was the only `h1` on the page. Rather than leave the landing with
no top-level heading, the hero title is promoted from `h2` to `h1`. It is styled
entirely by `.hero-title`, so the change is visually inert, and the now-unused
bare `h1` rule is deleted.

## Docs

`i18n consistency` is dropped from the review focus lists in `CLAUDE.md`,
`.gemini/styleguide.md`, `review-contract.md`, and `claude-review.yml`. The
frontend docs replace the `Locale Boot` section with `Brand Chrome`, `Language`,
and `View Boot`. Spec 010 gains a superseded banner instead of being deleted, so
the history of the English-first default stays readable.

## Verification

Local static server, checked at desktop, 812x375 phone landscape, 375px and
320px portrait: brand rendering, computed style parity against the live Ember
page, editor entry, add-text, back-to-landing, and reload on `#editor` with
draft restore. Console clean throughout. Then `pnpm run preflight`.
