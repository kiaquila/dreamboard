# Self-hosted production

## Goal

Move the canonical dreamboard production site from
`dreamboard-eta.vercel.app` to `dreamboard.ks-design.art`, served by the `cz`
host behind Cloudflare, and make reviewed `main` revisions deploy there
automatically.

## Requirements

- `dreamboard.ks-design.art` serves the static `dist/` artifact over HTTPS.
- Cloudflare proxies the public hostname to the `cz` origin.
- The origin exposes only ports 80 and 443 through the existing Cloudflare-only
  firewall policy; SSH remains reachable only through Tailscale.
- Production follows protected `main`. The deployer waits for successful `CI`
  and `OSV Scan` workflow runs triggered by a `main` push with the exact merge
  commit SHA before publishing it.
- Releases switch atomically and retain recent revisions for operational
  rollback.
- Vercel continues to create pull-request previews but does not deploy `main`.
- Cloudflare Workers remains the independent staging surface.
- Security headers remain equivalent across Nginx, Vercel previews, and the
  Cloudflare Worker wrapper.

## Non-goals

- Moving the Cloudflare Workers staging build to the `cz` server.
- Adding a persistent GitHub self-hosted runner to this public repository.
- Changing product UI or editor behavior.
