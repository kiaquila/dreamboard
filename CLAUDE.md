# dreamboard

Персональный инструмент для создания визуального dream board: landing page + редактор на Fabric.js с экспортом готового коллажа.

## Текущий стек

- Статический HTML/CSS/JS
- Fabric.js через CDN
- Vercel Git integration для preview и production deploy
- GitHub Actions для CI, guard и AI review orchestration

## Важные правила

- Источник истины — репозиторий, а не ручные правки в Vercel
- Все изменения проходят через PR
- При изменении поведения UI, workflow или build/deploy обновляй `docs_dreamboard/`
- Не ломай `npm run build`: проект должен оставаться deployable как статический сайт
- При review фокусируйся на mobile layout, editor behavior, export safety, i18n consistency и maintainability

## Документация

- Идея проекта: `docs_dreamboard/project-idea.md`
- Frontend: `docs_dreamboard/project/frontend/frontend-docs.md`
- Orchestration: `docs_dreamboard/project/devops/ai-orchestration-protocol.md`
- AI runner: `docs_dreamboard/project/devops/ai-runner.md`
- Review contract: `docs_dreamboard/project/devops/review-contract.md`
- Vercel CD: `docs_dreamboard/project/devops/vercel-cd.md`
