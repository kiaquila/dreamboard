#!/usr/bin/env node

import { appendFileSync, readFileSync } from "node:fs";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const eventPath = process.env.GITHUB_EVENT_PATH;
const selectedAgent = (process.env.AI_REVIEW_AGENT || "codex")
  .trim()
  .toLowerCase();
const explicitPrNumber = process.env.AI_REVIEW_PR_NUMBER;
const maxWaitMs = Number(process.env.AI_REVIEW_WAIT_MS || 900000);
const pollIntervalMs = Number(process.env.AI_REVIEW_POLL_MS || 15000);
const triggerMode = (process.env.AI_REVIEW_TRIGGER_MODE || "comment")
  .trim()
  .toLowerCase();
const triggeredAt = process.env.AI_REVIEW_TRIGGERED_AT;
const outputPath = process.env.GITHUB_OUTPUT;
const summaryPath = process.env.GITHUB_STEP_SUMMARY;
const claudeReviewerLogins = new Set(["claude[bot]"]);
const codexReviewerLogins = new Set(["chatgpt-codex-connector[bot]"]);
const geminiReviewerLogins = new Set(["gemini-code-assist[bot]"]);

if (!token) {
  throw new Error("GITHUB_TOKEN is required");
}

if (!repository) {
  throw new Error("GITHUB_REPOSITORY is required");
}

if (!eventPath) {
  throw new Error("GITHUB_EVENT_PATH is required");
}

if (!["claude", "codex", "gemini"].includes(selectedAgent)) {
  throw new Error(
    `AI_REVIEW_AGENT must be one of "claude", "codex", or "gemini", received "${selectedAgent}"`,
  );
}

if (!["comment", "skip"].includes(triggerMode)) {
  throw new Error(
    `AI_REVIEW_TRIGGER_MODE must be one of "comment" or "skip", received "${triggerMode}"`,
  );
}

const [owner, repo] = repository.split("/");
const event = JSON.parse(readFileSync(eventPath, "utf8"));

const setOutput = (name, value) => {
  if (!outputPath) {
    return;
  }

  appendFileSync(outputPath, `${name}=${String(value)}\n`);
};

const appendSummary = (lines) => {
  if (!summaryPath) {
    return;
  }

  appendFileSync(summaryPath, `${lines.join("\n")}\n`);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const apiFetch = async (path, init = {}) => {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `${init.method || "GET"} ${path} failed: ${response.status} ${body}`,
    );
  }

  return response;
};

const getPaginationPath = (linkHeader, rel) => {
  const match = (linkHeader || "").match(
    new RegExp(`<([^>]+)>;\\s*rel="${rel}"`),
  );

  return match ? new URL(match[1]).pathname + new URL(match[1]).search : "";
};

const listPaginated = async (path) => {
  const items = [];
  let nextPath = path;

  while (nextPath) {
    const response = await apiFetch(nextPath);
    const data = await response.json();
    items.push(...data);
    nextPath = getPaginationPath(response.headers.get("link"), "next");
  }

  return items;
};

const listNewestPullReviews = async (path) => {
  const firstResponse = await apiFetch(path);
  const lastPath = getPaginationPath(firstResponse.headers.get("link"), "last");

  if (!lastPath || lastPath === path) {
    return firstResponse.json();
  }

  const lastResponse = await apiFetch(lastPath);
  return lastResponse.json();
};

const request = async (path, init = {}) => {
  const response = await apiFetch(path, init);

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

const buildSinceQuery = (timestamp) =>
  timestamp
    ? `&since=${encodeURIComponent(new Date(timestamp).toISOString())}`
    : "";

const buildIssueCommentsPath = (sinceTimestamp) =>
  `/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100&sort=updated&direction=desc${buildSinceQuery(
    sinceTimestamp,
  )}`;

const buildPullReviewCommentsPath = (sinceTimestamp) =>
  `/repos/${owner}/${repo}/pulls/${prNumber}/comments?per_page=100&sort=updated&direction=desc${buildSinceQuery(
    sinceTimestamp,
  )}`;

const prNumber =
  explicitPrNumber ||
  event.pull_request?.number ||
  (event.issue?.pull_request ? event.issue.number : "") ||
  "";

if (!prNumber) {
  throw new Error(
    "AI Review gate requires a pull request context or AI_REVIEW_PR_NUMBER",
  );
}

const pull = await request(`/repos/${owner}/${repo}/pulls/${prNumber}`);
const headSha = pull.head.sha;
const markerAgentLine = `AI_REVIEW_AGENT: ${selectedAgent}`;
const markerShaLine = `AI_REVIEW_SHA: ${headSha}`;
const metadataMarker = `<!-- ai-review-gate:agent=${selectedAgent};sha=${headSha} -->`;
const claudeOutcomePrefix = "AI_REVIEW_OUTCOME:";

const buildTriggerComment = () => {
  if (selectedAgent === "codex") {
    return [
      "@codex review",
      "",
      `Please review PR #${prNumber} at head commit \`${headSha}\`.`,
      "",
      metadataMarker,
    ].join("\n");
  }

  if (selectedAgent === "gemini") {
    return [
      "/gemini review",
      "",
      `Please review PR #${prNumber} at head commit \`${headSha}\`.`,
      "",
      metadataMarker,
    ].join("\n");
  }

  return [
    "@claude review once",
    "",
    `Please review PR #${prNumber} at head commit \`${headSha}\`.`,
    "",
    "In your final top-level Claude comment, begin with exactly these three lines:",
    markerAgentLine,
    markerShaLine,
    `${claudeOutcomePrefix} pass|advisory|block`,
    "",
    "This repository validates Claude review via marker comments instead of formal GitHub PR review states.",
    "Use inline PR comments only for concrete findings, and do not modify code in this workflow.",
    "",
    metadataMarker,
  ].join("\n");
};

const ensureTriggerComment = async () => {
  // Dedupe: reuse an existing gate-originated trigger comment for the
  // current head SHA within the last 30 minutes instead of posting a
  // duplicate. The metadata marker encodes both agent and headSha, so a
  // match is unambiguous. Prevents trigger-comment spam on workflow
  // reruns and on repeated pull_request events for the same head.
  const dedupeWindowMs = 30 * 60 * 1000;
  const recentComments = await listPaginated(
    buildIssueCommentsPath(Date.now() - dedupeWindowMs),
  );
  const existing = recentComments.find((comment) =>
    (comment.body || "").includes(metadataMarker),
  );

  if (existing) {
    console.log(
      `Reusing existing gate trigger comment for ${selectedAgent} at ${headSha}: ${existing.html_url}`,
    );
    return existing;
  }

  return request(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
    method: "POST",
    body: JSON.stringify({ body: buildTriggerComment() }),
  });
};

const matchesCodexReview = (review) =>
  review.commit_id === headSha &&
  codexReviewerLogins.has(review.user?.login || "") &&
  (review.body || "").includes("Codex Review");

const matchesCodexSummaryComment = (comment) =>
  codexReviewerLogins.has(comment.user?.login || "") &&
  /^Codex Review:/i.test((comment.body || "").trim());

const matchesGeminiReview = (review) =>
  review.commit_id === headSha &&
  geminiReviewerLogins.has(review.user?.login || "");

const extractClaudeOutcome = (body) => {
  const match = body.match(/^AI_REVIEW_OUTCOME:\s*(pass|advisory|block)\s*$/im);
  return match ? match[1].toLowerCase() : null;
};

const matchesClaudeComment = (comment) => {
  const body = comment.body || "";
  return (
    claudeReviewerLogins.has(comment.user?.login || "") &&
    body.includes("AI_REVIEW_AGENT: claude") &&
    body.includes(markerShaLine) &&
    extractClaudeOutcome(body) !== null
  );
};

const pickLatestCodexReview = (reviews) =>
  reviews
    .filter((review) => review.submitted_at && matchesCodexReview(review))
    .sort(
      (a, b) =>
        new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime(),
    )[0] || null;

const pickLatestGeminiReview = (reviews) =>
  reviews
    .filter((review) => review.submitted_at && matchesGeminiReview(review))
    .sort(
      (left, right) =>
        new Date(right.submitted_at).getTime() -
        new Date(left.submitted_at).getTime(),
    )[0] || null;

const pickLatestClaudeComment = (comments) =>
  comments
    .filter((comment) => matchesClaudeComment(comment))
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at || 0).getTime() -
        new Date(a.updated_at || a.created_at || 0).getTime(),
    )[0] || null;

const findLatestCurrentHeadClaudeComment = (comments) =>
  comments
    .filter((comment) => matchesClaudeComment(comment))
    .sort(
      (left, right) =>
        new Date(right.updated_at || right.created_at || 0).getTime() -
        new Date(left.updated_at || left.created_at || 0).getTime(),
    )[0] || null;

const findLatestCurrentHeadCodexReview = (reviews) =>
  reviews
    .filter((review) => review.submitted_at && matchesCodexReview(review))
    .sort(
      (left, right) =>
        new Date(right.submitted_at).getTime() -
        new Date(left.submitted_at).getTime(),
    )[0] || null;

const findLatestCurrentHeadGeminiReview = (reviews) =>
  reviews
    .filter((review) => review.submitted_at && matchesGeminiReview(review))
    .sort(
      (left, right) =>
        new Date(right.submitted_at).getTime() -
        new Date(left.submitted_at).getTime(),
    )[0] || null;

const classifyCodexSetupReply = (comment) => {
  const body = (comment.body || "").trim();

  if (/create an environment for this repo/i.test(body)) {
    return {
      outcome: "fail",
      reason:
        "Codex could not start the selected review because no Codex cloud environment is configured for this repository.",
      details: [comment.html_url],
    };
  }

  if (/create a codex account and connect to github/i.test(body)) {
    return {
      outcome: "fail",
      reason:
        "Codex could not start the selected review because the trigger did not come from a connected human Codex account.",
      details: [comment.html_url],
    };
  }

  return null;
};

const classifyCodexSummaryComment = (comment) => {
  const body = (comment.body || "").trim();

  if (/did(?:\s+not|\s*n['’]?t)\s+find\s+any\s+major\s+issues/i.test(body)) {
    return {
      outcome: "pass",
      reason: "Codex completed review with no major issues.",
      details: [comment.html_url],
    };
  }

  return {
    outcome: "pending",
    reason:
      "Codex summary comment did not match a recognized no-findings reply.",
    details: [comment.html_url],
  };
};

const extractCodexPriority = (body) => {
  const match = body.match(/\bP([0-3])\b/i);
  return match ? Number(match[1]) : null;
};

const classifyCodexReview = async (review) => {
  if (review.state === "APPROVED") {
    return {
      outcome: "pass",
      reason: "Codex approved the PR with no blocking findings.",
      details: [],
    };
  }

  if (review.state === "CHANGES_REQUESTED") {
    return {
      outcome: "fail",
      reason: "Codex requested changes on the PR.",
      details: [],
    };
  }

  if (review.state !== "COMMENTED") {
    return {
      outcome: "pending",
      reason: `Codex produced unsupported review state "${review.state}".`,
      details: [],
    };
  }

  const reviewComments = await listPaginated(
    buildPullReviewCommentsPath(
      review.submitted_at ? new Date(review.submitted_at).getTime() : 0,
    ),
  );
  const commentsForReview = reviewComments.filter(
    (comment) => comment.pull_request_review_id === review.id,
  );

  if (commentsForReview.length === 0) {
    return {
      outcome: "pass",
      reason: "Codex completed a comment review without inline findings.",
      details: [],
    };
  }

  const parsedPriorities = commentsForReview
    .map((comment) => extractCodexPriority(comment.body || ""))
    .filter((priority) => priority !== null);
  const untaggedComments = commentsForReview.filter(
    (comment) => extractCodexPriority(comment.body || "") === null,
  );

  if (untaggedComments.length > 0) {
    return {
      outcome: "fail",
      reason:
        "Codex submitted inline findings without recognized P0-P3 severity badges.",
      details: untaggedComments.map((comment) => comment.html_url),
    };
  }

  const highestPriority = Math.min(...parsedPriorities);

  if (highestPriority <= 2) {
    return {
      outcome: "fail",
      reason: `Codex reported blocking findings with highest severity P${highestPriority}.`,
      details: commentsForReview.map((comment) => comment.html_url),
    };
  }

  return {
    outcome: "pass",
    reason: "Codex reported advisory-only findings.",
    details: commentsForReview.map((comment) => comment.html_url),
  };
};

const extractGeminiSeverity = (body) => {
  const altMatch = body.match(/!\[(critical|high|medium|low)\]/i);
  if (altMatch) {
    return altMatch[1].toLowerCase();
  }

  const wordMatch = body.match(/\b(critical|high|medium|low)\b/i);
  if (wordMatch) {
    return wordMatch[1].toLowerCase();
  }

  return null;
};

const classifyGeminiReview = async (review) => {
  if (review.state === "APPROVED") {
    return {
      outcome: "pass",
      reason: "Gemini approved the PR with no blocking findings.",
      details: [],
    };
  }

  if (review.state === "CHANGES_REQUESTED") {
    return {
      outcome: "fail",
      reason: "Gemini requested changes on the PR.",
      details: [],
    };
  }

  if (review.state !== "COMMENTED") {
    return {
      outcome: "pending",
      reason: `Gemini produced unsupported review state "${review.state}".`,
      details: [],
    };
  }

  const reviewComments = await listPaginated(
    buildPullReviewCommentsPath(
      review.submitted_at ? new Date(review.submitted_at).getTime() : 0,
    ),
  );
  const commentsForReview = reviewComments.filter(
    (comment) => comment.pull_request_review_id === review.id,
  );

  if (commentsForReview.length === 0) {
    return {
      outcome: "pass",
      reason: "Gemini completed a comment review without inline findings.",
      details: [review.html_url],
    };
  }

  const severities = commentsForReview
    .map((comment) => extractGeminiSeverity(comment.body || ""))
    .filter((severity) => severity !== null);
  const untaggedComments = commentsForReview.filter(
    (comment) => extractGeminiSeverity(comment.body || "") === null,
  );

  if (untaggedComments.length > 0) {
    return {
      outcome: "fail",
      reason:
        "Gemini submitted inline findings without recognized Critical/High/Medium/Low severity markers.",
      details: untaggedComments.map((comment) => comment.html_url),
    };
  }

  const priority = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  const highestSeverity = severities.reduce(
    (best, current) => (priority[current] < priority[best] ? current : best),
    "low",
  );

  if (priority[highestSeverity] <= 2) {
    return {
      outcome: "fail",
      reason: `Gemini reported blocking findings with highest severity ${highestSeverity}.`,
      details: commentsForReview.map((comment) => comment.html_url),
    };
  }

  return {
    outcome: "pass",
    reason: "Gemini reported advisory-only findings.",
    details: commentsForReview.map((comment) => comment.html_url),
  };
};

const classifyClaudeComment = (comment) => {
  const outcome = extractClaudeOutcome(comment.body || "");

  switch (outcome) {
    case "pass":
      return {
        outcome: "pass",
        reason: "Claude reported no material findings.",
        details: [comment.html_url],
      };
    case "advisory":
      return {
        outcome: "pass",
        reason: "Claude reported advisory-only findings.",
        details: [comment.html_url],
      };
    case "block":
      return {
        outcome: "fail",
        reason: "Claude reported blocking findings.",
        details: [comment.html_url],
      };
    default:
      return {
        outcome: "pending",
        reason:
          "Claude comment did not include a valid AI_REVIEW_OUTCOME marker.",
        details: [comment.html_url],
      };
  }
};

const triggerComment =
  triggerMode === "comment" ? await ensureTriggerComment() : null;
const triggerTime = triggerComment
  ? new Date(triggerComment.created_at).getTime()
  : triggeredAt
    ? new Date(triggeredAt).getTime()
    : Date.now();
const deadline = Date.now() + maxWaitMs;

while (Date.now() < deadline) {
  if (selectedAgent === "claude") {
    const issueComments = await listPaginated(
      buildIssueCommentsPath(triggerMode === "skip" ? 0 : triggerTime),
    );
    const recentComments = issueComments.filter(
      (comment) =>
        Math.max(
          new Date(comment.created_at || 0).getTime(),
          new Date(comment.updated_at || 0).getTime(),
        ) >= triggerTime,
    );
    const candidateComments =
      triggerMode === "skip" ? issueComments : recentComments;
    const matchedComment =
      pickLatestClaudeComment(candidateComments) ||
      (triggerMode === "skip"
        ? null
        : findLatestCurrentHeadClaudeComment(issueComments));

    if (matchedComment) {
      const mapped = classifyClaudeComment(matchedComment);

      if (mapped.outcome !== "pending") {
        setOutput("review_agent", selectedAgent);
        setOutput(
          "review_state",
          extractClaudeOutcome(matchedComment.body || ""),
        );
        setOutput("review_url", matchedComment.html_url);
        setOutput("review_id", matchedComment.id);

        appendSummary([
          "## AI Review Gate",
          "",
          `- Selected reviewer: \`${selectedAgent}\``,
          `- Trigger source: ${triggerComment ? triggerComment.html_url : "inline native workflow invocation"}`,
          `- Matched reviewer comment: ${matchedComment.html_url}`,
          `- Review state: \`${extractClaudeOutcome(matchedComment.body || "")}\``,
          `- Result: ${mapped.reason}`,
          ...(mapped.details?.length
            ? [`- Evidence: ${mapped.details.join(", ")}`]
            : []),
        ]);

        if (mapped.outcome === "fail") {
          throw new Error(mapped.reason);
        }

        console.log(mapped.reason);
        process.exit(0);
      }
    }
  } else if (selectedAgent === "codex") {
    const reviews = await listNewestPullReviews(
      `/repos/${owner}/${repo}/pulls/${prNumber}/reviews?per_page=100`,
    );
    const recentReviews = reviews.filter(
      (review) => new Date(review.submitted_at || 0).getTime() >= triggerTime,
    );
    const candidateReviews = triggerMode === "skip" ? reviews : recentReviews;
    const matchedReview =
      pickLatestCodexReview(candidateReviews) ||
      (triggerMode === "skip"
        ? null
        : findLatestCurrentHeadCodexReview(reviews));

    if (matchedReview) {
      const mapped = await classifyCodexReview(matchedReview);

      if (mapped.outcome !== "pending") {
        setOutput("review_agent", selectedAgent);
        setOutput("review_state", matchedReview.state);
        setOutput("review_url", matchedReview.html_url);
        setOutput("review_id", matchedReview.id);

        appendSummary([
          "## AI Review Gate",
          "",
          `- Selected reviewer: \`${selectedAgent}\``,
          `- Trigger source: ${triggerComment ? triggerComment.html_url : "inline native workflow invocation"}`,
          `- Matched review: ${matchedReview.html_url}`,
          `- Review state: \`${matchedReview.state}\``,
          `- Result: ${mapped.reason}`,
          ...(mapped.details?.length
            ? [`- Evidence: ${mapped.details.join(", ")}`]
            : []),
        ]);

        if (mapped.outcome === "fail") {
          throw new Error(mapped.reason);
        }

        console.log(mapped.reason);
        process.exit(0);
      }
    }

    const issueComments = await listPaginated(
      buildIssueCommentsPath(triggerMode === "skip" ? 0 : triggerTime),
    );
    const recentIssueComments = issueComments.filter(
      (comment) => new Date(comment.created_at || 0).getTime() >= triggerTime,
    );
    const summaryComment =
      recentIssueComments
        .filter((comment) => matchesCodexSummaryComment(comment))
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )[0] || null;

    if (summaryComment) {
      const mapped = classifyCodexSummaryComment(summaryComment);

      if (mapped.outcome !== "pending") {
        setOutput("review_agent", selectedAgent);
        setOutput("review_state", "COMMENTED_NO_FINDINGS");
        setOutput("review_url", summaryComment.html_url);
        setOutput("review_id", summaryComment.id);

        appendSummary([
          "## AI Review Gate",
          "",
          `- Selected reviewer: \`${selectedAgent}\``,
          `- Trigger source: ${triggerComment ? triggerComment.html_url : "inline native workflow invocation"}`,
          `- Matched reviewer comment: ${summaryComment.html_url}`,
          "- Review state: `COMMENTED_NO_FINDINGS`",
          `- Result: ${mapped.reason}`,
          ...(mapped.details?.length
            ? [`- Evidence: ${mapped.details.join(", ")}`]
            : []),
        ]);

        console.log(mapped.reason);
        process.exit(0);
      }
    }

    const recentConnectorReply =
      issueComments
        .filter(
          (comment) =>
            codexReviewerLogins.has(comment.user?.login || "") &&
            new Date(comment.created_at || 0).getTime() >= triggerTime,
        )
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .map((comment) => ({
          comment,
          classification: classifyCodexSetupReply(comment),
        }))
        .find((entry) => entry.classification) || null;

    if (recentConnectorReply) {
      const { comment, classification } = recentConnectorReply;

      setOutput("review_agent", selectedAgent);
      setOutput("review_state", "SETUP_REQUIRED");
      setOutput("review_url", comment.html_url);
      setOutput("review_id", comment.id);

      appendSummary([
        "## AI Review Gate",
        "",
        `- Selected reviewer: \`${selectedAgent}\``,
        `- Trigger source: ${triggerComment ? triggerComment.html_url : "inline native workflow invocation"}`,
        `- Connector reply: ${comment.html_url}`,
        "- Review state: `SETUP_REQUIRED`",
        `- Result: ${classification.reason}`,
      ]);

      throw new Error(classification.reason);
    }
  } else {
    const reviews = await listNewestPullReviews(
      `/repos/${owner}/${repo}/pulls/${prNumber}/reviews?per_page=100`,
    );
    const recentReviews = reviews.filter(
      (review) => new Date(review.submitted_at || 0).getTime() >= triggerTime,
    );
    const candidateReviews = triggerMode === "skip" ? reviews : recentReviews;
    const matchedReview =
      pickLatestGeminiReview(candidateReviews) ||
      (triggerMode === "skip"
        ? null
        : findLatestCurrentHeadGeminiReview(reviews));

    if (matchedReview) {
      const mapped = await classifyGeminiReview(matchedReview);

      if (mapped.outcome !== "pending") {
        setOutput("review_agent", selectedAgent);
        setOutput("review_state", matchedReview.state);
        setOutput("review_url", matchedReview.html_url);
        setOutput("review_id", matchedReview.id);

        appendSummary([
          "## AI Review Gate",
          "",
          `- Selected reviewer: \`${selectedAgent}\``,
          `- Trigger source: ${
            triggerComment
              ? triggerComment.html_url
              : "inline native workflow invocation"
          }`,
          `- Matched review: ${matchedReview.html_url}`,
          `- Review state: \`${matchedReview.state}\``,
          `- Result: ${mapped.reason}`,
          ...(mapped.details?.length
            ? [`- Evidence: ${mapped.details.join(", ")}`]
            : []),
        ]);

        if (mapped.outcome === "fail") {
          throw new Error(mapped.reason);
        }

        console.log(mapped.reason);
        process.exit(0);
      }
    }
  }

  await sleep(pollIntervalMs);
}

appendSummary([
  "## AI Review Gate",
  "",
  `- Selected reviewer: \`${selectedAgent}\``,
  `- Trigger source: ${triggerComment ? triggerComment.html_url : "inline native workflow invocation"}`,
  `- Head SHA: \`${headSha}\``,
  "- Result: no valid selected-reviewer output was detected before the timeout.",
]);

throw new Error(
  `AI Review gate timed out: PR #${prNumber} (SHA: ${headSha}) did not receive output from ${selectedAgent} within ${maxWaitMs}ms.`,
);
