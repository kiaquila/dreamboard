// Hero dotted mountains.
//
// The landing hero no longer ships a photo. It samples the halftone artwork
// (`hero-mountains-halftone.jpg`) into a square dot grid: every grid cell gets
// one dot whose radius follows the darkness of the pixels under it. When a hero
// slide becomes visible the dots settle in from the summits downward, like snow
// covering the slopes ("snowcap" assembly). Reduced-motion users get the final
// frame immediately.

const ARTWORK_URL = new URL(
  "../assets/images/landing/hero-mountains-halftone.jpg",
  import.meta.url,
).href;

export const HERO_PAPER = "#f4f2ee";
export const HERO_INK = "#1b1b1b";

const PAPER_LUMA = 0.952;
const INK_LUMA = 0.09;
const TONE_THRESHOLD = 0.035;
const MIN_BAND_HEIGHT = 0.62;
const ASSEMBLE_DURATION_MS = 2600;
const ALPHA_BUCKETS = 12;
const REGENERATE_DELAY_MS = 200;
const PLAY_VISIBILITY = 0.5;

const clamp = (value, min, max) =>
  value < min ? min : value > max ? max : value;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

/** Grid pitch in CSS px. Scales with width so desktop and phone keep a similar dot count. */
export function gridSpacing(width) {
  return clamp(width / 176, 4, 16);
}

/** Dot radius for a cell darkness in [0, 1]. Dots touch at full ink. */
export function toneToRadius(tone, spacing) {
  return (spacing / 2) * Math.pow(clamp(tone, 0, 1), 0.55);
}

/** Faint far ridges get softer dots instead of only smaller ones. */
export function toneToAlpha(tone) {
  const t = clamp(tone, 0, 1);
  return t > 0.3 ? 1 : 0.55 + 0.45 * (t / 0.3);
}

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
 * Builds the dot field for a canvas of `width` x `height` CSS px.
 * The artwork covers the full width, anchored to the bottom, and never takes
 * less than MIN_BAND_HEIGHT of the height on tall (phone) viewports.
 */
export function sampleField(image, width, height) {
  const spacing = gridSpacing(width);
  const scale = Math.max(
    width / image.naturalWidth,
    (height * MIN_BAND_HEIGHT) / image.naturalHeight,
  );
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const drawX = (width - drawWidth) / 2;
  const drawY = height - drawHeight;

  const scratch = document.createElement("canvas");
  scratch.width = width;
  scratch.height = height;
  const sctx = scratch.getContext("2d", { willReadFrequently: true });
  sctx.fillStyle = HERO_PAPER;
  sctx.fillRect(0, 0, width, height);
  sctx.imageSmoothingEnabled = true;
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  const pixels = sctx.getImageData(0, 0, width, height).data;

  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);
  const tone = new Float32Array(cols * rows);

  for (let j = 0; j < rows; j++) {
    const y0 = Math.floor(j * spacing);
    const y1 = Math.min(
      height,
      Math.max(y0 + 1, Math.floor((j + 1) * spacing)),
    );
    for (let i = 0; i < cols; i++) {
      const x0 = Math.floor(i * spacing);
      const x1 = Math.min(
        width,
        Math.max(x0 + 1, Math.floor((i + 1) * spacing)),
      );
      let sum = 0;
      let count = 0;
      for (let y = y0; y < y1; y++) {
        let k = (y * width + x0) * 4;
        for (let x = x0; x < x1; x++, k += 4) {
          sum +=
            (pixels[k] * 0.299 +
              pixels[k + 1] * 0.587 +
              pixels[k + 2] * 0.114) /
            255;
          count++;
        }
      }
      tone[j * cols + i] = clamp(
        (PAPER_LUMA - sum / count) / (PAPER_LUMA - INK_LUMA),
        0,
        1,
      );
    }
  }

  // Skyline: the first toned row of every column drives the snowcap order.
  const columnTop = new Int32Array(cols).fill(-1);
  let zoneTopRow = rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (tone[j * cols + i] > TONE_THRESHOLD * 2.2) {
        columnTop[i] = j;
        if (j < zoneTopRow) zoneTopRow = j;
        break;
      }
    }
  }
  const zoneTop = Math.max(0, zoneTopRow * spacing);
  const zoneHeight = Math.max(1, height - zoneTop);

  const dots = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cellTone = tone[j * cols + i];
      if (cellTone <= TONE_THRESHOLD) continue;
      const topRow = columnTop[i] < 0 ? j : columnTop[i];
      const y = (j + 0.5) * spacing;
      const depth = Math.max(0, (y - (topRow + 0.5) * spacing) / zoneHeight);
      const timing = snowcapTiming(depth, hash(i, j));
      dots.push({
        x: (i + 0.5) * spacing,
        y,
        radius: toneToRadius(cellTone, spacing),
        alpha: toneToAlpha(cellTone),
        delay: timing.delay,
        duration: timing.duration,
      });
    }
  }

  return { dots, spacing, width, height };
}

class HeroDots {
  constructor(canvas, image) {
    this.canvas = canvas;
    this.image = image;
    this.ctx = canvas.getContext("2d");
    this.sprites = new Map();
    this.dpr = 1;
    this.field = null;
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
    this.field = sampleField(this.image, width, height);
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

  render(progress) {
    const { ctx, field, dpr } = this;
    if (!field) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, field.width, field.height);

    // Group dots by alpha so globalAlpha changes a dozen times per frame, not per dot.
    const buckets = [];
    for (let k = 0; k <= ALPHA_BUCKETS; k++) buckets.push([]);
    for (const dot of field.dots) {
      const local = clamp((progress - dot.delay) / dot.duration, 0, 1);
      if (local <= 0) continue;
      const eased = easeOutCubic(local);
      const alpha = dot.alpha * eased;
      const radius = dot.radius * eased;
      if (alpha <= 0.004 || radius <= 0.05) continue;
      const bucket = Math.min(
        ALPHA_BUCKETS,
        Math.max(1, Math.round(alpha * ALPHA_BUCKETS)),
      );
      buckets[bucket].push(dot.x, dot.y - (1 - eased) * 6, radius);
    }
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

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error(`Hero artwork failed to load: ${url}`));
    image.src = url;
  });
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

  let image;
  try {
    image = await loadImage(ARTWORK_URL);
  } catch (error) {
    console.warn(error.message);
    return [];
  }

  const scenes = targets.map((section) => {
    const canvas = section.querySelector("canvas.hero-dots");
    return canvas ? new HeroDots(canvas, image) : null;
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
