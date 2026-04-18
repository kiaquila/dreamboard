# Tasks 007: Security Tier 2

## F — Response security headers

- [ ] `vercel.json`: добавить `headers` массив с CSP/HSTS/X-Frame-Options/
      X-Content-Type-Options/Referrer-Policy/Permissions-Policy
- [ ] Локально: `pnpm run ci` → зелёный

## G — SRI на fabric.js

- [ ] `index.html`: добавить `integrity` + `crossorigin` на CDN-скрипт
      fabric.js@5.3.1
- [ ] Локально: `pnpm run ci` → зелёный; визуальная проверка что редактор
      грузится (fabric инициализируется)

## H — ai-review-gate maturity bump

- [ ] `scripts/ai-review-helpers.mjs`: создать (port из pallete-maker)
- [ ] `scripts/ai-review-gate.mjs`: рефактор на helpers + Timeline API
- [ ] `.github/workflows/ai-review.yml`: concurrency group с `event_name`
- [ ] `tests/ai-review-helpers.test.mjs`: создать (port)
- [ ] `tests/ai-review-gate-regressions.test.mjs`: создать (port)
- [ ] `package.json`: `test` script, `ci` включает тесты, `format:check`
      glob на `tests/**/*.mjs`
- [ ] Локально: `pnpm run test` зелёный, `pnpm run ci` зелёный,
      `pnpm run preflight` зелёный

## PR

- [ ] 3 атомарных коммита (F, G, H) в один PR
- [ ] После push: OSV Scan, PR Guard, AI Review все зелёные
