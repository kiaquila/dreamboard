# Codex companion completion bounds

## Problem

A canonical finding summary can include an impossible completed companion time
after the server-observed edit. Dating the owning negative by its older row then
lets an intermediate clean completion erase a still-observed finding.

## Requirements

- Before granting historical clock or clearing authority, validate every
  completed section against the observed edit, including a foreign-head companion.
- Keep GitHub whole-second precision: observed + 999 ms is valid; + 1000 ms is not.
- Preserve carried companion rows that predate comment creation. The owning
  section retains its own existing creation lower bound.
- Invalid companion timing leaves typed findings at observation time. A genuinely
  newer canonical own-section clean completion can recover; null flags cannot
  erase another section's explicit finding or independently grant approval.
- Keep trusted actors, head/request binding, native receipt pairing, unresolved
  threads, and protected-main review requirements.

## Validation dependencies

Refresh the existing fast-uri and miniflare undici overrides to patched
3.1.9 and 7.30.1 releases. The advisory database updated during verification;
these minimal pins keep the required OSV check meaningful for this repair.

Use version-specific release-age exceptions for these two patched versions.
The reviewed advisories are
[fast-uri scheme injection](https://github.com/advisories/GHSA-333x-w4r6-6crp)
and [undici EventSource memory exhaustion](https://github.com/advisories/GHSA-4qv8-2p9j-2685).
All unrelated seven-day dependency policy remains in force.
