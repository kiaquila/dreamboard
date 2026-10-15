import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import {
  routesCodexWakeup,
  wakeCodexGate,
} from "../scripts/ai-review-wakeup.mjs";

const head = "2667f79cd7676ff331730cabf661d38dbbcddb0d";
const receipt = `<!-- codex-review-receipt:v1 -->\n\nCodex Review: Didn't find any major issues. :rocket:\n\n**Reviewed commit:** \`${head.slice(0, 10)}\``;
const summary = `<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 {"code_review":{"commit_sha":"${head}","status":"completed","has_any_findings":false,"has_unresolved_findings":false}} -->`;
const nativeComment = (body) => ({
  user: { login: "chatgpt-codex-connector[bot]" },
  body,
  created_at: "2026-10-14T11:00:00Z",
  updated_at: "2026-10-15T12:01:00Z",
});
const event = (body, action = "created") => ({
  action,
  issue: { number: 1, pull_request: {} },
  comment: nativeComment(body),
});
const workflow = readFileSync(
  new URL("../.github/workflows/ai-review-wakeup.yml", import.meta.url),
  "utf8",
);
const condition = workflow.match(/    if: >\n([\s\S]*?)    runs-on:/)[1];
const workflowAccepts = (payload, eventName = "issue_comment") =>
  Function(
    "github",
    "vars",
    `return (${condition});`,
  )({ event_name: eventName, event: payload }, { AI_REVIEW_AGENT: "codex" });

for (const body of [
  receipt,
  receipt.replace(":v1", ":v2"),
  summary,
  "Codex Review: Didn't find any major issues.",
]) {
  for (const action of ["created", "edited"]) {
    test(`workflow and runtime route ${action} ${body.slice(0, 35)}`, () => {
      assert.ok(workflowAccepts(event(body, action)));
      assert.ok(routesCodexWakeup("issue_comment", event(body, action)));
    });
  }
}
test("workflow subscribes to edited events and uses trusted scripts", () => {
  assert.match(
    workflow,
    /issue_comment:\s+types: \[created, edited, deleted\]/,
  );
  assert.match(
    workflow,
    /ref: \$\{\{ github.event.repository.default_branch \}\}/,
  );
  assert.match(workflow, /node scripts\/ai-review-wakeup.mjs/);
});
test("spoofed author and non-PR comments are rejected by workflow and router", () => {
  for (const payload of [
    {
      ...event(receipt),
      comment: { ...nativeComment(receipt), user: { login: "attacker" } },
    },
    { ...event(receipt), issue: { number: 1 } },
  ]) {
    assert.equal(Boolean(workflowAccepts(payload)), false);
    assert.equal(routesCodexWakeup("issue_comment", payload), false);
  }
});

const harness = (overrides = {}) => {
  const state = {
    head,
    reads: 0,
    reruns: 0,
    cancels: 0,
    waits: [],
    run: {
      id: 5,
      head_sha: head,
      event: "pull_request",
      pull_requests: [{ number: 1 }],
      status: "completed",
      conclusion: "failure",
      run_attempt: 1,
      run_started_at: "2026-10-15T12:00:00Z",
    },
    comments: [nativeComment(receipt)],
    inline: [],
    reviews: [],
    ...overrides,
  };
  const api = async (path, options = {}) => {
    if (path === "/pulls/1")
      return {
        state: "open",
        head: { sha: (state.reads++ && state.nextHead) || state.head },
      };
    if (path.startsWith("/actions/workflows/"))
      return { workflow_runs: [state.run] };
    if (path === "/actions/runs/5/cancel" && options.method === "POST") {
      state.cancels++;
      if (!state.cancelStuck)
        state.run = {
          ...state.run,
          status: "completed",
          conclusion: "cancelled",
        };
      if (state.cancelRace) throw new Error("Run already completed");
      return null;
    }
    if (path === "/actions/runs/5/rerun" && options.method === "POST") {
      state.reruns++;
      state.run = { ...state.run, status: "queued", run_attempt: 2 };
      return null;
    }
    if (path === "/actions/runs/5") return state.run;
    if (path.includes("/issues/1/comments")) return state.comments;
    if (path.includes("/pulls/1/reviews")) return state.reviews;
    if (path.includes("/pulls/1/comments")) return state.inline;
    if (path === "/graphql")
      return {
        data: {
          nodes: state.reviews.map((review) => ({
            id: review.node_id,
            updatedAt: state.reviewUpdatedAt || "2026-10-15T12:01:00Z",
          })),
        },
      };
    throw new Error(`Unexpected API route ${path}`);
  };
  return {
    state,
    wake: (payload = event(receipt), eventName = "issue_comment") =>
      wakeCodexGate({
        eventName,
        event: payload,
        api,
        wait: async (ms) => {
          state.waits.push(ms);
        },
      }),
  };
};

test("completed gate is rerun once for new evidence", async () => {
  const { state, wake } = harness();
  assert.equal(await wake(), "rerun:5");
  assert.equal(await wake(), "active-or-missing");
  state.run = {
    ...state.run,
    status: "completed",
    run_started_at: "2026-10-15T12:02:00Z",
  };
  assert.equal(await wake(), "already-evaluated");
  assert.equal(state.reruns, 1);
});

test("active gate keeps polling and completion event recovers the finish/reply race", async () => {
  const { state, wake } = harness();
  state.run.status = "in_progress";
  assert.equal(await wake(), "active-or-missing");
  state.run.status = "completed";
  assert.equal(
    await wake(
      {
        action: "completed",
        workflow_run: { ...state.run, name: "AI Review" },
      },
      "workflow_run",
    ),
    "rerun:5",
  );
});

test("an edited old summary wakes a completed gate but cannot attest success", async () => {
  const { state, wake } = harness({ comments: [nativeComment(summary)] });
  assert.equal(await wake(event(summary, "edited")), "rerun:5");
  assert.equal(state.reruns, 1);
});

for (const body of ["", "Review withdrawn."]) {
  test(`withdrawing receipt evidence into ${JSON.stringify(body)} requeues once`, async () => {
    const payload = event(body, "edited");
    const { state, wake } = harness({ comments: [nativeComment(body)] });
    assert.ok(workflowAccepts(payload));
    assert.ok(routesCodexWakeup("issue_comment", payload));
    assert.equal(routesCodexWakeup("issue_comment", event(body)), false);
    assert.equal(await wake(payload), "rerun:5");
    state.run = {
      ...state.run,
      status: "completed",
      run_started_at: "2026-10-15T12:02:00Z",
    };
    assert.equal(
      await wake(
        {
          action: "completed",
          workflow_run: { ...state.run, name: "AI Review" },
        },
        "workflow_run",
      ),
      "already-evaluated",
    );
    assert.equal(state.reruns, 1);
  });
}

test("receipt withdrawal cancels an active gate before it can publish stale success", async () => {
  const { state, wake } = harness({ comments: [nativeComment("")] });
  state.run.status = "in_progress";
  assert.equal(await wake(event("", "edited")), "rerun:5");
  assert.equal(state.cancels, 1);
  state.run = {
    ...state.run,
    status: "completed",
    run_started_at: "2026-10-15T12:02:00Z",
  };
  assert.equal(
    await wake(
      {
        action: "completed",
        workflow_run: { ...state.run, name: "AI Review" },
      },
      "workflow_run",
    ),
    "already-evaluated",
  );
  assert.equal(state.reruns, 1);
});

test("untrusted edits cannot wake the gate even when evidence is withdrawn", async () => {
  const payload = event("", "edited");
  payload.comment.user.login = "attacker";
  const { state, wake } = harness({ comments: [payload.comment] });
  assert.equal(Boolean(workflowAccepts(payload)), false);
  assert.equal(await wake(payload), "ignored");
  assert.equal(state.reruns, 0);
});

for (const body of [
  "",
  receipt.replace("Didn't find any major issues.", "Found major issues."),
]) {
  test(`same-second withdrawal ${JSON.stringify(body.slice(0, 35))} invalidates a completed gate`, async () => {
    const { state, wake } = harness();
    const payload = event(body, "edited");
    payload.comment.updated_at = state.run.run_started_at;
    assert.equal(await wake(payload), "rerun:5");
    assert.equal(state.reruns, 1);
  });
}

test("positive receipt edits keep active polling", async () => {
  const { state, wake } = harness();
  state.run.status = "in_progress";
  assert.equal(await wake(event(receipt, "edited")), "active-or-missing");
  assert.equal(state.cancels, 0);
});

for (const body of [
  "Create a Codex account and connect to GitHub.",
  receipt.replace(head.slice(0, 10), "bad-sha"),
  receipt.replace(":v1", ":v2"),
]) {
  for (const status of ["completed", "in_progress"]) {
    test(`new nonpassing comment ${body.slice(0, 25)} invalidates a ${status} gate at the same second`, async () => {
      const { state, wake } = harness();
      state.run.status = status;
      const payload = event(body);
      payload.comment.created_at = state.run.run_started_at;
      payload.comment.updated_at = state.run.run_started_at;
      assert.ok(routesCodexWakeup("issue_comment", payload));
      assert.equal(await wake(payload), "rerun:5");
      assert.equal(state.cancels, status === "in_progress" ? 1 : 0);
      assert.ok(state.waits.includes(1100));
    });
  }
}

test("equal-second completion evidence reruns once after a later-second boundary", async () => {
  const { state, wake } = harness();
  state.comments[0].updated_at = state.run.run_started_at;
  const completed = () => ({
    action: "completed",
    workflow_run: { ...state.run, name: "AI Review" },
  });
  assert.equal(await wake(completed(), "workflow_run"), "rerun:5");
  assert.deepEqual(state.waits, [1100]);
  state.run = {
    ...state.run,
    status: "completed",
    run_started_at: "2026-10-15T12:00:01Z",
  };
  assert.equal(await wake(completed(), "workflow_run"), "already-evaluated");
  assert.equal(state.reruns, 1);
});

test("replacing a receipt with a summary still withdraws its evidence", async () => {
  const { state, wake } = harness();
  state.run.status = "in_progress";
  const payload = event(summary, "edited");
  payload.changes = { body: { from: receipt } };
  assert.equal(await wake(payload), "rerun:5");
  assert.equal(state.cancels, 1);
});

test("new formal reviews cancel an active gate before publishing their outcome", async () => {
  const { state, wake } = harness();
  state.run.status = "in_progress";
  assert.equal(
    await wake(
      {
        action: "submitted",
        pull_request: { number: 1 },
        review: {
          commit_id: head,
          user: { login: "chatgpt-codex-connector[bot]" },
        },
      },
      "pull_request_review",
    ),
    "rerun:5",
  );
  assert.equal(state.cancels, 1);
});

for (const action of ["created", "edited", "deleted"]) {
  for (const status of ["completed", "in_progress"]) {
    test(`native inline comment ${action} invalidates a ${status} current-head gate, including older findings`, async () => {
      const { state, wake } = harness();
      state.run.status = status;
      const payload = {
        action,
        pull_request: { number: 1 },
        comment: {
          ...nativeComment("P1: Blocking finding"),
          commit_id: "a".repeat(40),
        },
      };
      payload.comment.updated_at = state.run.run_started_at;
      assert.match(
        workflow,
        /pull_request_review_comment:\s+types: \[created, edited, deleted\]/,
      );
      assert.ok(workflowAccepts(payload, "pull_request_review_comment"));
      assert.ok(routesCodexWakeup("pull_request_review_comment", payload));
      assert.equal(
        await wake(payload, "pull_request_review_comment"),
        "rerun:5",
      );
      assert.equal(state.cancels, status === "in_progress" ? 1 : 0);
      assert.equal(state.reruns, 1);
    });
  }
}

test("untrusted inline mutations cannot cancel or rerun the gate", async () => {
  const { state, wake } = harness();
  const payload = {
    action: "edited",
    pull_request: { number: 1 },
    comment: { user: { login: "attacker" }, body: "P1" },
  };
  assert.equal(
    Boolean(workflowAccepts(payload, "pull_request_review_comment")),
    false,
  );
  assert.equal(await wake(payload, "pull_request_review_comment"), "ignored");
  assert.equal(state.reruns, 0);
  assert.equal(state.cancels, 0);
});

test("completion notices a persisted inline edit and cannot loop after reevaluation", async () => {
  const { state, wake } = harness({
    comments: [],
    inline: [nativeComment("P1: Changed from P3")],
  });
  const completed = () => ({
    action: "completed",
    workflow_run: { ...state.run, name: "AI Review" },
  });
  assert.equal(await wake(completed(), "workflow_run"), "rerun:5");
  state.run = {
    ...state.run,
    status: "completed",
    run_started_at: "2026-10-15T12:02:00Z",
  };
  assert.equal(await wake(completed(), "workflow_run"), "already-evaluated");
  assert.equal(state.reruns, 1);
});

test("receipt deletion invalidates a completed gate without a persisted timestamp", async () => {
  const { state, wake } = harness({ comments: [] });
  const payload = event(receipt, "deleted");
  payload.comment.updated_at = "2026-10-14T12:00:00Z";
  assert.ok(workflowAccepts(payload));
  assert.equal(await wake(payload), "rerun:5");
  assert.equal(state.cancels, 0);
  assert.equal(state.reruns, 1);
});

test("deletion cancels an active gate before rerun and cannot loop at completion", async () => {
  const { state, wake } = harness({ comments: [] });
  state.run.status = "in_progress";
  assert.equal(await wake(event(receipt, "deleted")), "rerun:5");
  assert.equal(state.cancels, 1);
  assert.equal(state.reruns, 1);
  state.run = {
    ...state.run,
    status: "completed",
    run_started_at: "2026-10-15T12:02:00Z",
  };
  assert.equal(
    await wake(
      {
        action: "completed",
        workflow_run: { ...state.run, name: "AI Review" },
      },
      "workflow_run",
    ),
    "already-evaluated",
  );
  assert.equal(state.reruns, 1);
});

test("deletion still reruns if the active gate completes as cancellation starts", async () => {
  const { state, wake } = harness({ comments: [], cancelRace: true });
  state.run.status = "in_progress";
  assert.equal(await wake(event(receipt, "deleted")), "rerun:5");
  assert.equal(state.cancels, 1);
  assert.equal(state.reruns, 1);
});

test("deletion rechecks HEAD before cancelling or rerunning", async () => {
  const { state, wake } = harness({ nextHead: "a".repeat(40) });
  state.run.status = "in_progress";
  assert.equal(await wake(event(receipt, "deleted")), "changed");
  assert.equal(state.cancels, 0);
  assert.equal(state.reruns, 0);
});

test("untrusted deletion cannot cancel a gate", async () => {
  const payload = event(receipt, "deleted");
  payload.comment.user.login = "attacker";
  const { state, wake } = harness();
  assert.equal(Boolean(workflowAccepts(payload)), false);
  assert.equal(await wake(payload), "ignored");
  assert.equal(state.cancels, 0);
  assert.equal(state.reruns, 0);
});

test("deletion does not rerun an attempt whose cancellation is still pending", async () => {
  const { state, wake } = harness({ comments: [], cancelStuck: true });
  state.run.status = "in_progress";
  await assert.rejects(
    wake(event(receipt, "deleted")),
    /cancellation is still pending/,
  );
  assert.equal(state.cancels, 1);
  assert.equal(state.reruns, 0);
});

test("changed HEAD is rechecked before rerun", async () => {
  const { state, wake } = harness({ nextHead: "a".repeat(40) });
  assert.equal(await wake(), "changed");
  assert.equal(state.reruns, 0);
});

test("stale workflow completion cannot rerun a different HEAD", async () => {
  const { state, wake } = harness();
  assert.equal(
    await wake(
      {
        action: "completed",
        workflow_run: {
          ...state.run,
          name: "AI Review",
          head_sha: "a".repeat(40),
        },
      },
      "workflow_run",
    ),
    "stale-run",
  );
  assert.equal(state.reruns, 0);
});

test("initial rollout keeps the old trusted gate authoritative until main contains the router", () => {
  const directory = mkdtempSync(`${tmpdir()}/dreamboard-bootstrap-`);
  try {
    const run = workflow
      .split("        run: |\n")[1]
      .split("\n")
      .map((line) => line.slice(10))
      .join("\n");
    const result = spawnSync("bash", ["-e", "-c", run], {
      cwd: directory,
      encoding: "utf8",
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /existing required gate remains authoritative/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

for (const action of ["edited", "dismissed"]) {
  test(`persisted review update wakes the gate for ${action} without a new submitted_at`, async () => {
    const review = {
      id: 7,
      node_id: "review-node",
      commit_id: head,
      user: { login: "chatgpt-codex-connector[bot]" },
      submitted_at: "2026-10-14T12:00:00Z",
    };
    const { state, wake } = harness({ comments: [], reviews: [review] });
    const payload = { action, pull_request: { number: 1 }, review };
    assert.ok(workflowAccepts(payload, "pull_request_review"));
    assert.equal(await wake(payload, "pull_request_review"), "rerun:5");
    state.run = {
      ...state.run,
      status: "completed",
      run_started_at: "2026-10-15T12:02:00Z",
    };
    assert.equal(
      await wake(
        {
          action: "completed",
          workflow_run: { ...state.run, name: "AI Review" },
        },
        "workflow_run",
      ),
      "already-evaluated",
    );
    assert.equal(state.reruns, 1);
  });
}

test("dismissal cancels an active gate before it can publish stale success", async () => {
  const review = {
    id: 7,
    node_id: "review-node",
    commit_id: head,
    user: { login: "chatgpt-codex-connector[bot]" },
    submitted_at: "2026-10-14T12:00:00Z",
  };
  const { state, wake } = harness({ comments: [], reviews: [review] });
  state.run.status = "in_progress";
  assert.equal(
    await wake(
      { action: "dismissed", pull_request: { number: 1 }, review },
      "pull_request_review",
    ),
    "rerun:5",
  );
  assert.equal(state.cancels, 1);
  state.run = {
    ...state.run,
    status: "completed",
    run_started_at: "2026-10-15T12:02:00Z",
  };
  assert.equal(
    await wake(
      {
        action: "completed",
        workflow_run: { ...state.run, name: "AI Review" },
      },
      "workflow_run",
    ),
    "already-evaluated",
  );
});
