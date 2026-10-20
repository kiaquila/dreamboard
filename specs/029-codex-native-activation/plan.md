# Implementation plan

1. Verify current GitHub policy, protection, and local main against origin/main.
2. Set repository-native Codex review to all PRs on opening, independent of
   disabled personal preferences. Request native reviews for existing PRs.
3. Add only the two observed suffixes to the positive receipt allowlist. Cover
   their real envelopes, contradictory text, and unknown numeric shortcodes.
4. Document the active Codex-only recovery path and run the full preflight.
5. Obtain native review of this exact branch HEAD. The trusted-main gate must
   pass independently; never run PR gate code with privileged credentials.
6. Verify all required checks and unresolved findings, observe a stable
   two-minute window, merge normally, and verify the trusted-main gate against
   the previously rejected PR #57 receipt. Keep PR #58's real P2 blocking.
