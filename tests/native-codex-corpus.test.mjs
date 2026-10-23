import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  classifyCodexSummaryComment,
  pickAuthoritativeCodexSkipModeComment,
} from "../scripts/ai-review-helpers.mjs";
import { cleanStateBody } from "./fixtures/codex-state.mjs";

const corpus = JSON.parse(
  readFileSync(new URL("./fixtures/native-codex-corpus.json", import.meta.url)),
);
const bot = "chatgpt-codex-connector[bot]";
for (const entry of corpus.cleanReplies) {
  test(`public native corpus: ${entry.closing || "no closing"}`, () => {
    const comment = {
      body: entry.body,
      user: { login: bot },
      html_url: entry.source,
    };
    assert.equal(
      classifyCodexSummaryComment(comment, entry.head).outcome,
      "pass",
      entry.source,
    );
    assert.equal(
      classifyCodexSummaryComment(comment, "f".repeat(40)).outcome,
      "pending",
    );
    assert.equal(
      classifyCodexSummaryComment(
        { ...comment, user: { login: "someone" } },
        entry.head,
      ).outcome,
      "pending",
    );
  });
}
const head = "1234567890abcdef1234567890abcdef12345678";
const activation = {
  event: "committed",
  sha: head,
  created_at: "2026-10-20T12:00:00Z",
};
const receipt = {
  id: 2,
  user: { login: bot },
  body: `<!-- codex-review-receipt:v1 -->\n\nCodex Review: Didn't find any major issues. Delightful!\n\n**Reviewed commit:** \`${head}\``,
  created_at: "2026-10-20T12:01:58Z",
  updated_at: "2026-10-20T12:01:58Z",
};
const lifecycle = {
  id: 1,
  user: { login: bot },
  body: cleanStateBody(head, (state) => {
    state.code_review.has_any_findings = null;
    state.code_review.has_unresolved_findings = null;
    return state;
  }),
  created_at: "2026-10-20T12:00:01Z",
  updated_at: "2026-10-20T12:02:00Z",
};
const pick = (comments, timeline = [activation]) =>
  pickAuthoritativeCodexSkipModeComment({
    headSha: head,
    timelineEvents: timeline,
    issueComments: comments,
  })?.classification.outcome;
test("completed null lifecycle pairs with an earlier independent receipt", () => {
  assert.equal(pick([receipt, lifecycle]), "pass");
  assert.equal(pick([lifecycle]), "pending");
  assert.equal(
    pick([
      receipt,
      {
        ...lifecycle,
        body: lifecycle.body.replace("Manual request", "PR opened"),
      },
    ]),
    "pass",
  );
});
for (const [name, transform] of [
  ["unknown prose", (s) => s + "\nThere are concerns."],
  ["unknown trigger", (s) => s.replace("Manual request", "Unknown trigger")],
  ["unknown version", (s) => s.replace("state:v1", "state:v2")],
  [
    "negative code",
    (s) => s.replace('"has_any_findings":null', '"has_any_findings":true'),
  ],
  [
    "mixed flags",
    (s) => s.replace('"has_any_findings":null', '"has_any_findings":false'),
  ],
  [
    "running code",
    (s) =>
      s
        .replace('"status":"completed"', '"status":"running"')
        .replace("✅ **Completed**", "🔄 **Running** since"),
  ],
  [
    "active security",
    (s) =>
      s.replace(
        '"security_review":{"commit_sha":null',
        `"security_review":{"commit_sha":"${head}"`,
      ),
  ],
])
  test(`a later ${name} still vetoes a receipt`, () =>
    assert.notEqual(
      pick([receipt, { ...lifecycle, body: transform(lifecycle.body) }]),
      "pass",
    ));
test("receipt binding and lifecycle ordering cannot be renewed by edits", () => {
  assert.notEqual(
    pick([{ ...receipt, updated_at: lifecycle.updated_at }, lifecycle]),
    "pass",
  );
  assert.notEqual(
    pick([receipt, { ...lifecycle, created_at: "2026-10-20T12:01:59Z" }]),
    "pass",
  );
  assert.notEqual(
    pick(
      [receipt, lifecycle],
      [
        activation,
        {
          event: "commented",
          id: 3,
          user: { login: "kiaquila" },
          body: "@codex review",
          created_at: "2026-10-20T12:01:59Z",
        },
      ],
    ),
    "pass",
  );
});
for (const pair of corpus.lifecyclePairs) {
  test(`real native lifecycle/receipt pair: ${pair.repo}`, () => {
    const timelineEvents = [
      {
        event: "committed",
        sha: pair.head,
        created_at: pair.lifecycle.created_at,
      },
    ];
    const decision = pickAuthoritativeCodexSkipModeComment({
      headSha: pair.head,
      timelineEvents,
      issueComments: [pair.receipt, pair.lifecycle],
    });
    assert.equal(decision.classification.outcome, "pass");
    assert.equal(decision.comment.id, pair.receipt.id);
    assert.equal(
      classifyCodexSummaryComment(pair.lifecycle, pair.head).outcome,
      "pending",
    );
  });
}
test("both observed triggers support explicit clean machine state", () => {
  for (const trigger of ["Manual request", "PR opened"]) {
    assert.equal(
      classifyCodexSummaryComment(
        {
          user: { login: bot },
          body: cleanStateBody(head).replace("Manual request", trigger),
        },
        head,
      ).outcome,
      "pass",
    );
  }
});
