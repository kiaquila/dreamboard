import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Regression tests for scripts/ai-review-gate.mjs classification regexes.
 *
 * The structural skip-mode redesign now lives in
 * tests/ai-review-helpers.test.mjs. This file remains focused on the
 * user-visible Codex / connector phrases so accidental regex changes
 * still get caught by CI.
 */
const summaryPrefixPattern = /^Codex Review:/i;
const summaryNoIssuesPattern =
  /did(?:\s+not|\s*n['’]?t)\s+find\s+any\s+major\s+issues/i;
const setupEnvironmentPattern = /create an environment for this repo/i;
const setupAccountPattern = /create a codex account and connect to github/i;
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const gateScriptPath = path.join(repoRoot, "scripts/ai-review-gate.mjs");

describe("Codex summary prefix matches real outputs", () => {
  test("matches 'Codex Review: ... Nice work!'", () => {
    assert.ok(
      summaryPrefixPattern.test(
        "Codex Review: Didn't find any major issues. Nice work!",
      ),
    );
  });

  test("matches 'Codex Review: ... :tada:'", () => {
    assert.ok(
      summaryPrefixPattern.test(
        "Codex Review: Didn't find any major issues. :tada:",
      ),
    );
  });

  test("rejects unrelated connector messages", () => {
    assert.ok(
      !summaryPrefixPattern.test(
        "To use Codex here, create an environment for this repo.",
      ),
    );
  });
});

describe("Codex 'no major issues' phrase matches real outputs", () => {
  test("matches with curly apostrophe 'Didn’t'", () => {
    assert.ok(
      summaryNoIssuesPattern.test("Didn’t find any major issues. Nice work!"),
    );
  });

  test("matches with straight apostrophe Didn't", () => {
    assert.ok(
      summaryNoIssuesPattern.test("Didn't find any major issues. :tada:"),
    );
  });

  test("matches 'did not find any major issues'", () => {
    assert.ok(summaryNoIssuesPattern.test("did not find any major issues"));
  });

  test("rejects unrelated phrasing", () => {
    assert.ok(
      !summaryNoIssuesPattern.test("Found several issues worth reviewing."),
    );
  });
});

describe("Codex setup-reply classifications", () => {
  test("matches 'create an environment for this repo'", () => {
    assert.ok(
      setupEnvironmentPattern.test(
        "To use Codex here, create an environment for this repo.",
      ),
    );
  });

  test("matches 'create a codex account and connect to github'", () => {
    assert.ok(
      setupAccountPattern.test(
        "Please create a Codex account and connect to GitHub to continue.",
      ),
    );
  });
});

describe("ai-review-gate script integrity", () => {
  test("parses as valid ESM", () => {
    const result = spawnSync(process.execPath, ["--check", gateScriptPath], {
      encoding: "utf8",
    });

    assert.equal(
      result.status,
      0,
      result.stderr || result.stdout || "Expected node --check to succeed",
    );
  });
});

// Structural skip-mode regressions moved to `tests/ai-review-helpers.test.mjs`
// in spec 010, where the Codex freshness logic is now exercised through
// behavioural fixtures instead of source-string anchors.
