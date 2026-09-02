# Plan

1. Add Wrangler and repository-owned stage commands.
2. Configure Workers Static Assets for `dist/` with preview URLs enabled.
3. Add a small Worker entry point that applies the existing security headers.
4. Add regression coverage for the stage contract.
5. Document Cloudflare as a staging layer alongside Vercel production.
6. Publish a pull request, connect the repository in Cloudflare, and verify the
   versioned preview.

## Cloudflare build settings

- Repository: `kiaquila/dreamboard`
- Production branch: `main`
- Root directory: `/`
- Build command: `pnpm run build`
- Deploy command: `pnpm run stage:deploy`
- Version command: `pnpm run stage:preview`
- Non-production branch builds: enabled
- Build watch paths: default (`*`)
