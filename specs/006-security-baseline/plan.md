# Plan 006: Security Baseline

## Approach

Один PR с 5 атомарными изменениями, перенесёнными из pallete-maker.

## Steps

1. `.github/workflows/osv-scan.yml` — copy as-is, SHA-пин v2.3.5
2. `.github/dependabot.yml` — weekly, cooldown 7/14/7/3
3. SHA-пин в 4 workflow файлах (claude-agent, claude-review, ci, pr-guard)
4. `CLAUDE.md` — добавить OMC блок, commit-style, em-dash, preflight rules
5. `package.json` — добавить `preflight` script

## Verification

`pnpm run ci` зелёный локально до push.
