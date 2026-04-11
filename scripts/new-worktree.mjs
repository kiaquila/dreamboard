#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const options = {
  feature: "",
  branch: "",
  path: "",
  base: "origin/main",
};

const usage = [
  "Usage:",
  "  node scripts/new-worktree.mjs --feature <feature-id> [--branch <branch>] [--path <dir>] [--base <ref>]",
  "  node scripts/new-worktree.mjs --branch <branch> [--path <dir>] [--base <ref>]",
].join("\n");

for (let index = 0; index < args.length; index += 1) {
  const current = args[index];

  switch (current) {
    case "--feature":
      options.feature = (args[index + 1] || "").trim();
      index += 1;
      break;
    case "--branch":
      options.branch = (args[index + 1] || "").trim();
      index += 1;
      break;
    case "--path":
      options.path = (args[index + 1] || "").trim();
      index += 1;
      break;
    case "--base":
      options.base = (args[index + 1] || "").trim() || "origin/main";
      index += 1;
      break;
    default:
      throw new Error(`Unknown argument: ${current}\n\n${usage}`);
  }
}

if (!options.feature && !options.branch) {
  throw new Error(`Provide --feature or --branch.\n\n${usage}`);
}

const run = (command, commandArgs, cwd) =>
  execFileSync(command, commandArgs, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  }).trim();

const repoRoot = run("git", ["rev-parse", "--show-toplevel"], process.cwd());
const repoParent = dirname(repoRoot);
const featureSlug = (options.feature || options.branch)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
const branch = options.branch || `codex/${featureSlug}`;
const worktreePath = resolve(
  repoParent,
  options.path || `dreamboard-${featureSlug}`,
);

if (existsSync(worktreePath)) {
  throw new Error(`Worktree path already exists: ${worktreePath}`);
}

run("git", ["fetch", "--all", "--prune"], repoRoot);

const branchLookup = spawnSync("git", ["rev-parse", "--verify", branch], {
  cwd: repoRoot,
  stdio: "ignore",
});

if (branchLookup.status === 0) {
  throw new Error(`Branch already exists locally: ${branch}`);
}

run(
  "git",
  ["worktree", "add", "-b", branch, worktreePath, options.base],
  repoRoot,
);

console.log(`Created worktree: ${worktreePath}`);
console.log(`Branch: ${branch}`);
console.log("Next steps:");
console.log(`  cd ${worktreePath}`);
if (options.feature) {
  console.log(
    `  node scripts/start-implementation-worker.mjs --feature ${options.feature} --copy`,
  );
}
