#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const args = process.argv.slice(2);
const inspectWorktree = args.includes("--worktree");
const filteredArgs = args.filter((arg) => arg !== "--worktree");

const git = (args) =>
  execFileSync("git", args, {
    cwd: process.cwd(),
    encoding: "utf8",
  }).trim();

const hasRef = (ref) => {
  try {
    execFileSync("git", ["rev-parse", "--verify", ref], {
      cwd: process.cwd(),
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
};

const defaultBaseRef = hasRef("origin/main") ? "origin/main" : "HEAD~1";
const [baseRef = defaultBaseRef, headRef = "HEAD"] = filteredArgs;

const diffArgs = inspectWorktree
  ? ["diff", "--name-only", "HEAD"]
  : ["diff", "--name-only", `${baseRef}...${headRef}`];

const changedFiles = git(diffArgs)
  .split(/\r?\n/)
  .map((file) => file.trim())
  .filter(Boolean);

const isProductPath = (file) =>
  file === "index.html" ||
  file === "package.json" ||
  file === "package-lock.json" ||
  file === "vercel.json" ||
  file.startsWith("scripts/") ||
  file.startsWith("src/") ||
  file.startsWith("app/") ||
  file.startsWith("public/") ||
  file.startsWith("assets/");

if (!changedFiles.some(isProductPath)) {
  console.log("No product paths changed; feature-memory gate passes.");
  process.exit(0);
}

const featureCoverage = new Map();

for (const file of changedFiles) {
  const match = file.match(/^specs\/([^/]+)\/(spec|plan|tasks)\.md$/);
  if (!match) {
    continue;
  }

  const [, featureId, kind] = match;
  const current = featureCoverage.get(featureId) || {
    spec: false,
    plan: false,
    tasks: false,
  };

  current[kind] = true;
  featureCoverage.set(featureId, current);
}

const validFeature = [...featureCoverage.entries()].find(
  ([, files]) => files.spec && files.plan && files.tasks,
);

if (validFeature) {
  console.log(
    `Feature-memory gate passed via specs/${validFeature[0]}/{spec,plan,tasks}.md`,
  );
  process.exit(0);
}

console.error(
  "Product paths changed without a complete feature-memory update.",
);
console.error(
  "Touch one specs/<feature-id>/ folder with spec.md, plan.md, and tasks.md in the same PR.",
);

if (featureCoverage.size > 0) {
  console.error("Observed feature-memory changes:");
  for (const [featureId, files] of featureCoverage.entries()) {
    const touched = Object.entries(files)
      .filter(([, touchedFlag]) => touchedFlag)
      .map(([name]) => `${name}.md`)
      .join(", ");
    console.error(`- ${featureId}: ${touched || "no complete files"}`);
  }
}

process.exit(1);
