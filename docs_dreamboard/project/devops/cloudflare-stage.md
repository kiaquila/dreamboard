# Cloudflare PR Stage

## Role

Cloudflare Workers is the repository's staging layer. Vercel remains the
canonical production host and continues to create its own pull-request
previews. The Cloudflare integration adds a second, isolated URL for validating
each pull request against Workers Static Assets before merge.

The Worker is named `dreamboard`. Its stable `workers.dev` URL is a stage, not
the public production URL.

## Repository-owned contract

[`wrangler.json`](../../../wrangler.json) declares the Worker name, the `dist/`
asset directory, SPA fallback, and version preview support. The static build is
shared with Vercel: `pnpm run build` produces `dist/index.html` and the `src/`
asset tree.

[`worker/index.js`](../../../worker/index.js) runs before static assets and
applies the same security-header values as [`vercel.json`](../../../vercel.json).
Keep the two configurations aligned when a response header changes.

| Git event               | Command after `pnpm run build` | Result                                                 |
| ----------------------- | ------------------------------ | ------------------------------------------------------ |
| Push or merge to `main` | `pnpm run stage:deploy`        | Updates the stable staging Worker                      |
| Push to another branch  | `pnpm run stage:preview`       | Uploads an isolated version and adds its URL to the PR |

`workers_dev: true` keeps the stable stage reachable. `preview_urls: true`
enables versioned URLs shaped like
`https://<version>-dreamboard.<account-subdomain>.workers.dev`; Cloudflare owns
the version prefix and it must not be hard-coded.

Cloudflare owns the GitHub connection and its build API token. No Cloudflare
credential belongs in this repository or in GitHub Actions.

## Workers Builds settings

| Setting                            | Value                    |
| ---------------------------------- | ------------------------ |
| Worker name                        | `dreamboard`             |
| Repository                         | `kiaquila/dreamboard`    |
| Production branch                  | `main`                   |
| Root directory                     | `/`                      |
| Build command                      | `pnpm run build`         |
| Production deploy command          | `pnpm run stage:deploy`  |
| Non-production deploy command      | `pnpm run stage:preview` |
| Builds for non-production branches | enabled                  |
| Included build watch path          | default (`*`)            |

The Cloudflare GitHub App must have access to the private repository. Keep one
Git connection for this Worker; two repositories must never deploy it.

## Verification

For a pull request, confirm that the `Workers Builds: dreamboard` check is green
for the current head commit and open its versioned URL. Verify:

- landing and editor routes render from the SPA fallback
- `index.html` and files below `/src/` load without mixed-host failures
- the Content-Security-Policy and the five remaining security headers match
  `vercel.json`
- the browser console has no unexpected errors
- the preview URL is versioned and does not replace the stable stage

After a `main` deployment, repeat the smoke check against the stable
`dreamboard` Worker URL. This does not replace the Vercel production smoke.

## Rollback

For a bad staging deployment, use Cloudflare's deployment history to restore
the previous Worker version. For a configuration fix, change this repository
through a new pull request and let Git integration deploy it; do not patch the
Worker source in the dashboard.
