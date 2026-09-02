#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const inspectWorktree = args.includes("--worktree");
const inspectDependencyOnly = args.includes("--dependency-only");
const filteredArgs = args.filter(
  (arg) => arg !== "--worktree" && arg !== "--dependency-only",
);
const repoRoot = resolve(process.cwd());

const git = (args) =>
  execFileSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();

const hasRef = (ref) => {
  try {
    execFileSync("git", ["rev-parse", "--verify", ref], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
};

const [
  baseRefInput = process.env.GITHUB_BASE_REF || "origin/main",
  headRef = "HEAD",
] = filteredArgs;

const preferredBaseRef = process.env.GITHUB_BASE_REF
  ? `origin/${process.env.GITHUB_BASE_REF}`
  : "origin/main";
const baseRef = hasRef(baseRefInput)
  ? baseRefInput
  : hasRef(preferredBaseRef)
    ? preferredBaseRef
    : hasRef("origin/main")
      ? "origin/main"
      : "HEAD~1";

const diffArgs = inspectWorktree
  ? ["diff", "--name-only", "HEAD"]
  : ["diff", "--name-only", `${baseRef}...${headRef}`];

const changedFiles = git(diffArgs)
  .split(/\r?\n/)
  .map((file) => file.trim())
  .filter(Boolean);

const isDependencyManifest = (file) =>
  file === "package.json" || file === "pnpm-lock.yaml";

const dependencyFields = new Set([
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
]);

const readManifest = (ref, fromWorktree = false) => {
  try {
    if (fromWorktree) {
      return JSON.parse(
        readFileSync(resolve(repoRoot, "package.json"), "utf8"),
      );
    }

    return JSON.parse(git(["show", `${ref}:package.json`]));
  } catch {
    return null;
  }
};

const withoutDependencyFields = (manifest) => {
  if (!manifest) {
    return null;
  }

  return Object.fromEntries(
    Object.entries(manifest).filter(([field]) => !dependencyFields.has(field)),
  );
};

const usesPinChangeOnly = () => {
  const workflowFiles = changedFiles.filter((file) =>
    file.startsWith(".github/workflows/"),
  );

  if (workflowFiles.length === 0) {
    return true;
  }

  const changedLines = git(
    inspectWorktree
      ? ["diff", "--unified=0", "HEAD", "--", ...workflowFiles]
      : [
          "diff",
          "--unified=0",
          `${baseRef}...${headRef}`,
          "--",
          ...workflowFiles,
        ],
  )
    .split(/\r?\n/)
    .filter((line) => line.startsWith("+") || line.startsWith("-"))
    .filter((line) => !line.startsWith("+++") && !line.startsWith("---"));

  const pinnedUse =
    /^[+-]\s*uses:\s*([\w.-]+(?:\/[\w.-]+)+)@([a-f0-9]{40})(?:\s+#.*)?$/i;

  if (changedLines.length === 0 || changedLines.length % 2 !== 0) {
    return false;
  }

  for (let index = 0; index < changedLines.length; index += 2) {
    const previous = changedLines[index];
    const next = changedLines[index + 1];
    const previousMatch = previous.match(pinnedUse);
    const nextMatch = next.match(pinnedUse);

    if (
      !previousMatch ||
      !nextMatch ||
      !previous.startsWith("-") ||
      !next.startsWith("+") ||
      previousMatch[1] !== nextMatch[1]
    ) {
      return false;
    }
  }

  return true;
};

const isDependencyOnlyChange = () => {
  if (changedFiles.length === 0) {
    return false;
  }

  if (
    !changedFiles.every(
      (file) =>
        isDependencyManifest(file) || file.startsWith(".github/workflows/"),
    )
  ) {
    return false;
  }

  if (changedFiles.includes("package.json")) {
    const comparisonBase = inspectWorktree
      ? headRef
      : git(["merge-base", baseRef, headRef]);
    const baseManifest = readManifest(comparisonBase);
    const headManifest = readManifest(headRef, inspectWorktree);

    if (
      !baseManifest ||
      !headManifest ||
      JSON.stringify(withoutDependencyFields(baseManifest)) !==
        JSON.stringify(withoutDependencyFields(headManifest))
    ) {
      return false;
    }
  }

  return usesPinChangeOnly();
};

if (inspectDependencyOnly) {
  process.exit(isDependencyOnlyChange() ? 0 : 1);
}

if (isDependencyOnlyChange()) {
  console.log("Dependency-only change; feature memory is not required.");
  process.exit(0);
}

// Build-contract and repository-owned orchestration changes should participate
// in the same feature-memory rule as UI code.
const isProductPath = (file) =>
  file === "index.html" ||
  isDependencyManifest(file) ||
  file === "pnpm-workspace.yaml" ||
  file === "vercel.json" ||
  file === ".htmlvalidate.json" ||
  file.startsWith(".github/workflows/") ||
  file.startsWith("scripts/") ||
  file.startsWith("src/") ||
  file.startsWith("app/") ||
  file.startsWith("public/") ||
  file.startsWith("assets/");

if (!changedFiles.some(isProductPath)) {
  console.log("No product paths changed; feature-memory gate passes.");
  process.exit(0);
}

const featureIds = new Set();

for (const file of changedFiles) {
  const match = file.match(/^specs\/([^/]+)\//);
  if (!match) {
    continue;
  }

  featureIds.add(match[1]);
}

const hasCompleteFeatureMemory = (featureId) =>
  existsSync(resolve(repoRoot, "specs", featureId, "spec.md")) &&
  existsSync(resolve(repoRoot, "specs", featureId, "plan.md")) &&
  existsSync(resolve(repoRoot, "specs", featureId, "tasks.md"));

const validFeature = [...featureIds].find(hasCompleteFeatureMemory);

if (validFeature) {
  console.log(
    `Feature-memory gate passed via specs/${validFeature}/{spec,plan,tasks}.md`,
  );
  process.exit(0);
}

console.error(
  "Product paths changed without a complete feature-memory update.",
);
console.error(
  "Touch one specs/<feature-id>/ folder with spec.md, plan.md, and tasks.md in the same PR.",
);

if (featureIds.size > 0) {
  console.error("Observed feature-memory folders:");
  for (const featureId of featureIds) {
    console.error(
      `- ${featureId}: ${
        hasCompleteFeatureMemory(featureId)
          ? "complete feature memory present"
          : "missing one or more of spec.md, plan.md, tasks.md"
      }`,
    );
  }
}

process.exit(1);
