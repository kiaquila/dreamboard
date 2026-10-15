# Tasks

- [x] Reproduce the receipt prefix regression on current origin/main.
- [x] Implement receipt parsing, edited-comment retrieval, and HEAD guards.
- [x] Preserve unresolved finding and severity enforcement.
- [x] Add trusted native-event wakeup and bounded requeue.
- [x] Add actual gate, workflow-filter, and runtime-router regression coverage.
- [x] Complete local preflight with locked dependencies (104 tests).
- [x] Address native P1 on dismissed-review wakeups using persisted update times.
- [x] Address native P2 on equal receipt/dismissal timestamps using timeline ordering.
- [x] Address native P2 on timeline outages: bound receipts do not require timeline data.
- [x] Address native P1 on edits withdrawing recognized comment evidence.
- [x] Make ambiguous same-second old edits fail explicitly and recover with fresh evidence.
- [x] Invalidate deleted receipt evidence, including deletion during active completion.
- [x] Cancel active gates on receipt withdrawals and formal review changes before reevaluation.
- [x] Invalidate new nonpassing replies and requeue equal-second evidence without looping.
- [ ] Obtain native reviews for the final HEAD.
- [ ] Verify required gates, resolved threads, and the stable 120-second window.
- [ ] Merge and confirm trusted-main deployment of the new gate.
