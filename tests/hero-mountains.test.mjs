import { test } from "node:test";
import assert from "node:assert/strict";

import {
  gridSpacing,
  snowcapTiming,
  toneToAlpha,
  toneToRadius,
} from "../src/scripts/hero-mountains.js";

test("gridSpacing scales with width and stays inside the 4..16px window", () => {
  assert.equal(gridSpacing(390), 4);
  assert.ok(Math.abs(gridSpacing(1440) - 1440 / 176) < 1e-9);
  assert.equal(gridSpacing(5000), 16);
});

test("toneToRadius grows with tone and never exceeds half the spacing", () => {
  const spacing = 8;
  assert.equal(toneToRadius(0, spacing), 0);
  assert.ok(toneToRadius(0.2, spacing) < toneToRadius(0.6, spacing));
  assert.ok(Math.abs(toneToRadius(1, spacing) - spacing / 2) < 1e-9);
  assert.ok(Math.abs(toneToRadius(4, spacing) - spacing / 2) < 1e-9);
});

test("toneToAlpha softens faint tones and saturates above 0.3", () => {
  assert.ok(Math.abs(toneToAlpha(0) - 0.55) < 1e-9);
  assert.ok(toneToAlpha(0.15) > 0.55 && toneToAlpha(0.15) < 1);
  assert.equal(toneToAlpha(0.3000001), 1);
  assert.equal(toneToAlpha(1), 1);
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
