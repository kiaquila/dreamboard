import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildField,
  coverTransform,
  decodeHeroDots,
  snowcapTiming,
} from "../src/scripts/hero-mountains.js";

const shipped = JSON.parse(
  readFileSync(
    new URL("../src/assets/images/landing/hero-dots.json", import.meta.url),
    "utf8",
  ),
);

const close = (actual, expected, epsilon = 1e-6) =>
  assert.ok(
    Math.abs(actual - expected) < epsilon,
    `expected ${actual} to be close to ${expected}`,
  );

/** A 100x100 artwork with pitch 10, built from [x, y, r, a] in source px. */
function syntheticAsset(dots) {
  return decodeHeroDots({
    w: 100,
    h: 100,
    pitch: 10,
    n: dots.length,
    x: dots.map((d) => Math.round(d[0] * 8)),
    y: dots.map((d) => Math.round(d[1] * 8)),
    r: dots.map((d) => Math.round(d[2] * 16)),
    a: dots.map((d) => d[3]),
  });
}

test("decodeHeroDots converts the quantized shipped asset to source pixels", () => {
  const asset = decodeHeroDots(shipped);
  assert.equal(asset.width, shipped.w);
  assert.equal(asset.height, shipped.h);
  assert.equal(asset.count, shipped.n);
  assert.ok(asset.count > 5000);
  close(asset.x[0], shipped.x[0] / 8);
  close(asset.y[0], shipped.y[0] / 8);
  close(asset.r[0], shipped.r[0] / 16);
  close(asset.alpha[0], (shipped.a[0] + 1) / 16);
  for (let i = 0; i < asset.count; i++) {
    assert.ok(asset.x[i] >= 0 && asset.x[i] <= asset.width);
    assert.ok(asset.y[i] >= 0 && asset.y[i] <= asset.height);
    assert.ok(asset.r[i] > 0 && asset.r[i] < asset.pitch);
    assert.ok(asset.alpha[i] > 0 && asset.alpha[i] <= 1);
  }
});

test("decodeHeroDots rejects malformed assets", () => {
  assert.throws(() => decodeHeroDots(null), /malformed/);
  assert.throws(
    () =>
      decodeHeroDots({
        w: 10,
        h: 10,
        pitch: 2,
        n: 2,
        x: [1],
        y: [],
        r: [],
        a: [],
      }),
    /malformed/,
  );
  assert.throws(() => decodeHeroDots({ ...shipped, pitch: 0 }), /malformed/);
});

test("coverTransform covers the width and anchors the artwork to the bottom", () => {
  const asset = { width: 1672, height: 941 };

  const desktop = coverTransform(asset, 1440, 900);
  close(desktop.scale, 1440 / 1672);
  close(desktop.offsetX, 0);
  close(desktop.offsetY + 941 * desktop.scale, 900);

  // Portrait phone: the band keeps 62% of the height, centred horizontally.
  const phone = coverTransform(asset, 390, 844);
  close(phone.scale, (844 * 0.62) / 941);
  close(phone.offsetX, (390 - 1672 * phone.scale) / 2);
  close(phone.offsetY + 941 * phone.scale, 844);
});

test("buildField keeps the artwork pitch on common viewports and thins only below 4px", () => {
  const asset = decodeHeroDots(shipped);

  const desktop = buildField(asset, 1440, 900);
  close(desktop.spacing, (asset.pitch * 1440) / 1672);
  assert.equal(desktop.thinned, false);
  assert.equal(desktop.dots.length, asset.count);
  const ends = desktop.dots.map((d) => d.delay + d.duration);
  assert.ok(
    ends.every((end, i) => i === 0 || end >= ends[i - 1]),
    "dots are ordered by the moment they settle",
  );

  const portrait = buildField(asset, 390, 844);
  assert.equal(portrait.thinned, false);
  assert.ok(portrait.spacing > 5 && portrait.spacing < 6);
  assert.ok(portrait.dots.length < asset.count, "off-screen dots are culled");

  const landscape = buildField(asset, 844, 390);
  assert.equal(landscape.thinned, false);
  assert.ok(landscape.spacing > 4);

  const small = buildField(asset, 667, 375);
  assert.equal(small.thinned, true);
  assert.ok(small.dots.length < asset.count / 2);
});

test("buildField culls dots beyond the canvas edges", () => {
  // The artwork is 100x100; a 100x50 canvas scales it by 1 and shows y >= 50.
  const asset = syntheticAsset([
    [50, 20, 1, 15],
    [50, 60, 1, 15],
    [-5, 80, 1, 15],
    [99.5, 99, 1, 15],
  ]);
  const field = buildField(asset, 100, 50);
  const positions = field.dots.map((d) => [d.x, d.y]);
  assert.deepEqual(positions, [
    [50, 10],
    [99.5, 49],
  ]);
});

test("buildField thinning keeps the summed tone of the merged dots", () => {
  const asset = syntheticAsset([
    [10, 90, 2, 15],
    [13, 93, 2, 7],
  ]);
  // Scale 0.3 gives a 3px pitch, below the 4px floor.
  const field = buildField(asset, 30, 30);
  assert.equal(field.thinned, true);
  assert.equal(field.dots.length, 1);
  const [dot] = field.dots;
  const tone = (a, r) => a * r * r;
  close(tone(dot.alpha, dot.radius), tone(1, 0.6) + tone(0.5, 0.6), 1e-4);
  assert.equal(dot.alpha, 1);
});

test("buildField starts every column at its skyline and delays deeper dots", () => {
  // 100x100 canvas at scale 1: one-pitch cells of 10px.
  const asset = syntheticAsset([
    [15, 40, 4, 15], // ridge cell (column 1, row 4)
    [15, 70, 4, 15], // slope below it
    [15, 30, 0.5, 2], // faint haze above the ridge: not a skyline
    [85, 60, 4, 15], // lower ridge of column 8
  ]);
  const field = buildField(asset, 100, 100);
  const at = (x, y) =>
    field.dots.find(
      (d) => Math.abs(d.x - x) < 1e-6 && Math.abs(d.y - y) < 1e-6,
    );

  // Delay is depth * 1.35 plus up to 0.1 of jitter.
  assert.ok(at(15, 40).delay < 0.1);
  assert.ok(at(85, 60).delay < 0.1, "each column has its own skyline");
  assert.ok(at(15, 30).delay < 0.1, "dots above the skyline never go negative");
  // Skyline of column 1 is the centre of row 4 (y = 45); the zone runs from
  // there to the bottom of the canvas.
  const depth = (70 - 45) / (100 - 45);
  const slope = at(15, 70);
  assert.ok(slope.delay >= depth * 1.35 - 1e-6);
  assert.ok(slope.delay < depth * 1.35 + 0.1);
});

test("buildField lifts a column skyline to its neighbours", () => {
  const asset = syntheticAsset([
    [15, 20, 4, 15], // high ridge in column 1
    [25, 60, 4, 15], // column 2 has no far ridge of its own
    [25, 80, 4, 15],
  ]);
  const field = buildField(asset, 100, 100);
  const deep = field.dots.find((d) => d.x === 25 && d.y === 80);
  // Column 2 inherits the column 1 skyline (y = 25), not its own (y = 65).
  const depth = (80 - 25) / (100 - 25);
  assert.ok(deep.delay >= Math.min(0.68, depth * 1.35) - 1e-6);
});

test("snowcapTiming starts ridge dots before deep dots and caps the delay", () => {
  const ridge = snowcapTiming(0, 0);
  const slope = snowcapTiming(0.3, 0);
  const base = snowcapTiming(1, 0);
  assert.equal(ridge.delay, 0);
  assert.ok(ridge.delay < slope.delay && slope.delay < base.delay);
  assert.ok(Math.abs(base.delay - 0.68) < 1e-9);
  const latest = snowcapTiming(1, 0.999999);
  assert.ok(latest.delay + latest.duration <= 1.0000001);
  assert.ok(snowcapTiming(0.3, 0.999).delay > slope.delay);
});
