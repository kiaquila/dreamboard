import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

test("logo exports retain the canonical KS hashes and one shared geometry", async () => {
  const root = new URL("../", import.meta.url);
  const manifest = JSON.parse(
    await readFile(new URL("docs/logo-assets.json", root), "utf8"),
  );
  const shapes = [];
  for (const [name, expected] of Object.entries(manifest.variants)) {
    const svg = await readFile(
      new URL(`${manifest.assetDirectory}/${name}`, root),
      "utf8",
    );
    assert.equal(
      createHash("sha256").update(svg).digest("hex"),
      expected.sha256,
      name,
    );
    assert.match(svg, /width="121" height="20" viewBox="0 -17 121 20"/);
    assert.match(svg, />ks-design\.art<\/title>/);
    assert.doesNotMatch(
      svg,
      /<(?:text|script|image|style)\b|font-family|currentColor/,
    );
    shapes.push(svg.replace(`fill="${expected.ink}"`, 'fill="INK"'));
  }
  assert.equal(shapes.length, 2);
  assert.equal(shapes[0], shapes[1]);
});
