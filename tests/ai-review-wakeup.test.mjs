import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  assert.match(workflow, /issue_comment:\s+types: \[created, edited\]/);
  assert.match(
    workflow,
    /ref: \$\{\{ github.event.repository.default_branch \}\}/,
  );
  assert.match(workflow, /run: node scripts\/ai-review-wakeup.mjs/);
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
    if (path === "/actions/runs/5/rerun" && options.method === "POST") {
      state.reruns++;
      state.run = { ...state.run, status: "queued", run_attempt: 2 };
      return null;
    }
    if (path === "/actions/runs/5") return state.run;
    if (path.includes("/issues/1/comments")) return state.comments;
    if (path.includes("/pulls/1/reviews")) return [];
    throw new Error(`Unexpected API route ${path}`);
  };
  return {
    state,
    wake: (payload = event(receipt), eventName = "issue_comment") =>
      wakeCodexGate({ eventName, event: payload, api }),
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
