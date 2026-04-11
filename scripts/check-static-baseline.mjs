#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());

const requiredFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  ".specify/memory/constitution.md",
  "index.html",
  "package.json",
  "vercel.json",
  ".gemini/config.yaml",
  ".gemini/styleguide.md",
  "docs_dreamboard/README.md",
  "docs_dreamboard/adr/README.md",
  "docs_dreamboard/project-idea.md",
  "docs_dreamboard/project/frontend/frontend-docs.md",
  "docs_dreamboard/project/devops/ai-orchestration-protocol.md",
  "docs_dreamboard/project/devops/ai-runner.md",
  "docs_dreamboard/project/devops/ai-pr-workflow.md",
  "docs_dreamboard/project/devops/macos-local-runners.md",
  "docs_dreamboard/project/devops/delivery-playbook.md",
  "docs_dreamboard/project/devops/review-contract.md",
  "docs_dreamboard/project/devops/vercel-cd.md",
  "scripts/check-feature-memory.mjs",
  "scripts/set-implementation-agent.mjs",
  "scripts/new-worktree.mjs",
  "scripts/start-implementation-worker.mjs",
  "scripts/publish-branch.mjs",
  ".github/workflows/ci.yml",
  ".github/workflows/pr-guard.yml",
  ".github/workflows/ai-review.yml",
  ".github/workflows/ai-command-policy.yml",
];

const requiredDirs = ["specs"];

const missing = requiredFiles.filter(
  (file) => !existsSync(resolve(root, file)),
);

const missingDirs = requiredDirs.filter(
  (dir) => !existsSync(resolve(root, dir)),
);

if (missing.length > 0 || missingDirs.length > 0) {
  console.error("Missing required baseline files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  for (const dir of missingDirs) {
    console.error(`- ${dir}/`);
  }
  process.exit(1);
}

const html = readFileSync(resolve(root, "index.html"), "utf8");

if (!/<meta[^>]+name=["']viewport["'][^>]*>/i.test(html)) {
  console.error("index.html must include a viewport meta tag.");
  process.exit(1);
}

if (!html.includes("fabric.min.js")) {
  console.error(
    "index.html is expected to include the current Fabric.js editor dependency.",
  );
  process.exit(1);
}

console.log("Repository baseline OK.");
