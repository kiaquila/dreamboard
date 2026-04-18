# Plan 008: Dreamboard favicon

## Approach

Один mini-PR с одним коммитом: 4 новых файла (SVG + 2 PNG + spec) +
modification в `index.html`.

## Design

SVG c тремя radial gradients в одном `<svg viewBox="0 0 512 512">`:

- `#db-body` — основная сфера: центр света `(32%, 26%)`, радиус `80%`,
  stops: `#d7f79a → #a3ed9c → #5ee0bb → #24c8ea → #1a83e4 → #1145c8 →
#081b86` (мягкие переходы зелёный/циан/синий)
- `#db-gloss` — specular highlight: центр `(28%, 20%)`, radius `32%`,
  белая полупрозрачная для подсветки
- Прозрачный фон (нет `<rect>`-подложки, только `<circle>`)

## PNG generation

Локально на macOS:

```sh
qlmanage -t -s 180 -o /tmp src/assets/favicon.svg
mv /tmp/favicon.svg.png src/assets/apple-touch-icon.png
qlmanage -t -s 512 -o /tmp src/assets/favicon.svg
sips -z 32 32 /tmp/favicon.svg.png --out src/assets/favicon-32.png
```

qlmanage рендерит SVG через CoreSVG, сохраняя alpha-канал. Это
macOS-only утилита — она нужна только при обновлении иконки, не при
build-е. Build (build-static.mjs) копирует PNG как есть.

## Verification

- `pnpm run ci` зелёный (html-validate должен принять новые `<link>`,
  format:check должен отформатировать index.html)
- После push: PR Guard, OSV Scan, AI Review зелёные
- Vercel preview: favicon виден во вкладке браузера
