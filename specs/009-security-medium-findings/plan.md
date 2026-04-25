# Plan 009: Security Medium Findings

## Approach

Один PR, один коммит. Все три MEDIUM находки атомарны и независимы,
но малы по объёму — объединены для минимального review overhead.

## Changes

### M1 — SHA-pin actions (7 workflow файлов)

`sed -i ''` глобальная замена тегов на SHA + inline-комментарий с версией:

- `actions/checkout@v6` → `@de0fac2e...` # v6
- `actions/setup-node@v4` → `@49933ea5...` # v4
- `actions/github-script@v8` → `@ed597411...` # v8

SHA получены через `gh api repos/actions/<name>/commits/<tag> --jq '.sha'`.

### M2 — donateText DOM construction

`src/scripts/i18n.js`: переименовать `donateTextHtml` (template literal
с тегами) → `donateText` (массив объектов) для RU/EN/ES.

Структура элементов: `{type: "text"|"link"|"br", value?, href?, text?}`.

`src/scripts/app.js:272`: заменить `innerHTML` на `replaceChildren()` + loop.
Ссылки создаются с `rel="noopener noreferrer"`, `target="_blank"`.

### M3 — Narrow file input

`index.html:210`: `accept="image/*"` → `accept="image/png,image/jpeg,image/webp,image/gif"`.

`src/scripts/app.js` fileInput handler: добавить `ALLOWED_MIME` Set-фильтр
и `.endsWith(".svg")` check до `loadPromises`.

### L2 (included) — rel=noreferrer

`index.html`: `rel="noopener"` → `rel="noopener noreferrer"` на всех
внешних ссылках (3 штуки: instagram donate modal, matecito link).
`Referrer-Policy` уже стоит, это defense-in-depth.
