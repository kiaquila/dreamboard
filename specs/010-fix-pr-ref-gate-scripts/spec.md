# Spec 010: Fix PR-ref gate scripts

## Problem

Audit в параллельной сессии (tone-of-voice) выявил тот же класс уязвимости в
dreamboard. `actions/checkout` в `pr-guard.yml` и `ai-review.yml` тянет
workspace по PR-ref, а gate-скрипты (`scripts/check-feature-memory.mjs`,
`scripts/resolve-pr-context.mjs`, `scripts/ai-review-gate.mjs`) выполняются
именно из этого untrusted workspace.

Вектор: контрибьютор подменяет gate-скрипт в своём PR (например,
`scripts/check-feature-memory.mjs` → `process.exit(0)`) и проходит required
check без реальной проверки.

Затронутые required checks: `guard`, `ai-review`. `baseline-checks` (CI)
запускается на PR-ref сознательно (валидирует PR), но `pnpm run check:repo`
внутри `guard` тоже резолвится через PR-овский `package.json`, что делает
его tamper-prone.

## Goal

Закрыть P0 уязвимость одним PR. Gate-скрипты обязаны исполняться только из
trusted main, при этом сохраняя возможность валидировать содержимое PR
(diff, новые файлы в `specs/<id>/`, baseline).

## Scope

### F1 — `ai-review.yml`: checkout по default_branch

Single checkout с явным `ref: ${{ github.event.repository.default_branch }}`.
Скрипты `resolve-pr-context.mjs` и `ai-review-gate.mjs` не зависят от
filesystem PR-а — они читают PR-контекст через `GITHUB_EVENT_PATH` и GitHub
API, поэтому одной проверки main достаточно.

### F2 — `pr-guard.yml`: two-checkout pattern

Trusted main в `.gate-trusted/`, PR в workspace root. Это нужно потому,
что `check-feature-memory.mjs` помимо `git diff` ещё проверяет
`existsSync(specs/<id>/spec.md)` — для новых файлов в PR требуется PR-овское
дерево на диске.

PR-checkout получает `clean: false`, чтобы `git clean -ffdx` не уничтожил
`.gate-trusted/` после первой стадии.

`node scripts/check-feature-memory.mjs "$BASE_REF" "$HEAD_REF"` →
`node .gate-trusted/scripts/check-feature-memory.mjs "$BASE_REF" "$HEAD_REF"`.
`pnpm run check:repo` → `node .gate-trusted/scripts/check-static-baseline.mjs`
(минует PR-овский `package.json`, но `process.cwd()` остаётся на PR-tree).

## Out of scope

- Inline shell в `pr-guard.yml` (docs coverage check) — tamper-prone
  через изменение workflow-файла, отдельный класс защиты (branch protection
  на `.github/workflows/`, code review).
- `pnpm install --frozen-lockfile` — это валидатор lockfile, а не gate-скрипт;
  pnpm-binary доверенный (SHA-pinned action).
- `--ignore-scripts` для `pnpm install` — отдельная supply-chain hardening.
- `osv-scan.yml` — сознательно сканирует PR-овский lockfile.
- `ci.yml` baseline-checks — пока сознательно запускается на PR-tree
  (валидирует PR build).

## Acceptance

- `pnpm run preflight` зелёный локально
- `guard` зелёный на этом PR (использует trusted gate из main, который
  валидирует PR-tree через `git diff` и `existsSync`)
- `ai-review` зелёный (использует trusted scripts/ из main для polling)
- Контрибьютор больше не может пройти `guard`/`ai-review` через изменение
  `scripts/check-feature-memory.mjs`, `scripts/check-static-baseline.mjs`,
  `scripts/resolve-pr-context.mjs` или `scripts/ai-review-gate.mjs` в PR
