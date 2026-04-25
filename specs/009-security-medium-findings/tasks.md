# Tasks 009: Security Medium Findings

## M1 — SHA-pin first-party GitHub Actions

- [x] Получить SHA: `checkout@v6`, `setup-node@v4`, `github-script@v8`
- [x] `sed` замена во всех 7 `.github/workflows/*.yml`
- [x] Проверить: `grep -r "uses: actions/" .github/workflows/*.yml | grep -v "@[0-9a-f]\{40\}"` пустой

## M2 — donateText DOM construction

- [x] `src/scripts/i18n.js`: `donateTextHtml` → `donateText[]` для RU/EN/ES
- [x] `src/scripts/app.js:272`: `innerHTML` → `replaceChildren()` + DOM loop
- [x] Проверить: donate modal корректен для всех трёх локалей

## M3 — Narrow file input + JS SVG filter

- [x] `index.html:210`: `accept="image/*"` → raster-only список
- [x] `src/scripts/app.js` fileInput handler: `ALLOWED_MIME` Set + `.svg` check
- [x] Проверить: PNG/JPG/WebP загружаются; SVG отклоняется

## L2 — rel=noreferrer (included)

- [x] `index.html`: `rel="noopener"` → `rel="noopener noreferrer"` (3 ссылки)

## CI / preflight

- [x] `pnpm run preflight` зелёный локально
- [ ] PR Guard зелёный
- [ ] OSV Scan зелёный
- [ ] AI Review пройден
