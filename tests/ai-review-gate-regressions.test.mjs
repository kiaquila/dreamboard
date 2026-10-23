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
  "embedded-bom-clear",
  "comment-heading-clear",
  "mediumspace-clear",
  "hairspace-clear",
  "multiline-comment-clear",
  "zerowidth-priority-clear",
  "variation-priority-clear",
  "balanced-link-clear",
  "malformed-link-clear",
  "title-double-clear",
  "title-single-clear",
  "title-paren-clear",
  "escaped-space-clear",
  "space-destination-clear",
  "empty-destination-clear",
  "escaped-opener-clear",
  "escaped-label-closer-clear",
  "nested-link-clear",
  "found-article-repeat-clock",
  "found-html-article-repeat-clock",
  "found-word-count-repeat-clock",
  "blank-label-repeat-clock",
  "html-break-repeat-clock",
  "code-priority-repeat-clock",
  "code-warning-repeat-clock",
  "raw-html-link-repeat-clock",
  "quoted-raw-html-repeat-clock",
  "quoted-html-exit-repeat-clock",
  "list-html-exit-repeat-clock",
  "list-raw-html-repeat-clock",
  "mixed-finding-count-repeat-clock",
  "existential-finding-repeat-clock",
  "detected-finding-repeat-clock",
  "detected-article-repeat-clock",
  "reverse-container-repeat-clock",
  "unresolved-count-repeat-clock",
  "used-footnote-repeat-clock",
  "invalid-footnote-label-repeat-clock",
  "invalid-footnote-reference-repeat-clock",
  "footnote-two-space-repeat-clock",
  "footnote-four-space-repeat-clock",
  "used-footnote-four-space-repeat-clock",
  "transitive-footnote-repeat-clock",
  "footnote-destination-repeat-clock",
  "footnote-reference-destination-repeat-clock",
  "footnote-reference-title-repeat-clock",
  "bugfree-repeat-clock",
  "type7-paragraph-repeat-clock",
  "unmatched-underscore-repeat-clock",
  "unmatched-star-repeat-clock",

  "unicode-footnote-repeat-clock",
  "bug-repeat-clock",
  "not-fixed-repeat-clock",
  "not-resolved-repeat-clock",
  "unrelated-negation-repeat-clock",
  "meta-term-repeat-clock",
  "meta-words-repeat-clock",
  "flaw-repeat-clock",
  "worded-count-repeat-clock",
  "br-finding-repeat-clock",
  "harmless-repeat-clock",
  "benign-repeat-clock",
  "except-fixed-repeat-clock",
  "none-current-repeat-clock",
  "none-were-repeat-clock",
  "may-reappear-repeat-clock",
  "defect-repeat-clock",
  "regression-repeat-clock",
  "qualified-absence-repeat-clock",
  "security-risk-repeat-clock",
  "users-bypass-repeat-clock",
  "adjectival-mention-repeat-clock",
  "adjectival-discussion-repeat-clock",
  "adverb-bypass-repeat-clock",
  "mentioned-is-open-repeat-clock",
  "discussed-is-outstanding-repeat-clock",
  "entity-colon-repeat-clock",
  "nobody-repeat-clock",
  "subjectless-bypass-repeat-clock",
  "qualified-no-repeat-clock",
  "mentioned-fixed-repeat-clock",
  "mentioned-resolved-repeat-clock",
  "mentioned-closed-repeat-clock",

  "incomplete-fix-repeat-clock",
  "able-bypass-repeat-clock",
  "mentioned-unresolved-repeat-clock",
  "discussed-open-repeat-clock",
  "mentioned-remains-repeat-clock",
  "discussed-persists-repeat-clock",
  "no-users-repeat-clock",

  "mentioned-repeat-clock",
  "documents-repeat-clock",
  "includes-repeat-clock",
  "discussed-repeat-clock",
  "vulnerable-repeat-clock",
  "bypassed-repeat-clock",
  "see-repeat-clock",
  "identify-repeat-clock",
  "prevents-repeat-clock",
  "avoids-repeat-clock",
  "introduces-plural-repeat-clock",
  "contains-plural-repeat-clock",
  "has-plural-repeat-clock",

  "causes-repeat-clock",
  "exposes-repeat-clock",
  "qualified-fixed-repeat-clock",
  "regression-tests-repeat-clock",
  "not-remain-fixed-repeat-clock",
  "exception-recurred-repeat-clock",
  "regression-test-count-repeat-clock",
  "defect-report-count-repeat-clock",
  "must-fixed-repeat-clock",
  "should-fixed-repeat-clock",
  "fixed-one-repeat-clock",

  "introduces-repeat-clock",
  "creates-repeat-clock",
  "contains-repeat-clock",
  "has-finding-repeat-clock",

  "direct-reappeared-repeat-clock",
  "perfect-reappeared-repeat-clock",
  "recurred-repeat-clock",
  "reopened-repeat-clock",
  "qualified-harmless-repeat-clock",
  "already-fixed-exception-repeat-clock",
  "bare-critical-repeat-clock",
  "bare-authentication-repeat-clock",
  "most-count-repeat-clock",
  "every-count-repeat-clock",
  "numerous-count-repeat-clock",
  "no-exist-repeat-clock",
  "no-remain-repeat-clock",

  "both-count-repeat-clock",
  "many-count-repeat-clock",
  "all-count-repeat-clock",
  "still-bug-repeat-clock",
  "there-still-bug-repeat-clock",
  "have-one-repeat-clock",
  "eliminated-documented-repeat-clock",
  "center-repeat-clock",
  "exception-one-repeat-clock",
  "reappeared-repeat-clock",
  "none-exist-repeat-clock",
  "nominal-this-repeat-clock",
  "nominal-that-repeat-clock",
  "grouped-count-repeat-clock",
  "vulnerability-repeat-clock",
  "coordinated-nouns-repeat-clock",
  "colon-security-repeat-clock",
  "colon-passive-repeat-clock",
  "eliminated-repeat-clock",
  "contextual-unresolved-repeat-clock",
  "plural-persist-repeat-clock",
  "plural-outstanding-repeat-clock",
  "mixed-needed-repeat-clock",
  "got-passive-repeat-clock",
  "documented-meta-repeat-clock",
  "positive-count-zero-colon-repeat-clock",
  "indefinite-present-repeat-clock",
  "indefinite-happens-repeat-clock",
  "indefinite-exists-repeat-clock",
  "ordinary-definition-repeat-clock",
  "zero-after-colon-repeat-clock",
  "colon-count-repeat-clock",
  "emphasized-repeat-clock",
  "type7-indented-repeat-clock",

  "wrapped-numeric-repeat-clock",
  "passive-finding-repeat-clock",
  "abrupt-comment-repeat-clock",
  "abrupt-dash-comment-repeat-clock",
  "tab-list-repeat-clock",
  "footnote-transitive-reference-repeat-clock",
  "footnote-transitive-destination-repeat-clock",
  "unused-footnote-repeat-clock",
  "deep-destination-repeat-clock",
  "allzero-finding-count-repeat-clock",
  "finding-softbreak-repeat-clock",
  "raw-html-numeric-repeat-clock",
  "markdown-numeric-repeat-clock",
  "code-numeric-repeat-clock",
  "finding-blankline-repeat-clock",
  "found-html-no-repeat-clock",
  "found-html-zero-repeat-clock",
  "comment-pipe-clear",
  "inactive-numeric-row-clock",
  "inactive-nbsp-row-clock",
  "inactive-html-row-clock",
  "inactive-optional-pipe-row-clock",
  "inactive-quoted-row-clock",
  "marker-bom-clear",
  "marker-nbsp-clear",
  "zerowidth-trigger-clear",
  "namedzero-trigger-clear",
  "code-heading-space-clear",
  "code-heading-tab-clear",
  "markdown-trigger-clear",
  "entity-trigger-clear",
  "numeric-priority-clear",
  "duplicate-row-clock",
  "hidden-row-clock",
  "markdown-priority-clear",
  "numeric-trigger-clear",
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
    if (["code-heading-space-clear", "code-heading-tab-clear"].includes(mode))
      newer.body = newer.body.replace(
        "## Codex Review Summary",
        (mode === "code-heading-tab-clear" ? "\t" : "    ") +
          "## Codex Review Summary",
      );
    if (mode === "embedded-bom-clear")
      newer.body = newer.body.replace(
        "## Codex Review Summary",
        "\uFEFF    ## Codex Review Summary",
      );
    if (mode === "comment-heading-clear")
      newer.body = newer.body.replace(
        "## Codex Review Summary",
        "<!-- presentation metadata -->    ## Codex Review Summary",
      );
    if (["mediumspace-clear", "hairspace-clear"].includes(mode))
      newer.body = newer.body.replaceAll(
        "Manual request",
        mode === "mediumspace-clear"
          ? "Do&MediumSpace;not&MediumSpace;merge"
          : "Do&hairsp;not&hairsp;merge",
      );
    if (mode === "marker-nbsp-clear")
      newer.body = newer.body.replace(
        /^<!-- codex-pull-request-review-summary/,
        "    \u00A0<!-- codex-pull-request-review-summary",
      );
    if (mode === "marker-bom-clear")
      newer.body = newer.body.replace(
        /^<!-- codex-pull-request-review-summary/,
        "    \uFEFF<!-- codex-pull-request-review-summary",
      );
    if (["zerowidth-trigger-clear", "namedzero-trigger-clear"].includes(mode))
      newer.body = newer.body.replaceAll(
        "Manual request",
        mode === "zerowidth-trigger-clear"
          ? "Do&#8203;not&#8203;merge"
          : "Do&ZeroWidthSpace;not&ZeroWidthSpace;merge",
      );
    if (mode === "malformed-link-clear")
      newer.body = newer.body.replaceAll(
        "Manual request",
        "[safe](P1 blocker)",
      );
    if (
      [
        "title-double-clear",
        "title-single-clear",
        "title-paren-clear",
      ].includes(mode)
    ) {
      const title =
        mode === "title-double-clear"
          ? '\"title\"'
          : mode === "title-single-clear"
            ? "'title'"
            : "(title)";
      newer.body = newer.body.replaceAll(
        "Manual request",
        `Do [not](https://example.com ${title}) merge`,
      );
    }
    if (mode === "escaped-space-clear")
      newer.body = newer.body.replaceAll(
        "Manual request",
        "[safe](P1\\ blocker)",
      );
    if (["space-destination-clear", "empty-destination-clear"].includes(mode))
      newer.body = newer.body.replaceAll(
        "Manual request",
        mode === "space-destination-clear"
          ? "Do [not]( https://example.com ) merge"
          : "Do [not]() merge",
      );
    if (mode === "escaped-opener-clear")
      newer.body = newer.body.replaceAll("Manual request", "\\[safe](P1)");
    if (mode === "escaped-label-closer-clear")
      newer.body = newer.body.replaceAll("Manual request", "[safe\\]( P1)");
    if (mode === "comment-pipe-clear")
      newer.body = newer.body.replaceAll(
        "Manual request",
        "Manual <!-- | --> request",
      );
    if (mode === "nested-link-clear")
      newer.body = newer.body.replaceAll(
        "Manual request",
        "[safe [inner](url)](P1)",
      );
    if (
      [
        "found-article-repeat-clock",
        "found-html-article-repeat-clock",
        "found-word-count-repeat-clock",
        "blank-label-repeat-clock",
        "html-break-repeat-clock",
        "code-priority-repeat-clock",
        "code-warning-repeat-clock",
        "raw-html-link-repeat-clock",
        "quoted-raw-html-repeat-clock",
        "quoted-html-exit-repeat-clock",
        "list-html-exit-repeat-clock",
        "list-raw-html-repeat-clock",
        "mixed-finding-count-repeat-clock",
        "existential-finding-repeat-clock",
        "detected-finding-repeat-clock",
        "detected-article-repeat-clock",
        "reverse-container-repeat-clock",
        "unresolved-count-repeat-clock",
        "used-footnote-repeat-clock",
        "invalid-footnote-label-repeat-clock",
        "invalid-footnote-reference-repeat-clock",
        "footnote-two-space-repeat-clock",
        "footnote-four-space-repeat-clock",
        "used-footnote-four-space-repeat-clock",
        "transitive-footnote-repeat-clock",
        "footnote-destination-repeat-clock",
        "footnote-reference-destination-repeat-clock",
        "footnote-reference-title-repeat-clock",
        "bugfree-repeat-clock",
        "type7-paragraph-repeat-clock",
        "unmatched-underscore-repeat-clock",
        "unmatched-star-repeat-clock",

        "unicode-footnote-repeat-clock",
        "bug-repeat-clock",
        "not-fixed-repeat-clock",
        "not-resolved-repeat-clock",
        "unrelated-negation-repeat-clock",
        "mentioned-repeat-clock",
        "documents-repeat-clock",
        "includes-repeat-clock",
        "discussed-repeat-clock",
        "meta-term-repeat-clock",
        "meta-words-repeat-clock",
        "flaw-repeat-clock",
        "worded-count-repeat-clock",
        "br-finding-repeat-clock",
        "harmless-repeat-clock",
        "benign-repeat-clock",
        "except-fixed-repeat-clock",
        "none-current-repeat-clock",
        "none-were-repeat-clock",
        "may-reappear-repeat-clock",
        "defect-repeat-clock",
        "regression-repeat-clock",
        "qualified-absence-repeat-clock",
        "security-risk-repeat-clock",
        "users-bypass-repeat-clock",
        "adjectival-mention-repeat-clock",
        "adjectival-discussion-repeat-clock",
        "adverb-bypass-repeat-clock",
        "mentioned-is-open-repeat-clock",
        "discussed-is-outstanding-repeat-clock",
        "entity-colon-repeat-clock",
        "nobody-repeat-clock",
        "subjectless-bypass-repeat-clock",
        "qualified-no-repeat-clock",
        "mentioned-fixed-repeat-clock",
        "mentioned-resolved-repeat-clock",
        "mentioned-closed-repeat-clock",

        "incomplete-fix-repeat-clock",
        "able-bypass-repeat-clock",
        "mentioned-unresolved-repeat-clock",
        "discussed-open-repeat-clock",
        "mentioned-remains-repeat-clock",
        "discussed-persists-repeat-clock",
        "no-users-repeat-clock",

        "mentioned-repeat-clock",
        "documents-repeat-clock",
        "includes-repeat-clock",
        "discussed-repeat-clock",
        "vulnerable-repeat-clock",
        "bypassed-repeat-clock",
        "see-repeat-clock",
        "identify-repeat-clock",
        "prevents-repeat-clock",
        "avoids-repeat-clock",
        "introduces-plural-repeat-clock",
        "contains-plural-repeat-clock",
        "has-plural-repeat-clock",

        "causes-repeat-clock",
        "exposes-repeat-clock",
        "qualified-fixed-repeat-clock",
        "regression-tests-repeat-clock",
        "not-remain-fixed-repeat-clock",
        "exception-recurred-repeat-clock",
        "regression-test-count-repeat-clock",
        "defect-report-count-repeat-clock",
        "must-fixed-repeat-clock",
        "should-fixed-repeat-clock",
        "fixed-one-repeat-clock",

        "introduces-repeat-clock",
        "creates-repeat-clock",
        "contains-repeat-clock",
        "has-finding-repeat-clock",

        "direct-reappeared-repeat-clock",
        "perfect-reappeared-repeat-clock",
        "recurred-repeat-clock",
        "reopened-repeat-clock",
        "qualified-harmless-repeat-clock",
        "already-fixed-exception-repeat-clock",
        "bare-critical-repeat-clock",
        "bare-authentication-repeat-clock",
        "most-count-repeat-clock",
        "every-count-repeat-clock",
        "numerous-count-repeat-clock",
        "no-exist-repeat-clock",
        "no-remain-repeat-clock",

        "both-count-repeat-clock",
        "many-count-repeat-clock",
        "all-count-repeat-clock",
        "still-bug-repeat-clock",
        "there-still-bug-repeat-clock",
        "have-one-repeat-clock",
        "eliminated-documented-repeat-clock",
        "center-repeat-clock",
        "exception-one-repeat-clock",
        "reappeared-repeat-clock",
        "none-exist-repeat-clock",
        "nominal-this-repeat-clock",
        "nominal-that-repeat-clock",
        "grouped-count-repeat-clock",
        "vulnerability-repeat-clock",
        "coordinated-nouns-repeat-clock",
        "colon-security-repeat-clock",
        "colon-passive-repeat-clock",
        "eliminated-repeat-clock",
        "contextual-unresolved-repeat-clock",
        "plural-persist-repeat-clock",
        "plural-outstanding-repeat-clock",
        "mixed-needed-repeat-clock",
        "got-passive-repeat-clock",
        "documented-meta-repeat-clock",
        "positive-count-zero-colon-repeat-clock",
        "indefinite-present-repeat-clock",
        "indefinite-happens-repeat-clock",
        "indefinite-exists-repeat-clock",
        "ordinary-definition-repeat-clock",
        "zero-after-colon-repeat-clock",
        "colon-count-repeat-clock",
        "emphasized-repeat-clock",
        "type7-indented-repeat-clock",

        "wrapped-numeric-repeat-clock",
        "passive-finding-repeat-clock",
        "abrupt-comment-repeat-clock",
        "abrupt-dash-comment-repeat-clock",
        "tab-list-repeat-clock",
        "footnote-transitive-reference-repeat-clock",
        "footnote-transitive-destination-repeat-clock",
        "unused-footnote-repeat-clock",
        "deep-destination-repeat-clock",
        "allzero-finding-count-repeat-clock",
        "finding-softbreak-repeat-clock",
        "raw-html-numeric-repeat-clock",
        "markdown-numeric-repeat-clock",
        "code-numeric-repeat-clock",
        "finding-blankline-repeat-clock",
        "found-html-no-repeat-clock",
        "found-html-zero-repeat-clock",
      ].includes(mode)
    ) {
      old.body +=
        mode === "meta-term-repeat-clock"
          ? "\n" +
            helpFooter.replace(
              "</details>",
              "This term security issue was recorded in the glossary.</details>",
            )
          : mode === "meta-words-repeat-clock"
            ? "\n" +
              helpFooter.replace(
                "</details>",
                "These words security issues were documented below.</details>",
              )
            : mode === "flaw-repeat-clock"
              ? "\n" +
                helpFooter.replace(
                  "</details>",
                  "A security flaw was found.</details>",
                )
              : mode === "worded-count-repeat-clock"
                ? "\n" +
                  helpFooter.replace(
                    "</details>",
                    "Two security issues were found.</details>",
                  )
                : mode === "br-finding-repeat-clock"
                  ? "\n" +
                    helpFooter.replace(
                      "</details>",
                      "A security issue<br>was found.</details>",
                    )
                  : mode === "harmless-repeat-clock"
                    ? "\n" +
                      helpFooter.replace(
                        "</details>",
                        "The issue is harmless.</details>",
                      )
                    : mode === "benign-repeat-clock"
                      ? "\n" +
                        helpFooter.replace(
                          "</details>",
                          "The issue is benign.</details>",
                        )
                      : mode === "except-fixed-repeat-clock"
                        ? "\n" +
                          helpFooter.replace(
                            "</details>",
                            "No issues or findings were found—except one, which was fixed.</details>",
                          )
                        : mode === "none-current-repeat-clock"
                          ? "\n" +
                            helpFooter.replace(
                              "</details>",
                              "Security issue: none currently exist.</details>",
                            )
                          : mode === "none-were-repeat-clock"
                            ? "\n" +
                              helpFooter.replace(
                                "</details>",
                                "Security issue: none were found.</details>",
                              )
                            : [
                                  "may-reappear-repeat-clock",
                                  "defect-repeat-clock",
                                  "regression-repeat-clock",
                                  "qualified-absence-repeat-clock",
                                  "security-risk-repeat-clock",
                                  "users-bypass-repeat-clock",
                                  "adjectival-mention-repeat-clock",
                                  "adjectival-discussion-repeat-clock",
                                  "adverb-bypass-repeat-clock",
                                  "mentioned-is-open-repeat-clock",
                                  "discussed-is-outstanding-repeat-clock",
                                  "entity-colon-repeat-clock",
                                  "nobody-repeat-clock",
                                  "subjectless-bypass-repeat-clock",
                                  "qualified-no-repeat-clock",
                                  "mentioned-fixed-repeat-clock",
                                  "mentioned-resolved-repeat-clock",
                                  "mentioned-closed-repeat-clock",

                                  "incomplete-fix-repeat-clock",
                                  "able-bypass-repeat-clock",
                                  "mentioned-unresolved-repeat-clock",
                                  "discussed-open-repeat-clock",
                                  "mentioned-remains-repeat-clock",
                                  "discussed-persists-repeat-clock",
                                  "no-users-repeat-clock",

                                  "mentioned-repeat-clock",
                                  "documents-repeat-clock",
                                  "includes-repeat-clock",
                                  "discussed-repeat-clock",
                                  "vulnerable-repeat-clock",
                                  "bypassed-repeat-clock",
                                  "see-repeat-clock",
                                  "identify-repeat-clock",
                                  "prevents-repeat-clock",
                                  "avoids-repeat-clock",
                                  "introduces-plural-repeat-clock",
                                  "contains-plural-repeat-clock",
                                  "has-plural-repeat-clock",

                                  "causes-repeat-clock",
                                  "exposes-repeat-clock",
                                  "qualified-fixed-repeat-clock",
                                  "regression-tests-repeat-clock",
                                  "not-remain-fixed-repeat-clock",
                                  "exception-recurred-repeat-clock",
                                  "regression-test-count-repeat-clock",
                                  "defect-report-count-repeat-clock",
                                  "must-fixed-repeat-clock",
                                  "should-fixed-repeat-clock",
                                  "fixed-one-repeat-clock",

                                  "introduces-repeat-clock",
                                  "creates-repeat-clock",
                                  "contains-repeat-clock",
                                  "has-finding-repeat-clock",

                                  "direct-reappeared-repeat-clock",
                                  "perfect-reappeared-repeat-clock",
                                  "recurred-repeat-clock",
                                  "reopened-repeat-clock",
                                  "qualified-harmless-repeat-clock",
                                  "already-fixed-exception-repeat-clock",
                                  "bare-critical-repeat-clock",
                                  "bare-authentication-repeat-clock",
                                  "most-count-repeat-clock",
                                  "every-count-repeat-clock",
                                  "numerous-count-repeat-clock",
                                  "no-exist-repeat-clock",
                                  "no-remain-repeat-clock",
                                ].includes(mode)
                              ? "\n" +
                                helpFooter.replace(
                                  "</details>",
                                  ({
                                    "introduces-repeat-clock":
                                      "This change introduces a bug.",
                                    "creates-repeat-clock":
                                      "This change creates a bug.",
                                    "contains-repeat-clock":
                                      "This change contains a bug.",
                                    "has-finding-repeat-clock":
                                      "This change has a bug.",
                                    "causes-repeat-clock":
                                      "This change causes a regression.",
                                    "exposes-repeat-clock":
                                      "This patch exposes a vulnerability.",
                                    "prevents-repeat-clock":
                                      "This patch prevents a vulnerability.",
                                    "avoids-repeat-clock":
                                      "This change avoids a regression.",
                                    "introduces-plural-repeat-clock":
                                      "This change introduces multiple bugs.",
                                    "contains-plural-repeat-clock":
                                      "This change contains some issues.",
                                    "has-plural-repeat-clock":
                                      "This change has several regressions.",
                                    "see-repeat-clock": "I see a bug.",
                                    "identify-repeat-clock":
                                      "We identify an issue.",
                                    "vulnerable-repeat-clock":
                                      "The application is vulnerable to SQL injection.",
                                    "bypassed-repeat-clock":
                                      "Authentication can be bypassed.",
                                    "users-bypass-repeat-clock":
                                      "Users can bypass authentication.",
                                    "adjectival-mention-repeat-clock":
                                      "The mentioned vulnerability allows code execution.",
                                    "adjectival-discussion-repeat-clock":
                                      "The discussed vulnerability is exploitable.",
                                    "adverb-bypass-repeat-clock":
                                      "Users can trivially bypass authentication.",
                                    "mentioned-is-open-repeat-clock":
                                      "The review mentioned a bug that is open.",
                                    "discussed-is-outstanding-repeat-clock":
                                      "We discussed a vulnerability that is outstanding.",
                                    "entity-colon-repeat-clock":
                                      "Security issue&colon; remains unresolved.",
                                    "nobody-repeat-clock":
                                      "Nobody can bypass authentication.",
                                    "subjectless-bypass-repeat-clock":
                                      "Can bypass authentication without credentials.",
                                    "qualified-no-repeat-clock":
                                      "No unauthenticated users can bypass authentication.",
                                    "mentioned-fixed-repeat-clock":
                                      "The review mentioned a bug that remains fixed.",
                                    "mentioned-resolved-repeat-clock":
                                      "The review mentioned a bug that remains resolved.",
                                    "mentioned-closed-repeat-clock":
                                      "The review mentioned a bug that remains closed.",
                                    "incomplete-fix-repeat-clock":
                                      "One bug fix remains incomplete.",
                                    "able-bypass-repeat-clock":
                                      "Users are able to bypass authentication.",
                                    "mentioned-unresolved-repeat-clock":
                                      "The review mentioned a bug that remains unresolved.",
                                    "discussed-open-repeat-clock":
                                      "We discussed a bug that remains open.",
                                    "mentioned-remains-repeat-clock":
                                      "The review mentioned a bug that remains.",
                                    "discussed-persists-repeat-clock":
                                      "We discussed a bug that persists.",
                                    "no-users-repeat-clock":
                                      "No users can bypass authentication.",
                                    "mentioned-repeat-clock":
                                      "The review mentioned a bug fix.",
                                    "documents-repeat-clock":
                                      "This patch documents a bug fix.",
                                    "includes-repeat-clock":
                                      "This release includes a bug fix.",
                                    "discussed-repeat-clock":
                                      "We discussed a bug.",
                                    "security-risk-repeat-clock":
                                      "A security risk remains.",
                                    "qualified-absence-repeat-clock":
                                      "The security issue does not exist locally but remains in production.",
                                    "qualified-fixed-repeat-clock":
                                      "A security issue is already fixed in tests but exploitable in production.",
                                    "regression-tests-repeat-clock":
                                      "Regression tests passed.",
                                    "not-remain-fixed-repeat-clock":
                                      "The issue does not remain fixed.",
                                    "exception-recurred-repeat-clock":
                                      "No issues were found except one already fixed that has reappeared.",
                                    "regression-test-count-repeat-clock":
                                      "One regression test passed.",
                                    "defect-report-count-repeat-clock":
                                      "One defect report was closed.",
                                    "must-fixed-repeat-clock":
                                      "A bug must be fixed.",
                                    "should-fixed-repeat-clock":
                                      "A bug should be fixed.",
                                    "fixed-one-repeat-clock":
                                      "Fixed one issue.",
                                    "direct-reappeared-repeat-clock":
                                      "An eliminated issue reappeared.",
                                    "perfect-reappeared-repeat-clock":
                                      "An eliminated issue has reappeared.",
                                    "recurred-repeat-clock":
                                      "A fixed bug recurred.",
                                    "reopened-repeat-clock":
                                      "A resolved issue reopened.",
                                    "qualified-harmless-repeat-clock":
                                      "The security issue is harmless in tests but exploitable in production.",
                                    "already-fixed-exception-repeat-clock":
                                      "No issues were found except one already fixed.",
                                    "bare-critical-repeat-clock":
                                      "Critical security issue remains.",
                                    "bare-authentication-repeat-clock":
                                      "Authentication vulnerability exists.",
                                    "most-count-repeat-clock":
                                      "Most issues remain.",
                                    "every-count-repeat-clock":
                                      "Every issue remains.",
                                    "numerous-count-repeat-clock":
                                      "Numerous issues remain.",
                                    "no-exist-repeat-clock":
                                      "Issues do not exist.",
                                    "no-remain-repeat-clock":
                                      "Bugs do not remain.",
                                  }[mode] ??
                                    (mode === "defect-repeat-clock"
                                      ? "A defect remains."
                                      : mode === "regression-repeat-clock"
                                        ? "A regression remains."
                                        : "An eliminated issue may reappear.")) +
                                    "</details>",
                                )
                              : mode === "both-count-repeat-clock"
                                ? "\n" +
                                  helpFooter.replace(
                                    "</details>",
                                    "Both issues remain.</details>",
                                  )
                                : mode === "many-count-repeat-clock"
                                  ? "\n" +
                                    helpFooter.replace(
                                      "</details>",
                                      "Many issues remain.</details>",
                                    )
                                  : mode === "all-count-repeat-clock"
                                    ? "\n" +
                                      helpFooter.replace(
                                        "</details>",
                                        "All issues remain unresolved.</details>",
                                      )
                                    : mode === "still-bug-repeat-clock"
                                      ? "\n" +
                                        helpFooter.replace(
                                          "</details>",
                                          "The bug still exists.</details>",
                                        )
                                      : mode === "there-still-bug-repeat-clock"
                                        ? "\n" +
                                          helpFooter.replace(
                                            "</details>",
                                            "There still is a bug.</details>",
                                          )
                                        : mode === "have-one-repeat-clock"
                                          ? "\n" +
                                            helpFooter.replace(
                                              "</details>",
                                              "We have one security issue.</details>",
                                            )
                                          : mode ===
                                              "eliminated-documented-repeat-clock"
                                            ? "\n" +
                                              helpFooter.replace(
                                                "</details>",
                                                "An eliminated issue was documented.</details>",
                                              )
                                            : mode === "center-repeat-clock"
                                              ? "\n" +
                                                helpFooter.replace(
                                                  "</details>",
                                                  "No<center>An issue remains</center></details>",
                                                )
                                              : mode ===
                                                  "exception-one-repeat-clock"
                                                ? "\n" +
                                                  helpFooter.replace(
                                                    "</details>",
                                                    "No issues or findings were found—except one.</details>",
                                                  )
                                                : mode ===
                                                    "reappeared-repeat-clock"
                                                  ? "\n" +
                                                    helpFooter.replace(
                                                      "</details>",
                                                      "An eliminated issue was found again.</details>",
                                                    )
                                                  : mode ===
                                                      "none-exist-repeat-clock"
                                                    ? "\n" +
                                                      helpFooter.replace(
                                                        "</details>",
                                                        "Security issue: none exist.</details>",
                                                      )
                                                    : mode ===
                                                        "nominal-this-repeat-clock"
                                                      ? "\n" +
                                                        helpFooter.replace(
                                                          "</details>",
                                                          "This is an issue.</details>",
                                                        )
                                                      : mode ===
                                                          "nominal-that-repeat-clock"
                                                        ? "\n" +
                                                          helpFooter.replace(
                                                            "</details>",
                                                            "That is a bug.</details>",
                                                          )
                                                        : mode ===
                                                            "raw-html-numeric-repeat-clock"
                                                          ? "\n<div>\nP&#49 blocker\n</div>"
                                                          : mode ===
                                                              "markdown-numeric-repeat-clock"
                                                            ? "\n<span>P&#49</span> blocker"
                                                            : mode ===
                                                                "code-numeric-repeat-clock"
                                                              ? "\n`P&#49` blocker"
                                                              : mode ===
                                                                  "finding-softbreak-repeat-clock"
                                                                ? "\nFound\nan issue."
                                                                : mode ===
                                                                    "finding-blankline-repeat-clock"
                                                                  ? "\nFound\n\nan issue."
                                                                  : mode ===
                                                                      "quoted-raw-html-repeat-clock"
                                                                    ? "\n> <div>\n> [safe](P1)\n> </div>"
                                                                    : mode ===
                                                                        "quoted-html-exit-repeat-clock"
                                                                      ? "\n> <div>\n[safe](P1)"
                                                                      : mode ===
                                                                          "list-html-exit-repeat-clock"
                                                                        ? "\n- <div>\n[safe](P1)"
                                                                        : mode ===
                                                                            "list-raw-html-repeat-clock"
                                                                          ? "\n- <div>\n  [safe](P1)\n  </div>"
                                                                          : mode ===
                                                                              "mixed-finding-count-repeat-clock"
                                                                            ? "\nFound 0 code issues and 1 security issue."
                                                                            : mode ===
                                                                                "existential-finding-repeat-clock"
                                                                              ? "\nThere is an issue."
                                                                              : mode ===
                                                                                  "detected-finding-repeat-clock"
                                                                                ? "\nDetected 1 issue."
                                                                                : mode ===
                                                                                    "detected-article-repeat-clock"
                                                                                  ? "\nDetected an issue."
                                                                                  : mode ===
                                                                                      "reverse-container-repeat-clock"
                                                                                    ? "\n- > <div>\n  > [safe](P1)"
                                                                                    : mode ===
                                                                                        "unresolved-count-repeat-clock"
                                                                                      ? "\n1 unresolved finding."
                                                                                      : mode ===
                                                                                          "used-footnote-repeat-clock"
                                                                                        ? "\nnote[^doc]\n\n[^doc]: P1"
                                                                                        : mode ===
                                                                                            "invalid-footnote-label-repeat-clock"
                                                                                          ? "\n[^bad label]: P1 blocker"
                                                                                          : mode ===
                                                                                              "invalid-footnote-reference-repeat-clock"
                                                                                            ? "\n[^bad label]: P1"
                                                                                            : mode ===
                                                                                                "footnote-two-space-repeat-clock"
                                                                                              ? "\n[^doc]: safe\n  P1"
                                                                                              : mode ===
                                                                                                  "footnote-four-space-repeat-clock"
                                                                                                ? "\n[^doc]: safe\n    P1"
                                                                                                : mode ===
                                                                                                    "used-footnote-four-space-repeat-clock"
                                                                                                  ? "\nnote[^doc]\n\n[^doc]: safe\n    P1"
                                                                                                  : mode ===
                                                                                                      "transitive-footnote-repeat-clock"
                                                                                                    ? "\nroot[^a]\n\n[^a]: safe [^b]\n[^b]: P1"
                                                                                                    : mode ===
                                                                                                        "footnote-destination-repeat-clock"
                                                                                                      ? "\n[safe](https://example.test/[^note])\n\n[^note]: P1 example"
                                                                                                      : mode ===
                                                                                                          "footnote-reference-destination-repeat-clock"
                                                                                                        ? "\n[safe]: https://example.test/[^note]\n\n[^note]: P1 example"
                                                                                                        : mode ===
                                                                                                            "footnote-reference-title-repeat-clock"
                                                                                                          ? '\n[safe]: /url\n  "title [^note]"\n[^note]: P1'
                                                                                                          : mode ===
                                                                                                              "unicode-footnote-repeat-clock"
                                                                                                            ? "\nnote[^SS]\n\n[^ß]: P1 blocker"
                                                                                                            : mode ===
                                                                                                                "bug-repeat-clock"
                                                                                                              ? "\nThere is a bug."
                                                                                                              : mode ===
                                                                                                                  "not-fixed-repeat-clock"
                                                                                                                ? "\n1 bug is not fixed"
                                                                                                                : mode ===
                                                                                                                    "not-resolved-repeat-clock"
                                                                                                                  ? "\nThere is an issue that was not resolved"
                                                                                                                  : mode ===
                                                                                                                      "unrelated-negation-repeat-clock"
                                                                                                                    ? "\nThis is not safe because there is a bug."
                                                                                                                    : mode ===
                                                                                                                        "grouped-count-repeat-clock"
                                                                                                                      ? "\nFound 1,000 issues."
                                                                                                                      : mode ===
                                                                                                                          "vulnerability-repeat-clock"
                                                                                                                        ? "\n" +
                                                                                                                          helpFooter.replace(
                                                                                                                            "</details>",
                                                                                                                            "A vulnerability was detected.</details>",
                                                                                                                          )
                                                                                                                        : mode ===
                                                                                                                            "coordinated-nouns-repeat-clock"
                                                                                                                          ? "\n" +
                                                                                                                            helpFooter.replace(
                                                                                                                              "</details>",
                                                                                                                              "No issues or findings were found.</details>",
                                                                                                                            )
                                                                                                                          : mode ===
                                                                                                                              "colon-security-repeat-clock"
                                                                                                                            ? "\n" +
                                                                                                                              helpFooter.replace(
                                                                                                                                "</details>",
                                                                                                                                "Security issue: authentication bypass.</details>",
                                                                                                                              )
                                                                                                                            : mode ===
                                                                                                                                "colon-passive-repeat-clock"
                                                                                                                              ? "\n" +
                                                                                                                                helpFooter.replace(
                                                                                                                                  "</details>",
                                                                                                                                  "A security issue: was flagged.</details>",
                                                                                                                                )
                                                                                                                              : mode ===
                                                                                                                                  "eliminated-repeat-clock"
                                                                                                                                ? "\n" +
                                                                                                                                  helpFooter.replace(
                                                                                                                                    "</details>",
                                                                                                                                    "A security issue got eliminated.</details>",
                                                                                                                                  )
                                                                                                                                : mode ===
                                                                                                                                    "contextual-unresolved-repeat-clock"
                                                                                                                                  ? "\n" +
                                                                                                                                    helpFooter.replace(
                                                                                                                                      "</details>",
                                                                                                                                      "This issue is not resolved.</details>",
                                                                                                                                    )
                                                                                                                                  : mode ===
                                                                                                                                      "plural-persist-repeat-clock"
                                                                                                                                    ? "\n" +
                                                                                                                                      helpFooter.replace(
                                                                                                                                        "</details>",
                                                                                                                                        "Issues persist.</details>",
                                                                                                                                      )
                                                                                                                                    : mode ===
                                                                                                                                        "plural-outstanding-repeat-clock"
                                                                                                                                      ? "\n" +
                                                                                                                                        helpFooter.replace(
                                                                                                                                          "</details>",
                                                                                                                                          "Findings are outstanding.</details>",
                                                                                                                                        )
                                                                                                                                      : mode ===
                                                                                                                                          "mixed-needed-repeat-clock"
                                                                                                                                        ? "\n" +
                                                                                                                                          helpFooter.replace(
                                                                                                                                            "</details>",
                                                                                                                                            "No code changes were needed and one security issue remains.</details>",
                                                                                                                                          )
                                                                                                                                        : mode ===
                                                                                                                                            "got-passive-repeat-clock"
                                                                                                                                          ? "\nA security issue got flagged."
                                                                                                                                          : mode ===
                                                                                                                                              "documented-meta-repeat-clock"
                                                                                                                                            ? "\nThe words security issues are documented below."
                                                                                                                                            : mode ===
                                                                                                                                                "positive-count-zero-colon-repeat-clock"
                                                                                                                                              ? "\n1 issue: zero"
                                                                                                                                              : mode ===
                                                                                                                                                  "indefinite-present-repeat-clock"
                                                                                                                                                ? "\n" +
                                                                                                                                                  helpFooter.replace(
                                                                                                                                                    "</details>",
                                                                                                                                                    "A bug is present.\n</details>",
                                                                                                                                                  )
                                                                                                                                                : mode ===
                                                                                                                                                    "indefinite-happens-repeat-clock"
                                                                                                                                                  ? "\n" +
                                                                                                                                                    helpFooter.replace(
                                                                                                                                                      "</details>",
                                                                                                                                                      "A bug happens.\n</details>",
                                                                                                                                                    )
                                                                                                                                                  : mode ===
                                                                                                                                                      "indefinite-exists-repeat-clock"
                                                                                                                                                    ? "\n" +
                                                                                                                                                      helpFooter.replace(
                                                                                                                                                        "</details>",
                                                                                                                                                        "An issue exists.\n</details>",
                                                                                                                                                      )
                                                                                                                                                    : mode ===
                                                                                                                                                        "ordinary-definition-repeat-clock"
                                                                                                                                                      ? "\n\n[safe]: P1"
                                                                                                                                                      : mode ===
                                                                                                                                                          "zero-after-colon-repeat-clock"
                                                                                                                                                        ? "\nFound issues: zero. Issues found: zero."
                                                                                                                                                        : mode ===
                                                                                                                                                            "colon-count-repeat-clock"
                                                                                                                                                          ? "\nNo code issues: 1 security issue found"
                                                                                                                                                          : mode ===
                                                                                                                                                              "emphasized-repeat-clock"
                                                                                                                                                            ? "\nThe word issues is emphasized."
                                                                                                                                                            : mode ===
                                                                                                                                                                "type7-indented-repeat-clock"
                                                                                                                                                              ? "\n\n    example\n<span>\n[safe](P1)\n</span>"
                                                                                                                                                              : mode ===
                                                                                                                                                                  "wrapped-numeric-repeat-clock"
                                                                                                                                                                ? "\n<div>\nFound **1** issue\n</div>"
                                                                                                                                                                : mode ===
                                                                                                                                                                    "passive-finding-repeat-clock"
                                                                                                                                                                  ? "\nAn issue was detected."
                                                                                                                                                                  : mode ===
                                                                                                                                                                      "bugfree-repeat-clock"
                                                                                                                                                                    ? "\nThis is a bug-free change"
                                                                                                                                                                    : mode ===
                                                                                                                                                                        "type7-paragraph-repeat-clock"
                                                                                                                                                                      ? "\nparagraph\n<span>\n[safe](P1)"
                                                                                                                                                                      : mode ===
                                                                                                                                                                          "unmatched-underscore-repeat-clock"
                                                                                                                                                                        ? "\nP_1 is not a priority token"
                                                                                                                                                                        : mode ===
                                                                                                                                                                            "unmatched-star-repeat-clock"
                                                                                                                                                                          ? "\nP*1"
                                                                                                                                                                          : mode ===
                                                                                                                                                                              "abrupt-comment-repeat-clock"
                                                                                                                                                                            ? "\n<!-->P1 blocker"
                                                                                                                                                                            : mode ===
                                                                                                                                                                                "abrupt-dash-comment-repeat-clock"
                                                                                                                                                                              ? "\n<!--->P1 blocker"
                                                                                                                                                                              : mode ===
                                                                                                                                                                                  "tab-list-repeat-clock"
                                                                                                                                                                                ? "\n-  <div>\n \t[safe](P1)\n   </div>"
                                                                                                                                                                                : mode ===
                                                                                                                                                                                    "footnote-transitive-reference-repeat-clock"
                                                                                                                                                                                  ? "\nroot[^a]\n\n[^a]: safe\n  [safe]: https://example.test/[^note]\n[^note]: P1 example"
                                                                                                                                                                                  : mode ===
                                                                                                                                                                                      "footnote-transitive-destination-repeat-clock"
                                                                                                                                                                                    ? "\nroot[^a]\n\n[^a]: [safe](https://example.test/[^note])\n[^note]: P1 example"
                                                                                                                                                                                    : mode ===
                                                                                                                                                                                        "unused-footnote-repeat-clock"
                                                                                                                                                                                      ? "\n[^doc]: P1"
                                                                                                                                                                                      : mode ===
                                                                                                                                                                                          "deep-destination-repeat-clock"
                                                                                                                                                                                        ? "\n[safe](" +
                                                                                                                                                                                          "(".repeat(
                                                                                                                                                                                            33,
                                                                                                                                                                                          ) +
                                                                                                                                                                                          "P1" +
                                                                                                                                                                                          ")".repeat(
                                                                                                                                                                                            33,
                                                                                                                                                                                          ) +
                                                                                                                                                                                          ")"
                                                                                                                                                                                        : mode ===
                                                                                                                                                                                            "allzero-finding-count-repeat-clock"
                                                                                                                                                                                          ? "\nFound 0 code issues and 0 security issues."
                                                                                                                                                                                          : mode ===
                                                                                                                                                                                              "raw-html-link-repeat-clock"
                                                                                                                                                                                            ? "\n<div>\n[safe](P1)\n</div>"
                                                                                                                                                                                            : mode ===
                                                                                                                                                                                                "found-html-no-repeat-clock"
                                                                                                                                                                                              ? "\nFound <em>no</em> issues"
                                                                                                                                                                                              : mode ===
                                                                                                                                                                                                  "found-html-zero-repeat-clock"
                                                                                                                                                                                                ? "\nFound <code>0</code> issues"
                                                                                                                                                                                                : mode ===
                                                                                                                                                                                                    "html-break-repeat-clock"
                                                                                                                                                                                                  ? "\nDo<br>not<br>merge"
                                                                                                                                                                                                  : mode ===
                                                                                                                                                                                                      "code-priority-repeat-clock"
                                                                                                                                                                                                    ? "\nP`1`"
                                                                                                                                                                                                    : mode ===
                                                                                                                                                                                                        "code-warning-repeat-clock"
                                                                                                                                                                                                      ? "\nDo `not` merge"
                                                                                                                                                                                                      : mode ===
                                                                                                                                                                                                          "blank-label-repeat-clock"
                                                                                                                                                                                                        ? "\n[safe\n\nlabel](P1)"
                                                                                                                                                                                                        : mode ===
                                                                                                                                                                                                            "found-word-count-repeat-clock"
                                                                                                                                                                                                          ? "\nFound one issue"
                                                                                                                                                                                                          : mode ===
                                                                                                                                                                                                              "found-html-article-repeat-clock"
                                                                                                                                                                                                            ? "\nFound <em>an</em> issue"
                                                                                                                                                                                                            : "\nFound an issue";
      old.updated_at = "2026-10-20T12:05:00Z";
      request.created_at = "2026-10-20T12:06:00Z";
      receipt.created_at = "2026-10-20T12:07:00Z";
    }
    if (mode === "balanced-link-clear")
      newer.body = newer.body.replaceAll(
        "Manual request",
        "Do [not](https://example.com/(x)) merge",
      );
    if (
      [
        "inactive-numeric-row-clock",
        "inactive-nbsp-row-clock",
        "inactive-html-row-clock",
        "inactive-optional-pipe-row-clock",
        "inactive-quoted-row-clock",
      ].includes(mode)
    ) {
      const codeBody = (negative, time) =>
        cleanStateBody(head, (state) => ({
          ...state,
          code_review: {
            ...state.code_review,
            has_any_findings: negative,
            has_unresolved_findings: negative,
          },
        })).replaceAll("2026-10-20T12:02:00Z", time);
      const label =
        mode === "inactive-numeric-row-clock"
          ? "Security&#32;Review"
          : mode === "inactive-nbsp-row-clock"
            ? "Security&nbsp;Review"
            : mode === "inactive-html-row-clock"
              ? "Security<em> Review</em>"
              : mode === "inactive-quoted-row-clock"
                ? "Security&#32;Review"
                : "Security Review";
      old.body =
        codeBody(true, "2026-10-20T12:01:00Z") +
        `\n| 🔒 **${label}** | ✅ **Completed** <relative-time datetime="2026-10-20T12:01:00Z">2026-10-20T12:01:00Z</relative-time> | \`${head.slice(0, 7)}\` | Manual request |`;
      if (mode === "inactive-optional-pipe-row-clock")
        old.body = old.body.replace("\n| 🔒", "\n🔒");
      if (mode === "inactive-quoted-row-clock")
        old.body = old.body.replace(
          /\n(\| 🔒[^\n]+)$/,
          "\n<details><summary>ℹ️ About Codex in GitHub</summary>\n> $1\n</details>",
        );
      old.updated_at = "2026-10-20T12:05:00Z";
      newer.body = codeBody(false, "2026-10-20T12:02:00Z");
      newer.created_at = "2026-10-20T12:02:00Z";
      request.created_at = "2026-10-20T12:06:00Z";
      receipt.created_at = "2026-10-20T12:07:00Z";
    }
    if (mode === "variation-priority-clear")
      newer.body = newer.body.replaceAll("Manual request", "P\uFE0F1 blocker");
    if (mode === "zerowidth-priority-clear")
      newer.body = newer.body.replaceAll("Manual request", "P&#8203;1 blocker");
    if (mode === "multiline-comment-clear")
      newer.body = newer.body.replace(
        'datetime="2026-10-20T12:05:00Z"',
        'datetime="2026-10-20T12:<!-- metadata\n-->05:00Z"',
      );
    if (mode === "markdown-trigger-clear")
      newer.body = newer.body.replaceAll("Manual request", "Do **not** merge");
    if (["duplicate-row-clock", "hidden-row-clock"].includes(mode)) {
      old.updated_at = "2026-10-20T12:05:00Z";
      request.created_at = "2026-10-20T12:06:00Z";
      receipt.created_at = "2026-10-20T12:07:00Z";
      newer.created_at = "2026-10-20T12:03:00Z";
      newer.body = securityHistoryBody(false, "2026-10-20T12:03:00Z");
      if (mode === "duplicate-row-clock")
        old.body +=
          "\n " + old.body.split("\n").find((line) => line.startsWith("| 🔒"));
      else old.body = old.body.replace(/^(\| 🔒[^\n]+)$/m, "<!--\n$1\n-->");
    }
    if (mode === "numeric-priority-clear")
      newer.body = newer.body.replaceAll("Manual request", "P&#49; blocker");
    if (mode === "markdown-priority-clear")
      newer.body = newer.body.replaceAll("Manual request", "P*1* blocker");
    if (mode === "numeric-trigger-clear")
      newer.body = newer.body.replaceAll(
        "Manual request",
        "Do&#32;not&#32;merge",
      );
    if (mode === "entity-trigger-clear")
      newer.body = newer.body.replaceAll("Manual request", "Do not&nbsp;merge");
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
        "embedded-bom-clear",
        "comment-heading-clear",
        "mediumspace-clear",
        "hairspace-clear",
        "multiline-comment-clear",
        "zerowidth-priority-clear",
        "variation-priority-clear",
        "balanced-link-clear",
        "malformed-link-clear",
        "title-double-clear",
        "title-single-clear",
        "title-paren-clear",
        "escaped-space-clear",
        "space-destination-clear",
        "empty-destination-clear",
        "escaped-opener-clear",
        "escaped-label-closer-clear",
        "nested-link-clear",
        "found-article-repeat-clock",
        "found-html-article-repeat-clock",
        "found-word-count-repeat-clock",
        "blank-label-repeat-clock",
        "html-break-repeat-clock",
        "code-priority-repeat-clock",
        "code-warning-repeat-clock",
        "raw-html-link-repeat-clock",
        "quoted-raw-html-repeat-clock",
        "quoted-html-exit-repeat-clock",
        "list-html-exit-repeat-clock",
        "list-raw-html-repeat-clock",
        "mixed-finding-count-repeat-clock",
        "existential-finding-repeat-clock",
        "detected-finding-repeat-clock",
        "detected-article-repeat-clock",
        "reverse-container-repeat-clock",
        "unresolved-count-repeat-clock",
        "used-footnote-repeat-clock",
        "invalid-footnote-label-repeat-clock",
        "invalid-footnote-reference-repeat-clock",
        "footnote-two-space-repeat-clock",
        "footnote-four-space-repeat-clock",
        "used-footnote-four-space-repeat-clock",
        "transitive-footnote-repeat-clock",
        "footnote-destination-repeat-clock",
        "footnote-reference-destination-repeat-clock",
        "footnote-reference-title-repeat-clock",
        "bugfree-repeat-clock",
        "type7-paragraph-repeat-clock",
        "unmatched-underscore-repeat-clock",
        "unmatched-star-repeat-clock",

        "unicode-footnote-repeat-clock",
        "bug-repeat-clock",
        "not-fixed-repeat-clock",
        "not-resolved-repeat-clock",
        "unrelated-negation-repeat-clock",
        "meta-term-repeat-clock",
        "meta-words-repeat-clock",
        "flaw-repeat-clock",
        "worded-count-repeat-clock",
        "br-finding-repeat-clock",
        "harmless-repeat-clock",
        "benign-repeat-clock",
        "except-fixed-repeat-clock",
        "none-current-repeat-clock",
        "none-were-repeat-clock",
        "may-reappear-repeat-clock",
        "defect-repeat-clock",
        "regression-repeat-clock",
        "qualified-absence-repeat-clock",
        "security-risk-repeat-clock",
        "users-bypass-repeat-clock",
        "adjectival-mention-repeat-clock",
        "adjectival-discussion-repeat-clock",
        "adverb-bypass-repeat-clock",
        "mentioned-is-open-repeat-clock",
        "discussed-is-outstanding-repeat-clock",
        "entity-colon-repeat-clock",
        "nobody-repeat-clock",
        "subjectless-bypass-repeat-clock",
        "qualified-no-repeat-clock",
        "mentioned-fixed-repeat-clock",
        "mentioned-resolved-repeat-clock",
        "mentioned-closed-repeat-clock",

        "incomplete-fix-repeat-clock",
        "able-bypass-repeat-clock",
        "mentioned-unresolved-repeat-clock",
        "discussed-open-repeat-clock",
        "mentioned-remains-repeat-clock",
        "discussed-persists-repeat-clock",
        "no-users-repeat-clock",

        "mentioned-repeat-clock",
        "documents-repeat-clock",
        "includes-repeat-clock",
        "discussed-repeat-clock",
        "vulnerable-repeat-clock",
        "bypassed-repeat-clock",
        "see-repeat-clock",
        "identify-repeat-clock",
        "prevents-repeat-clock",
        "avoids-repeat-clock",
        "introduces-plural-repeat-clock",
        "contains-plural-repeat-clock",
        "has-plural-repeat-clock",

        "causes-repeat-clock",
        "exposes-repeat-clock",
        "qualified-fixed-repeat-clock",
        "regression-tests-repeat-clock",
        "not-remain-fixed-repeat-clock",
        "exception-recurred-repeat-clock",
        "regression-test-count-repeat-clock",
        "defect-report-count-repeat-clock",
        "must-fixed-repeat-clock",
        "should-fixed-repeat-clock",
        "fixed-one-repeat-clock",

        "introduces-repeat-clock",
        "creates-repeat-clock",
        "contains-repeat-clock",
        "has-finding-repeat-clock",

        "direct-reappeared-repeat-clock",
        "perfect-reappeared-repeat-clock",
        "recurred-repeat-clock",
        "reopened-repeat-clock",
        "qualified-harmless-repeat-clock",
        "already-fixed-exception-repeat-clock",
        "bare-critical-repeat-clock",
        "bare-authentication-repeat-clock",
        "most-count-repeat-clock",
        "every-count-repeat-clock",
        "numerous-count-repeat-clock",
        "no-exist-repeat-clock",
        "no-remain-repeat-clock",

        "both-count-repeat-clock",
        "many-count-repeat-clock",
        "all-count-repeat-clock",
        "still-bug-repeat-clock",
        "there-still-bug-repeat-clock",
        "have-one-repeat-clock",
        "eliminated-documented-repeat-clock",
        "center-repeat-clock",
        "exception-one-repeat-clock",
        "reappeared-repeat-clock",
        "none-exist-repeat-clock",
        "nominal-this-repeat-clock",
        "nominal-that-repeat-clock",
        "grouped-count-repeat-clock",
        "vulnerability-repeat-clock",
        "coordinated-nouns-repeat-clock",
        "colon-security-repeat-clock",
        "colon-passive-repeat-clock",
        "eliminated-repeat-clock",
        "contextual-unresolved-repeat-clock",
        "plural-persist-repeat-clock",
        "plural-outstanding-repeat-clock",
        "mixed-needed-repeat-clock",
        "got-passive-repeat-clock",
        "documented-meta-repeat-clock",
        "positive-count-zero-colon-repeat-clock",
        "indefinite-present-repeat-clock",
        "indefinite-happens-repeat-clock",
        "indefinite-exists-repeat-clock",
        "ordinary-definition-repeat-clock",
        "zero-after-colon-repeat-clock",
        "colon-count-repeat-clock",
        "emphasized-repeat-clock",
        "type7-indented-repeat-clock",

        "wrapped-numeric-repeat-clock",
        "passive-finding-repeat-clock",
        "abrupt-comment-repeat-clock",
        "abrupt-dash-comment-repeat-clock",
        "tab-list-repeat-clock",
        "footnote-transitive-reference-repeat-clock",
        "footnote-transitive-destination-repeat-clock",
        "unused-footnote-repeat-clock",
        "deep-destination-repeat-clock",
        "allzero-finding-count-repeat-clock",
        "finding-softbreak-repeat-clock",
        "raw-html-numeric-repeat-clock",
        "markdown-numeric-repeat-clock",
        "code-numeric-repeat-clock",
        "finding-blankline-repeat-clock",
        "found-html-no-repeat-clock",
        "found-html-zero-repeat-clock",
        "comment-pipe-clear",
        "inactive-numeric-row-clock",
        "inactive-nbsp-row-clock",
        "inactive-html-row-clock",
        "inactive-optional-pipe-row-clock",
        "inactive-quoted-row-clock",
        "marker-bom-clear",
        "marker-nbsp-clear",
        "zerowidth-trigger-clear",
        "namedzero-trigger-clear",
        "code-heading-space-clear",
        "code-heading-tab-clear",
        "markdown-trigger-clear",
        "entity-trigger-clear",
        "numeric-priority-clear",
        "duplicate-row-clock",
        "hidden-row-clock",
        "markdown-priority-clear",
        "numeric-trigger-clear",
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
    // Only canonical or genuinely absent/untrusted historical evidence can
    // retain completion authority. Every unknown presentation case stays closed.
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
  "tied-unresolved-observation",
  "older-unresolved-observation",
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
      ...([
        "tied-unresolved-observation",
        "older-unresolved-observation",
        "newer-unresolved-observation",
      ].includes(mode)
        ? [
            {
              ...newerUnresolved,
              created_at:
                mode === "older-unresolved-observation"
                  ? "2026-10-20T12:01:00Z"
                  : newerUnresolved.created_at,
              updated_at:
                mode === "tied-unresolved-observation"
                  ? resolved.updated_at
                  : mode === "older-unresolved-observation"
                    ? "2026-10-20T12:02:00Z"
                    : newerUnresolved.updated_at,
              body:
                mode === "older-unresolved-observation"
                  ? newerUnresolved.body.replaceAll("12:02:00", "12:01:00")
                  : newerUnresolved.body,
            },
          ]
        : []),
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
      ["fresh-code", "older-unresolved-observation"].includes(mode),
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

test("unknown companion presentation requires fresh canonical evidence for each negative section", () => {
  const body = (code, security, time) =>
    cleanStateBody(head, (state) => ({
      ...state,
      code_review: {
        ...state.code_review,
        has_any_findings: code,
        has_unresolved_findings: code,
      },
      security_review: {
        ...state.code_review,
        has_any_findings: security,
        has_unresolved_findings: security,
      },
    })).replaceAll("2026-10-20T12:02:00Z", time) +
    `\n| 🔒 **Security Review** | ✅ **Completed** <relative-time datetime="${time}">${time}</relative-time> | \`${head.slice(0, 7)}\` | Manual request |`;
  const old = comment(
    body(true, true, "2026-10-20T12:01:00Z").replace(
      /^(\| 🔒[^\n]+)Manual request/gm,
      "$1 P1",
    ),
    {
      id: 940,
      created_at: "2026-10-20T12:01:00Z",
      updated_at: "2026-10-20T12:05:00Z",
    },
  );
  const codeclear = comment(body(false, true, "2026-10-20T12:02:00Z"), {
    id: 942,
    created_at: "2026-10-20T12:02:00Z",
  });
  const securityBody = body(false, false, "2026-10-20T12:06:00Z")
    .replace(
      /"code_review":\{[^}]+\}/,
      '"code_review":{"status":null,"commit_sha":null,"has_any_findings":null,"has_unresolved_findings":null}',
    )
    .replace(/^\| 📝[^\n]+\n/gm, "");
  const securityclear = comment(securityBody, {
    id: 944,
    created_at: "2026-10-20T12:06:00Z",
  });
  const request = {
    ...comment(`@codex review ${head}`, {
      id: 941,
      created_at: "2026-10-20T12:07:00Z",
    }),
    event: "commented",
    user: { login: "kiaquila" },
    author_association: "OWNER",
  };
  const events = [
    { ...activation, created_at: "2026-10-20T12:00:00Z" },
    old,
    codeclear,
    securityclear,
    request,
    comment(presentationReceipt(head, ":rocket:"), {
      id: 943,
      created_at: "2026-10-20T12:08:00Z",
    }),
  ];
  assert.notEqual(runGate({ timeline: events, comments: events }).status, 0);
  const codeFresh = comment(
    cleanStateBody(head).replaceAll(
      "2026-10-20T12:02:00Z",
      "2026-10-20T12:06:30Z",
    ),
    { id: 945, created_at: "2026-10-20T12:06:30Z" },
  );
  const cleared = [...events, codeFresh];
  assert.equal(runGate({ timeline: cleared, comments: cleared }).status, 0);
  const uncleared = cleared.filter((event) => event.id !== 944);
  assert.notEqual(
    runGate({ timeline: uncleared, comments: uncleared }).status,
    0,
  );
});

// Unknown presentation is intentionally opaque, even when apparently benign.
// Only a genuinely later canonical section completion may clear its observation.
for (const warning of [
  "We discussed a security issue, currently exploitable in production.",
  "The issue was resolved, which is good.",
  "<div>Do&nbspnot&nbspmerge</div>",
  "<div>P&shy1</div>",
  "<div>Do&nbspnot&nbspmerge&notin;</div>",
  "Do&nbspnot&nbspmerge",
  "`<div>Do&nbspnot&nbspmerge</div>`",
  "<div><code>Do&nbspnot&nbspmerge</code></div>",
  "<div>Do&amp;nbspnot&amp;nbspmerge</div>",
  "We discussed a security issue that is still open.",
  "We discussed a security issue, which is exploitable in production.",
  "We discussed a security issue,which is exploitable in production.",
  "We mentioned a security issue, that allows authentication bypass.",
  "We discussed a security issue, which is still fixed.",
  "We discussed a security issue, which is not open.",
  "There is a bug, which is not documented.",
  "No code issues were found, a security issue remains.",
  "A code issue was not found, a security issue remains.",
  "We discussed a security issue that is still exploitable in production.",
  "We mentioned a security issue that allows authentication bypass.",
  "We discussed a security issue allowing code execution.",
  "We discussed a security issue yesterday.",
  "We discussed a security issue as an example.",
  "We discussed a security issue that is still fixed.",
  "A security issue is not open.",
  "A security issue is not outstanding.",
  "A security issue is not unresolved.",
  "A security issue is not open locally but remains in production.",
  "We mentioned a security issue that is currently outstanding.",
  "We discussed a security issue that is now still unresolved.",
  "We discussed a security issue that is not still open.",
  "We discussed a security issue that is still not open.",
  "We discussed a security issue that is still resolved.",
  "A security issue was not found.",
  "An authentication problem is not detected.",
  "Some security issues were never reported.",
  "Each security issue has not been flagged.",
  "Security issues are not found.",
  "A security issue does not exist.",
  "A security issue was not fixed.",
  "A security issue is not benign.",
  "A security issue is not harmless.",
  "1 security issue is not documented.",
  "A security issue is still found.",
  "Some security issues were reported.",
  "No code issues: 1 security issue found",
  "No code issues 1 security issue found",
  "Found 0 code issues: 1 security issue found",
  "Found 1 security issue without a workaround.",
  "Found 1 security issue in the fixed login path.",
  "There is a bug that is not documented.",
  "Found no code issues but detected a security issue.",
  "One security issue was identified.",
  "A security issue was flagged.",
  "Raised a security issue.",
  "A security issue was confirmed.",
  "A security bug was reproduced.",
  "A security issue got flagged.",
  "Security issues get reported.",
  "A security issue has gotten detected.",
  "A security issue is being flagged.",
  "This security issue was flagged.",
  "That security bug was reproduced.",
  "These new security issues were detected.",
  "Those authentication problems remain.",
  "Our security issue was flagged.",
  "Each authentication problem was detected.",
  "The security issue was flagged.",
  "This word boundary issue was flagged.",
  "This label validation issue was flagged.",
  "This token security issue was flagged.",
  "This string parsing issue was detected.",
  "Security issue: authentication bypass.",
  "A security issue: was flagged.",
  "Security issue — authentication bypass.",
  "Security issue: no authentication on the endpoint.",
  "Security issue: no workaround is available.",
  "1 security issue did not get resolved.",
  "The word parser has a security issue reported.",
  "The words security issues are documented below.",
  "This term security issue was recorded in the glossary.",
  "These words security issues were documented below.",
  "Our label security issue was recorded.",
  "Each phrase security issue was documented.",
  "The term security issue was reported in the glossary.",
  "The label security issue got recorded.",
  "No security issue got flagged.",
  "A security issue did not get flagged.",
  "A security issue never got detected.",
  "A security issue got resolved.",
  "1 security issue got fixed.",
  "This security issue was fixed.",
  "These security issues were not flagged.",
  "Those issues have been resolved.",
  "Our security issue was resolved.",
  "The security issue was not flagged.",
  "Security issues: zero.",
  "Security issues: none.",
  "Security issues: no.",
  "Security issue: was fixed.",
  "The words security issues: documented below.",
  "Multiple security issues remain.",
  "There is a security issue.",
  "Found one security issue.",
  "The word issues is emphasized.",
  "The word issues is highlighted.",
  "Found no issues.",
  "Found 0 issues.",
  "There is not a bug.",
  "No security issue was found.",
  "No security issue was flagged.",
  "We did not detect any issues.",
  "Found 1 fixed issue.",
  "1 issue was resolved.",
  "This is a bug-free change.",
]) {
  test(`unknown edited presentation retains observation: ${warning}`, () => {
    const old = comment(
      securityHistoryBody(true, "2026-10-20T12:01:00Z") + "\n" + warning,
      {
        id: 980,
        created_at: "2026-10-20T12:01:00Z",
        updated_at: "2026-10-20T12:05:00Z",
      },
    );
    const clean = comment(securityHistoryBody(false, "2026-10-20T12:03:00Z"), {
      id: 981,
      created_at: "2026-10-20T12:03:00Z",
    });
    const request = {
      ...comment(`@codex review ${head}`, {
        id: 982,
        created_at: "2026-10-20T12:06:00Z",
      }),
      user: { login: "kiaquila" },
      author_association: "OWNER",
    };
    const assessment = comment(presentationReceipt(head, ":rocket:"), {
      id: 983,
      created_at: "2026-10-20T12:07:00Z",
    });
    const events = [
      { ...activation, created_at: "2026-10-20T12:00:00Z" },
      old,
      clean,
      request,
      assessment,
    ];
    const result = runGate({ comments: events, timeline: events });
    assert.equal(result.status !== 0, true, result.stderr || result.stdout);
  });
}

test("actual gate retains contradictory false companion trigger observation", () => {
  const body = (code, security, time) =>
    cleanStateBody(head, (state) => ({
      ...state,
      code_review: {
        ...state.code_review,
        has_any_findings: code,
        has_unresolved_findings: code,
      },
      security_review: {
        ...state.code_review,
        has_any_findings: security,
        has_unresolved_findings: security,
      },
    })).replaceAll("2026-10-20T12:02:00Z", time) +
    `\n| 🔒 **Security Review** | ✅ **Completed** <relative-time datetime="${time}">${time}</relative-time> | \`${head.slice(0, 7)}\` | Manual request |`;
  const old = comment(
    body(true, false, "2026-10-20T12:01:00Z").replace(
      /^(\| 🔒[^\n]+)Manual request/gm,
      "$1 P1",
    ),
    {
      id: 940,
      created_at: "2026-10-20T12:01:00Z",
      updated_at: "2026-10-20T12:05:00Z",
    },
  );
  const codeclear = comment(body(false, true, "2026-10-20T12:02:00Z"), {
    id: 942,
    created_at: "2026-10-20T12:02:00Z",
  });
  const securityBody = body(false, false, "2026-10-20T12:06:00Z")
    .replace(
      /"code_review":\{[^}]+\}/,
      '"code_review":{"status":null,"commit_sha":null,"has_any_findings":null,"has_unresolved_findings":null}',
    )
    .replace(/^\| 📝[^\n]+\n/gm, "");
  const securityclear = comment(securityBody, {
    id: 944,
    created_at: "2026-10-20T12:06:00Z",
  });
  const request = {
    ...comment(`@codex review ${head}`, {
      id: 941,
      created_at: "2026-10-20T12:07:00Z",
    }),
    event: "commented",
    user: { login: "kiaquila" },
    author_association: "OWNER",
  };
  const events = [
    { ...activation, created_at: "2026-10-20T12:00:00Z" },
    old,
    codeclear,
    request,
    comment(presentationReceipt(head, ":rocket:"), {
      id: 943,
      created_at: "2026-10-20T12:08:00Z",
    }),
  ];
  assert.notEqual(runGate({ timeline: events, comments: events }).status, 0);
  const uncleared = events.filter((event) => event.id !== 944);
  assert.notEqual(
    runGate({ timeline: uncleared, comments: uncleared }).status,
    0,
  );
});

for (const recover of [false, true]) {
  test(`actual gate bounds completion by comment creation; recovery=${recover}`, () => {
    const h = head;
    const body = (negative, time) =>
      cleanStateBody(h, (state) => ({
        ...state,
        security_review: {
          ...state.code_review,
          has_any_findings: negative,
          has_unresolved_findings: negative,
        },
      })).replaceAll("2026-10-20T12:02:00Z", time) +
      `\n| 🔒 **Security Review** | ✅ **Completed** <relative-time datetime="${time}">${time}</relative-time> | \`${h.slice(0, 7)}\` | Manual request |`;
    const old = comment(body(true, "2026-10-20T12:01:00Z"), {
      id: 9550,
      created_at: "2026-10-20T12:03:00Z",
      updated_at: "2026-10-20T12:05:00Z",
    });
    const clear = comment(
      body(false, recover ? "2026-10-20T12:06:00Z" : "2026-10-20T12:02:00Z"),
      {
        id: 9551,
        created_at: recover ? "2026-10-20T12:06:00Z" : "2026-10-20T12:02:00Z",
      },
    );
    const request = {
      ...comment(`@codex review ${h}`, {
        id: 9552,
        created_at: "2026-10-20T12:07:00Z",
      }),
      event: "commented",
      user: { login: "kiaquila" },
      author_association: "OWNER",
    };
    const events = [
      { ...activation, created_at: "2026-10-20T12:00:00Z" },
      old,
      clear,
      request,
      comment(presentationReceipt(h, ":rocket:"), {
        id: 9553,
        created_at: "2026-10-20T12:08:00Z",
      }),
    ];
    const result = runGate({ comments: events, timeline: events });
    assert.equal(result.status === 0, recover, result.stderr || result.stdout);
  });
}

for (const section of ["code_review", "security_review"])
  for (const presentation of [
    "We discussed a security issue, currently exploitable in production.",
    "The issue was resolved, which is good.",
    "`Do not merge`",
    "<div>Do&nbspnot&nbspmerge</div>",
    "Unrecognized presentation: 日本語.",
    "unknown-trigger",
    "comment-in-clock",
    "prose-before-heading",
    "missing-heading",
    "quoted-heading",
    "fenced-heading",
    "indented-heading",
    "protocol-example-before-heading",
    "prefixed-comment-in-clock",
    "multiline-prefixed-comment-in-clock",
  ])
    for (const clearAt of ["03", "05", "06"])
      test(`opaque ${section} presentation ${presentation} requires strictly newer canonical ${clearAt}`, () => {
        const makeBody = (negative, time) =>
          section === "security_review"
            ? securityHistoryBody(negative, time)
            : cleanStateBody(head, (state) => ({
                ...state,
                code_review: {
                  ...state.code_review,
                  has_any_findings: negative,
                  has_unresolved_findings: negative,
                },
              })).replaceAll("2026-10-20T12:02:00Z", time);
        let oldBody = makeBody(true, "2026-10-20T12:02:00Z");
        if (presentation === "unknown-trigger")
          oldBody = oldBody.replaceAll(
            "Manual request",
            "Unrecognized trigger",
          );
        else if (presentation === "comment-in-clock")
          oldBody = oldBody.replaceAll(
            "12:02:00Z",
            "12:<!-- explanation -->02:00Z",
          );
        else if (presentation === "prose-before-heading")
          oldBody = oldBody.replace(
            "## Codex Review Summary",
            "Fresh finding still applies.\n\n## Codex Review Summary",
          );
        else if (presentation === "missing-heading")
          oldBody = oldBody.replace(
            "## Codex Review Summary",
            "Updated activity",
          );
        else if (presentation === "quoted-heading")
          oldBody = oldBody.replace(
            "## Codex Review Summary",
            "> ## Codex Review Summary",
          );
        else if (presentation === "fenced-heading")
          oldBody = oldBody.replace(
            "## Codex Review Summary",
            "```\n## Codex Review Summary\n```",
          );
        else if (presentation === "indented-heading")
          oldBody = oldBody.replace(
            "## Codex Review Summary",
            "    ## Codex Review Summary",
          );
        else if (presentation === "protocol-example-before-heading")
          oldBody = oldBody.replace(
            "## Codex Review Summary",
            "    <!-- codex-review-state:v1 {} -->\n\n## Codex Review Summary",
          );
        else if (
          presentation === "prefixed-comment-in-clock" ||
          presentation === "multiline-prefixed-comment-in-clock"
        ) {
          oldBody = oldBody.replace(
            "\n| 📝",
            presentation === "prefixed-comment-in-clock"
              ? "\n<!-- decoration -->| 📝"
              : "\n<!-- multi\nline decoration -->| 📝",
          );
          oldBody = oldBody.replaceAll(
            "12:02:00Z",
            "12:<!-- invisible | separator -->02:00Z",
          );
        } else oldBody += "\n" + presentation;
        const old = comment(oldBody, {
          id: 9600,
          created_at: "2026-10-20T12:02:00Z",
          updated_at: "2026-10-20T12:05:00Z",
        });
        const clean = comment(makeBody(false, `2026-10-20T12:${clearAt}:00Z`), {
          id: 9601,
          created_at: `2026-10-20T12:${clearAt}:00Z`,
        });
        const request = {
          ...comment(`@codex review ${head}`, {
            id: 9602,
            created_at: "2026-10-20T12:07:00Z",
          }),
          user: { login: "kiaquila" },
          author_association: "OWNER",
        };
        const events = [
          { ...activation, created_at: "2026-10-20T12:00:00Z" },
          old,
          clean,
          request,
          comment(presentationReceipt(head, ":rocket:"), {
            id: 9603,
            created_at: "2026-10-20T12:08:00Z",
          }),
        ];
        const result = runGate({ comments: events, timeline: events });
        assert.equal(
          result.status === 0,
          clearAt === "06",
          result.stderr || result.stdout,
        );
      });

for (const section of ["code_review", "security_review"])
  for (const [indentName, indent] of [
    ["three-spaces", "   "],
    ["four-spaces", "    "],
    ["tab", "\t"],
  ])
    for (const altered of ["negative", "clean"])
      test(`${section} history rejects code-indented ${altered} table ${indentName}`, () => {
        const makeBody = (negative, time) =>
          section === "security_review"
            ? securityHistoryBody(negative, time)
            : cleanStateBody(head, (state) => ({
                ...state,
                code_review: {
                  ...state.code_review,
                  has_any_findings: negative,
                  has_unresolved_findings: negative,
                },
              })).replaceAll("2026-10-20T12:02:00Z", time);
        const indentTable = (body) => body.replace(/^\|/gm, indent + "|");
        const negative = makeBody(true, "2026-10-20T12:02:00Z");
        const clean = makeBody(false, "2026-10-20T12:04:00Z");
        const events = [
          { ...activation, created_at: "2026-10-20T12:00:00Z" },
          comment(altered === "negative" ? indentTable(negative) : negative, {
            id: 9700,
            created_at: "2026-10-20T12:02:00Z",
            updated_at: "2026-10-20T12:05:00Z",
          }),
          comment(altered === "clean" ? indentTable(clean) : clean, {
            id: 9701,
            created_at: "2026-10-20T12:04:00Z",
          }),
          {
            ...comment(`@codex review ${head}`, {
              id: 9702,
              created_at: "2026-10-20T12:07:00Z",
            }),
            user: { login: "kiaquila" },
            author_association: "OWNER",
          },
          comment(presentationReceipt(head, ":rocket:"), {
            id: 9703,
            created_at: "2026-10-20T12:08:00Z",
          }),
        ];
        const result = runGate({ comments: events, timeline: events });
        assert.equal(
          result.status === 0,
          indentName === "three-spaces",
          result.stderr || result.stdout,
        );
      });

for (const section of ["code_review", "security_review"])
  for (const presentation of [
    "blank-after-header",
    "blank-before-row",
    "missing-paragraph-boundaries",
    "nbsp-blank-before-table",
    "comment-line-in-table",
    "extra-paragraph-spacing",
  ])
    for (const altered of ["negative", "clean"])
      test(`${section} history preserves Markdown blocks for ${altered} ${presentation}`, () => {
        const makeBody = (negative, time) =>
          section === "security_review"
            ? securityHistoryBody(negative, time)
            : cleanStateBody(head, (state) => ({
                ...state,
                code_review: {
                  ...state.code_review,
                  has_any_findings: negative,
                  has_unresolved_findings: negative,
                },
              })).replaceAll("2026-10-20T12:02:00Z", time);
        const alter = (body) => {
          if (presentation === "blank-after-header")
            return body.replace("\n| ---", "\n\n| ---");
          if (presentation === "blank-before-row")
            return body.replace("\n| 📝", "\n\n| 📝");
          if (presentation === "missing-paragraph-boundaries")
            return body.replaceAll("\n\n", "\n");
          if (presentation === "nbsp-blank-before-table")
            return body.replace("\n\n| Review", "\n\u00a0\n| Review");
          if (presentation === "comment-line-in-table")
            return body.replace("\n| 📝", "\n<!-- explanation -->\n| 📝");
          return body.replaceAll("\n\n", "\n\n\n");
        };
        const negative = makeBody(true, "2026-10-20T12:02:00Z");
        const clean = makeBody(false, "2026-10-20T12:04:00Z");
        const events = [
          { ...activation, created_at: "2026-10-20T12:00:00Z" },
          comment(altered === "negative" ? alter(negative) : negative, {
            id: 9800,
            created_at: "2026-10-20T12:02:00Z",
            updated_at: "2026-10-20T12:05:00Z",
          }),
          comment(altered === "clean" ? alter(clean) : clean, {
            id: 9801,
            created_at: "2026-10-20T12:04:00Z",
          }),
          {
            ...comment(`@codex review ${head}`, {
              id: 9802,
              created_at: "2026-10-20T12:07:00Z",
            }),
            user: { login: "kiaquila" },
            author_association: "OWNER",
          },
          comment(presentationReceipt(head, ":rocket:"), {
            id: 9803,
            created_at: "2026-10-20T12:08:00Z",
          }),
        ];
        const result = runGate({ comments: events, timeline: events });
        assert.equal(
          result.status === 0,
          presentation === "extra-paragraph-spacing",
          result.stderr || result.stdout,
        );
      });

for (const section of ["code_review", "security_review"])
  for (const separator of [
    "<!-- invisible | separator -->\n",
    "<!-- invisible | --> <!-- another separator -->\n",
    "<!-- multiline\n| separator -->\n<!-- another | separator -->\n",
  ])
    for (const clear of [false, true])
      test(`${section} pipe-bearing metadata comments preserve negatives and canonical clearing ${JSON.stringify(separator)} ${clear}`, () => {
        const makeBody = (negative, time) =>
          section === "security_review"
            ? securityHistoryBody(negative, time)
            : cleanStateBody(head, (state) => ({
                ...state,
                code_review: {
                  ...state.code_review,
                  has_any_findings: negative,
                  has_unresolved_findings: negative,
                },
              })).replaceAll("2026-10-20T12:02:00Z", time);
        const negative = makeBody(true, "2026-10-20T12:02:00Z").replace(
          "<!-- codex-review-state:v1",
          separator + "<!-- codex-review-state:v1",
        );
        const events = [
          { ...activation, created_at: "2026-10-20T12:00:00Z" },
          comment(negative, {
            id: 9900,
            created_at: "2026-10-20T12:02:00Z",
            updated_at: "2026-10-20T12:05:00Z",
          }),
          ...(clear
            ? [
                comment(makeBody(false, "2026-10-20T12:04:00Z"), {
                  id: 9901,
                  created_at: "2026-10-20T12:04:00Z",
                }),
              ]
            : []),
          {
            ...comment(`@codex review ${head}`, {
              id: 9902,
              created_at: "2026-10-20T12:07:00Z",
            }),
            user: { login: "kiaquila" },
            author_association: "OWNER",
          },
          comment(presentationReceipt(head, ":rocket:"), {
            id: 9903,
            created_at: "2026-10-20T12:08:00Z",
          }),
        ];
        const result = runGate({ comments: events, timeline: events });
        assert.equal(
          result.status === 0,
          clear,
          result.stderr || result.stdout,
        );
      });
