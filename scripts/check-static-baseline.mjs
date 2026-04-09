#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd());

const requiredFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "index.html",
  "package.json",
  "vercel.json",
  "docs_dreamboard/project-idea.md",
  "docs_dreamboard/project/frontend/frontend-docs.md",
  "docs_dreamboard/project/devops/ai-orchestration-protocol.md",
  "docs_dreamboard/project/devops/ai-runner.md",
  "docs_dreamboard/project/devops/review-contract.md",
  "docs_dreamboard/project/devops/vercel-cd.md",
  ".github/workflows/ci.yml",
  ".github/workflows/pr-guard.yml",
  ".github/workflows/ai-review.yml",
  ".github/workflows/ai-command-policy.yml",
];

const missing = requiredFiles.filter(
  (file) => !existsSync(resolve(root, file)),
);

if (missing.length > 0) {
  console.error("Missing required baseline files:");
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

const html = readFileSync(resolve(root, "index.html"), "utf8");

if (!/<meta[^>]+name=["']viewport["']/i.test(html)) {
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
