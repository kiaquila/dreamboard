# Plan 010: default English cookie locale

## Slice 1: Static English Fallback

- Change `index.html` visible fallback copy and `html lang` to English.
- Ensure language buttons show `EN` before JavaScript runs.

## Slice 2: Cookie Locale Boot

- Add a small same-origin boot script that reads a valid locale cookie before
  body rendering.
- Hide the body only when a non-English cookie is present, then reveal it after
  the module applies localized strings.

## Slice 3: Runtime Locale Source

- Initialize `currentLang` from the boot script/cookie or English fallback.
- Write the locale cookie only after explicit language toggles.
- Ignore legacy `snapshot.lang` values while still restoring draft canvas data.

## Slice 4: Documentation and Validation

- Update frontend docs with the locale contract.
- Run repository checks.
- Smoke-check no-cookie English-first and cookie-backed Russian render locally.
