# Plan 010: Fix PR-ref gate scripts

## Approach

Один PR, один коммит. Параллель с фиксом, который уже приземлился в
tone-of-voice репо. Затрагиваем только два workflow-файла плюс обязательные
spec-файлы и заметка в `ai-pr-workflow.md`.

## Changes

### F1 — `.github/workflows/ai-review.yml`

Один checkout, явный `ref`:

```yaml
- name: Checkout trusted base (default branch)
  uses: actions/checkout@de0fac2e... # v6
  with:
    ref: ${{ github.event.repository.default_branch }}
    fetch-depth: 1
```

Inline-комментарий объясняет threat model для будущих читателей.

### F2 — `.github/workflows/pr-guard.yml`

Two-checkout:

```yaml
- name: Checkout PR content
  uses: actions/checkout@de0fac2e... # v6
  with:
    fetch-depth: 0
    ref: ${{ inputs.ref || github.event.pull_request.head.sha || github.sha }}

- name: Checkout trusted gate scripts (default branch)
  uses: actions/checkout@de0fac2e... # v6
  with:
    ref: ${{ github.event.repository.default_branch }}
    path: .gate-trusted
    fetch-depth: 1
```

Порядок важен: PR-content first, trusted second. `actions/checkout` v6 при
checkout в непустую директорию без matching `.git/` делает
`Deleting the contents of '<path>'` — это `prepareExistingDirectory()`,
fires до `clean` фазы и не блокируется `clean: false`. Если бы trusted шёл
первым, второй checkout на workspace root снёс бы `.gate-trusted/` (как и
случилось в первой попытке этого фикса, GH run 25027611454).

Adversarial `.gate-trusted/` в PR-tree не страшен: второй checkout с
`path: .gate-trusted` вызывает `prepareExistingDirectory()` для подпапки,
который stomps non-matching content и переинициализирует с main. Даже если
PR засеет `.gate-trusted/.git/` с фальшивым origin URL, action всё равно
делает rm-rf и init заново. Если PR попадает в матчинг origin, `git fetch`
пуллит реальный main (token-аутентифицированный), коллизию SHA подделать
нельзя.

Замена двух запусков скриптов:

- `node scripts/check-feature-memory.mjs` →
  `node .gate-trusted/scripts/check-feature-memory.mjs`
- `pnpm run check:repo` → `node .gate-trusted/scripts/check-static-baseline.mjs`

`process.cwd()` обоих скриптов остаётся workspace root (PR-tree), поэтому
`existsSync` проверяет PR-овское состояние, а не main.

`pnpm install --frozen-lockfile` остаётся как есть: pnpm-binary доверенный
(SHA-pinned), а валидация PR-овского lockfile — это и есть цель.

### F3 — `docs_dreamboard/project/devops/ai-pr-workflow.md`

В секцию `## Hard Gates` добавить пункт о trusted-base pattern: gate-скрипты
исполняются только из main, не из PR.

## Risks

- Этот PR может не пройти свой собственный `guard`, потому что workflow в
  PR пока работает по старой схеме на `pull_request` event. На самом деле
  no — для same-repo PR GitHub Actions берёт workflow-файл из PR head, так
  что новый pattern активируется сразу. Проверим в run.
- Если `.gate-trusted/` чекаут падает (network), PR не сможет пройти guard.
  Mitigation: `actions/checkout` retries на 401/5xx из коробки.
- `node` без `setup-node` доступен на ubuntu-latest из коробки (preinstalled
  через nvm). Проверено.
