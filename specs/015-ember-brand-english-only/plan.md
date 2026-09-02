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
the column variant for the editor rail, which shares its width with the back
control.

Keeping every tag on one line is a per-shell calculation, because the space each
shell offers differs by an order of magnitude. Measured against the widest tag,
`study 01 — dream board`:

| Shell                         | Space for the mark | Tag needs | Handling            |
| ----------------------------- | ------------------ | --------- | ------------------- |
| landing, 1440px               | 1390px             | 202px     | Ember 11px / 0.22em |
| landing, 361px to 900px       | 329px and up       | 168px     | 10px / 0.16em       |
| landing, 320px to 360px       | 288px              | 145px     | 9px / 0.12em        |
| editor rail, 480px landscape  | 146px              | 140px     | 9px / 0.08em        |
| editor rail, rotated portrait | 104px              | 129px     | study tag hidden    |

The rotated portrait rail is the one case with no size that both fits and stays
readable: 104px of rail would need roughly 5px type with no tracking. It shows
the `ks·design · lab` tag alone instead, which fits at 8px with room to spare.
Dropping the build label there is a better trade than wrapping the mark into a
vertical smear of characters, which is what the first attempt did.

Rail tracking is trimmed to 0.08em rather than the Ember 0.22em so the tightest
landscape rail keeps a margin: `system-ui` resolves to different faces per OS,
and a 2px margin measured on one machine is not a margin at all.

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
