# Plan 012: editor reload state

## Slice 1: Static Editor Route

- Add a lightweight hash route for the editor view.
- Push the editor hash when entering the editor from landing CTAs.
- Clear the hash when using editor back/home controls.

## Slice 2: Reload and History Restore

- On initial load, open the editor automatically when the hash route is present.
- Mark the initial editor route before CSS loads so the landing view cannot
  paint first.
- Lock canvas-mutating editor controls until draft restore has completed.
- Listen for hash changes so browser back/forward stays in sync with the view.
- Keep draft bootstrap sequencing intact while showing the editor shell
  immediately.

## Slice 3: Documentation and Validation

- Update frontend docs with the route-backed editor reload contract.
- Run repository checks.
- Smoke-check editor refresh with a local draft.
