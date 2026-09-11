#!/usr/bin/env node

// Extracts every halftone dot of the hero artwork into
// `src/assets/images/landing/hero-dots.json`.
//
// The artwork is already a halftone on a square lattice, so the browser draws
// these dots as data instead of re-sampling the picture (re-sampling beats
// against the lattice and produces moire). Each dot keeps its centre, radius
// and ink (how dark the dot itself is, so faint far ridges stay grey).
//
// usage: pnpm run dots:extract [--source <png>] [--out <json>] [--pitch <px>]

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseArgs } from "node:util";
import { gzipSync } from "node:zlib";
import pngjs from "pngjs";

const { PNG } = pngjs;

const { values } = parseArgs({
  options: {
    source: {
      type: "string",
      default: "design/hero-mountains/halftone-alpine-serenity-1672x941.png",
    },
    out: {
      type: "string",
      default: "src/assets/images/landing/hero-dots.json",
    },
    pitch: { type: "string", default: "9.75" },
  },
});

const pitch = Number(values.pitch);
if (!(pitch > 2)) throw new Error(`Invalid lattice pitch: ${values.pitch}`);

// Darkness is 1 - luma. Paper sits near 0.048, full ink near 0.91.
const PAPER_DARK = 1 - 0.952;
const INK_DARK = 1 - 0.09;
const BASE = 0.06; // paper texture below this is ignored
const DETECT = 0.08; // blurred darkness a dot centre must reach
const XY_STEPS = 8; // 1/8 px
const R_STEPS = 16; // 1/16 px
const INK_LEVELS = 16; // stored as 0..15, alpha = (a + 1) / 16
const MAX_TONE_MAE = 0.03;

const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);

const png = PNG.sync.read(readFileSync(resolve(values.source)));
const W = png.width;
const H = png.height;

const dark = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  const k = i * 4;
  dark[i] =
    1 -
    (png.data[k] * 0.299 + png.data[k + 1] * 0.587 + png.data[k + 2] * 0.114) /
      255;
}

function blur3(src) {
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let sum = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = clamp(y + dy, 0, H - 1);
        for (let dx = -1; dx <= 1; dx++) {
          sum += src[yy * W + clamp(x + dx, 0, W - 1)];
        }
      }
      out[y * W + x] = sum / 9;
    }
  }
  return out;
}

// Two 3x3 passes: a 5x5 tent keeps every large dot single-peaked.
const blurred = blur3(blur3(dark));

// 1. Dot centres: local maxima of the blurred darkness. The lattice also has
// a dot in the centre of every cell (nearest neighbour pitch / sqrt 2), so
// the suppression window is a disc well inside that distance.
const SUPPRESS = pitch * 0.4;
const R = Math.floor(SUPPRESS);
const candidates = [];
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const v = blurred[y * W + x];
    if (v < DETECT) continue;
    let isPeak = true;
    for (let dy = -R; dy <= R && isPeak; dy++) {
      const yy = y + dy;
      if (yy < 0 || yy >= H) continue;
      for (let dx = -R; dx <= R; dx++) {
        const xx = x + dx;
        if ((dx === 0 && dy === 0) || xx < 0 || xx >= W) continue;
        if (dx * dx + dy * dy > SUPPRESS * SUPPRESS) continue;
        const u = blurred[yy * W + xx];
        if (u > v || (u === v && (dy < 0 || (dy === 0 && dx < 0)))) {
          isPeak = false;
          break;
        }
      }
    }
    if (!isPeak) continue;
    let peak = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const yy = clamp(y + dy, 0, H - 1);
        peak = Math.max(peak, dark[yy * W + clamp(x + dx, 0, W - 1)]);
      }
    }
    candidates.push({ x, y, peak, sw: 0, sx: 0, sy: 0, area: 0 });
  }
}

// 2. Every inked pixel belongs to its nearest centre (Voronoi); its coverage
// is measured against that dot's own peak, so a grey dot is not undersized.
const CELL = Math.ceil(pitch);
const GW = Math.ceil(W / CELL);
const GH = Math.ceil(H / CELL);
const buckets = Array.from({ length: GW * GH }, () => []);
candidates.forEach((c, i) => {
  buckets[Math.floor(c.y / CELL) * GW + Math.floor(c.x / CELL)].push(i);
});
const MAX_D2 = (pitch * 0.75) ** 2;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const w = dark[y * W + x] - BASE;
    if (w <= 0) continue;
    const gx = Math.floor(x / CELL);
    const gy = Math.floor(y / CELL);
    let best = -1;
    let bestD2 = MAX_D2;
    for (let by = gy - 1; by <= gy + 1; by++) {
      if (by < 0 || by >= GH) continue;
      for (let bx = gx - 1; bx <= gx + 1; bx++) {
        if (bx < 0 || bx >= GW) continue;
        for (const i of buckets[by * GW + bx]) {
          const c = candidates[i];
          const d2 = (c.x - x) ** 2 + (c.y - y) ** 2;
          if (d2 < bestD2) {
            bestD2 = d2;
            best = i;
          }
        }
      }
    }
    if (best < 0) continue;
    const c = candidates[best];
    c.sw += w;
    c.sx += w * x;
    c.sy += w * y;
    c.area += Math.min(1, w / Math.max(1e-6, c.peak - BASE));
  }
}

// 3. Quantize. Radius is re-fitted after ink quantization so that
// alpha * pi * r^2 (the dot's tone) is preserved.
const dots = [];
for (const c of candidates) {
  if (c.sw <= 0) continue;
  const ink = clamp((c.peak - BASE) / (INK_DARK - BASE), 0, 1);
  const level = Math.round(ink * INK_LEVELS);
  if (level < 1) continue;
  const alpha = level / INK_LEVELS;
  const r = Math.sqrt((ink * c.area) / (alpha * Math.PI));
  const rq = Math.round(r * R_STEPS);
  if (r < 0.3 || rq < 1) continue;
  dots.push({
    x: Math.round((c.sx / c.sw + 0.5) * XY_STEPS),
    y: Math.round((c.sy / c.sw + 0.5) * XY_STEPS),
    r: rq,
    a: level - 1,
  });
}

// 4. Sort by lattice row (rows sit half a pitch apart because of the centred
// dots), then by x, so neighbouring values repeat and compress well.
const rowOf = (d) => Math.round(d.y / XY_STEPS / (pitch / 2));
dots.sort((p, q) => rowOf(p) - rowOf(q) || p.x - q.x || p.y - q.y);

const asset = {
  w: W,
  h: H,
  pitch,
  n: dots.length,
  x: dots.map((d) => d.x),
  y: dots.map((d) => d.y),
  r: dots.map((d) => d.r),
  a: dots.map((d) => d.a),
};
const json = `${JSON.stringify(asset)}\n`;

// 5. Tone check: render the quantized dots at source resolution and compare
// both images blurred over one lattice cell.
const SS = 4;
const rendered = new Float32Array(W * H);
for (let i = 0; i < asset.n; i++) {
  const cx = asset.x[i] / XY_STEPS;
  const cy = asset.y[i] / XY_STEPS;
  const r = asset.r[i] / R_STEPS;
  const alpha = (asset.a[i] + 1) / INK_LEVELS;
  const x0 = Math.max(0, Math.floor(cx - r - 1));
  const x1 = Math.min(W - 1, Math.ceil(cx + r + 1));
  const y0 = Math.max(0, Math.floor(cy - r - 1));
  const y1 = Math.min(H - 1, Math.ceil(cy + r + 1));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      let inside = 0;
      for (let sy = 0; sy < SS; sy++) {
        const dy = y + (sy + 0.5) / SS - cy;
        for (let sx = 0; sx < SS; sx++) {
          const dx = x + (sx + 0.5) / SS - cx;
          if (dx * dx + dy * dy <= r * r) inside++;
        }
      }
      if (inside === 0) continue;
      const cover = (inside / (SS * SS)) * alpha;
      const k = y * W + x;
      rendered[k] += cover - rendered[k] * cover;
    }
  }
}

const tone = new Float32Array(W * H);
for (let i = 0; i < W * H; i++) {
  tone[i] = clamp((dark[i] - PAPER_DARK) / (INK_DARK - PAPER_DARK), 0, 1);
}

function boxBlur(src, radius) {
  const sat = new Float64Array((W + 1) * (H + 1));
  for (let y = 0; y < H; y++) {
    let row = 0;
    for (let x = 0; x < W; x++) {
      row += src[y * W + x];
      sat[(y + 1) * (W + 1) + x + 1] = sat[y * (W + 1) + x + 1] + row;
    }
  }
  const out = new Float32Array(W * H);
  for (let y = 0; y < H; y++) {
    const ya = Math.max(0, y - radius);
    const yb = Math.min(H, y + radius + 1);
    for (let x = 0; x < W; x++) {
      const xa = Math.max(0, x - radius);
      const xb = Math.min(W, x + radius + 1);
      const sum =
        sat[yb * (W + 1) + xb] -
        sat[ya * (W + 1) + xb] -
        sat[yb * (W + 1) + xa] +
        sat[ya * (W + 1) + xa];
      out[y * W + x] = sum / ((yb - ya) * (xb - xa));
    }
  }
  return out;
}

const blurRadius = Math.round(pitch);
const toneBlur = boxBlur(tone, blurRadius);
const renderBlur = boxBlur(rendered, blurRadius);
let frameError = 0;
let inkError = 0;
let inkPixels = 0;
for (let i = 0; i < W * H; i++) {
  const e = Math.abs(toneBlur[i] - renderBlur[i]);
  frameError += e;
  if (toneBlur[i] > 0.05) {
    inkError += e;
    inkPixels++;
  }
}
const frameMae = frameError / (W * H);
const inkMae = inkError / Math.max(1, inkPixels);

console.log(
  [
    `source      ${values.source} (${W}x${H}, pitch ${pitch}px)`,
    `dots        ${asset.n}`,
    `json        ${json.length} bytes, gzip ${gzipSync(json).length} bytes`,
    `tone MAE    ${inkMae.toFixed(4)} inked area (limit ${MAX_TONE_MAE}), ${frameMae.toFixed(4)} full frame`,
  ].join("\n"),
);

if (inkMae > MAX_TONE_MAE) {
  console.error(
    `Tone MAE ${inkMae.toFixed(4)} exceeds ${MAX_TONE_MAE}; not written.`,
  );
  process.exit(1);
}

writeFileSync(resolve(values.out), json);
console.log(`written     ${values.out}`);
