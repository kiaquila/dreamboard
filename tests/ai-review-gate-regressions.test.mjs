import {
  cleanStateBody,
  presentationReceipt,
} from "./fixtures/codex-state.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { classifyCodexSummaryComment } from "../scripts/ai-review-helpers.mjs";

const helpFooter = readFileSync(
  new URL("./fixtures/codex-help-footer.txt", import.meta.url),
  "utf8",
).trim();

const head = "2667f79cd7676ff331730cabf661d38dbbcddb0d";
const bot = "chatgpt-codex-connector[bot]";
const positive = "Codex Review: Didn't find any major issues. :rocket:";
const taskLink =
  "[View task →](https://chatgpt.com/s/cd_6ad7739599808191a9f9f3d75b130484)";
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
    "SHA-bound native task reply with its service link",
    `${positive}\n\n**Reviewed commit:** \`${head}\`\n\n ${taskLink}`,
  ],
  [
    "observed follow-up question",
    receipt.replace(":rocket:", "What shall we delve into next?"),
  ],
  [
    "native short help footer",
    `${receipt}\n\n${helpFooter.split("Codex can also")[0].trim()}\n</details>`,
  ],
  [
    "observed keep-them-coming receipt with info footer",
    `${receipt.replace(":rocket:", "Keep them coming!")}\n\n${helpFooter}`,
  ],
  [
    "observed keep-it-up receipt with info footer",
    `${receipt.replace(":rocket:", "Keep it up!")}\n\n${helpFooter}`,
  ],
  [
    "observed bravo receipt with info footer",
    `${receipt.replace(":rocket:", "Bravo.")}\n\n${helpFooter}`,
  ],
  [
    "observed hooray receipt with info footer",
    `${receipt.replace(":rocket:", "Hooray!")}\n\n${helpFooter}`,
  ],
  [
    "PR 57 thumbs-up shortcode receipt with info footer",
    `${receipt.replace(":rocket:", ":+1:")}\n\n${helpFooter}`,
  ],
  [
    "PR 56 on-a-roll receipt with info footer",
    `${receipt.replace(":rocket:", "You're on a roll.")}\n\n${helpFooter}`,
  ],
  [
    "PR 57 chef's-kiss receipt with info footer",
    `${receipt.replace(":rocket:", "Chef's kiss.")}\n\n${helpFooter}`,
  ],
  [
    "PR 57 swish receipt with info footer",
    `${receipt.replace(":rocket:", "Swish!")}\n\n${helpFooter}`,
  ],
  ["curly legacy", positive.replace("Didn't", "Didn’t")],
  [
    "receipt with help",
    `${receipt}\n\n${helpFooter.replace("ℹ️ ", "").replace("<br/>", "")}`,
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
  [
    "conflicting follow-up question",
    receipt.replace(
      ":rocket:",
      "What shall we delve into next? P1: Fix a bug.",
    ),
  ],
  [
    "task link followed by a finding",
    `${receipt}\n\n${taskLink}\nP1: Fix a bug.`,
  ],
  ["finding before task link", `${receipt}\nP1: Fix a bug.\n${taskLink}`],
  [
    "task link to another domain",
    `${receipt}\n${taskLink.replace("chatgpt.com", "example.com")}`,
  ],
  ["duplicate task links", `${receipt}\n${taskLink}\n${taskLink}`],
  [
    "conflicting footer verdict",
    `${receipt}\n\n${helpFooter.replace("</details>", "P1: Fix a bug\n</details>")}`,
  ],
  [
    "unknown footer body",
    `${receipt}\n\n${helpFooter.replace("If Codex has suggestions", "There are major blocking findings. If Codex has suggestions")}`,
  ],
  [
    "nested footer",
    `${receipt}\n\n${helpFooter.replace("</details>", "<details>P1: Bug</details></details>")}`,
  ],
  [
    "bravo followed by conflicting verdict",
    receipt.replace(":rocket:", "Bravo. However, P1: Fix a bug."),
  ],
  [
    "hooray followed by conflicting verdict",
    receipt.replace(":rocket:", "Hooray! However, P1: Fix a bug."),
  ],
  [
    "thumbs-up shortcode followed by conflicting verdict",
    receipt.replace(":rocket:", ":+1: However, P1: Fix a bug."),
  ],
  [
    "on-a-roll followed by conflicting verdict",
    receipt.replace(":rocket:", "You're on a roll. However, P1: Fix a bug."),
  ],
  ["unknown numeric shortcode", receipt.replace(":rocket:", ":-1:")],
  ["unknown encouragement", receipt.replace(":rocket:", "Almost ready!")],
  ...["Chef's kiss.", "Swish!"].flatMap((suffix) => {
    const native = receipt.replace(":rocket:", suffix);
    return [
      [
        `${suffix} with wrong SHA`,
        native.replace(head.slice(0, 10), "aaaaaaaaaa"),
      ],
      [
        `${suffix} with spoofed author`,
        native,
        { user: { login: "attacker" } },
      ],
      [
        `${suffix} with duplicate marker`,
        `<!-- codex-review-receipt:v1 -->\n${native}`,
      ],
      [`${suffix} with unknown marker`, native.replace(":v1", ":v2")],
      [
        `${suffix} with unknown footer`,
        `${native}\n\n${helpFooter.replace("If Codex has suggestions", "P1: Fix a bug. If Codex has suggestions")}`,
      ],
      [
        `${suffix} with trailing prose`,
        native.replace(suffix, `${suffix} Almost ready!`),
      ],
      [
        `${suffix} with conflicting verdict`,
        native.replace(suffix, `${suffix} However, P1: Fix a bug.`),
      ],
      [
        `${suffix} with negative verdict`,
        native.replace("Didn't find any major issues.", "Found major issues."),
      ],
    ];
  }),
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

test("edited old receipt cannot supersede a newer incomplete summary", () => {
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
  assert.notEqual(result.status, 0, result.stdout);
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

for (const [body, passes] of [
  ["P3: Advisory finding", true],
  ["P1: Escalated finding", false],
  ["Finding without a severity badge", false],
]) {
  test(`actual reevaluated gate handles inline mutation: ${body}`, () => {
    const result = runGate({
      reviews: [formalReview()],
      inline: [
        {
          pull_request_review_id: 7,
          body,
          html_url: "https://example.com/inline",
        },
      ],
    });
    assert.equal(result.status === 0, passes, result.stderr || result.stdout);
  });
}

const invalidationRecord = (extra = {}) => ({
  id: 50,
  user: { login: "github-actions[bot]" },
  body: `<!-- codex-review-invalidation:v1 ${JSON.stringify({ head_sha: head, source_event: "issue_comment", source_id: 42 })} -->\nNative evidence deleted.`,
  created_at: "2026-10-15T12:02:00Z",
  ...extra,
});
for (const formal of [false, true]) {
  test(`persisted deletion prevents reuse of an older ${formal ? "formal approval" : "receipt"}`, () => {
    const result = runGate({
      comments: [comment(receipt), invalidationRecord()],
      reviews: formal
        ? [
            {
              id: 7,
              user: { login: bot },
              commit_id: head,
              body: "Codex Review",
              state: "APPROVED",
              submitted_at: "2026-10-15T12:01:30Z",
            },
          ]
        : [],
    });
    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /require a new assessment/);
  });
}
for (const [label, created_at, updated_at, passes] of [
  ["same-second receipt", "2026-10-15T12:02:00Z", undefined, false],
  ["edited old receipt", "2026-10-15T12:01:00Z", "2026-10-15T12:03:00Z", false],
  ["new native receipt", "2026-10-15T12:03:00Z", undefined, true],
]) {
  test(`${label} ${passes ? "can" : "cannot"} recover after deletion`, () => {
    const result = runGate({
      comments: [
        invalidationRecord(),
        comment(receipt, { created_at, updated_at }),
      ],
    });
    assert.equal(result.status === 0, passes, result.stderr || result.stdout);
  });
}
test("a malformed trusted invalidation fails closed", () => {
  const result = runGate({
    comments: [
      comment(receipt),
      invalidationRecord({ body: "<!-- codex-review-invalidation:v2 -->" }),
    ],
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /invalidation record/);
});
test("untrusted tombstone text and another head cannot provide positive authority or invalidate this head", () => {
  for (const extra of [
    { user: { login: "attacker" } },
    { body: invalidationRecord().body.replace(head, "a".repeat(40)) },
  ]) {
    const result = runGate({
      comments: [comment(receipt), invalidationRecord(extra)],
    });
    assert.equal(result.status, 0, result.stderr);
  }
});

for (const ordering of ["summary-first", "receipt-first"]) {
  test(`actual gate accepts strict state with unseen closing (${ordering})`, () => {
    const snapshot = comment(cleanStateBody(head), {
      id: 41,
      created_at: "2026-10-20T12:02:00Z",
    });
    const presentation = comment(presentationReceipt(head), {
      id: 42,
      created_at: "2026-10-20T12:03:00Z",
    });
    if (ordering === "receipt-first") {
      snapshot.created_at = "2026-10-20T12:04:00Z";
      snapshot.body = snapshot.body.replaceAll(
        "2026-10-20T12:02:00Z",
        "2026-10-20T12:04:00Z",
      );
    }
    const events = [
      activation,
      ...(ordering === "summary-first"
        ? [snapshot, presentation]
        : [presentation, snapshot]),
    ];
    const result = runGate({ timeline: events, comments: events });
    if (ordering === "receipt-first")
      assert.equal(result.status, 0, result.stderr);
    else assert.notEqual(result.status, 0);
  });
}

test("security-only snapshot edit cannot supersede later formal dismissal", () => {
  const snapshot = comment(cleanStateBody(head), {
    id: 88,
    created_at: "2026-10-20T12:02:00Z",
    updated_at: "2026-10-20T12:04:00Z",
  });
  const result = runGate({
    comments: [snapshot],
    timeline: [activation, { ...snapshot, event: "commented" }],
    reviewUpdatedAt: "2026-10-20T12:03:00Z",
    reviews: [
      {
        id: 7,
        node_id: "review-node",
        commit_id: head,
        body: "Codex Review",
        state: "DISMISSED",
        user: { login: bot },
        submitted_at: "2026-10-20T12:01:00Z",
      },
    ],
  });
  assert.notEqual(result.status, 0, result.stdout);
});

for (const scenario of ["newer-pending", "prerequest", "edited-unknown"]) {
  test(`actual gate rejects static edit renewal: ${scenario}`, () => {
    const request = {
      ...comment(`@codex review ${head}`, {
        id: 79,
        created_at: "2026-10-20T12:01:00Z",
      }),
      event: "commented",
      user: { login: "kiaquila" },
      author_association: "OWNER",
    };
    const edited = comment(
      presentationReceipt(
        head,
        scenario === "edited-unknown" ? "Unseen closing!" : ":rocket:",
      ),
      {
        id: 80,
        created_at:
          scenario === "newer-pending"
            ? "2026-10-20T12:02:00Z"
            : "2026-10-20T12:00:00Z",
        updated_at: "2026-10-20T12:05:00Z",
      },
    );
    const snapshot = comment(
      scenario === "newer-pending"
        ? cleanStateBody(head).replaceAll(
            '"status":"completed"',
            '"status":"running"',
          )
        : cleanStateBody(head),
      { id: 81, created_at: "2026-10-20T12:03:00Z" },
    );
    const events = [
      { ...activation, created_at: "2026-10-20T11:59:00Z" },
      request,
      edited,
      ...(scenario === "prerequest" ? [] : [snapshot]),
    ];
    const result = runGate({ timeline: events, comments: events });
    assert.notEqual(result.status, 0, result.stdout);
  });
}

const securityHistoryBody = (negative, time) =>
  cleanStateBody(head, (state) => ({
    ...state,
    security_review: {
      ...state.code_review,
      has_any_findings: negative,
      has_unresolved_findings: negative,
    },
  })).replaceAll("2026-10-20T12:02:00Z", time) +
  `\n| 🔒 **Security Review** | ✅ **Completed** <relative-time datetime="${time}">${time}</relative-time> | \`${head.slice(0, 7)}\` | Manual request |`;
for (const mode of [
  "formal",
  "static",
  "security-null",
  "newer-clear",
  "ordinary-comment-clear",
  "indented-comment-clear",
  "tabbed-comment-clear",
  "uppercase-clear",
  "equal-clear",
  "old-security-clock",
  "missing-security-clock",
  "malformed-old",
  "multiline-old",
  "marker-prose-old",
  "trailing-example-old",
  "fenced-example-old",
  "quoted-fence-old",
  "spaced-heading-old",
  "contradictory-trigger-clear",
  "trailing-marker-old",
  "duplicate-leading-old",
  "whole-fenced-old",
  "whole-quoted-old",
  "trailing-marker-clear",
  "quoted-fence-clear",
  "fenced-example-clear",
  "bom-space-clear",
  "bom-tab-clear",
  "warning-clear",
  "running-visible-clear",
  "example-clear",
  "multiline-example-clear",
  "indented-old",
  "tabbed-old",
  "wrong-actor",
]) {
  test(`actual gate retains section-specific security history: ${mode}`, () => {
    const old = comment(securityHistoryBody(true, "2026-10-20T12:02:00Z"), {
      id: 930,
      created_at: "2026-10-20T12:02:00Z",
    });
    if (mode === "multiline-old")
      old.body =
        "<!-- presentation-only metadata -->\n" +
        old.body.replace(
          /(codex-review-state:v1 )(\{[^\n]+\})( -->)/,
          (_, prefix, json, suffix) =>
            prefix + JSON.stringify(JSON.parse(json), null, 2) + suffix,
        );
    if (mode === "marker-prose-old")
      old.body = old.body.replaceAll(
        "Manual request",
        "codex-review-state: parser review",
      );
    if (["indented-old", "tabbed-old"].includes(mode))
      old.body = old.body.replace(
        /^(<!-- codex-(?:pull-request-review-summary|review-state)[^\n]*)/gm,
        (mode === "tabbed-old" ? "\t" : "    ") + "$1",
      );
    if (mode === "duplicate-leading-old")
      old.body = old.body.replace(
        "<!-- codex-review-state:v1",
        "<!-- codex-review-state:v1 {} -->\n<!-- codex-review-state:v1",
      );
    if (mode === "whole-fenced-old")
      old.body = "```html\n" + old.body + "\n```";
    if (mode === "whole-quoted-old")
      old.body = old.body
        .split("\n")
        .map((line) => "> " + line)
        .join("\n");
    if (mode === "trailing-marker-old")
      old.body += "\n<!-- codex-review-state:v1 {} -->";
    if (mode === "spaced-heading-old")
      old.body =
        old.body.replace(
          "## Codex Review Summary",
          "  ## Codex Review Summary",
        ) + "\n    <!-- codex-review-state:v1 {} -->";
    if (mode === "quoted-fence-old")
      old.body += "\n> ```html\n> <!-- codex-review-state:v1 {} -->\n> ```";
    if (mode === "fenced-example-old")
      old.body += "\n```html\n<!-- codex-review-state:v1 example -->\n```";
    if (mode === "trailing-example-old")
      old.body += "\n    <!-- codex-review-state:v1 example -->";
    if (mode === "malformed-old")
      old.body = old.body.replace("state:v1", "state:v2");
    if (mode === "wrong-actor") old.user = { login: "attacker" };
    const request = {
      ...comment(`@codex review ${head}`, {
        id: 931,
        created_at: "2026-10-20T12:03:00Z",
      }),
      event: "commented",
      user: { login: "kiaquila" },
      author_association: "OWNER",
    };
    const receipt = comment(presentationReceipt(head, ":rocket:"), {
      id: 932,
      created_at: "2026-10-20T12:04:00Z",
    });
    const newer = comment(
      mode === "security-null"
        ? cleanStateBody(head).replaceAll(
            "2026-10-20T12:02:00Z",
            "2026-10-20T12:05:00Z",
          )
        : securityHistoryBody(
            false,
            mode === "equal-clear"
              ? "2026-10-20T12:02:00Z"
              : "2026-10-20T12:05:00Z",
          ),
      { id: 933, created_at: "2026-10-20T12:05:00Z" },
    );
    if (["ordinary-comment-clear", "uppercase-clear"].includes(mode))
      receipt.created_at = "2026-10-20T12:06:00Z";
    if (mode === "ordinary-comment-clear")
      newer.body += "\n<!-- TODO: presentation metadata -->";
    if (["bom-space-clear", "bom-tab-clear"].includes(mode))
      newer.body =
        "\uFEFF" +
        newer.body.replace(
          /^<!-- codex-pull-request-review-summary/,
          (mode === "bom-tab-clear" ? "\t" : "    ") +
            "<!-- codex-pull-request-review-summary",
        );
    if (mode === "warning-clear")
      newer.body = newer.body.replace(
        "🔒 **Security Review**",
        "⚠️ 🔒 **Security Review**",
      );
    if (mode === "running-visible-clear")
      newer.body = newer.body.replaceAll(
        '"status":"completed"',
        '"status":"running"',
      );
    if (mode === "trailing-marker-clear")
      newer.body += "\n<!-- codex-review-state:v1 {} -->";
    if (mode === "contradictory-trigger-clear")
      newer.body = newer.body.replaceAll("Manual request", "Do not merge");
    if (mode === "quoted-fence-clear")
      newer.body += "\n> ```html\n> <!-- codex-review-state:v1 {} -->\n> ```";
    if (mode === "fenced-example-clear")
      newer.body += "\n```html\n<!-- codex-review-state:v1 example -->\n```";
    if (mode === "indented-comment-clear")
      newer.body += "\n    <!-- TODO: presentation metadata -->";
    if (mode === "tabbed-comment-clear")
      newer.body += "\n\t<!-- TODO: presentation metadata -->";
    if (mode === "example-clear")
      newer.body += "\n\t<!-- codex-pull-request-review-summary -->";
    if (mode === "multiline-example-clear")
      newer.body += "\n    <!-- codex-review-state:v1 {\n    } -->";
    if (mode === "uppercase-clear")
      newer.body += "\n<!-- CODEX-review-state:v1 {} -->";
    if (mode === "old-security-clock")
      newer.body = newer.body
        .split("\n")
        .map((line) =>
          line.includes("**Security Review**")
            ? line.replaceAll("2026-10-20T12:05:00Z", "2026-10-20T12:02:00Z")
            : line,
        )
        .join("\n");
    if (mode === "missing-security-clock")
      newer.body = newer.body.replace(
        /(Security Review\*\* \| ✅ \*\*Completed\*\*) <relative-time[^>]+>[^<]+<\/relative-time>/,
        "$1",
      );
    const events = [
      { ...activation, created_at: "2026-10-20T12:00:00Z" },
      old,
      request,
      ...(mode === "formal" ? [] : [receipt]),
      ...([
        "security-null",
        "example-clear",
        "fenced-example-clear",
        "quoted-fence-clear",
        "contradictory-trigger-clear",
        "trailing-marker-clear",
        "bom-space-clear",
        "bom-tab-clear",
        "warning-clear",
        "running-visible-clear",
        "multiline-example-clear",
        "newer-clear",
        "ordinary-comment-clear",
        "indented-comment-clear",
        "tabbed-comment-clear",
        "uppercase-clear",
        "equal-clear",
        "old-security-clock",
        "missing-security-clock",
      ].includes(mode)
        ? [newer]
        : []),
    ];
    const reviews =
      mode === "formal"
        ? [
            {
              id: 934,
              node_id: "history-review",
              commit_id: head,
              body: "Codex Review",
              state: "APPROVED",
              user: { login: "chatgpt-codex-connector[bot]" },
              submitted_at: "2026-10-20T12:04:00Z",
            },
          ]
        : [];
    const result = runGate({
      timeline: events,
      comments: events,
      reviews,
      reviewUpdatedAt: "2026-10-20T12:04:00Z",
    });
    assert.equal(
      result.status === 0,
      [
        "newer-clear",
        "ordinary-comment-clear",
        "malformed-old",
        "duplicate-leading-old",
        "whole-fenced-old",
        "whole-quoted-old",
        "wrong-actor",
        "indented-old",
        "tabbed-old",
      ].includes(mode),
      result.stderr || result.stdout,
    );
  });
}

for (const section of ["code_review", "security_review"])
  for (const indentation of ["spaces", "tabs", "mixed-crlf", "partial"])
    test(`actual gate retains ${section} before multiline ${indentation} examples`, () => {
      const negative =
        section === "security_review"
          ? securityHistoryBody(true, "2026-10-20T12:02:00Z")
          : cleanStateBody(head, (state) => ({
              ...state,
              code_review: {
                ...state.code_review,
                has_any_findings: true,
                has_unresolved_findings: true,
              },
            }));
      const example = [
        "<!-- codex-review-state:v1 {",
        '  "code_review": {}',
        "} -->",
      ]
        .map((line, index) => {
          const indent =
            indentation === "partial" && index === 1
              ? ""
              : indentation === "tabs" ||
                  (indentation === "mixed-crlf" && index === 1)
                ? "\t"
                : "    ";
          return indent + line;
        })
        .join(indentation === "mixed-crlf" ? "\r\n" : "\n");
      const old = comment(`${negative}\n${example}`, {
        id: 980,
        created_at: "2026-10-20T12:02:00Z",
      });
      const request = {
        ...comment(`@codex review ${head}`, {
          id: 981,
          created_at: "2026-10-20T12:03:00Z",
        }),
        event: "commented",
        user: { login: "kiaquila" },
        author_association: "OWNER",
      };
      const receipt = comment(presentationReceipt(head, ":rocket:"), {
        id: 982,
        created_at: "2026-10-20T12:04:00Z",
      });
      const events = [
        { ...activation, created_at: "2026-10-20T12:00:00Z" },
        old,
        request,
        receipt,
      ];
      const result = runGate({ timeline: events, comments: events });
      assert.equal(result.status === 0, false, result.stderr || result.stdout);
    });

for (const section of ["code_review", "security_review"])
  test(`actual gate uses ${section} completion despite later shared edit`, () => {
    const old = comment(
      securityHistoryBody(false, "2026-10-20T12:01:00Z").replace(
        `"${section}":{"commit_sha":"${head}","has_any_findings":false,"has_unresolved_findings":false`,
        `"${section}":{"commit_sha":"${head}","has_any_findings":true,"has_unresolved_findings":true`,
      ),
      {
        id: 940,
        created_at: "2026-10-20T12:01:00Z",
        updated_at: "2026-10-20T12:05:00Z",
      },
    );
    const request = {
      ...comment(`@codex review ${head}`, {
        id: 941,
        created_at: "2026-10-20T12:02:00Z",
      }),
      event: "commented",
      user: { login: "kiaquila" },
      author_association: "OWNER",
    };
    const clean = comment(securityHistoryBody(false, "2026-10-20T12:04:00Z"), {
      id: 942,
      created_at: "2026-10-20T12:04:00Z",
    });
    const events = [
      { ...activation, created_at: "2026-10-20T12:00:00Z" },
      old,
      request,
      clean,
    ];
    const result = runGate({ timeline: events, comments: events });
    assert.equal(result.status, 0, result.stderr || result.stdout);
  });

test("actual gate preserves concurrent running section observed clock", () => {
  const clean = comment(securityHistoryBody(false, "2026-10-20T12:04:00Z"), {
    id: 950,
    created_at: "2026-10-20T12:04:00Z",
  });
  let pendingBody = securityHistoryBody(true, "2026-10-20T12:01:00Z").replace(
    /"security_review":\{[^}]+\}/,
    `"security_review":{"commit_sha":"${head}","has_any_findings":null,"has_unresolved_findings":null,"status":"running"}`,
  );
  pendingBody = pendingBody
    .split("\n")
    .map((line) =>
      line.includes("**Security Review**")
        ? line
            .replace("✅ **Completed**", "🔄 **Running** since")
            .replaceAll("2026-10-20T12:01:00Z", "2026-10-20T12:05:00Z")
        : line,
    )
    .join("\n");
  const pending = comment(pendingBody, {
    id: 951,
    created_at: "2026-10-20T12:01:00Z",
    updated_at: "2026-10-20T12:05:00Z",
  });
  const events = [
    { event: "committed", sha: head, created_at: "2026-10-20T12:00:00Z" },
    clean,
    pending,
  ];
  const result = runGate({ timeline: events, comments: events });
  assert.notEqual(result.status, 0, result.stdout);
});

for (const clear of [false, true, "inactive-code", "edited-mixed"])
  test(`actual gate section head history ignores foreign other head: ${clear}`, () => {
    const foreign = "b".repeat(40);
    const mixed = (negative, time) =>
      securityHistoryBody(negative, time)
        .replace(
          `"code_review":{"commit_sha":"${head}"`,
          `"code_review":{"commit_sha":"${foreign}"`,
        )
        .split("\n")
        .map((line) =>
          line.includes("**Code Review**")
            ? line.replace(head.slice(0, 7), foreign.slice(0, 7))
            : line,
        )
        .join("\n");
    const old = comment(
      clear
        ? securityHistoryBody(true, "2026-10-20T12:01:00Z")
        : mixed(true, "2026-10-20T12:01:00Z"),
      { id: 960, created_at: "2026-10-20T12:01:00Z" },
    );
    if (clear === "edited-mixed") {
      old.body = mixed(true, "2026-10-20T12:01:00Z");
      old.updated_at = "2026-10-20T12:05:00Z";
    }
    const cleared = comment(mixed(false, "2026-10-20T12:02:00Z"), {
      id: 961,
      created_at: "2026-10-20T12:02:00Z",
    });
    if (clear === "inactive-code")
      cleared.body = cleared.body
        .replace(
          /"code_review":\{[^}]+\}/,
          '"code_review":{"commit_sha":null,"has_any_findings":null,"has_unresolved_findings":null,"status":null}',
        )
        .split("\n")
        .filter((line) => !line.includes("**Code Review**"))
        .join("\n");
    const request = {
      ...comment(`@codex review ${head}`, {
        id: 962,
        created_at: "2026-10-20T12:03:00Z",
      }),
      event: "commented",
      user: { login: "kiaquila" },
      author_association: "OWNER",
    };
    const receipt = comment(presentationReceipt(head, ":rocket:"), {
      id: 963,
      created_at: "2026-10-20T12:04:00Z",
    });
    const events = [
      { event: "committed", sha: head, created_at: "2026-10-20T12:00:00Z" },
      old,
      ...(clear ? [cleared] : []),
      request,
      receipt,
    ];
    const result = runGate({ timeline: events, comments: events });
    assert.equal(
      result.status === 0,
      Boolean(clear),
      result.stderr || result.stdout,
    );
  });

for (const mode of [
  "fresh-code",
  "unresolved-code",
  "security",
  "same-second",
  "before-observation",
  "edited-old-receipt",
  "before-request",
  "wrong-head",
  "wrong-actor",
  "unknown-receipt",
  "noncanonical-resolved-example",
  "noncanonical-resolved-multiline-example",
  "open-thread",
  "newer-unresolved-observation",
  "formal-only",
]) {
  test(`actual gate requires independent native resolved-code recovery: ${mode}`, () => {
    const completed = "2026-10-20T12:02:00Z";
    const resolvedBody =
      mode === "security"
        ? securityHistoryBody(true, completed).replace(
            /("security_review":\{[^}]+"has_unresolved_findings":)true/,
            "$1false",
          )
        : cleanStateBody(head, (state) => ({
            ...state,
            code_review: {
              ...state.code_review,
              has_any_findings: true,
              has_unresolved_findings: mode === "unresolved-code",
            },
          }));
    const resolved = comment(
      mode === "noncanonical-resolved-example"
        ? `${resolvedBody}\n\n    <!-- codex-review-state:v1 {} -->`
        : mode === "noncanonical-resolved-multiline-example"
          ? `${resolvedBody}\n    <!-- codex-review-state:v1 {\n    } -->`
          : resolvedBody,
      {
        id: 970,
        created_at: completed,
        updated_at: "2026-10-20T12:03:00Z",
      },
    );
    const request = {
      ...comment(`@codex review ${head}`, {
        id: 971,
        created_at:
          mode === "before-request"
            ? "2026-10-20T12:06:00Z"
            : "2026-10-20T12:01:00Z",
      }),
      event: "commented",
      user: { login: "kiaquila" },
      author_association: "OWNER",
    };
    const assessment = comment(
      presentationReceipt(
        mode === "wrong-head" ? "b".repeat(40) : head,
        ":rocket:",
      ),
      {
        id: 972,
        created_at:
          mode === "same-second"
            ? "2026-10-20T12:03:00Z"
            : ["before-observation", "edited-old-receipt"].includes(mode)
              ? "2026-10-20T12:02:30Z"
              : "2026-10-20T12:05:00Z",
        ...(mode === "edited-old-receipt"
          ? { updated_at: "2026-10-20T12:05:00Z" }
          : {}),
        ...(mode === "wrong-actor" ? { user: { login: "attacker" } } : {}),
      },
    );
    if (mode === "unknown-receipt") assessment.body += "\nPending issue.";
    const newerUnresolved = {
      ...resolved,
      id: 973,
      body: resolved.body.replace(
        '"has_unresolved_findings":false',
        '"has_unresolved_findings":true',
      ),
      updated_at: "2026-10-20T12:04:00Z",
    };
    const events = [
      { ...activation, created_at: "2026-10-20T12:00:00Z" },
      request,
      resolved,
      ...(mode === "newer-unresolved-observation" ? [newerUnresolved] : []),
      ...(mode === "formal-only" ? [] : [assessment]),
    ].sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
    const result = runGate({
      timeline: events,
      comments: events,
      ...(mode === "open-thread"
        ? {
            threads: [
              {
                isResolved: false,
                comments: {
                  nodes: [
                    {
                      author: { login: bot },
                      body: "P1: unresolved finding",
                      url: "https://example.com/finding",
                    },
                  ],
                },
              },
            ],
          }
        : {}),
      ...(mode === "formal-only"
        ? {
            reviews: [
              {
                id: 974,
                node_id: "resolved-history-review",
                commit_id: head,
                body: "Codex Review",
                state: "APPROVED",
                user: { login: bot },
                submitted_at: "2026-10-20T12:05:00Z",
              },
            ],
            reviewUpdatedAt: "2026-10-20T12:05:00Z",
          }
        : {}),
    });
    assert.equal(
      result.status === 0,
      mode === "fresh-code",
      result.stderr || result.stdout,
    );
  });
}

test("actual gate preserves latest foreign negative observation", () => {
  const foreign = "b".repeat(40);
  const stale = comment(
    securityHistoryBody(true, "2026-10-20T12:01:00Z")
      .replaceAll(head, foreign)
      .replaceAll(head.slice(0, 7), foreign.slice(0, 7)),
    {
      id: 970,
      created_at: "2026-10-20T12:01:00Z",
      updated_at: "2026-10-20T12:05:00Z",
    },
  );
  const clean = comment(securityHistoryBody(false, "2026-10-20T12:04:00Z"), {
    id: 971,
    created_at: "2026-10-20T12:04:00Z",
  });
  const events = [
    { event: "committed", sha: head, created_at: "2026-10-20T12:00:00Z" },
    clean,
    stale,
  ];
  const result = runGate({ timeline: events, comments: events });
  assert.notEqual(result.status, 0, result.stdout);
});
