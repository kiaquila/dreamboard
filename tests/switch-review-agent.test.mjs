import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const head = "a".repeat(40);
const runSwitch = (overrides = {}, args = []) => {
  const directory = mkdtempSync(`${tmpdir()}/dreamboard-review-switch-`);
  try {
    writeFileSync(
      `${directory}/fixture.json`,
      JSON.stringify({
        head,
        run: {
          databaseId: 7,
          headSha: head,
          status: "in_progress",
          conclusion: "",
          attempt: 1,
        },
        ...overrides,
      }),
    );
    writeFileSync(`${directory}/calls.jsonl`, "");
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        fileURLToPath(
          new URL("./fixtures/review-switch-gh.mjs", import.meta.url),
        ),
        fileURLToPath(
          new URL("../scripts/switch-review-agent.mjs", import.meta.url),
        ),
        "--to",
        "codex",
        "--pr",
        "1",
        "--repo",
        "owner/repo",
        ...args,
      ],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          REVIEW_SWITCH_FIXTURE: `${directory}/fixture.json`,
          REVIEW_SWITCH_CALLS: `${directory}/calls.jsonl`,
        },
      },
    );
    const calls = readFileSync(`${directory}/calls.jsonl`, "utf8")
      .trim()
      .split("\n")
      .filter(Boolean)
      .map(JSON.parse);
    return {
      ...result,
      calls,
      cancels: calls.filter(
        (call) => call[0] === "run" && call[1] === "cancel",
      ),
      reruns: calls.filter((call) => call[0] === "run" && call[1] === "rerun"),
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

for (const status of ["queued", "in_progress"]) {
  test(`reviewer switch cancels and requeues a ${status} previous backend`, () => {
    const result = runSwitch({
      run: { databaseId: 7, headSha: head, status, conclusion: "", attempt: 1 },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.cancels.length, 1);
    assert.equal(result.reruns.length, 1);
    assert.ok(
      result.calls
        .find((call) => call[0] === "pr" && call[1] === "comment")
        .includes(`@codex review ${head}`),
    );
    assert.ok(
      result.calls.indexOf(result.cancels[0]) <
        result.calls.indexOf(result.reruns[0]),
    );
    assert.ok(!result.reruns[0].includes("--failed"));
  });
}

for (const reason of ["cancelStuck", "headChanged", "attemptChanged"]) {
  test(`reviewer switch refuses requeue when ${reason}`, () => {
    const result = runSwitch({ [reason]: true });
    assert.notEqual(result.status, 0, result.stdout);
    assert.equal(result.cancels.length, 1);
    assert.equal(result.reruns.length, 0);
  });
}

test("reviewer switch tolerates completion racing cancellation", () => {
  const result = runSwitch({ cancelRace: true });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.reruns.length, 1);
});

for (const conclusion of ["success", "failure"]) {
  test(`reviewer switch rechecks the selected policy after prior ${conclusion}`, () => {
    const result = runSwitch({
      run: {
        databaseId: 7,
        headSha: head,
        status: "completed",
        conclusion,
        attempt: 1,
      },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.cancels.length, 0);
    assert.equal(result.reruns.length, 1);
    assert.equal(
      result.reruns[0].includes("--failed"),
      conclusion === "failure",
    );
  });
}

test("explicit no-rerun leaves the active attempt alone", () => {
  const result = runSwitch({}, ["--no-rerun"]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.cancels.length, 0);
  assert.equal(result.reruns.length, 0);
});
