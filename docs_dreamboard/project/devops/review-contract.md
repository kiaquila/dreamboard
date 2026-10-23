# Review Contract

## Backend Trigger Constraints

All three supported review backends require a **human-authored** trigger
on `pull_request: synchronize` events. Bot-posted trigger comments from
GitHub Actions (`github-actions[bot]`) are rejected silently or with an
explicit error by every backend:

- **Codex** — the connector replies "trigger did not come from a
  connected human Codex account" and the `AI Review` gate fails fast.
- **Gemini** — `gemini-code-assist[bot]` silently ignores bot-posted
  `/gemini review` comments; the gate times out after 20 minutes.
- **Claude** — `claude-review.yml` gates on `author_association in
(OWNER, MEMBER, COLLABORATOR)` and drops anything authored by a bot.

Codex Cloud's on-open auto-review (on `opened` and `ready_for_review`)
and Gemini Code Assist's on-open auto-review cover the initial review
for free, but every new push on an already-open PR needs a manual
trigger. The canonical recovery path is
`pnpm run review:switch -- --to <agent>`, which flips the repository
variable, posts the correct native trigger comment as the current `gh`
user (human-authored, therefore trusted), and reruns the latest
PR-linked `AI Review` run for that HEAD. If the previous backend is still active,
the helper cancels it, waits up to 60 seconds for completion, and requeues it
under the newly selected policy. Selection checks the Actions API pull-request
association, not only the SHA, and reads every result page. It rechecks HEAD and attempt identity before
rerunning; cancellation timeouts or identity changes stop the operation.

See `docs_dreamboard/project/devops/ai-runner.md` for the full matrix.

## Codex Review

- Default review backend for `dreamboard`
- Native GitHub PR review surface from `chatgpt-codex-connector[bot]`
- Inline findings must carry `P0` to `P3`
- `P3`-only findings are advisory
- `P0` to `P2` findings block merge

The active operating path uses Codex without Gemini or new API keys. In Codex
repository settings, enable **Automatic review**, select **All PRs**, and use
**On PR open**. Do not inherit disabled personal preferences. Existing PRs and
later pushes need an authenticated owner command:
`pnpm run review:switch -- --to codex --pr <number>`. This posts the native
request and reevaluates the PR-linked gate; it does not dispatch a replacement
check or treat a bot-authored trigger as a human request.

## Gemini Review

- Fallback review backend, used when `AI_REVIEW_AGENT=gemini`
- Native GitHub PR review surface from `gemini-code-assist[bot]`
- Inline findings are expected to carry `Critical`, `High`, `Medium`, or `Low`
- `Low`-only findings are advisory
- `Critical`, `High`, and `Medium` findings block merge

## Claude Review

- Third-tier review backend, used only when `AI_REVIEW_AGENT=claude`
- Final result is a top-level comment, not a formal GitHub review state
- The comment must start with:

```text
AI_REVIEW_AGENT: claude
AI_REVIEW_SHA: <head sha>
AI_REVIEW_OUTCOME: pass|advisory|block
```

- `pass` and `advisory` are non-blocking
- `block` is merge-blocking

## Repository Focus

For `dreamboard`, reviewers should prioritize:

- mobile layout regressions
- canvas/editor correctness
- export behavior
- draft persistence and state safety
- English-only copy regressions
- build/deploy safety
- maintainability risks in the static app

## Native Codex receipts and wakeups

The trusted gate accepts legacy `Codex Review:` replies and the native
`<!-- codex-review-receipt:v1 -->` envelope from
`chatgpt-codex-connector[bot]`. Receipts require an explicit no-major-issues
result and a reviewed commit of 10-40 hex characters matching the current full
HEAD; abbreviated commits must also resolve through GitHub to that full SHA.
Known encouragement suffixes include "Nice work!", "Keep it up!", "Keep them
coming!", "Bravo." (observed in the [2026-10-20 native receipt](https://github.com/kiaquila/dreamboard/pull/56#issuecomment-6291144147)),
and "Hooray!" (observed in a [later native receipt](https://github.com/kiaquila/dreamboard/pull/56#issuecomment-6292041940)).
The exact follow-up question "What shall we delve into next?" is also observed
in a [completed native receipt](https://github.com/kiaquila/dreamboard/pull/56#issuecomment-6292550550).
Ordinary native tasks can append one exact trailing `[View task →]` link to
`https://chatgpt.com/s/cd_<32 lowercase hex characters>`. Only that service link
may be stripped; duplicate links, foreign domains, extra prose, and findings
before or after the link remain unsupported. A task reply needs a genuine
independent assessment and the same author, SHA, freshness, and thread checks.
Arbitrary extra verdict text remains unsupported, including text appended after
an otherwise recognized encouragement.
Only the exact known native help templates are stripped, allowing whitespace
and the documented optional question-help paragraph. Unknown footer content,
including nested markup or a contradictory finding hidden in details, fails closed.
Unbound legacy replies require current-head timeline activation and
request ordering. SHA-bound receipts remain usable during timeline outages;
only legacy binding and equal-second dismissal ordering require the timeline.
Duplicate markers, conflicting content, malformed commits,
and unfinished replies cannot pass.
Receipt-like responses with unknown versions still wake and invalidate the
gate. Their envelope is never accepted as positive proof, and a newer unknown
receipt cannot leave older positive evidence authoritative, even without
timeline access or a parseable binding.
Supported receipts for another commit also supersede older positive receipts;
binding controls eligibility to pass, not eligibility to invalidate old proof.
Equal-second new comments use proven timeline creation order. When edits make
that order unprovable, nonpassing
evidence takes precedence until a later valid receipt arrives.
Persisted setup failures and withdrawn connector replies also invalidate older
proof during timeline outages. Both issue comments and formal reviews are read
before success. Formal reviews use persisted update times, including edits that
remove their recognized body. A newer nonpassing comment supersedes an older
formal pass; an ambiguous timestamp tie cannot prefer success. A later valid
formal review or receipt can recover, while blocking formal findings remain
blocking and unresolved threads are still checked.

The connector's `codex-pull-request-review-summary` / `codex-review-state:v1`
comments require the strict native-state contract below; labels and reactions
alone remain insufficient.
They never replace a receipt or formal review. Updated issue comments are read
independently of timeline position. All unresolved Codex threads are checked
before success; P0-P2 and untagged findings still block, including older commits.
P3 remains advisory. The gate rejects stale event HEADs and rechecks live HEAD
before success.

`AI Review Wakeup` runs trusted default-branch scripts for native comment
creation/edits, formal review updates, native inline comment creation/edits/deletions,
and completion of a PR-linked gate. Every webhook runs independently, without
a shared Actions concurrency group: even `cancel-in-progress: false` replaces
the previous pending run, potentially dropping the only copy of a deletion.
HEAD and run-attempt checks guard overlapping router mutations. A changed
attempt is left for its fresh evidence evaluation; cancelled attempts cannot
permit merge. This avoids relying on a bounded concurrency queue to preserve
transient invalidations. Inline mutations invalidate completed or
active results even for older commits, since unresolved older findings still
block. Completion scans persist inline update times to close the finish/edit race.
Thread resolution state is checked on every gate evaluation; after changing
only that state, rerun the PR-linked gate or request a fresh native review.
GitHub Actions does not document a direct review-thread status trigger.
Comment deletion, nonpassing receipt/setup replies, receipt withdrawals, and formal review updates explicitly
invalidate the old result. Deleted comments cannot be recovered from API scans.
Before rerunning, the trusted router writes a negative `codex-review-invalidation:v1`
issue comment as `github-actions[bot]`, binding the current HEAD and deleted
object ID. The gate rereads these records before success and requires a newly
created native assessment strictly after GitHub's record timestamp; editing an
older positive cannot restore it. A timestamp tie fails closed. These records
never provide positive authority. Malformed trusted records block evaluation,
and editing/deleting a record produces a replacement negative boundary.
New record creation cannot recursively trigger the router. The wakeup's issue
write permission is used for these negative records; gate code still runs from
trusted main. A withdrawal timestamp may also tie the gate's start. The trusted webhook
therefore forces one reevaluation per delivery. The router rechecks HEAD and
the run attempt, cancels an active gate, waits for cancellation, then requeues
it once. This prevents invalidations from racing the gate's final read and exit.
Before requeue, a relative delay of just over one second places the next attempt
after the webhook's timestamp second. Completion events do not replay these invalidations.
Cancellation waiting is bounded; if it remains pending, the wakeup fails and
the cancelled check cannot permit merge. A later native receipt can recover.
Every trusted connector comment edit is eligible, even when its new body no
longer contains a recognized marker. Persisted comment update times also keep
withdrawn receipts visible to the completion wakeup; only the gate parser can
decide whether the current body still provides valid evidence.
For new positive receipts and summary-only updates, active gates keep polling.
A completed gate can be rerun once for evidence
newer than its attempt's start, covering the finish/reply race; the next attempt
starts after that evidence and cannot loop.
Equal-second evidence is conservatively reevaluated after the same relative
delay, so the following attempt starts later than the evidence and cannot loop.
Independent wakeups recheck HEAD and run attempt before rerunning.
Their workflow-run lookup follows every result page before selecting the latest
run associated with the target PR and exact HEAD. Runs for another PR on the
same commit cannot hide the target run or be cancelled in its place.
Persisted GraphQL review `updatedAt`
handles edits and dismissals whose REST `submitted_at` never changes, including
the active-gate completion race. Receipts older than a dismissal cannot restore
its positive result; equal-second timestamps use the timeline dismissal/comment
order to distinguish fresh replacements from stale receipts. Summary presence and reactions do not
produce success.

For an older comment edited within the exact dismissal second, its creation
position does not establish edit order. GitHub's persisted edit timestamps do
not provide an ordering proof for this tie. The gate fails explicitly with a
fresh native review request instead of guessing or waiting for a timeout.
A later receipt supersedes that ambiguity and wakes the gate normally. This
recovery preserves the dismissal boundary; an edited receipt with a strictly
later update time remains valid without timeline ordering.

The positive suffix allowlist includes the exact native `:+1:` shortcode
([PR #57 receipt](https://github.com/kiaquila/dreamboard/pull/57#issuecomment-6293144095))
and "You're on a roll."
([PR #56 receipt](https://github.com/kiaquila/dreamboard/pull/56#issuecomment-6292798502)).
It also includes the literal "Chef's kiss."
([PR #57 receipt](https://github.com/kiaquila/dreamboard/pull/57#issuecomment-6294585352))
and "Swish!"
([PR #57 receipt](https://github.com/kiaquila/dreamboard/pull/57#issuecomment-6294362761)).
This does not permit arbitrary numeric shortcodes, encouragements, or text
after a known suffix. Contradictory verdicts still fail closed.

When introducing changes to the gate itself, the PR still executes the old
trusted-main scripts. Obtain real native Codex review for the exact HEAD. If
its clean-result format is unsupported by main, a separate native Codex task
may independently audit the full diff between the exact base and HEAD git
objects and return a genuine legacy-format assessment with the full HEAD SHA.
The task must inspect the source itself and report all material findings;
copying or translating an earlier verdict is not an assessment. Verify live
HEAD, required checks, and unresolved threads externally if the task lacks
GitHub API access. This keeps Codex selected without Gemini or key changes.
Validate the new trusted-main parser after merge. Do not switch checkout to PR
code, fabricate a status, or bypass protection.

## Strict native structured state

Modern connector replies can vary their friendly closing without changing the
review verdict. The gate therefore accepts the connector's official mutable
summary as independent proof, rather than interpreting arbitrary closing prose.
Standalone legacy replies and receipts retain their strict verdict rules.

A trusted `chatgpt-codex-connector[bot]` summary must contain exactly one supported
summary marker and one compact `codex-review-state:v1` JSON object. The closed
schema requires exactly `code_review` and `security_review`, each with exactly
`commit_sha`, `has_any_findings`, `has_unresolved_findings` and `status`. Code
review must bind the full current 40-character SHA, have status `completed`, and
both flags must be boolean `false`. Security must either have all four fields
`null`, or independently satisfy the same current-head clean condition. Duplicate
keys, unknown keys/versions, wrong types, partial security state and stale SHAs
remain pending. The matching native visible review table is required; extra or
contradictory visible text, stale commits and unknown help content fail closed.

The visible code-row completion datetime is required and must follow both the
current head activation and latest request boundary. Security-only summary edits
cannot refresh an older code verdict. The snapshot's `updated_at` must also follow
the same boundary; an older creation can qualify only through a fresh edit.
Clean snapshot ordering uses its actual code completion time, conservatively
bucketed to GitHub seconds. Completion in a request, activation, receipt or
formal-withdrawal second cannot prove a later review. A security-only
edit cannot reorder that code verdict after a later unknown receipt. Completion
must not exceed the comment update clock (allowing GitHub second truncation).
Invalid snapshots use their mutable update time as conservative veto signals.
The latest summary supersedes older clean state even when malformed, negative,
for another head or still running. A non-passing snapshot wins timestamp ties.
No timeline means no structured-state approval.

Unknown receipt closings remain pending evidence under the existing strict
receipt parser. A later strict completed-clean snapshot may supersede that
receipt; an unknown receipt arriving after a clean snapshot makes the result
pending again. On equal timestamps, non-passing evidence wins. Request a fresh
native review when the connector publishes ambiguous evidence last. This keeps
future neutral phrases independent of a positive suffix allowlist without
interpreting arbitrary prose or weakening contradictory-finding invalidation.
Malformed envelopes, extra lines, duplicate metadata, unsupported footers and
explicit negative/provisional findings retain their normal invalidating role.
Native P0–P2 findings, unresolved threads, formal retractions, abbreviated receipt
SHA resolution and final-head checks keep their existing blocking rules.

Static clean receipts use immutable creation time for approval ordering and current-request/head freshness. Editing a receipt cannot renew approval; unknown, pending and negative edits retain update time to invalidate older proof. Strict structured approvals continue to use code-row completion time.

A fresh unedited static receipt at the same timestamp second as a request or head activation may use observed timeline order after that boundary. Edited or unordered equal-second receipts remain pending.

Strict valid same-head structured finding flags persist per section across repeated review requests. A strictly newer canonical completed false/false result clears the affected section; the resolved-code recovery below is the only additional path. Security null and later code-only/formal/static approvals cannot clear security findings; equal-second evidence stays blocked. Malformed and untrusted historical snapshots cannot create a permanent latch.

Completed negative state uses the affected section’s canonical completion clock only when the entire summary is canonical. A recognized companion-section edit preserves that clock; unknown presentation, running state or invalid completion clocks retain server observation time.

The history guard covers strict snapshots present in the current REST issue-comment/timeline response. GitHub exposes only the current body of a mutable comment; this contract does not retain unseen prior revisions. Lifecycle fixtures use distinct persisted comment IDs. Native inline findings and unresolved review-thread guards remain authoritative. Durable webhook revision capture is outside this change.

Historical negative latching and clearing match the affected section’s exact head and canonical row independently of the other section’s head. This partial historical evidence never grants whole-PR approval or suppresses current pending signals.

Native summaries can retain `has_any_findings=true` after all code threads are
resolved, even when a new current-head review reports no issues
([PR #63](https://github.com/kiaquila/dreamboard/pull/63#issuecomment-6304811853)).
This is not clean structured proof. Recovery requires a strict completed code
snapshot explicitly reporting `has_unresolved_findings=false`, followed in a
strictly later timestamp second by a separately created, SHA-bound native clean
assessment eligible under the current request and head boundaries. An edit to
an old receipt cannot qualify. That assessment must follow the latest observed
negative code snapshot, not just its embedded completion clock. It clears code
history only; security findings still require a newer canonical clean security
completion. Unknown, malformed, stale or running snapshots, formal findings,
unresolved threads, invalidation records and final-head checks keep their vetoes.

## Canonical presentation and conservative history

Only the complete canonical native summary can supply completion authority:
unique live protocol markers, closed typed JSON, the exact native heading and
introductory text, one canonical visible row per active section, matching raw
SHA and completion fields, and the known native help footer. Source table lines
permit at most three leading ASCII spaces; code indentation or other whitespace
cannot be trimmed into canonical evidence. Heading, intro and contiguous table
retain their block boundaries: blank lines or removed-comment lines inside the
table, missing paragraph boundaries, and non-ASCII whitespace-only lines cannot
supply canonical authority. Extra blank lines between native blocks are supported.
This follows [GFM table boundaries](https://github.github.com/gfm/#tables-extension-). The supported
review-trigger label is `Manual request`; unknown labels fail closed and need a
new supported native assessment. Nonprotocol HTML comments may be removed only
while preserving line breaks and source indentation. Multiline JSON remains
supported for historical evidence with duplicate-key and scalar checks intact.
An offset/line-preserving comment mask distinguishes actual table pipes from
invisible separator pipes: comments between machine markers cannot hide negative
flags, while comments in raw table fields cannot assemble canonical clocks or SHAs.

A strict leading native envelope with explicit current-head negative flags can
retain those negative facts even when later presentation is unknown. Later prose
before a heading, a missing or code/quote-framed heading, or a protocol example
cannot erase that live leading record. Whole-comment code/quote framing and
code-indented leading records remain ineligible. It cannot
supply any completion clock, clean evidence or resolved-code recovery. Its
server observation time orders the negative, regardless of whether appended
English, Markdown, HTML, code or punctuation appears active, harmless or resolved.
No natural-language classifier is allowed to move that observation backwards.

This deliberately requires fresh canonical evidence after an ambiguous edit,
including apparently benign prose. Whitespace and known native presentation
remain supported; arbitrary text is never interpreted as approval or clearing.
A genuinely newer canonical false/false section completion clears that section.
Resolved code recovery still requires a complete canonical resolved-code snapshot
and a separate strictly later, current-request SHA-bound native clean assessment.
Security null, unbound receipts and resolved threads alone cannot clear findings.

Completion authority must not precede its comment creation bucket or exceed its
observed update time beyond GitHub's timestamp-second truncation. Same-second
clearing remains ambiguous. All native inline, formal, thread, invalidation,
current-head and unchanged protected-main guards continue to apply.

Metadata liveness is validated in the original HTML context after masking hidden comments. Same-line separators and padded comment prefixes cannot discard negative flags; actual first-element code indentation remains ineligible. This history-only normalization never grants whole-PR approval.
