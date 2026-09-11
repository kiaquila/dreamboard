// Hero dotted mountains.
//
// The landing hero draws the halftone artwork as data. Every dot of the source
// picture was extracted once (`scripts/extract-hero-dots.mjs`) into
// `hero-dots.json` with its centre, radius and ink, and the dots are only
// scaled to the section, never re-sampled, so the artwork's lattice cannot beat
// into moire. When a hero slide becomes visible the dots settle in from the
// summits downward, like snow covering the slopes ("snowcap" assembly).
// Reduced-motion users get the final frame immediately.

const DOTS_URL = new URL(
  "../assets/images/landing/hero-dots.json",
  import.meta.url,
).href;

export const HERO_PAPER = "#f4f2ee";
export const HERO_INK = "#1b1b1b";

const XY_STEPS = 8;
const R_STEPS = 16;
const INK_LEVELS = 16;
const MIN_BAND_HEIGHT = 0.62;
const MIN_PITCH = 4;
// The artwork's dense foreground dots read too heavy at full size. Dots up to
// the median radius keep their size, the largest ones are drawn at
// LARGE_DOT_SCALE, and the factor ramps linearly in between, so a larger dot
// always stays larger and the near/far gradation survives.
export const LARGE_DOT_SCALE = 0.75;
const SMALL_DOT_RATIO = 0.16; // radius / pitch, about the median dot
const LARGE_DOT_RATIO = 0.35; // radius / pitch, about the 98th percentile

/** Drawn-radius factor for a dot whose extracted radius is `ratio` * pitch. */
export function dotRadiusScale(ratio) {
  const t = clamp(
    (ratio - SMALL_DOT_RATIO) / (LARGE_DOT_RATIO - SMALL_DOT_RATIO),
    0,
    1,
  );
  return 1 - (1 - LARGE_DOT_SCALE) * t;
}
const SKYLINE_TONE = 0.077;
const ASSEMBLE_DURATION_MS = 2600;
const ALPHA_BUCKETS = 12;
const REGENERATE_DELAY_MS = 200;
const PLAY_VISIBILITY = 0.5;

const clamp = (value, min, max) =>
  value < min ? min : value > max ? max : value;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const alphaBuckets = () => Array.from({ length: ALPHA_BUCKETS + 1 }, () => []);
const bucketOf = (alpha) =>
  Math.min(ALPHA_BUCKETS, Math.max(1, Math.round(alpha * ALPHA_BUCKETS)));

/**
 * Snowcap timing for one dot, in fractions of the whole timeline.
 * `depth` is how far the dot sits below the skyline of its column (0 = ridge,
 * 1 = bottom of the mountain zone). Shallow dots appear first, deep ones last;
 * `jitter` in [0, 1) breaks up the rows. delay + jitter + duration never
 * exceeds 1, so the deepest dots still finish inside the timeline.
 */
export function snowcapTiming(depth, jitter) {
  return {
    delay: clamp(depth * 1.35, 0, 0.68) + jitter * 0.1,
    duration: 0.22,
  };
}

/** Deterministic hash in [0, 1) so the field is identical across reloads. */
function hash(i, j) {
  let h = (i * 374761393 + j * 668265263 + 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * Turns the quantized JSON asset into source-pixel arrays:
 * `x`, `y` are stored in 1/8 px, `r` in 1/16 px and ink `a` as 0..15
 * (alpha `(a + 1) / 16`).
 */
export function decodeHeroDots(json) {
  const { w, h, pitch, n } = json || {};
  const valid =
    Number.isInteger(w) &&
    w > 0 &&
    Number.isInteger(h) &&
    h > 0 &&
    Number.isFinite(pitch) &&
    pitch > 0 &&
    Number.isInteger(n) &&
    n >= 0 &&
    ["x", "y", "r", "a"].every(
      (key) => Array.isArray(json[key]) && json[key].length === n,
    );
  if (!valid) throw new Error("Hero dots asset is malformed.");

  const x = new Float32Array(n);
  const y = new Float32Array(n);
  const r = new Float32Array(n);
  const alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    x[i] = json.x[i] / XY_STEPS;
    y[i] = json.y[i] / XY_STEPS;
    r[i] = json.r[i] / R_STEPS;
    alpha[i] = (clamp(json.a[i], 0, INK_LEVELS - 1) + 1) / INK_LEVELS;
  }
  return { width: w, height: h, pitch, count: n, x, y, r, alpha };
}

/**
 * The artwork covers the full width, anchored to the bottom, and never takes
 * less than MIN_BAND_HEIGHT of the height on tall (phone) viewports.
 */
export function coverTransform(asset, width, height) {
  const scale = Math.max(
    width / asset.width,
    (height * MIN_BAND_HEIGHT) / asset.height,
  );
  return {
    scale,
    offsetX: (width - asset.width * scale) / 2,
    offsetY: height - asset.height * scale,
  };
}

/**
 * Builds the dot field for a canvas of `width` x `height` CSS px.
 *
 * The artwork's lattice has a dot at every cell corner and every cell centre,
 * so one dot owns pitch^2 / 2 of paper. If the scaled pitch drops below
 * MIN_PITCH, dots are merged 4 to 1 into square cells of pitch * sqrt(2):
 * each merged dot sits at the tone-weighted centre and keeps the summed tone.
 * Skyline and timing use the extracted radii; only the drawn radius goes
 * through dotRadiusScale.
 */
export function buildField(asset, width, height) {
  const { scale, offsetX, offsetY } = coverTransform(asset, width, height);
  const pitch = asset.pitch * scale;
  const thin = pitch < MIN_PITCH;
  const spacing = thin ? pitch * Math.SQRT2 : pitch;

  let xs = [];
  let ys = [];
  let rs = [];
  let as = [];
  for (let i = 0; i < asset.count; i++) {
    const x = offsetX + asset.x[i] * scale;
    const y = offsetY + asset.y[i] * scale;
    const r = asset.r[i] * scale;
    if (x + r < 0 || x - r > width || y + r < 0 || y - r > height) continue;
    xs.push(x);
    ys.push(y);
    rs.push(r);
    as.push(asset.alpha[i]);
  }

  if (thin) {
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;
    const tone = new Float64Array(cols * rows);
    const sumX = new Float64Array(cols * rows);
    const sumY = new Float64Array(cols * rows);
    const peak = new Float32Array(cols * rows);
    for (let i = 0; i < xs.length; i++) {
      const cell =
        clamp(Math.floor(ys[i] / spacing), 0, rows - 1) * cols +
        clamp(Math.floor(xs[i] / spacing), 0, cols - 1);
      const t = as[i] * rs[i] * rs[i];
      tone[cell] += t;
      sumX[cell] += t * xs[i];
      sumY[cell] += t * ys[i];
      peak[cell] = Math.max(peak[cell], as[i]);
    }
    xs = [];
    ys = [];
    rs = [];
    as = [];
    for (let cell = 0; cell < tone.length; cell++) {
      if (tone[cell] <= 0) continue;
      xs.push(sumX[cell] / tone[cell]);
      ys.push(sumY[cell] / tone[cell]);
      rs.push(Math.sqrt(tone[cell] / peak[cell]));
      as.push(peak[cell]);
    }
  }

  // Skyline: the first toned cell of every one-pitch column drives the
  // snowcap order. Tone is summed per cell so faint haze does not count, and
  // each column takes the highest skyline of its neighbours, so a column whose
  // far ridge falls just under the threshold does not start early as a streak.
  const cols = Math.max(1, Math.ceil(width / spacing));
  const rows = Math.max(1, Math.ceil(height / spacing));
  const columnOf = (x) => clamp(Math.floor(x / spacing), 0, cols - 1);
  const cellTone = new Float32Array(cols * rows);
  for (let i = 0; i < xs.length; i++) {
    const row = clamp(Math.floor(ys[i] / spacing), 0, rows - 1);
    cellTone[row * cols + columnOf(xs[i])] +=
      (as[i] * Math.PI * rs[i] * rs[i]) / (spacing * spacing);
  }
  const firstToned = new Float32Array(cols).fill(Infinity);
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      if (cellTone[row * cols + col] > SKYLINE_TONE) {
        firstToned[col] = (row + 0.5) * spacing;
        break;
      }
    }
  }
  const columnTop = firstToned.map((_, col) =>
    Math.min(
      firstToned[Math.max(0, col - 1)],
      firstToned[col],
      firstToned[Math.min(cols - 1, col + 1)],
    ),
  );
  const zoneTop = Math.min(height, ...firstToned);
  const zoneHeight = Math.max(1, height - Math.max(0, zoneTop));

  const dots = [];
  for (let i = 0; i < xs.length; i++) {
    const top = columnTop[columnOf(xs[i])];
    const depth =
      top === Infinity ? 0 : Math.max(0, (ys[i] - top) / zoneHeight);
    const timing = snowcapTiming(
      depth,
      hash(Math.round(xs[i] * 4), Math.round(ys[i] * 4)),
    );
    dots.push({
      x: xs[i],
      y: ys[i],
      radius: rs[i] * dotRadiusScale(rs[i] / pitch),
      alpha: as[i],
      delay: timing.delay,
      duration: timing.duration,
    });
  }

  // Ordered by the moment each dot settles; the renderer relies on it.
  dots.sort((p, q) => p.delay + p.duration - (q.delay + q.duration));

  return { dots, spacing, thinned: thin, width, height };
}

class HeroDots {
  constructor(canvas, asset) {
    this.canvas = canvas;
    this.asset = asset;
    this.ctx = canvas.getContext("2d");
    this.sprites = new Map();
    this.dpr = 1;
    this.field = null;
    this.layer = null;
    this.frame = 0;
    this.progress = 1;
    this.reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.progress = 0;
    this.syncSize();
  }

  /**
   * Rebuilds the dot field for the canvas' current CSS size and returns
   * whether the canvas is measurable. A hidden landing (boot straight into
   * `#editor`, or a window resize while the editor is open) reports a
   * zero-size rect; sizing is then deferred until the slide is shown again,
   * which `play()` handles on the next intersection.
   */
  syncSize() {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    if (width < 2 || height < 2) return false;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (
      this.field &&
      this.field.width === width &&
      this.field.height === height &&
      dpr === this.dpr
    ) {
      return true;
    }
    if (dpr !== this.dpr) this.sprites.clear();
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.field = buildField(this.asset, width, height);
    this.layer = null;
    this.render(this.progress);
    return true;
  }

  play() {
    cancelAnimationFrame(this.frame);
    // Nothing to animate for reduced-motion users or a hidden tab: paint the final frame.
    const still = this.reducedMotion || document.hidden;
    this.progress = still ? 1 : 0;
    if (!this.syncSize()) return;
    this.render(this.progress);
    if (still) return;
    const startedAt = performance.now();
    const tick = (now) => {
      this.progress = clamp((now - startedAt) / ASSEMBLE_DURATION_MS, 0, 1);
      this.render(this.progress);
      if (this.progress < 1) this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  sprite(radius) {
    const key = Math.max(1, Math.round(radius * 4));
    let sprite = this.sprites.get(key);
    if (sprite) return sprite;
    const r = key / 4;
    const size = Math.ceil(r * 2 + 2);
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(size * this.dpr);
    canvas.height = Math.ceil(size * this.dpr);
    const ctx = canvas.getContext("2d");
    ctx.scale(this.dpr, this.dpr);
    ctx.fillStyle = HERO_INK;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    ctx.fill();
    sprite = { canvas, size, half: size / 2 };
    this.sprites.set(key, sprite);
    return sprite;
  }

  /**
   * Dots that have settled are baked once into an offscreen layer, so a frame
   * only blits that layer and redraws the dots still in flight. The field is
   * ordered by end time, which keeps both groups contiguous. The layer canvas
   * exists only while the assembly runs and something has settled: a hero that
   * is waiting at progress 0 or showing its final frame keeps no copy.
   */
  render(progress) {
    const { ctx, field, dpr } = this;
    if (!field) return;
    const layer = progress < 1 ? this.settledLayer(progress) : null;
    if (!layer) this.layer = null;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (layer?.canvas) ctx.drawImage(layer.canvas, 0, 0);

    const buckets = alphaBuckets();
    for (let n = layer ? layer.count : 0; n < field.dots.length; n++) {
      const dot = field.dots[n];
      const local = clamp((progress - dot.delay) / dot.duration, 0, 1);
      if (local <= 0) continue;
      const eased = easeOutCubic(local);
      const alpha = dot.alpha * eased;
      const radius = dot.radius * eased;
      if (alpha <= 0.004 || radius <= 0.05) continue;
      buckets[bucketOf(alpha)].push(dot.x, dot.y - (1 - eased) * 6, radius);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.drawBuckets(ctx, buckets);
  }

  settledLayer(progress) {
    const { field, dpr } = this;
    if (!this.layer || progress < this.layer.progress) {
      this.layer = { canvas: null, ctx: null, count: 0, progress };
    }
    const layer = this.layer;
    const buckets = alphaBuckets();
    let count = layer.count;
    while (count < field.dots.length) {
      const dot = field.dots[count];
      if (dot.delay + dot.duration > progress) break;
      buckets[bucketOf(dot.alpha)].push(dot.x, dot.y, dot.radius);
      count++;
    }
    if (count > layer.count) {
      if (!layer.canvas) {
        layer.canvas = document.createElement("canvas");
        layer.canvas.width = this.canvas.width;
        layer.canvas.height = this.canvas.height;
        layer.ctx = layer.canvas.getContext("2d");
      }
      layer.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.drawBuckets(layer.ctx, buckets);
      layer.count = count;
    }
    layer.progress = progress;
    return layer;
  }

  // Grouped by alpha so globalAlpha changes a dozen times per frame, not per dot.
  drawBuckets(ctx, buckets) {
    for (let k = 1; k <= ALPHA_BUCKETS; k++) {
      const list = buckets[k];
      if (list.length === 0) continue;
      ctx.globalAlpha = k / ALPHA_BUCKETS;
      for (let n = 0; n < list.length; n += 3) {
        const sprite = this.sprite(list[n + 2]);
        ctx.drawImage(
          sprite.canvas,
          list[n] - sprite.half,
          list[n + 1] - sprite.half,
          sprite.size,
          sprite.size,
        );
      }
    }
    ctx.globalAlpha = 1;
  }

  destroy() {
    cancelAnimationFrame(this.frame);
  }
}

async function loadDots(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Hero dots failed to load: ${url} (${response.status})`);
  }
  return decodeHeroDots(await response.json());
}

/**
 * Mounts a dotted-mountain canvas into every hero section and assembles it
 * whenever that section scrolls (or is switched) into view. Sizing happens
 * lazily inside `play()`, so a landing that is hidden at boot is measured
 * only once it is actually shown.
 */
export async function initHeroMountains(sections) {
  const targets = Array.from(sections || []);
  if (targets.length === 0) return [];

  let asset;
  try {
    asset = await loadDots(DOTS_URL);
  } catch (error) {
    console.warn(error.message);
    return [];
  }

  const scenes = targets.map((section) => {
    const canvas = section.querySelector("canvas.hero-dots");
    return canvas ? new HeroDots(canvas, asset) : null;
  });

  // The initial observation reports any overlap, so check the ratio explicitly:
  // a hero starts assembling only once at least half of it is on screen.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const scene = scenes[targets.indexOf(entry.target)];
        if (
          scene &&
          entry.isIntersecting &&
          entry.intersectionRatio >= PLAY_VISIBILITY
        ) {
          scene.play();
        }
      }
    },
    { threshold: PLAY_VISIBILITY },
  );
  targets.forEach((section, index) => {
    if (scenes[index]) observer.observe(section);
  });

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      for (const scene of scenes) scene?.syncSize();
    }, REGENERATE_DELAY_MS);
  });

  return scenes.filter(Boolean);
}
