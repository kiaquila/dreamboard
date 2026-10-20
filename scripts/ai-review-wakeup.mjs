#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { readReviewUpdates } from "./codex-review-updates.mjs";
import {
  invalidationCutoff,
  isInvalidationMutation,
} from "./codex-review-invalidations.mjs";
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
      ((codexReviewerLogins.has(event.comment?.user?.login) &&
        (event.action !== "created" || isCodexWakeupComment(event.comment))) ||
        isInvalidationMutation(event))
    );
  }
  if (eventName === "pull_request_review") {
    return (
      ["submitted", "edited", "dismissed"].includes(event.action) &&
      codexReviewerLogins.has(event.review?.user?.login)
    );
  }
  if (eventName === "pull_request_review_comment") {
    return (
      ["created", "edited", "deleted"].includes(event.action) &&
      Boolean(event.pull_request?.number) &&
      codexReviewerLogins.has(event.comment?.user?.login)
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
  // The deleted object is absent from subsequent API reads. Retain a negative
  // boundary before requeue, even when no gate run exists yet. GitHub assigns
  // its timestamp; a rerun must obtain a newly created native assessment after it.
  const recordDeletion =
    event.action === "deleted" ||
    (eventName === "issue_comment" && isInvalidationMutation(event));
  if (recordDeletion) {
    if (!Number.isSafeInteger(event.comment?.id) || event.comment.id <= 0)
      throw new Error("Invalid deleted evidence identifier.");
    const record = await api(`/issues/${number}/comments`, {
      method: "POST",
      body: {
        body: `<!-- codex-review-invalidation:v1 ${JSON.stringify({
          head_sha: head,
          source_event: eventName,
          source_id: event.comment.id,
        })} -->\nNative evidence was deleted or its invalidation record changed. A newly created native assessment is required before success.`,
      },
    });
    if (!invalidationCutoff([record], head))
      throw new Error("Could not persist native evidence invalidation.");
  }
  const runs = await api(
    `/actions/workflows/ai-review.yml/runs?event=pull_request&head_sha=${head}&per_page=100`,
    { paginate: true },
  );
  const run = runs
    .filter(
      (entry) =>
        entry.head_sha === head &&
        entry.event === "pull_request" &&
        entry.pull_requests?.some((pr) => pr.number === number),
    )
    .sort((a, b) => b.id - a.id)[0];
  if (!run) return "active-or-missing";
  const rerun = async () => {
    try {
      await api(`/actions/runs/${run.id}/rerun`, { method: "POST" });
      return `rerun:${run.id}`;
    } catch (error) {
      // Independent deliveries can both reach the final read before one queues
      // the new attempt. Do not retry or cancel the attempt that won the race.
      const current = await api(`/actions/runs/${run.id}`);
      if (
        current.run_attempt !== run.run_attempt ||
        current.status !== "completed"
      )
        return "changed";
      throw error;
    }
  };
  const isPositive = (body) =>
    classifyCodexSummaryComment({ ...event.comment, body }, head, {
      allowUnboundLegacy: true,
    }).outcome === "pass";
  const summaryOnlyEdit =
    event.comment?.body?.includes(
      "<!-- codex-pull-request-review-summary -->",
    ) && !isPositive(event.changes?.body?.from || "");
  const invalidatingEvidence =
    recordDeletion ||
    eventName === "pull_request_review" ||
    eventName === "pull_request_review_comment" ||
    (eventName === "issue_comment" &&
      (event.action === "deleted" ||
        (["created", "edited"].includes(event.action) &&
          !summaryOnlyEdit &&
          !isPositive(event.comment.body))));
  if (invalidatingEvidence) {
    // A trusted invalidation webhook is evidence even if persisted timestamps
    // tie the gate start. Deletions now have a durable negative record. Cancel an active
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
    // The webhook precedes this relative delay. The new attempt must therefore
    // start in a later timestamp second, preventing completion from replaying
    // a persisted signal tied with the old attempt start.
    await wait(1100);
    const finalPull = await api(`/pulls/${number}`);
    const finalRun = await api(`/actions/runs/${run.id}`);
    if (
      finalPull.head.sha !== head ||
      finalPull.state !== "open" ||
      finalRun.status !== "completed" ||
      finalRun.run_attempt !== run.run_attempt
    )
      return "changed";
    return rerun();
  }
  // The active gate polls. Its completion event closes the finish/reply race.
  if (run.status !== "completed") return "active-or-missing";
  const comments = await api(`/issues/${number}/comments?per_page=100`, {
    paginate: true,
  });
  const reviews = await api(`/pulls/${number}/reviews?per_page=100`, {
    paginate: true,
  });
  const inlineComments = await api(`/pulls/${number}/comments?per_page=100`, {
    paginate: true,
  });
  const currentReviews = reviews.filter(
    (review) =>
      review.commit_id === head && codexReviewerLogins.has(review.user?.login),
  );
  const reviewUpdates = await readReviewUpdates(currentReviews, api);
  const newestSignal = Math.max(
    0,
    // A deletion record may arrive after another attempt's final evidence read.
    // Completion must notice it even if its delivery observed an older attempt.
    invalidationCutoff(comments, head),
    // Keep edits that withdraw or replace recognized evidence visible even on
    // workflow completion, when the original edit webhook is no longer present.
    ...[...comments, ...inlineComments]
      .filter((comment) => codexReviewerLogins.has(comment.user?.login))
      .map(codexCommentTimestamp),
    ...reviewUpdates.values(),
  );
  // At most one follow-up attempt per new evidence timestamp, including when
  // evidence arrives just as the old gate completes. Reruns start after it.
  const attemptStart = Date.parse(run.run_started_at || run.created_at);
  if (newestSignal < attemptStart) return "already-evaluated";
  // Equal-second evidence may have arrived after the final read. Reevaluate
  // conservatively, after a relative delay that makes the next start later.
  if (newestSignal === attemptStart) await wait(1100);
  const currentPull = await api(`/pulls/${number}`);
  const currentRun = await api(`/actions/runs/${run.id}`);
  if (
    currentPull.head.sha !== head ||
    currentPull.state !== "open" ||
    currentRun.status !== "completed" ||
    currentRun.run_attempt !== run.run_attempt
  )
    return "changed";
  return rerun();
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
      const pageItems = Array.isArray(data) ? data : data.workflow_runs;
      if (!Array.isArray(pageItems))
        throw new Error(`Invalid paginated response from ${path}`);
      items.push(...pageItems);
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
