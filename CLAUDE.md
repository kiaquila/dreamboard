# dreamboard

Персональный инструмент для создания визуального dream board: landing page + редактор на Fabric.js с экспортом готового коллажа.

## Текущий стек

- Статический HTML/CSS/JS
- Fabric.js через CDN
- Vercel Git integration для preview и production deploy
- GitHub Actions для CI, guard и AI review orchestration
- `.specify/`, `docs_dreamboard/` и `specs/` как repository memory
- Gemini Code Assist как default review backend

## Важные правила

- Источник истины — репозиторий, а не ручные правки в Vercel
- Все изменения проходят через PR
- Продуктовые изменения начинаются с активной папки `specs/<feature-id>/`
- Один implementation loop = один worktree, одна ветка и один PR
- При изменении поведения UI, workflow или build/deploy обновляй `specs/` и `docs_dreamboard/`
- Не ломай `npm run build`: проект должен оставаться deployable как статический сайт
- При review фокусируйся на mobile layout, editor behavior, export safety, i18n consistency и maintainability

## Документация

- Конституция процесса: `.specify/memory/constitution.md`
- Карта docs: `docs_dreamboard/README.md`
- Идея проекта: `docs_dreamboard/project-idea.md`
- Frontend: `docs_dreamboard/project/frontend/frontend-docs.md`
- Orchestration: `docs_dreamboard/project/devops/ai-orchestration-protocol.md`
- PR loop: `docs_dreamboard/project/devops/ai-pr-workflow.md`
- Local runners: `docs_dreamboard/project/devops/macos-local-runners.md`
- AI runner: `docs_dreamboard/project/devops/ai-runner.md`
- Review contract: `docs_dreamboard/project/devops/review-contract.md`
- Vercel CD: `docs_dreamboard/project/devops/vercel-cd.md`
