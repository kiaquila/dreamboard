# Tasks

- [x] Define the self-hosted production and preview/staging boundary.
- [x] Add the atomic `cz` deployer and systemd schedule.
- [x] Add bootstrap and final Nginx virtual-host configurations.
- [x] Disable Vercel deployment for `main` only.
- [x] Add deployment contract tests.
- [x] Update durable repository documentation.
- [x] Merge with green required checks.
- [x] Install the reviewed configuration on `cz`.
- [x] Create the Cloudflare DNS record and origin certificate.
- [x] Verify HTTPS, security headers, editor entry, and automatic deployment.

## Cutover record

- PR #40 merged as `a5578bbcba50a857a6d830b7d41f4ecf8ecc8a09` after all required
  checks passed.
- Cloudflare proxies `dreamboard.ks-design.art` to `178.105.95.17` with the
  zone in Full (strict) mode.
- The Let's Encrypt origin certificate expires on December 2, 2026 and uses
  the server's existing automatic renewal schedule.
- Public HTTPS, the security-header baseline, static assets, editor entry, the
  origin smoke, and the enabled systemd deployment timer were verified on
  September 3, 2026.
