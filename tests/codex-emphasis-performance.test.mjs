import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanStateBody } from "./fixtures/codex-state.mjs";
import { hasCleanCodexState } from "../scripts/codex-review-state.mjs";

test("closer-only Markdown presentation stays bounded without gaining authority", () => {
  const head = "2667f79cd7676ff331730cabf661d38dbbcddb0d";
  const body = cleanStateBody(head) + "\n" + "a_ ".repeat(21000);
  const started = performance.now();
  assert.equal(hasCleanCodexState(body, head), false);
  assert.ok(
    performance.now() - started < 5000,
    "63KB closer-only presentation must not repeatedly scan prior non-openers",
  );
});
