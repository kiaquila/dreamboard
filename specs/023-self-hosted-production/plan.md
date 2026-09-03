# Plan

1. Add repository-owned Nginx, systemd, and deployer configuration for `cz`.
2. Gate publication on the checks that run on `main`, build in a pinned
   network-isolated Node container, and switch the live release atomically.
3. Disable Vercel automatic deployment for `main` while preserving branch
   previews.
4. Update repository memory and tests for the new production contract.
5. Merge through the normal PR gates and install the reviewed HTTP bootstrap
   configuration on `cz`.
6. Temporarily allow public HTTP, create a DNS-only Cloudflare A record that
   points `dreamboard.ks-design.art` to `cz`, and wait for it to resolve.
7. Issue the HTTP-01 origin certificate, install the final HTTPS virtual host,
   restore the Cloudflare-only firewall policy, then enable the Cloudflare
   proxy. The zone already uses Full (strict) TLS.
8. Verify the public site, security headers, editor entry, and automatic
   deployment.
