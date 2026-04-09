#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const source = resolve(root, "index.html");
const distDir = resolve(root, "dist");
const target = resolve(distDir, "index.html");

if (!existsSync(source)) {
  throw new Error("Missing index.html — static build cannot proceed.");
}

rmSync(distDir, { force: true, recursive: true });
mkdirSync(distDir, { recursive: true });
cpSync(source, target);

console.log(`Built static artifact: ${target}`);
