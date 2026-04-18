# Tasks 008: Dreamboard favicon

- [ ] `src/assets/favicon.svg`: создать SVG с тремя radial gradients
- [ ] Сгенерить `src/assets/apple-touch-icon.png` (180×180) через `qlmanage -s 180`
- [ ] Сгенерить `src/assets/favicon-32.png` (32×32) через `qlmanage -s 512` +
      `sips -z 32 32`
- [ ] `index.html`: добавить три `<link rel>` в `<head>` (SVG + 32px PNG +
      apple-touch-icon 180×180)
- [ ] Локально: `pnpm run ci` зелёный
- [ ] Push + PR + `@codex review` comment
