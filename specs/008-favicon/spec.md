# Spec 008: Dreamboard favicon

## Problem

Dreamboard не имеет favicon, иконки для вкладки и для Apple touch (iOS
home screen). Сейчас браузер показывает дефолтную "битую" иконку,
а iOS при добавлении на домашний экран генерирует скриншот страницы.

## Goal

Добавить фирменную иконку в стиле сферы с градиентом зелёный-циан-синий
(привет от эстетики `--pantone-yellow` и фирменных цветов брендинга),
прозрачный фон, с адаптацией под Apple touch.

## Scope

- `src/assets/favicon.svg` — основной scalable icon (сфера-планета:
  три radial gradients — body cyan→blue, upper-left warm green/yellow rim,
  lower-right dark terminator — + fractalNoise turbulence для диагональных
  cloud-streaks, прозрачный фон)
- `src/assets/apple-touch-icon.png` — 180×180 PNG для iOS home screen
  (прозрачный фон; iOS 7+ не добавляет свой background)
- `src/assets/favicon-32.png` — 32×32 PNG fallback для старых браузеров
- `index.html` — `<link rel="icon">` для SVG + 32px PNG fallback +
  `<link rel="apple-touch-icon">`

PNG файлы пре-рендерятся локально из SVG через `qlmanage -t -s <size>`
(macOS built-in) — коммитятся в репо как артефакты.

## Out of scope

- favicon.ico (устаревший формат; modern browsers берут SVG, legacy
  get 32px PNG)
- Android web app manifest / maskable icons (не подключен PWA manifest)
- Theme color / `<meta name="theme-color">` (отдельный decision)

## Verification

- `pnpm run ci` зелёный
- Vercel preview: favicon виден во вкладке, apple-touch-icon срабатывает
  при "Add to Home Screen" на iOS
