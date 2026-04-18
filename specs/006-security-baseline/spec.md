# Spec 006: Security Baseline

## Problem

dreamboard не имел supply-chain защиты и quality-gate перед push.

## Goal

Привести security и quality инфраструктуру dreamboard к уровню pallete-maker PR #11.

## Scope

- OSV Scanner workflow для автоматического сканирования уязвимостей
- Dependabot с cooldown для github-actions и npm
- SHA-пин третьесторонних actions (anthropics/claude-code-action, pnpm/action-setup)
- CLAUDE.md: OMC auto-routing, commit-style rule, em-dash rule, preflight reference
- `pnpm run preflight` npm script для локального pre-push gate

## Out of scope

- CSP/HSTS headers (нет vercel.json headers в dreamboard пока)
- Tier 2 и Tier 3 переноса
