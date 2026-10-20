import test from "node:test";
import assert from "node:assert/strict";
import { hasCodexNegativeHistory } from "../scripts/codex-review-state.mjs";
import { cleanStateBody } from "./fixtures/codex-state.mjs";
const head = "a".repeat(40);
const body = (negative, time) =>
  cleanStateBody(head, (state) => ({
    ...state,
    code_review: {
      ...state.code_review,
      has_any_findings: negative,
      has_unresolved_findings: negative,
    },
  })).replaceAll("2026-10-20T12:02:00Z", time);
const entry = (negative, time, update = time) => ({
  body: body(negative, time),
  created_at: time,
  updated_at: update,
  user: { login: "trusted" },
});
const check = (entries) =>
  hasCodexNegativeHistory(
    entries,
    head,
    (item) => item.user.login === "trusted",
  );
test("code finding survives newer code-independent presentation", () =>
  assert.equal(
    check([
      entry(true, "2026-10-20T12:02:00Z"),
      {
        body: "Codex approved",
        created_at: "2026-10-20T12:04:00Z",
        user: { login: "trusted" },
      },
    ]),
    true,
  ));
test("strict newer code completion clears code finding", () =>
  assert.equal(
    check([
      entry(true, "2026-10-20T12:02:00Z"),
      entry(false, "2026-10-20T12:04:00Z"),
    ]),
    false,
  ));
test("same-second code completion cannot clear code finding", () =>
  assert.equal(
    check([
      entry(true, "2026-10-20T12:02:00Z"),
      entry(false, "2026-10-20T12:02:00.500Z", "2026-10-20T12:04:00Z"),
    ]),
    true,
  ));
test("security edit of old code completion cannot clear newer code finding", () =>
  assert.equal(
    check([
      entry(true, "2026-10-20T12:03:00Z"),
      entry(false, "2026-10-20T12:02:00Z", "2026-10-20T12:05:00Z"),
    ]),
    true,
  ));
test("duplicate fields cannot create permanent history latch", () => {
  const bad = entry(true, "2026-10-20T12:02:00Z");
  bad.body = bad.body.replace(
    '"code_review":',
    '"code_review":{},"code_review":',
  );
  assert.equal(check([bad]), false);
});
