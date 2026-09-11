# Tasks 026: Горы hero как точки-данные

- [x] Исходник `design/hero-mountains/halftone-alpine-serenity-1672x941.png` вне сборки
- [x] `pngjs` в devDependencies
- [x] `scripts/extract-hero-dots.mjs` и `pnpm run dots:extract`: ink, квантование, MAE, детерминизм
- [x] `src/assets/images/landing/hero-dots.json`, удалить `hero-mountains-halftone.jpg`
- [x] `src/scripts/hero-mountains.js`: `decodeHeroDots`, `buildField`, fetch JSON, слой осевших точек
- [x] `tests/hero-mountains.test.mjs`: декодирование, трансформация, skyline и depth, тайминги
- [x] `deploy/cz/nginx.conf`: gzip для JSON
- [x] `docs_dreamboard/`: раздел "Hero dotted mountains", команда регенерации, gzip на origin
- [x] Локально: `pnpm run preflight`, визуально 1440x900, 390x844, 844x390, время кадра
- [x] Крупные точки мельче: `dotRadiusScale`, `LARGE_DOT_SCALE` = 0.75 (выбрано из 0.65 для всех, 0.8 и 0.75 для крупных)
- [ ] Push, PR, `@codex review`, все гейты зелёные, треды закрыты
