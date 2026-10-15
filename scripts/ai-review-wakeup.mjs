#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { readReviewUpdates } from "./codex-review-updates.mjs";
import {
  classifyCodexSummaryComment,
  isCodexWakeupComment,
  codexReviewerLogins,
  codexCommentTimestamp,
} from "./ai-review-helpers.mjs";

export const routesCodexWakeup = (eventName, event) => {
  if (eventName === "issue_comment") {
    return (
      ["created", "edited", "deleted"].includes(event.action) &&
      Boolean(event.issue?.pull_request) &&
      codexReviewerLogins.has(event.comment?.user?.login) &&
      (event.action !== "created" || isCodexWakeupComment(event.comment))
    );
  }
  if (eventName === "pull_request_review") {
    return (
      ["submitted", "edited", "dismissed"].includes(event.action) &&
      codexReviewerLogins.has(event.review?.user?.login)
    );
  }
  return (
    eventName === "workflow_run" &&
    event.action === "completed" &&
    event.workflow_run?.name === "AI Review" &&
    event.workflow_run?.event === "pull_request"
  );
};

export const wakeCodexGate = async ({
  eventName,
  event,
  api,
  selectedAgent = "codex",
  wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}) => {
  if (selectedAgent !== "codex" || !routesCodexWakeup(eventName, event))
    return "ignored";
  const number =
    event.issue?.number ||
    event.pull_request?.number ||
    event.workflow_run?.pull_requests?.[0]?.number;
  if (!number) return "no-pr";
  const pull = await api(`/pulls/${number}`);
  if (pull.state !== "open" || pull.draft) return "closed-or-draft";
  const head = pull.head.sha;
  if (eventName === "pull_request_review" && event.review.commit_id !== head)
    return "stale-review";
  if (eventName === "workflow_run" && event.workflow_run.head_sha !== head)
    return "stale-run";
  const runs = (
    await api(
      `/actions/workflows/ai-review.yml/runs?event=pull_request&head_sha=${head}&per_page=100`,
    )
  ).workflow_runs;
  const run = runs
    .filter(
      (entry) =>
        entry.head_sha === head &&
        entry.event === "pull_request" &&
        entry.pull_requests?.some((pr) => pr.number === number),
    )
    .sort((a, b) => b.id - a.id)[0];
  if (!run) return "active-or-missing";
  const isPositive = (body) =>
    classifyCodexSummaryComment({ ...event.comment, body }, head, {
      allowUnboundLegacy: true,
    }).outcome === "pass";
  const summaryOnlyEdit =
    event.comment?.body?.includes(
      "<!-- codex-pull-request-review-summary -->",
    ) && !isPositive(event.changes?.body?.from || "");
  const invalidatingEvidence =
    eventName === "pull_request_review" ||
    (eventName === "issue_comment" &&
      (event.action === "deleted" ||
        (event.action === "edited" &&
          !summaryOnlyEdit &&
          !isPositive(event.comment.body))));
  if (invalidatingEvidence) {
    // A trusted invalidation webhook is evidence even if persisted timestamps
    // tie the gate start or the comment has disappeared. Cancel an active
    // attempt so a withdrawal cannot race its final evidence read and exit.
    const currentPull = await api(`/pulls/${number}`);
    let currentRun = await api(`/actions/runs/${run.id}`);
    if (
      currentPull.head.sha !== head ||
      currentPull.state !== "open" ||
      currentRun.run_attempt !== run.run_attempt
    )
      return "changed";
    if (currentRun.status !== "completed") {
      try {
        await api(`/actions/runs/${run.id}/cancel`, { method: "POST" });
      } catch (error) {
        currentRun = await api(`/actions/runs/${run.id}`);
        if (currentRun.status !== "completed") throw error;
      }
      for (let poll = 0; poll < 60; poll++) {
        currentRun = await api(`/actions/runs/${run.id}`);
        if (currentRun.run_attempt !== run.run_attempt) return "changed";
        if (currentRun.status === "completed") break;
        await wait(1000);
      }
      if (currentRun.status !== "completed")
        throw new Error(
          "Gate cancellation is still pending after evidence invalidation.",
        );
    }
    const finalPull = await api(`/pulls/${number}`);
    const finalRun = await api(`/actions/runs/${run.id}`);
    if (
      finalPull.head.sha !== head ||
      finalPull.state !== "open" ||
      finalRun.status !== "completed" ||
      finalRun.run_attempt !== run.run_attempt
    )
      return "changed";
    await api(`/actions/runs/${run.id}/rerun`, { method: "POST" });
    return `rerun:${run.id}`;
  }
  // The active gate polls. Its completion event closes the finish/reply race.
  if (run.status !== "completed") return "active-or-missing";
  const comments = await api(`/issues/${number}/comments?per_page=100`, {
    paginate: true,
  });
  const reviews = await api(`/pulls/${number}/reviews?per_page=100`, {
    paginate: true,
  });
  const currentReviews = reviews.filter(
    (review) =>
      review.commit_id === head && codexReviewerLogins.has(review.user?.login),
  );
  const reviewUpdates = await readReviewUpdates(currentReviews, api);
  const newestSignal = Math.max(
    0,
    // Keep edits that withdraw or replace recognized evidence visible even on
    // workflow completion, when the original edit webhook is no longer present.
    ...comments
      .filter((comment) => codexReviewerLogins.has(comment.user?.login))
      .map(codexCommentTimestamp),
    ...reviewUpdates.values(),
  );
  // At most one follow-up attempt per new evidence timestamp, including when
  // evidence arrives just as the old gate completes. Reruns start after it.
  if (newestSignal <= Date.parse(run.run_started_at || run.created_at))
    return "already-evaluated";
  const currentPull = await api(`/pulls/${number}`);
  const currentRun = await api(`/actions/runs/${run.id}`);
  if (
    currentPull.head.sha !== head ||
    currentPull.state !== "open" ||
    currentRun.status !== "completed" ||
    currentRun.run_attempt !== run.run_attempt
  )
    return "changed";
  await api(`/actions/runs/${run.id}/rerun`, { method: "POST" });
  return `rerun:${run.id}`;
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repository || !token)
    throw new Error("GitHub repository and token are required.");
  const api = async (path, { method = "GET", paginate = false, body } = {}) => {
    let url =
      path === "/graphql"
        ? "https://api.github.com/graphql"
        : `https://api.github.com/repos/${repository}${path}`;
    const items = [];
    do {
      const response = await fetch(url, {
        method,
        ...(body ? { body: JSON.stringify(body) } : {}),
        headers: {
          Accept: "application/vnd.github+json",
          ...(body ? { "Content-Type": "application/json" } : {}),
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      if (!response.ok)
        throw new Error(`${method} ${path}: ${response.status}`);
      if (response.status === 204 || /\/(rerun|cancel)$/.test(path))
        return null;
      const data = await response.json();
      if (!paginate) return data;
      items.push(...data);
      url = response.headers.get("link")?.match(/<([^>]+)>;\s*rel="next"/)?.[1];
    } while (url);
    return items;
  };
  console.log(
    await wakeCodexGate({
      eventName: process.env.GITHUB_EVENT_NAME,
      event: JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")),
      selectedAgent: process.env.AI_REVIEW_AGENT || "codex",
      api,
    }),
  );
}
