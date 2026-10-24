# Codex companion completion bounds

## Problem

A canonical finding summary can include an impossible completed companion time
after the server-observed edit. Dating the owning negative by its older row then
lets an intermediate clean completion erase a still-observed finding.

## Requirements

- Before granting historical clock or clearing authority, validate every
  completed section against the observed edit, including a foreign-head companion.
- Keep GitHub whole-second precision: completion within the observed server second is valid; the next second is not, even when the server timestamp itself has a fractional part.
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

## Lifecycle correlation

A receipt created after a canonical null/null lifecycle's own completion cannot
approve that lifecycle. Retain the unpaired lifecycle as pending before static
receipt ordering and formal approval selection. Preserve valid immutable
in-window receipt pairing and recovery through a strictly newer canonical own
clean completion. A same-second clear cannot establish a newer completion.

An unpaired lifecycle has no historical clock authority: canonical recovery
must complete strictly after its observed edit second. An intermediate clear
after the old lifecycle completion but before that edit cannot recover it.

Keep persisted unpaired lifecycle pending when timeline HTTP retrieval fails,
before a later formal approval is considered. Do not synthesize activation or
grant positive structured authority from this conservative fallback.

Native row clocks must use UTC ISO timestamps with real calendar dates. Prose dates and calendar rollover cannot grant approval, historical timing or clearing authority. Preserve native microsecond timestamps and valid carried companions.

Lifecycle retirement belongs to its own CODE channel: a newer canonical CODE clear can retire null CODE lifecycle while Security remains independently blocking. Only a separately newer Security clear retires its own finding. A Security-only edit carrying old CODE completion cannot retire null CODE lifecycle.
