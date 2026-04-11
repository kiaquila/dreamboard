# Delivery Playbook

This playbook covers preview validation before merge and production smoke after
merge.

## Preview Checklist

For any app-facing PR, verify on the Vercel preview:

- landing page loads without layout breakage
- editor opens and renders the Fabric canvas
- primary mobile viewport still works
- back navigation, export, and save flows behave as expected for the changed
  scope
- no obvious missing assets or broken links appear

## Merge Rule

Do not merge while any of these are true:

- required GitHub checks are pending or failing
- the active review backend has unresolved blocking findings
- the Vercel preview is failing or visibly broken for the changed flow

## Production Smoke

After merge to `main`, verify the production URL documented in
`VERCEL_PRODUCTION_DOMAIN`.

Minimum smoke:

- landing page responds
- editor can be opened
- critical changed feature still behaves on desktop and mobile

If production smoke fails, treat it as an active incident and recover through a
new PR rather than a direct Vercel dashboard edit.
