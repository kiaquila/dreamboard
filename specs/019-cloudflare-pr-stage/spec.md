# Feature 019: Cloudflare PR stage

## Goal

Add a Cloudflare Workers staging path for `dreamboard`, following the existing
`ember` and `chaijana` pattern without changing Vercel's role as the production
host.

## Requirements

- Cloudflare Workers Builds connects directly to `kiaquila/dreamboard`.
- `main` updates one stable staging Worker named `dreamboard`.
- Every non-production branch, including pull requests, uploads an isolated
  Worker version with a versioned preview URL.
- The static artifact remains `dist/`, produced by `pnpm run build`.
- Cloudflare responses preserve the security headers currently declared for
  Vercel.
- No Cloudflare credential is committed to the repository or stored in GitHub.
- The repository documents the build commands, branch policy, verification,
  and rollback path.

## Acceptance criteria

1. `pnpm run ci` passes with the Cloudflare configuration included.
2. Wrangler validates the checked-in Worker configuration.
3. Cloudflare Workers Builds uses `main` as production branch, builds all
   non-production branches, and reports its result on pull requests.
4. A pull request receives a working versioned Cloudflare preview URL.
5. Vercel preview and production behavior remains unchanged.
