# Plan 007: Security Tier 2

## Approach

Один PR с тремя атомарными коммитами, каждый самодостаточен и ревьюабелен
изолированно.

## Commits

### Commit 1 — vercel.json security headers

Добавить `headers` массив в `vercel.json`. Путь allowlist выбран под реальные
внешние зависимости dreamboard (без 'unsafe-inline' для script-src, т. к.
в index.html нет inline `<script>` с кодом и нет `on*=` атрибутов).

### Commit 2 — SRI на fabric.js

В `index.html` на `<script src="https://cdnjs.cloudflare.com/.../fabric.min.js">`
добавить `integrity="sha512-CeIsOAsgJnmevfCi2C7Zsyy6bQKi43utIjdA87Q0ZY84oDqnI0uwfM9+bKiIkI75lUeI00WG/+uJzOmuHlesMA=="`
(официальный хэш из cdnjs API) и `crossorigin="anonymous"`.

### Commit 3 — ai-review-gate maturity bump

1. Создать `scripts/ai-review-helpers.mjs` (port 1:1 из pallete-maker).
2. Рефактор `scripts/ai-review-gate.mjs`: импорт helpers, skip-mode
   Codex branch переведён на Timeline API.
3. `.github/workflows/ai-review.yml`: только concurrency group обновить
   (включить `event_name` в ключ). НЕ трогать: checkout@v6, default
   `codex`, allowed list `[gemini, codex, claude]`.
4. Добавить `tests/ai-review-helpers.test.mjs`,
   `tests/ai-review-gate-regressions.test.mjs` (port 1:1).
5. `package.json`: добавить `"test": "node --test tests/*.test.mjs"`,
   включить в `ci` (`&& pnpm run test`), расширить `format:check` glob
   на `"tests/**/*.mjs"`.

## Verification

- `pnpm run ci` зелёный (включая новые тесты)
- `pnpm run preflight` зелёный
- После push на PR: OSV Scan, PR Guard, AI Review все зелёные

## Rollback

Каждый коммит self-contained → `git revert <sha>` любого из трёх без
каскадных конфликтов.
