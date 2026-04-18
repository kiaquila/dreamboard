import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  classifyCodexSetupReply,
  findLatestHeadActivationIndex,
  pickAuthoritativeCodexSkipModeComment,
} from "../scripts/ai-review-helpers.mjs";

const HEAD_SHA = "head-sha";
const OLD_SHA = "old-sha";
const OTHER_SHA = "other-sha";

let commentId = 0;

const committed = (sha) => ({
  event: "committed",
  sha,
});

const forcePushed = (sha) => ({
  event: "head_ref_force_pushed",
  commit_id: sha,
});

const commented = ({ login, body, urlSuffix }) => {
  commentId += 1;
  return {
    event: "commented",
    user: { login },
    body,
    html_url: `https://example.com/${urlSuffix || `comment-${commentId}`}`,
    created_at: `2026-04-17T20:${String(commentId).padStart(2, "0")}:00Z`,
  };
};

describe("pickAuthoritativeCodexSkipModeComment", () => {
  test("passes when Codex posts a fresh summary after a normal push and human trigger", () => {
    const decision = pickAuthoritativeCodexSkipModeComment({
      headSha: HEAD_SHA,
      timelineEvents: [
        committed(HEAD_SHA),
        commented({
          login: "kiaquila",
          body: "@codex review",
          urlSuffix: "human-trigger",
        }),
        commented({
          login: "chatgpt-codex-connector[bot]",
          body: "Codex Review: Didn't find any major issues. Nice work!",
          urlSuffix: "codex-summary",
        }),
      ],
    });

    assert.equal(decision?.reviewState, "COMMENTED_NO_FINDINGS");
    assert.equal(decision?.classification.outcome, "pass");
    assert.equal(decision?.boundaryType, "human-trigger");
  });

  test("accepts a same-head Codex summary even if the workflow starts after the human trigger", () => {
    const decision = pickAuthoritativeCodexSkipModeComment({
      headSha: HEAD_SHA,
      timelineEvents: [
        committed(HEAD_SHA),
        commented({
          login: "kiaquila",
          body: "@codex review",
          urlSuffix: "pre-dispatch-trigger",
        }),
        commented({
          login: "chatgpt-codex-connector[bot]",
          body: "Codex Review: Didn’t find any major issues. :rocket:",
          urlSuffix: "pre-dispatch-summary",
        }),
      ],
    });

    assert.equal(decision?.reviewState, "COMMENTED_NO_FINDINGS");
    assert.equal(decision?.classification.outcome, "pass");
  });

  test("rejects a stale prior-push summary when a newer head becomes current", () => {
    const decision = pickAuthoritativeCodexSkipModeComment({
      headSha: HEAD_SHA,
      timelineEvents: [
        committed(OLD_SHA),
        commented({
          login: "kiaquila",
          body: "@codex review",
          urlSuffix: "old-trigger",
        }),
        commented({
          login: "chatgpt-codex-connector[bot]",
          body: "Codex Review: Didn't find any major issues. Nice work!",
          urlSuffix: "old-summary",
        }),
        committed(HEAD_SHA),
      ],
    });

    assert.equal(decision, null);
  });

  test("rejects a prior-head summary after force-pushing back to an older commit", () => {
    const decision = pickAuthoritativeCodexSkipModeComment({
      headSha: HEAD_SHA,
      timelineEvents: [
        committed(HEAD_SHA),
        commented({
          login: "kiaquila",
          body: "@codex review",
          urlSuffix: "first-trigger",
        }),
        commented({
          login: "chatgpt-codex-connector[bot]",
          body: "Codex Review: Didn't find any major issues. Nice work!",
          urlSuffix: "first-summary",
        }),
        committed(OTHER_SHA),
        forcePushed(HEAD_SHA),
      ],
    });

    assert.equal(decision, null);
  });

  test("keeps polling when the current head is not yet observable in the PR timeline", () => {
    const decision = pickAuthoritativeCodexSkipModeComment({
      headSha: HEAD_SHA,
      timelineEvents: [
        committed(OLD_SHA),
        commented({
          login: "chatgpt-codex-connector[bot]",
          body: "Codex Review: Didn't find any major issues. Nice work!",
          urlSuffix: "old-summary-only",
        }),
      ],
    });

    assert.equal(
      findLatestHeadActivationIndex([committed(OLD_SHA)], HEAD_SHA),
      -1,
    );
    assert.equal(decision, null);
  });

  test("fails closed when timeline evidence is unavailable", () => {
    assert.equal(
      pickAuthoritativeCodexSkipModeComment({
        headSha: HEAD_SHA,
        timelineEvents: null,
      }),
      null,
    );
  });

  test("surfaces a fresh setup-error comment for the current head", () => {
    const decision = pickAuthoritativeCodexSkipModeComment({
      headSha: HEAD_SHA,
      timelineEvents: [
        committed(HEAD_SHA),
        commented({
          login: "kiaquila",
          body: "@codex review",
          urlSuffix: "setup-trigger",
        }),
        commented({
          login: "chatgpt-codex-connector[bot]",
          body: "To use Codex here, create an environment for this repo.",
          urlSuffix: "setup-error",
        }),
      ],
    });

    assert.equal(decision?.reviewState, "SETUP_REQUIRED");
    assert.equal(decision?.classification.outcome, "fail");
  });

  test("does not let a stale setup-error bleed across pushes", () => {
    const decision = pickAuthoritativeCodexSkipModeComment({
      headSha: HEAD_SHA,
      timelineEvents: [
        committed(OLD_SHA),
        commented({
          login: "kiaquila",
          body: "@codex review",
          urlSuffix: "old-setup-trigger",
        }),
        commented({
          login: "chatgpt-codex-connector[bot]",
          body: "Please create a Codex account and connect to GitHub to continue.",
          urlSuffix: "old-setup-error",
        }),
        committed(HEAD_SHA),
      ],
    });

    assert.equal(decision, null);
  });

  test("ignores older same-head Codex replies once a newer human trigger is posted", () => {
    const decision = pickAuthoritativeCodexSkipModeComment({
      headSha: HEAD_SHA,
      timelineEvents: [
        committed(HEAD_SHA),
        commented({
          login: "kiaquila",
          body: "@codex review",
          urlSuffix: "first-same-head-trigger",
        }),
        commented({
          login: "chatgpt-codex-connector[bot]",
          body: "To use Codex here, create an environment for this repo.",
          urlSuffix: "first-same-head-setup",
        }),
        commented({
          login: "kiaquila",
          body: "@codex review",
          urlSuffix: "second-same-head-trigger",
        }),
        commented({
          login: "chatgpt-codex-connector[bot]",
          body: "Codex Review: Didn't find any major issues. Nice work!",
          urlSuffix: "second-same-head-summary",
        }),
      ],
    });

    assert.equal(decision?.reviewState, "COMMENTED_NO_FINDINGS");
    assert.equal(decision?.boundaryType, "human-trigger");
  });
});

describe("classifyCodexSetupReply", () => {
  test("matches both supported setup-error variants", () => {
    assert.equal(
      classifyCodexSetupReply(
        commented({
          login: "chatgpt-codex-connector[bot]",
          body: "To use Codex here, create an environment for this repo.",
          urlSuffix: "environment-variant",
        }),
      )?.outcome,
      "fail",
    );
    assert.equal(
      classifyCodexSetupReply(
        commented({
          login: "chatgpt-codex-connector[bot]",
          body: "Please create a Codex account and connect to GitHub to continue.",
          urlSuffix: "account-variant",
        }),
      )?.outcome,
      "fail",
    );
  });
});
