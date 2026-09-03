# Plan

1. Add repository-owned Nginx, systemd, and deployer configuration for `cz`.
2. Gate publication on the checks that run on `main`, build in a pinned
   network-isolated Node container, and switch the live release atomically.
3. Disable Vercel automatic deployment for `main` while preserving branch
   previews.
4. Update repository memory and tests for the new production contract.
5. Merge through the normal PR gates, install the reviewed configuration on
   `cz`, issue the origin certificate, add the proxied Cloudflare DNS record,
   and verify the public site and the next automatic deployment.
