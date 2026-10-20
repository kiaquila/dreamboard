# Native receipt suffix compatibility

PR #57 has a genuine clean native Codex receipt bound to its current HEAD,
but protected main rejects its literal "Chef's kiss." suffix. An earlier
native receipt also used "Swish!". Add only these two observed literals to
the existing positive-result allowlist in a separate CI compatibility PR.

Evidence:

- [Current Chef's kiss. receipt](https://github.com/kiaquila/dreamboard/pull/57#issuecomment-6294585352)
- [Observed Swish! receipt](https://github.com/kiaquila/dreamboard/pull/57#issuecomment-6294362761)

Keep bot identity, current-HEAD binding, exact marker/footer handling, negative
verdict rejection, trailing-prose rejection, invalidation, and unresolved
finding checks intact. Summaries and reactions remain wakeup-only signals.
Do not include the actions updates or other feature changes from PR #57.
No backend, permission, workflow checkout, or protection changes are in scope.

The bootstrap PR must pass the existing trusted-main gate with a genuine
native verdict. An unsupported clean receipt on this PR is an external blocker:
stop without further suffix additions, review rerolls, or a protection bypass.
