import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const packageJson = JSON.parse(
  await readFile(new URL("../package.json", import.meta.url), "utf8"),
);
const wrangler = JSON.parse(
  await readFile(new URL("../wrangler.json", import.meta.url), "utf8"),
);
const worker = await readFile(
  new URL("../worker/index.js", import.meta.url),
  "utf8",
);
const vercel = JSON.parse(
  await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
);

test("Cloudflare stage keeps production and preview commands separate", () => {
  assert.match(packageJson.scripts["stage:deploy"], /wrangler deploy$/);
  assert.match(
    packageJson.scripts["stage:preview"],
    /wrangler versions upload$/,
  );
});

test("Cloudflare serves the static artifact with pull-request previews", () => {
  assert.equal(wrangler.name, "dreamboard");
  assert.equal(wrangler.workers_dev, true);
  assert.equal(wrangler.preview_urls, true);
  assert.deepEqual(wrangler.assets, {
    directory: "./dist",
    binding: "ASSETS",
    run_worker_first: true,
    html_handling: "auto-trailing-slash",
    not_found_handling: "single-page-application",
  });
});

test("Cloudflare Worker mirrors every Vercel security header", () => {
  const vercelHeaders = vercel.headers.flatMap((rule) => rule.headers);

  for (const { key, value } of vercelHeaders) {
    assert.ok(worker.includes(JSON.stringify(key)), `missing header ${key}`);
    assert.ok(worker.includes(JSON.stringify(value)), `wrong value for ${key}`);
  }
});
