import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { appendFileSync, readFileSync } from "node:fs";

const fixture = JSON.parse(
  readFileSync(process.env.REVIEW_SWITCH_FIXTURE, "utf8"),
);
let cancelled = false;
globalThis.setTimeout = (callback) => callback();
childProcess.execFileSync = (command, args) => {
  if (command !== "gh") throw new Error(`Unexpected command: ${command}`);
  appendFileSync(process.env.REVIEW_SWITCH_CALLS, `${JSON.stringify(args)}\n`);
  const [group, action] = args;
  if (group === "pr" && action === "view")
    return JSON.stringify({
      headRefOid:
        cancelled && fixture.headChanged ? "b".repeat(40) : fixture.head,
    });
  if (group === "variable" || (group === "pr" && action === "comment"))
    return "";
  if (group === "api")
    return JSON.stringify(
      fixture.pages || [
        {
          workflow_runs: [
            {
              id: fixture.run.databaseId,
              head_sha: fixture.run.headSha,
              run_attempt: fixture.run.attempt,
              event: "pull_request",
              pull_requests: [{ number: 1 }],
            },
          ],
        },
      ],
    );
  if (group === "run" && action === "view")
    return JSON.stringify({
      ...fixture.run,
      status:
        cancelled && !fixture.cancelStuck ? "completed" : fixture.run.status,
      conclusion:
        cancelled && !fixture.cancelStuck
          ? "cancelled"
          : fixture.run.conclusion,
      attempt:
        fixture.run.attempt + (cancelled && fixture.attemptChanged ? 1 : 0),
    });
  if (group === "run" && action === "cancel") {
    cancelled = true;
    if (fixture.cancelRace)
      throw new Error("Run completed before cancellation");
    return "";
  }
  if (group === "run" && action === "rerun") return "";
  throw new Error(`Unexpected gh call: ${args.join(" ")}`);
};
syncBuiltinESMExports();
