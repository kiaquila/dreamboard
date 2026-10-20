# Activate native Codex review

Use Codex for the repository's required AI review without Gemini or API-key
changes. Enable native automatic review for all PRs on opening; request reviews
as the authenticated owner for existing PRs and after subsequent pushes.

The live no-findings receipt on PR #57 uses `:+1:`. Another genuine receipt on
PR #56 uses "You're on a roll.". Accept those exact harmless suffixes after the
existing no-major-issues verdict. Unknown or contradictory text must still fail
closed. Preserve native author, current SHA, dismissal/deletion boundaries,
unresolved P0-P2 findings, trusted-main execution, and branch protection.

Confirm both sides of the contract against real GitHub output: a clean Codex
assessment can pass the gate, and a native P2 finding remains blocking.

The synchronized actions update in PR #57 later received the exact additional
suffix "Chef's kiss.". Accept this harmless native suffix with a conflicting
verdict regression. Keep unknown text fail-closed and obtain a new native
assessment when this actual gate code change advances the PR HEAD.
