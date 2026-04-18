# Spec 007: Security Tier 2

## Problem

После tier 1 (spec 006) dreamboard получил OSV/Dependabot/SHA-пины/preflight,
но defence-in-depth на уровне браузера и supply-chain скриптов всё ещё
отсутствует, а gate для Codex review в skip-mode сохраняет дефект,
пойманный на pallete-maker PR #12 (6-итерационный cascade P1/P2).

## Goal

Перенести tier 2 security-наработок pallete-maker → dreamboard одним PR:

- защита браузера от XSS/clickjacking на уровне response headers
- supply-chain защита от компрометации CDN через SRI
- maturity bump ai-review-gate (spec 010 timeline-redesign из pallete-maker)

## Scope

### F — Response security headers в vercel.json

- `Content-Security-Policy` с allowlist строго под зависимости dreamboard:
  - script-src: `'self'` + `https://cdnjs.cloudflare.com` (fabric.js)
  - style-src: `'self' 'unsafe-inline'` + `https://fonts.googleapis.com`
    (inline style-атрибуты используются в index.html)
  - font-src: `'self'` + `https://fonts.gstatic.com`
  - img-src: `'self' data:` + `https://cdn.matecito.co` (donate button)
  - connect-src: `'self'` (без внешних fetch)
  - frame-ancestors: `'none'`, base-uri: `'self'`, form-action: `'self'`,
    object-src: `'none'`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Frame-Options: DENY` (defence-in-depth для старых браузеров)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`

### G — SRI на CDN-скрипте

- fabric.js@5.3.1 с cdnjs: `integrity="sha512-..."` + `crossorigin="anonymous"`.
  Хэш с официального cdnjs API.
- Google Fonts CSS: SRI не применяется (Google ротирует content-stylesheet;
  это стандартная практика отказа от SRI на Google Fonts).
- cdn.matecito.co images: SRI на `<img>` браузерами не поддерживается.

### H — ai-review-gate maturity bump (spec 010 pallete-maker)

- новый `scripts/ai-review-helpers.mjs` — чистые helpers с Timeline API
  freshness binding (извлекает `head_ref_force_pushed`/`committed` события
  для привязки Codex summary/setup комментов к текущему head SHA)
- рефактор `scripts/ai-review-gate.mjs`:
  - импорт helpers
  - skip-mode Codex: матчинг по PR Timeline API вместо committer-date
  - graceful degradation при недоступности timeline
- `.github/workflows/ai-review.yml`: concurrency group включает `event_name`
  (предотвращает cross-event cancellations между `pull_request` и
  `workflow_dispatch`)
- `tests/ai-review-helpers.test.mjs` + `tests/ai-review-gate-regressions.test.mjs`
  (behavioural tests против повторного регресса)
- `package.json`: `test` script + включение в `ci` + расширение
  `format:check` glob на `tests/**/*.mjs`

## Out of scope

- Tier 3 переноса (CSP refactor на nonce-based, если понадобится убрать
  `'unsafe-inline'` из style-src)
- Рефактор inline style-атрибутов в index.html
- Gemini/Claude branch в ai-review-gate (spec 010 касается только Codex)
- Изменение default review agent (dreamboard = codex, не трогаем)

## Verification

`pnpm run preflight` зелёный локально. После merge: OSV Scan, PR Guard,
AI Review green на PR. Ручная проверка headers через `curl -I` на
production URL после deploy.
