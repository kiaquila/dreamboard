# Spec 009: Security Medium Findings

## Problem

Security audit по всем публичным репо `kiaquila` выявил 3 MEDIUM + 3 LOW
находки в dreamboard. Risk level MEDIUM: активный frontend с file upload,
i18n innerHTML и canvas. Critical/High = 0.

## Goal

Закрыть 3 MEDIUM находки одним PR. LOW findings частично включены
(L2 — noreferrer), остальные отложены.

## Scope

### M1 — SHA-pin first-party GitHub Actions

Третьи actions (`pnpm/action-setup`, `google/osv-scanner-action`,
`anthropics/claude-code-action`) уже SHA-пиннуты. Доделать first-party:
`actions/checkout`, `actions/setup-node`, `actions/github-script` во всех
7 воркфлоу.

Вектор: компрометация тега на GitHub → подмена кода в CI-пайплайне.

### M2 — innerHTML для i18n donateTextHtml

`app.js` использует `donateTextEl.innerHTML = t.donateTextHtml` где источник
статичная i18n-строка. Сегодня XSS невозможен, но любой контрибьютор может
случайно добавить динамику в i18n → stored XSS.

Решение: реструктурировать `donateTextHtml` в `donateText[]` (typed array
объектов `{type, value/href/text}`) и собрать DOM через `replaceChildren()`.

### M3 — File input accept="image/\*" пропускает SVG

`accept="image/*"` разрешает SVG. CSP блокирует `<script>` внутри SVG,
но `<foreignObject>` и CSS-based exfil могут пробить.
Self-XSS (юзер сам грузит вредоносный svg). Фикс тривиален.

Решение: сузить до `image/png,image/jpeg,image/webp,image/gif` + JS-фильтр
по MIME и `.svg`-расширению в file handler.

## Out of scope (deferred)

- L1: `style-src 'unsafe-inline'` → tracked в specs/007-security-tier-2
- L3: `loadFromJSON` schema validation → информационное, не приоритет
