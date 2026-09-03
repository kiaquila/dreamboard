# Production and Vercel Preview CD

## Deploy model

The canonical production site is
[`dreamboard.ks-design.art`](https://dreamboard.ks-design.art). Cloudflare
proxies the hostname to the `cz` origin, where Nginx serves the current static
release.

- Pull requests create Vercel preview deployments.
- Cloudflare Workers Builds creates a second pull-request stage and keeps its
  stable Worker as a non-production stage.
- `vercel.json` sets `git.deploymentEnabled.main` to `false`, so merges no
  longer produce Vercel production deployments.
- A systemd timer on `cz` checks protected `main` every minute and publishes a
  new release only after the merge commit's `baseline-checks` and `osv-scan`
  jobs succeed.

The deployer runs `scripts/build-static.mjs` inside a pinned Node container
with networking disabled, validates `dist/index.html` and `dist/src`, then
atomically moves `/srv/dreamboard/current` to the new release. Ten releases are
retained.

## Why the host pulls

The repository is public and the production server is reachable over SSH only
through Tailscale. A permanent repository self-hosted runner would expose the
server to workflows from a public repository, while a GitHub-hosted runner
cannot reach the Tailscale-only SSH service without another long-lived access
credential. The production host therefore pulls the public protected branch
instead.

Branch protection is the trust boundary for PR-only checks. It requires
`baseline-checks`, `guard`, `osv-scan`, and `AI Review` before a revision can
enter `main`. The deployer additionally waits for the two checks that run again
on the resulting `main` commit: `baseline-checks` and `osv-scan`.

## Repository-owned server configuration

Files under [`deploy/cz/`](../../../deploy/cz/) define the production runtime:

- `deploy.sh`: fetch, check, isolated build, atomic switch, live smoke, and
  release retention
- `dreamboard-deploy.service`: hardened one-shot systemd unit
- `dreamboard-deploy.timer`: one-minute poll schedule
- `nginx-http.conf`: ACME bootstrap virtual host
- `nginx.conf`: final HTTPS static virtual host and security headers

The installed paths on `cz` are:

| Purpose            | Path                                                       |
| ------------------ | ---------------------------------------------------------- |
| Repository mirror  | `/srv/dreamboard/repository.git`                           |
| Retained releases  | `/srv/dreamboard/releases/<commit-sha>`                    |
| Live static root   | `/srv/dreamboard/current`                                  |
| Deployer           | `/usr/local/sbin/dreamboard-deploy`                        |
| Nginx virtual host | `/etc/nginx/sites-available/dreamboard.ks-design.art.conf` |
| Systemd units      | `/etc/systemd/system/dreamboard-deploy.{service,timer}`    |

Operational server changes must be copied from a reviewed `main` revision.
Product files are never edited on the host.

## TLS and edge

Cloudflare owns public DNS and proxies `dreamboard.ks-design.art` to the public
IPv4 address of `cz`. The origin uses a Let's Encrypt certificate obtained via
the existing `/var/www/certbot` webroot. The server firewall accepts public web
traffic only from Cloudflare address ranges after certificate bootstrap; SSH
remains Tailscale-only.

The Nginx security headers match `vercel.json` and `worker/index.js`. Update all
three in one pull request when the policy changes.

## Rollback

For an incident:

1. Stop `dreamboard-deploy.timer` so it cannot immediately reapply the newest
   revision.
2. Repoint `/srv/dreamboard/current` to the last healthy retained release.
3. Run the HTTPS smoke check.
4. Fix the source through a new pull request.
5. Restart the timer after the repaired `main` revision is ready.

Preview validation and post-merge smoke are documented in
[`delivery-playbook.md`](./delivery-playbook.md).

## Vercel preview project

The connected Vercel project remains `dreamboard` in the `ks_aquila's projects`
team. Its build contract stays `pnpm run build` with `dist` as the output
directory. Vercel auto-detects pnpm from `pnpm-lock.yaml` and the pinned
`packageManager` version.
