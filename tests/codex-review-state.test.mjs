import test from "node:test";
import assert from "node:assert/strict";
import { hasCleanCodexState } from "../scripts/codex-review-state.mjs";
import {
  pickAuthoritativeCodexSkipModeComment,
  classifyCodexSummaryComment,
} from "../scripts/ai-review-helpers.mjs";
import {
  cleanStateBody,
  presentationReceipt,
} from "./fixtures/codex-state.mjs";
const head = "a".repeat(40);
const clean = cleanStateBody(head);
const bot = (body, time, id = time) => ({
  event: "commented",
  id,
  body,
  user: { login: "chatgpt-codex-connector[bot]" },
  created_at: `2026-10-20T12:0${time}:00Z`,
});
const activation = {
  event: "committed",
  sha: head,
  created_at: "2026-10-20T12:00:00Z",
};
const trigger = {
  event: "commented",
  id: 99,
  body: `@codex review ${head}`,
  user: { login: "kiaquila", type: "User" },
  author_association: "OWNER",
  created_at: "2026-10-20T12:01:00Z",
};
const pick = (events) =>
  pickAuthoritativeCodexSkipModeComment({
    timelineEvents: [activation, trigger, ...events],
    issueComments: events,
    headSha: head,
  });
test("strict full-head native state supplies proof", () =>
  assert.equal(hasCleanCodexState(clean, head), true));
for (const [name, body] of [
  ["unknown key", cleanStateBody(head, (s) => ({ ...s, unknown: false }))],
  [
    "duplicate key",
    clean.replace(
      '"status":"completed"',
      '"status":"running","status":"completed"',
    ),
  ],
  [
    "wrong type",
    clean.replace('"has_any_findings":false', '"has_any_findings":"false"'),
  ],
  ["abbreviated head", clean.replace(head, head.slice(0, 10))],
  ["stale head", clean.replace(head, "b".repeat(40))],
  [
    "findings",
    clean.replace('"has_any_findings":false', '"has_any_findings":true'),
  ],
  [
    "unresolved",
    clean.replace(
      '"has_unresolved_findings":false',
      '"has_unresolved_findings":true',
    ),
  ],
  ["pending", clean.replace('"status":"completed"', '"status":"running"')],
  [
    "security active",
    cleanStateBody(head, (s) => ({
      ...s,
      security_review: { ...s.code_review, status: "running" },
    })),
  ],
  [
    "security stale",
    cleanStateBody(head, (s) => ({
      ...s,
      security_review: { ...s.code_review, commit_sha: "b".repeat(40) },
    })),
  ],
  [
    "security incomplete",
    cleanStateBody(head, (s) => ({
      ...s,
      security_review: { ...s.security_review, status: "completed" },
    })),
  ],
  ["visible pending", clean.replace("✅ **Completed**", "⏳ **Running**")],
  ["visible stale", clean.replace("`aaaaaaa`", "`bbbbbbb`")],
  ["visible contradiction", clean + "\nP1: Authentication leaks credentials."],
  ["unknown version", clean.replace("state:v1", "state:v2")],
  ["duplicate marker", clean + "\n<!-- codex-review-state:v1 {} -->"],
  ["heading only", "## Codex Review Summary\nCompleted 👍"],
])
  test(`rejects ${name}`, () =>
    assert.equal(hasCleanCodexState(body, head), false));
for (const closing of [
  "Swish!",
  "Chef's kiss.",
  "Another round soon, please!",
  "Already looking forward to next diff.",
  "The tiny confetti parade continues!",
]) {
  test(`closing derives authority only from fresh state: ${closing}`, () => {
    const receipt = bot(presentationReceipt(head, closing), 3);
    assert.equal(
      pick([bot(clean, 2), receipt]).classification.outcome,
      classifyCodexSummaryComment(receipt, head).outcome,
    );
    assert.equal(
      pick([
        receipt,
        bot(
          clean.replaceAll("2026-10-20T12:02:00Z", "2026-10-20T12:04:00Z"),
          4,
        ),
      ]).classification.outcome,
      "pass",
    );
  });
}
test("newer pending state withdraws proof", () => {
  assert.equal(
    pick([
      bot(clean, 2),
      bot(clean.replace('"status":"completed"', '"status":"running"'), 3),
      bot(presentationReceipt(head), 4),
    ]).classification.outcome,
    "pending",
  );
});
test("state created before request is not proof; edit after request can be", () => {
  const before = bot(clean, 0);
  assert.notEqual(pick([before])?.classification.outcome, "pass");
  assert.equal(
    pick([{ ...before, updated_at: "2026-10-20T12:02:00Z" }]).classification
      .outcome,
    "pass",
  );
});
test("wrong actor and absent activation cannot grant state authority", () => {
  assert.notEqual(
    pick([{ ...bot(clean, 2), user: { login: "attacker" } }])?.classification
      .outcome,
    "pass",
  );
  assert.notEqual(
    pickAuthoritativeCodexSkipModeComment({
      timelineEvents: [bot(clean, 2)],
      headSha: head,
    })?.classification.outcome,
    "pass",
  );
});

for (const mutation of [
  (text) => text.replace(head, "b".repeat(40)),
  (text) => text.replace("state:v1", "state:v2"),
  (text) => text.replace('"status":"completed"', '"status":"running"'),
  (text) => text.replace('"code_review":', '"code_review":BROKEN'),
])
  test("newer invalid snapshot vetoes clean state and receipt", () => {
    const bad = bot(mutation(clean), 3);
    assert.equal(
      pick([bot(clean, 2), bad, bot(presentationReceipt(head), 4)])
        .classification.outcome,
      "pending",
    );
    for (const entries of [
      [bad, bot(clean, 3, 32)],
      [bot(clean, 3, 32), bad],
    ])
      assert.equal(pick(entries).classification.outcome, "pending");
  });
test("opaque receipt alone never grants a verdict", () => {
  for (const closing of [
    "The tiny confetti parade continues!",
    "Authentication leaks credentials.",
    "The deployment deletes all customer data.",
  ])
    assert.equal(
      pick([bot(presentationReceipt(head, closing), 3)]).classification.outcome,
      "pending",
    );
});
test("explicit finding and malformed receipt remain vetoes", () => {
  for (const text of [
    presentationReceipt(head, "P1: Fix authentication."),
    presentationReceipt(head) + "\nAnother line.",
    presentationReceipt(head) + `\n**Reviewed commit:** \`${head}\``,
    presentationReceipt(head).replace("receipt:v1", "receipt:v2"),
  ])
    assert.equal(
      pick([bot(clean, 2), bot(text, 3)]).classification.outcome,
      "pending",
    );
});
test("security review can be clean only with matching visible row", () => {
  const active = cleanStateBody(head, (s) => ({
    ...s,
    security_review: { ...s.code_review },
  }));
  assert.equal(hasCleanCodexState(active, head), false);
  assert.equal(
    hasCleanCodexState(
      active +
        `\n| 🔒 **Security Review** | ✅ **Completed** <relative-time datetime="2026-10-20T12:02:00Z">2026-10-20T12:02:00Z</relative-time> | \`${head.slice(0, 7)}\` | Manual request |`,
      head,
    ),
    true,
  );
});

for (const closing of [
  "One issue remains.",
  "Review failed.",
  "Changes requested.",
  "Almost ready!",
  "No findings, but status pending.",
])
  test(`explicit contradictory receipt vetoes state: ${closing}`, () => {
    assert.equal(
      pick([bot(clean, 2), bot(presentationReceipt(head, closing), 3)])
        .classification.outcome,
      "pending",
    );
  });

test("security-only edit cannot refresh code completion from before request", () => {
  const oldCode = clean.replaceAll(
    "2026-10-20T12:02:00Z",
    "2026-10-20T12:00:00Z",
  );
  const edited = bot(oldCode, 0);
  edited.updated_at = "2026-10-20T12:04:00Z";
  assert.equal(pick([edited]).classification.outcome, "pending");
  const noTime = clean.replace(
    / <relative-time[^>]+>[^<]+<\/relative-time>/g,
    "",
  );
  assert.equal(hasCleanCodexState(noTime, head), false);
});

test("security edit cannot reorder old code completion after newer unknown receipt", () => {
  const snapshot = { ...bot(clean, 2), updated_at: "2026-10-20T12:05:00Z" };
  assert.equal(
    pick([snapshot, bot(presentationReceipt(head), 3)]).classification.outcome,
    "pending",
  );
});
test("future-dated code row cannot supply completion proof", () => {
  assert.equal(
    pick([
      bot(clean.replaceAll("2026-10-20T12:02:00Z", "2026-10-20T12:09:00Z"), 2),
    ]).classification.outcome,
    "pending",
  );
});

test("subsecond completion cannot order GitHub second-level boundaries", () => {
  const fractional = clean.replaceAll(
    "2026-10-20T12:02:00Z",
    "2026-10-20T12:02:00.070Z",
  );
  assert.equal(
    pick([bot(fractional, 2), bot(presentationReceipt(head), 2, 25)])
      .classification.outcome,
    "pending",
  );
  const requestSecond = clean.replaceAll(
    "2026-10-20T12:02:00Z",
    "2026-10-20T12:01:00.070Z",
  );
  assert.equal(pick([bot(requestSecond, 2)]).classification.outcome, "pending");
});
