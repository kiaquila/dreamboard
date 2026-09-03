# Delivery Playbook

This playbook covers preview validation before merge and production smoke after
merge.

## Preview Checklist

For any app-facing PR, verify the same commit on both the Vercel preview and the
versioned Cloudflare Workers preview:

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
- the Cloudflare Workers preview is failing or visibly broken for the changed
  flow

## Dependabot Configuration

Keep grouped Dependabot version updates scoped to each package ecosystem. The
`minor-and-patch` group combines only minor and patch version updates; major
updates remain individual pull requests. GitHub Actions does not support the
SemVer-specific cooldown keys, so its configuration uses only `default-days`.
The npm configuration may retain SemVer-specific cooldown periods.

## Production Smoke

After merge to `main`, verify the production URL documented in
`PRODUCTION_DOMAIN`.

Minimum smoke:

- landing page responds
- editor can be opened
- critical changed feature still behaves on desktop and mobile

If production smoke fails, stop the `dreamboard-deploy.timer`, repoint the
`/srv/dreamboard/current` symlink to the last healthy retained release, and
recover through a new PR. Restart the timer only after the fixed `main`
revision is ready to deploy.
