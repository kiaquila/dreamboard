#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const options = {
  to: "",
  pr: "",
  rerun: true,
  comment: true,
  repo: "",
};

const usage = [
  "Usage:",
  "  node scripts/switch-review-agent.mjs --to <codex|gemini|claude> [--pr <number>] [--no-rerun] [--no-comment] [--repo <owner/name>]",
].join("\n");

for (let index = 0; index < args.length; index += 1) {
  const current = args[index];

  switch (current) {
    case "--to":
      options.to = (args[index + 1] || "").trim().toLowerCase();
      index += 1;
      break;
    case "--pr":
      options.pr = (args[index + 1] || "").trim();
      index += 1;
      break;
    case "--no-rerun":
      options.rerun = false;
      break;
    case "--no-comment":
      options.comment = false;
      break;
    case "--repo":
      options.repo = (args[index + 1] || "").trim();
      index += 1;
      break;
    default:
      throw new Error(`Unknown argument: ${current}\n\n${usage}`);
  }
}

const validAgents = new Set(["codex", "gemini", "claude"]);
if (!validAgents.has(options.to)) {
  throw new Error(`--to must be one of: codex, gemini, claude\n\n${usage}`);
}

const triggerBodies = {
  codex: "@codex review",
  gemini: "/gemini review",
  claude: "@claude review once",
};

const run = (command, commandArgs) =>
  execFileSync(command, commandArgs, {
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  }).trim();

const repoArgs = options.repo ? ["--repo", options.repo] : [];

// Step 0: resolve PR number from the current branch if not supplied.
if (!options.pr) {
  let json;
  try {
    json = run("gh", ["pr", "view", "--json", "number", ...repoArgs]);
  } catch (error) {
    throw new Error(
      "No open PR detected for the current branch. Pass --pr <number> explicitly.",
    );
  }
  options.pr = String(JSON.parse(json).number);
}

const prSnapshot = JSON.parse(
  run("gh", ["pr", "view", options.pr, "--json", "headRefOid", ...repoArgs]),
);
const requestedHead = prSnapshot.headRefOid;
if (options.to === "codex") triggerBodies.codex += ` ${requestedHead}`;

// Step 1: flip the AI_REVIEW_AGENT repository variable.
run("gh", [
  "variable",
  "set",
  "AI_REVIEW_AGENT",
  "--body",
  options.to,
  ...repoArgs,
]);
console.log(`Repository variable AI_REVIEW_AGENT set to ${options.to}.`);

// Step 2: post the native trigger comment on the target PR.
if (options.comment) {
  run("gh", [
    "pr",
    "comment",
    options.pr,
    "--body",
    triggerBodies[options.to],
    ...repoArgs,
  ]);
  console.log(`Posted "${triggerBodies[options.to]}" on PR #${options.pr}.`);
} else {
  console.log("Skipped native trigger comment because --no-comment was used.");
}

// Step 3: reevaluate the selected policy in the latest PR-linked same-head run.
if (options.rerun) {
  const prJson = run("gh", [
    "pr",
    "view",
    options.pr,
    "--json",
    "headRefOid",
    ...repoArgs,
  ]);
  const headSha = JSON.parse(prJson).headRefOid;
  if (headSha !== requestedHead)
    throw new Error(
      "PR head changed after the review request; refusing stale requeue.",
    );

  const runsJson = run("gh", [
    "run",
    "list",
    "--workflow",
    "ai-review.yml",
    "--commit",
    headSha,
    "--event",
    "pull_request",
    "--limit",
    "10",
    "--json",
    "databaseId,conclusion,headSha,status,attempt",
    ...repoArgs,
  ]);
  const runs = JSON.parse(runsJson);
  const target = runs.find((entry) => entry.headSha === headSha);

  if (target) {
    const readAttempt = () => {
      const current = JSON.parse(
        run("gh", [
          "run",
          "view",
          String(target.databaseId),
          "--json",
          "headSha,status,conclusion,attempt",
          ...repoArgs,
        ]),
      );
      const liveHead = JSON.parse(
        run("gh", [
          "pr",
          "view",
          options.pr,
          "--json",
          "headRefOid",
          ...repoArgs,
        ]),
      ).headRefOid;
      if (
        liveHead !== requestedHead ||
        current.headSha !== requestedHead ||
        current.attempt !== target.attempt
      )
        throw new Error(
          "PR head or run attempt changed; refusing stale requeue.",
        );
      return current;
    };
    let current = readAttempt();
    if (current.status !== "completed") {
      console.log(
        `Cancelling active AI Review run ${target.databaseId} before selecting ${options.to}.`,
      );
      try {
        run("gh", ["run", "cancel", String(target.databaseId), ...repoArgs]);
      } catch (error) {
        // The run may have finished between our read and the cancel request.
        if (readAttempt().status !== "completed") throw error;
      }
      for (let poll = 0; poll < 60; poll += 1) {
        current = readAttempt();
        if (current.status === "completed") break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      if (current.status !== "completed")
        throw new Error(
          "AI Review cancellation did not complete; no rerun dispatched.",
        );
    }
    current = readAttempt();
    // `gh run rerun --failed` only reruns jobs whose conclusion is
    // literally `failure`. For runs that ended in `cancelled`,
    // `timed_out`, `startup_failure`, or `action_required` there
    // may be no `failure`-conclusion jobs at all, so `--failed`
    // would fail the command. Rerun the whole run in those cases
    // and keep the targeted `--failed` behavior only for actual
    // job failures.
    const rerunArgs = ["run", "rerun", String(target.databaseId), ...repoArgs];
    if (current.conclusion === "failure") {
      rerunArgs.push("--failed");
    }
    run("gh", rerunArgs);
    console.log(
      `Re-run dispatched for AI Review run ${target.databaseId} (conclusion: ${current.conclusion}).`,
    );
  } else {
    console.log(
      "No rerunable AI Review run found for the current head SHA; skipping rerun.",
    );
  }
} else {
  console.log("Skipped AI Review rerun because --no-rerun was used.");
}
