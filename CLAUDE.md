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
- Не ломай `pnpm run build`: проект должен оставаться deployable как статический сайт
- При review фокусируйся на mobile layout, editor behavior, export safety, i18n consistency и maintainability
- Стиль commit-message: только subject (≤72 chars, conventional prefix `fix:`/`chore:`/`docs:`/etc.); body не пишу, кроме случая с неочевидным «why»; длинный контекст идёт в PR description, не в commit body.
- Перед каждым `git push` прогоняй `pnpm run preflight` — он локально повторяет то, что делают PR Guard и CI (feature-memory gate + baseline + html + build + format).
- Не используй `—` (em-dash) в README и публичных docs; AI-slop tell; заменять на точку, двоеточие, запятую или middle-dot.

## OMC orchestration (auto-routing)

Перед выполнением нетривиальной задачи оцени, подходит ли какая-то возможность oh-my-claudecode (OMC), и **предложи пользователю подходящий режим одной короткой фразой с обоснованием до начала работы**. Не запускай автоматически — сначала получи согласие.

Триггеры «нетривиально» (хотя бы один):

- Многофайловое изменение, рефакторинг, миграция
- Исследование/поиск по кодбазе, где неочевиден ответ
- Задача с верификацией/QA-циклом
- Параллелизуемая работа (несколько независимых подзадач)
- Долгая автономная работа («не останавливайся, пока не сделаешь»)
- Дебаг с неясной причиной, трассировка, несколько гипотез

Карта режимов (сокращённо, полный каталог — skill `omc-reference`):

- `/plan` — стратегическое планирование сложной задачи
- `/ralph` — «не останавливайся, пока не сделаешь», PRD-driven цикл с верификацией
- `/ultrawork` — параллельное выполнение независимых подзадач
- `/autopilot` — полный цикл от идеи до кода
- `/team` — несколько координированных агентов на общем списке задач
- `/trace`, `/debug` — диагностика на основе цепочки доказательств (evidence-chain)
- `/ask` — консилиум Claude/Codex/Gemini
- subagents: `executor`, `architect`, `critic`, `code-reviewer`, `debugger`, `tracer`, `verifier`, `planner`, `security-reviewer`, `test-engineer`, `explorer`, `designer`, `writer`

Пропускай предложение для тривиальных задач (переименование, однострочный фикс, ответ на вопрос, быстрая проверка статуса).

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
