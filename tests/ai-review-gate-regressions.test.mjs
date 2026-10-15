import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { classifyCodexSummaryComment } from "../scripts/ai-review-helpers.mjs";

const head = "2667f79cd7676ff331730cabf661d38dbbcddb0d";
const bot = "chatgpt-codex-connector[bot]";
const positive = "Codex Review: Didn't find any major issues. :rocket:";
const receipt = `<!-- codex-review-receipt:v1 -->\n\n${positive}\n\n**Reviewed commit:** \`${head.slice(0, 10)}\``;
const summary = `<!-- codex-pull-request-review-summary -->\n<!-- codex-review-state:v1 {"code_review":{"commit_sha":"${head}","has_any_findings":false,"has_unresolved_findings":false,"status":"completed"},"security_review":{"commit_sha":null,"has_any_findings":null,"has_unresolved_findings":null,"status":null}} -->\n\n## Codex Review Summary`;
const comment = (body, extra = {}) => ({
  id: 1,
  body,
  user: { login: bot },
  html_url: "https://example.com/receipt",
  created_at: "2026-10-15T12:01:00Z",
  ...extra,
});
const activation = { event: "committed", sha: head };

const runGate = (overrides = {}) => {
  const directory = mkdtempSync(`${tmpdir()}/dreamboard-review-`);
  try {
    const fixture = {
      head,
      comments: [comment(receipt)],
      timeline: [activation],
      reviewUpdatedAt: overrides.reviews?.some(
        (review) => review.state === "DISMISSED",
      )
        ? "2026-10-15T12:02:00Z"
        : undefined,
      ...overrides,
    };
    writeFileSync(`${directory}/fixture.json`, JSON.stringify(fixture));
    writeFileSync(
      `${directory}/event.json`,
      JSON.stringify({
        pull_request: { number: 1, head: { sha: overrides.eventHead || head } },
      }),
    );
    return spawnSync(
      process.execPath,
      [
        "--import",
        fileURLToPath(new URL("./fixtures/review-api.mjs", import.meta.url)),
        fileURLToPath(
          new URL("../scripts/ai-review-gate.mjs", import.meta.url),
        ),
      ],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          GITHUB_TOKEN: "test",
          GITHUB_REPOSITORY: "owner/repo",
          GITHUB_EVENT_PATH: `${directory}/event.json`,
          REVIEW_FIXTURE: `${directory}/fixture.json`,
          AI_REVIEW_AGENT: "codex",
          AI_REVIEW_TRIGGER_MODE: "skip",
          AI_REVIEW_WAIT_MS: "70",
          AI_REVIEW_POLL_MS: "1",
          GITHUB_OUTPUT: `${directory}/output`,
          GITHUB_STEP_SUMMARY: `${directory}/summary`,
        },
      },
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

for (const [name, body] of [
  ["real receipt", receipt],
  ["legacy", positive],
  [
    "observed keep-them-coming receipt with info footer",
    `${receipt.replace(":rocket:", "Keep them coming!")}\n\n<details> <summary>ℹ️ About Codex in GitHub</summary>\n<br/>Native review help.\n</details>`,
  ],
  [
    "observed keep-it-up receipt with info footer",
    `${receipt.replace(":rocket:", "Keep it up!")}\n\n<details> <summary>ℹ️ About Codex in GitHub</summary>\n<br/>Native review help.\n</details>`,
  ],
  ["curly legacy", positive.replace("Didn't", "Didn’t")],
  [
    "receipt with help",
    `${receipt}\n\n<details>\n<summary>About Codex in GitHub</summary>\nNative review help.\n</details>`,
  ],
]) {
  test(`actual gate accepts ${name}`, () => {
    const result = runGate({
      comments: [comment(body)],
      timeline: [activation, { ...comment(body), event: "commented" }],
    });
    assert.equal(result.status, 0, result.stderr);
  });
}

for (const [name, body, extra] of [
  ["wrong SHA", receipt.replace(head.slice(0, 10), "aaaaaaaaaa")],
  ["missing SHA", receipt.split("\n\n**Reviewed")[0]],
  ["short SHA", receipt.replace(head.slice(0, 10), head.slice(0, 7))],
  ["duplicate marker", `<!-- codex-review-receipt:v1 -->\n${receipt}`],
  ["malformed marker", receipt.replace(":v1", ":v2")],
  ["conflicting content", `${receipt}\nP1: Fix a bug.`],
  ["duplicate SHA", `${receipt}\n**Reviewed commit:** \`${head}\``],
  [
    "negative",
    receipt.replace("Didn't find any major issues.", "Found major issues."),
  ],
  ["unfinished", receipt.replace(positive, "Codex Review: Still reviewing.")],
  ["spoofed author", receipt, { user: { login: "attacker" } }],
  ["structured summary alone", summary],
  [
    "malformed structured summary",
    summary.replace('"completed"', '"in_progress"'),
  ],
  ["thumbs-up", "👍 Completed"],
]) {
  test(`actual gate rejects ${name}`, () => {
    const result = runGate({ comments: [comment(body, extra)] });
    assert.notEqual(result.status, 0, result.stdout);
    assert.equal(
      classifyCodexSummaryComment(comment(body, extra), head).outcome,
      "pending",
    );
  });
}

test("edited old receipt is read from issue comments despite its old timeline position", () => {
  const updated = comment(receipt, {
    created_at: "2026-10-14T12:00:00Z",
    updated_at: "2026-10-15T12:02:00Z",
  });
  const result = runGate({
    comments: [updated, comment(summary, { id: 2 })],
    timeline: [
      updated,
      activation,
      {
        event: "commented",
        user: { login: "kiaquila" },
        body: "@codex review",
      },
    ],
  });
  assert.equal(result.status, 0, result.stderr);
});

test("legacy summary before activation is stale", () => {
  assert.notEqual(
    runGate({
      comments: [comment(positive)],
      timeline: [comment(positive), activation],
    }).status,
    0,
  );
});

test("event HEAD must match the live PR", () => {
  assert.match(runGate({ eventHead: "a".repeat(40) }).stderr, /does not match/);
});

test("push during final evaluation refuses a stale positive result", () => {
  const result = runGate({ heads: [head, head, "a".repeat(40)] });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /head changed/);
});

test("formal reviews remain supported", () => {
  const result = runGate({
    comments: [],
    reviews: [
      {
        id: 7,
        commit_id: head,
        body: "Codex Review",
        state: "COMMENTED",
        user: { login: bot },
        submitted_at: "2026-10-15T12:00:00Z",
      },
    ],
  });
  assert.equal(result.status, 0, result.stderr);
});

for (const body of [
  "P1: A blocking issue",
  "Untagged issue",
  "P3 and P2: conflicting badges",
]) {
  test(`positive receipt cannot clear unresolved finding: ${body}`, () => {
    const result = runGate({
      threads: [
        {
          isResolved: false,
          comments: {
            nodes: [
              {
                author: { login: "chatgpt-codex-connector" },
                body,
                url: "https://example.com/finding",
              },
            ],
          },
        },
      ],
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Unresolved blocking/);
  });
}

test("human request does not clear blocking formal review", () => {
  const result = runGate({
    timeline: [
      activation,
      {
        event: "commented",
        user: { login: "kiaquila" },
        body: `@codex review ${head}`,
      },
    ],
    reviews: [
      {
        id: 7,
        commit_id: head,
        body: "Codex Review",
        state: "CHANGES_REQUESTED",
        user: { login: bot },
        submitted_at: "2026-10-15T12:00:00Z",
      },
    ],
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /requested changes/);
});

test("P3-only findings preserve advisory policy", () => {
  const result = runGate({
    threads: [
      {
        isResolved: false,
        comments: {
          nodes: [
            {
              author: { login: "chatgpt-codex-connector" },
              body: "P3: advisory",
            },
          ],
        },
      },
    ],
  });
  assert.equal(result.status, 0, result.stderr);
});

test("abbreviated receipt SHA must resolve unambiguously to the full HEAD", () => {
  const result = runGate({ resolvedHead: head.slice(0, 10) + "a".repeat(30) });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /does not resolve/);
});

test("dismissed formal review cannot reuse an older positive receipt", () => {
  const result = runGate({
    reviews: [
      {
        id: 7,
        node_id: "review-node",
        commit_id: head,
        body: "Codex Review",
        state: "DISMISSED",
        user: { login: bot },
        submitted_at: "2026-10-15T12:00:00Z",
      },
    ],
  });
  assert.notEqual(result.status, 0, result.stdout);
});

test("a fresh current-head receipt can supersede a dismissed formal review", () => {
  const result = runGate({
    comments: [comment(receipt, { updated_at: "2026-10-15T12:03:00Z" })],
    reviews: [
      {
        id: 7,
        node_id: "review-node",
        commit_id: head,
        body: "Codex Review",
        state: "DISMISSED",
        user: { login: bot },
        submitted_at: "2026-10-15T12:00:00Z",
      },
    ],
  });
  assert.equal(result.status, 0, result.stderr);
});

for (const after of [true, false]) {
  test(`same-second receipt ${after ? "after" : "before"} dismissal follows timeline ordering`, () => {
    const receiptComment = {
      ...comment(receipt, { created_at: "2026-10-15T12:02:00Z" }),
      event: "commented",
    };
    const dismissal = {
      event: "review_dismissed",
      dismissed_review: { review_id: 7 },
    };
    const timeline = after
      ? [activation, dismissal, receiptComment]
      : [activation, receiptComment, dismissal];
    const result = runGate({
      comments: [receiptComment],
      timeline,
      reviews: [
        {
          id: 7,
          node_id: "review-node",
          commit_id: head,
          body: "Codex Review",
          state: "DISMISSED",
          user: { login: bot },
          submitted_at: "2026-10-15T12:00:00Z",
        },
      ],
    });
    if (after) assert.equal(result.status, 0, result.stderr);
    else assert.notEqual(result.status, 0, result.stdout);
  });
}

for (const replacement of [false, true]) {
  test(`ambiguous same-second edit ${replacement ? "recovers with later evidence" : "requires fresh review without guessing order"}`, () => {
    const editedReceipt = comment(receipt, {
      updated_at: "2026-10-15T12:02:00Z",
    });
    const result = runGate({
      comments: [
        editedReceipt,
        ...(replacement
          ? [comment(receipt, { id: 2, updated_at: "2026-10-15T12:03:00Z" })]
          : []),
      ],
      timeline: [
        activation,
        { ...editedReceipt, event: "commented" },
        { event: "review_dismissed", dismissed_review: { review_id: 7 } },
      ],
      reviews: [
        {
          id: 7,
          node_id: "review-node",
          commit_id: head,
          body: "Codex Review",
          state: "DISMISSED",
          user: { login: bot },
          submitted_at: "2026-10-15T12:00:00Z",
        },
      ],
    });
    if (replacement) assert.equal(result.status, 0, result.stderr);
    else {
      assert.notEqual(result.status, 0, result.stdout);
      assert.match(result.stderr, /Cannot order a Codex receipt edit/);
      assert.match(result.stderr, /Request a fresh native @codex review/);
      assert.doesNotMatch(result.stderr, /timed out/);
    }
  });
}

for (const options of [
  { timeline: [] },
  { timeline: null, timelineUnavailable: true },
]) {
  test(`bound receipt passes when timeline is ${options.timelineUnavailable ? "unavailable" : "empty"}`, () => {
    const result = runGate(options);
    assert.equal(result.status, 0, result.stderr);
  });
  test(`unbound legacy cannot pass when timeline is ${options.timelineUnavailable ? "unavailable" : "empty"}`, () => {
    const result = runGate({ ...options, comments: [comment(positive)] });
    assert.notEqual(result.status, 0, result.stdout);
  });
}

for (const binding of [true, false]) {
  test(`unknown receipt ${binding ? "with" : "without"} binding supersedes an older positive during timeline outage`, () => {
    const unknown = receipt.replace(":v1", ":v2");
    const result = runGate({
      timelineUnavailable: true,
      comments: [
        comment(receipt),
        comment(binding ? unknown : unknown.split("\n\n**Reviewed")[0], {
          id: 2,
          created_at: "2026-10-15T12:02:00Z",
        }),
      ],
    });
    assert.notEqual(result.status, 0, result.stdout);
  });
}

test("an unknown old edit tied with a positive receipt cannot reuse stale success", () => {
  const unknown = comment(receipt.replace(":v1", ":v2"), {
    updated_at: "2026-10-15T12:02:00Z",
    event: "commented",
  });
  const fresh = comment(receipt, {
    id: 2,
    created_at: "2026-10-15T12:02:00Z",
    event: "commented",
  });
  const result = runGate({
    comments: [unknown, fresh],
    timeline: [activation, unknown, fresh],
  });
  assert.notEqual(result.status, 0, result.stdout);
});

test("a new positive receipt after an unknown reply in the same second follows proven creation order", () => {
  const unknown = comment(receipt.replace(":v1", ":v2"), {
    created_at: "2026-10-15T12:02:00Z",
    event: "commented",
  });
  const fresh = comment(receipt, {
    id: 2,
    created_at: "2026-10-15T12:02:00Z",
    event: "commented",
  });
  const result = runGate({
    comments: [unknown, fresh],
    timeline: [activation, unknown, fresh],
  });
  assert.equal(result.status, 0, result.stderr);
});

test("mixed same-second edits and new comments cannot depend on API ordering", () => {
  const edited = comment(receipt.replace(":v1", ":v2"), {
    id: 3,
    updated_at: "2026-10-15T12:02:00Z",
    event: "commented",
  });
  const unknown = comment(receipt.replace(":v1", ":v2"), {
    created_at: "2026-10-15T12:02:00Z",
    event: "commented",
  });
  const positive = comment(receipt, {
    id: 2,
    created_at: "2026-10-15T12:02:00Z",
    event: "commented",
  });
  for (const comments of [
    [edited, unknown, positive],
    [edited, positive, unknown],
    [unknown, edited, positive],
    [unknown, positive, edited],
    [positive, edited, unknown],
    [positive, unknown, edited],
  ]) {
    const result = runGate({
      comments,
      timeline: [activation, edited, unknown, positive],
    });
    assert.notEqual(result.status, 0, result.stdout);
  }
});

for (const unavailable of [false, true]) {
  for (const length of [10, 40]) {
    test(`a newer wrong-head ${length}-character receipt supersedes old success with ${unavailable ? "failed" : "empty"} timeline`, () => {
      const result = runGate({
        timeline: [],
        timelineUnavailable: unavailable,
        comments: [
          comment(receipt),
          comment(receipt.replace(head.slice(0, 10), "a".repeat(length)), {
            id: 2,
            created_at: "2026-10-15T12:02:00Z",
          }),
        ],
      });
      assert.notEqual(result.status, 0, result.stdout);
    });
  }
}

const formalReview = (extra = {}) => ({
  id: 7,
  node_id: "review-node",
  commit_id: head,
  body: "Codex Review",
  state: "COMMENTED",
  user: { login: bot },
  submitted_at: "2026-10-15T12:00:00Z",
  ...extra,
});

const setupFailures = [
  "To use Codex here, create an environment for this repo.",
  "Please create a Codex account and connect to GitHub to continue.",
];
for (const unavailable of [false, true]) {
  for (const [index, body] of setupFailures.entries()) {
    test(`persisted setup failure ${index + 1} supersedes receipt with ${unavailable ? "unavailable" : "empty"} timeline`, () => {
      const result = runGate({
        timeline: [],
        timelineUnavailable: unavailable,
        comments: [
          comment(receipt),
          comment(body, { id: 2, created_at: "2026-10-15T12:02:00Z" }),
        ],
      });
      assert.notEqual(result.status, 0, result.stdout);
      assert.match(result.stderr, /Codex could not start/);
    });
  }
}

for (const state of ["APPROVED", "COMMENTED"]) {
  for (const [name, body] of [
    ["unknown marker", receipt.replace(":v1", ":v2")],
    ["wrong head", receipt.replace(head.slice(0, 10), "a".repeat(10))],
    ["setup failure", setupFailures[0]],
    ["withdrawal", ""],
    ["unbound legacy without timeline", positive],
  ]) {
    test(`newer ${name} supersedes formal ${state}`, () => {
      const result = runGate({
        timelineUnavailable: true,
        reviews: [formalReview({ state })],
        comments: [comment(body, { updated_at: "2026-10-15T12:02:00Z" })],
      });
      assert.notEqual(result.status, 0, result.stdout);
    });
  }
}

test("a nonpassing comment tied with formal success cannot reuse that success", () => {
  const result = runGate({
    reviews: [formalReview()],
    reviewUpdatedAt: "2026-10-15T12:02:00Z",
    comments: [
      comment(receipt.replace(":v1", ":v2"), {
        updated_at: "2026-10-15T12:02:00Z",
      }),
    ],
  });
  assert.notEqual(result.status, 0, result.stdout);
});

test("a newer formal success recovers after an older nonpassing comment", () => {
  const result = runGate({
    reviews: [formalReview({ submitted_at: "2026-10-15T12:03:00Z" })],
    comments: [comment(setupFailures[0])],
  });
  assert.equal(result.status, 0, result.stderr);
});

test("a later positive receipt recovers after formal success and a failed reply", () => {
  const result = runGate({
    reviews: [formalReview()],
    comments: [
      comment(setupFailures[0]),
      comment(receipt, { id: 2, created_at: "2026-10-15T12:03:00Z" }),
    ],
  });
  assert.equal(result.status, 0, result.stderr);
});

test("a newer formal withdrawal does not expose an older formal success or receipt", () => {
  const result = runGate({
    reviews: [
      formalReview(),
      formalReview({ id: 8, node_id: "withdrawn", body: "" }),
    ],
    reviewUpdates: {
      "review-node": "2026-10-15T12:00:00Z",
      withdrawn: "2026-10-15T12:03:00Z",
    },
  });
  assert.notEqual(result.status, 0, result.stdout);
});

test("persisted formal edits order evidence independently of submission time", () => {
  const result = runGate({
    reviews: [formalReview()],
    reviewUpdatedAt: "2026-10-15T12:03:00Z",
    comments: [comment(setupFailures[0])],
  });
  assert.equal(result.status, 0, result.stderr);
});
