# Tasks 010: Fix PR-ref gate scripts

## F1 — ai-review.yml: checkout default_branch

- [x] Заменить single checkout на explicit `ref: default_branch`
- [x] Inline-комментарий с threat model

## F2 — pr-guard.yml: two-checkout pattern

- [x] PR checkout в workspace root first
- [x] Trusted checkout в `.gate-trusted/` second
- [x] `node scripts/check-feature-memory.mjs` → `.gate-trusted/`
- [x] `pnpm run check:repo` → `node .gate-trusted/scripts/check-static-baseline.mjs`
- [x] Fix #1: первый прогон провалился (run 25027611454) — `actions/checkout`
      v6 при втором checkout на workspace root делает "Deleting the contents",
      сносит `.gate-trusted/`. `clean: false` тут не помогает — это другая
      фаза. Решение: поменять порядок на PR-first.
- [x] Fix #2: Codex P1 finding (run 25028103989) — `pnpm-workspace.yaml` без
      `packages:` мог бы триггерить scanning subdirs в будущих версиях pnpm,
      и `.gate-trusted/package.json` ломал бы frozen-lockfile install.
      Решение: явный `packages: ["."]` в `pnpm-workspace.yaml`.

## F3 — Docs

- [x] `ai-pr-workflow.md` Hard Gates: пункт про trusted-base

## CI / preflight

- [x] `pnpm run preflight` зелёный локально
- [ ] `guard` зелёный на PR
- [ ] `baseline-checks` зелёный на PR
- [ ] `ai-review` зелёный на PR
