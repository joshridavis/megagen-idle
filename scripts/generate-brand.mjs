// Composes the store and brand images from the existing sprites (item 1.52).
//
// Nothing here is new art: every image is code that places the generic sprites
// from src/assets/sprites/ on simple shapes, in AAP-64 colors only. Pixel art is
// scaled by whole numbers with nearest-neighbor, so every pixel stays a crisp
// square. The only text is the game's name (Steam allows nothing else).
//
// Output (always overwritten; deterministic, no randomness or timestamps):
//   src/assets/brand/logo.png, app_icon_1024.png, key_scene.png
//   docs/steam/capsules/*.png (store and library capsules)
// --out-root=<dir> writes under another folder (used by tests).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { Canvas } from './lib/canvas.mjs';
import { C, nearestPaletteRgb } from './lib/palette.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outArg = process.argv.find((a) => a.startsWith('--out-root='));
const outRoot = outArg ? resolve(outArg.slice('--out-root='.length)) : root;
const spritesDir = resolve(root, 'src/assets/sprites');

// ---------- sprites ----------

function loadSprite(file) {
  const png = PNG.sync.read(readFileSync(resolve(spritesDir, file)));
  const c = new Canvas(png.width, png.height);
  c.data = new Uint8ClampedArray(png.data);
  return c;
}

/** The eight generators in energy-history order. */
const GENERATORS = [
  'solar_panel', 'wind_turbine', 'coal_plant', 'hydro_dam',
  'tidal_station', 'gas_plant', 'oil_plant', 'nuclear_plant',
].map((id) => loadSprite(`generators/${id}.png`));
const ENERGY_ICON = loadSprite('energy_currency_icon_32.png');
const PLANT = loadSprite('generators/coal_plant.png');
const TREE = loadSprite('map/decor_tree.png');
const BUSH = loadSprite('map/deco_bush.png');

/** Bounding box of the opaque pixels. */
function bbox(s) {
  let x0 = s.width, y0 = s.height, x1 = -1, y1 = -1;
  for (let y = 0; y < s.height; y++) {
    for (let x = 0; x < s.width; x++) {
      if (s.alphaAt(x, y) === 0) continue;
      x0 = Math.min(x0, x); y0 = Math.min(y0, y);
      x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
  }
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** Copy `src` onto `dst` at (x, y), each source pixel drawn as k×k (k whole). */
function blit(dst, src, x, y, k = 1) {
  for (let sy = 0; sy < src.height; sy++) {
    for (let sx = 0; sx < src.width; sx++) {
      const px = src.getRGBA(sx, sy);
      if (px[3] === 0) continue;
      for (let j = 0; j < k; j++) {
        for (let i = 0; i < k; i++) {
          const dx = x + sx * k + i, dy = y + sy * k + j;
          if (dx < 0 || dy < 0 || dx >= dst.width || dy >= dst.height) continue;
          dst.setRGBA(dx, dy, px[3] === 255 ? px : over(dst.getRGBA(dx, dy), px));
        }
      }
    }
  }
}

/** Blend a partly transparent pixel over an opaque one, snapped back to AAP-64. */
function over(under, top) {
  if (under[3] === 0) return top;
  const a = top[3] / 255;
  return nearestPaletteRgb([0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a))).concat(255);
}

/** Whole-number nearest-neighbor upscale. */
function upscale(src, k) {
  const out = new Canvas(src.width * k, src.height * k);
  blit(out, src, 0, 0, k);
  return out;
}

// ---------- logo ----------

// Bold pixel font: caps 7 rows, lowercase x-height 5 (rows 2-6), descender rows 7-8.
const GLYPHS = {
  M: ['XX...XX', 'XXX.XXX', 'XXXXXXX', 'XX.X.XX', 'XX.X.XX', 'XX...XX', 'XX...XX'],
  G: ['.XXXXX', 'XX..XX', 'XX....', 'XX.XXX', 'XX..XX', 'XX..XX', '.XXXXX'],
  I: ['XXXX', '.XX.', '.XX.', '.XX.', '.XX.', '.XX.', 'XXXX'],
  e: ['......', '......', '.XXXX.', 'XX..XX', 'XXXXXX', 'XX....', '.XXXX.'],
  g: ['......', '......', '.XXXXX', 'XX..XX', 'XX..XX', 'XX..XX', '.XXXXX', '....XX', '.XXXX.'],
  a: ['......', '......', '.XXXX.', '....XX', '.XXXXX', 'XX..XX', '.XXXXX'],
  n: ['......', '......', 'XXXXX.', 'XX..XX', 'XX..XX', 'XX..XX', 'XX..XX'],
  d: ['....XX', '....XX', '.XXXXX', 'XX..XX', 'XX..XX', 'XX..XX', '.XXXXX'],
  l: ['XX', 'XX', 'XX', 'XX', 'XX', 'XX', 'XX'],
  bolt: ['....XXX', '...XXX.', '..XXX..', '.XXXXXX', 'XXXXXX.', '...XXX.', '..XXX..', '..XX...', '.XX....'],
};
const UNIT = 3; // logo pixels per font pixel; the outline is one logo pixel

/** Lay out a line of glyphs; returns filled font cells. */
function layoutLine(names, gap = 1) {
  const cells = [];
  let x = 0;
  names.forEach((n, i) => {
    if (i > 0) x += n === 'bolt' ? gap + 1 : gap;
    const g = GLYPHS[n];
    const dy = n === 'bolt' ? -1 : 0; // the bolt rises one row into the line gap
    g.forEach((row, y) => [...row].forEach((ch, dx) => ch === 'X' && cells.push([x + dx, y + dy])));
    x += g[0].length;
  });
  return { cells, width: x, height: Math.max(...cells.map(([, y]) => y)) + 1 };
}

/**
 * The wordmark at one logo pixel per image pixel: "MegaGen" over "Idle" and a
 * small bolt, electric yellow with a bevel, a dark outline and a drop shadow.
 * Transparent background, tight bounds. Scale it with upscale().
 */
function drawLogo() {
  const line1 = layoutLine(['M', 'e', 'g', 'a', 'G', 'e', 'n']);
  const line2 = layoutLine(['I', 'd', 'l', 'e', 'bolt']);
  const gridW = Math.max(line1.width, line2.width);
  const line2Y = 10; // one empty font row under the "g" descender
  const fill = new Set();
  const add = (cells, ox, oy) => cells.forEach(([x, y]) => fill.add(`${x + ox},${y + oy}`));
  add(line1.cells, Math.floor((gridW - line1.width) / 2), 0);
  add(line2.cells, Math.floor((gridW - line2.width) / 2), line2Y);

  const pad = 1; // outline
  const c = new Canvas(gridW * UNIT + pad * 2 + 1, (line2Y + line2.height) * UNIT + pad * 2 + 1);
  const isFill = (x, y) => {
    const fx = x - pad, fy = y - pad;
    if (fx < 0 || fy < 0) return false;
    return fill.has(`${Math.floor(fx / UNIT)},${Math.floor(fy / UNIT)}`);
  };
  const line2Top = pad + line2Y * UNIT;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (!isFill(x, y)) continue;
      // Two-tone fill per line, with a light top edge and an amber bottom edge.
      const top = y < line2Top ? pad : line2Top;
      const mid = top + (y < line2Top ? 9 : 7) * UNIT * 0.45;
      let color = y < mid ? C.lemon : C.yellow;
      if (!isFill(x, y - 1)) color = C.cream;
      else if (!isFill(x, y + 1)) color = C.amber;
      c.set(x, y, color);
    }
  }
  c.outline(C.ink);
  // Narrow gaps between strokes (the inside of M, the counter of G) fill with ink too.
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (c.alphaAt(x, y) > 0) continue;
      const h = c.alphaAt(x - 1, y) > 0 && c.alphaAt(x + 1, y) > 0;
      const v = c.alphaAt(x, y - 1) > 0 && c.alphaAt(x, y + 1) > 0;
      if (h || v) c.set(x, y, C.ink);
    }
  }
  // Corner pixels of the outline, so the letters read as solid chunky blocks.
  const corners = [];
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (c.alphaAt(x, y) > 0) continue;
      if ([[1, 1], [-1, 1], [1, -1], [-1, -1]].some(([dx, dy]) => isFill(x + dx, y + dy))) corners.push([x, y]);
    }
  }
  corners.forEach(([x, y]) => c.set(x, y, C.ink));
  // Drop shadow: one pixel down and right of the outline.
  const shadow = [];
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (c.alphaAt(x, y) === 0 && c.alphaAt(x - 1, y - 1) > 0) shadow.push([x, y]);
    }
  }
  shadow.forEach(([x, y]) => c.set(x, y, '3b1725'));
  return c;
}

const LOGO = drawLogo();

// ---------- scene ----------

const SKY = ['242234', '403353', '793a80', 'bc4a9b', 'e86a73', 'f5a097'];

/** Cheap deterministic hash for star placement. */
function hash(x, y) {
  let h = (x * 374761393 + y * 668265263) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/** Dusk sky: banded from night at the top to warm at the horizon, dithered seams, stars, a low sun. */
function drawSky(c, horizon) {
  const band = horizon / SKY.length;
  for (let y = 0; y < c.height; y++) {
    const f = Math.min(SKY.length - 1, y / band);
    const i = Math.floor(f);
    const next = Math.min(SKY.length - 1, i + 1);
    const t = f - i;
    for (let x = 0; x < c.width; x++) {
      // 2×2 ordered dither in the last third of each band.
      const bayer = [[0, 2], [3, 1]][y % 2][x % 2] / 4;
      const useNext = t > 0.66 && (t - 0.66) * 3 > bayer;
      c.set(x, y, SKY[useNext ? next : i]);
    }
  }
  for (let y = 0; y < horizon * 0.45; y++) {
    for (let x = 0; x < c.width; x++) {
      const h = hash(x, y) % 1000;
      if (h < 3) c.set(x, y, C.white);
      else if (h < 6) c.set(x, y, 'b9bffb');
    }
  }
}

function drawSun(c, cx, cy, r) {
  c.circle(cx, cy, r + 2, C.amber);
  c.circle(cx, cy, r, C.yellow);
  c.circle(cx - r * 0.25, cy - r * 0.25, r * 0.55, C.cream);
}

/** Dusk water from seaY down: dark bands, pink ripples, the sun's glitter column. */
function drawSea(c, seaY, sunX) {
  const bands = [[6, 'bc4a9b'], [40, '793a80'], [100, '403353'], [Infinity, '242234']];
  for (let y = seaY; y < c.height; y++) {
    const depth = y - seaY;
    const i = bands.findIndex(([d]) => depth < d);
    for (let x = 0; x < c.width; x++) {
      // Dither into the next band over the last few rows of each.
      const edge = bands[i][0] - depth;
      const useNext = i < bands.length - 1 && edge <= 3 && (x + y) % (edge + 1) === 0;
      let color = bands[useNext ? i + 1 : i][1];
      const h = hash(x >> 2, y);
      if (y % 3 === 0 && h % 17 === 0) color = depth < 40 ? 'e86a73' : '793a80';
      if (y % 2 === 0 && Math.abs(x - sunX) < 16 - depth * 0.06 && h % 3 === 0) color = depth < 40 ? C.yellow : C.amber;
      c.set(x, y, color);
    }
  }
}

/** Fill a hill below the profile y = top(x), with a lit rim. */
function drawHill(c, top, fill, rim, edge, bottom = c.height) {
  for (let x = 0; x < c.width; x++) {
    const t = Math.round(top(x));
    if (t >= bottom) continue;
    for (let y = Math.max(0, t); y < bottom; y++) c.set(x, y, fill);
    if (rim) {
      c.set(x, t, edge);
      c.set(x, t + 1, rim);
      c.set(x, t + 2, rim);
    }
  }
}

/** Mound profile: flat at `base`, rising by `amp` around `cx`. */
const mound = (base, amp, cx, spread) => (x) => base - amp * Math.exp(-(((x - cx) / spread) ** 2));

/** Glowing power line from a to b with a sag, dithered glow in palette colors only. */
function powerLine(c, a, b, sag) {
  const pts = [];
  const steps = Math.ceil(Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1])) * 2 + 1;
  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    pts.push([Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t + sag * 4 * t * (1 - t))]);
  }
  for (const [x, y] of pts) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const d = Math.abs(dx) + Math.abs(dy);
        if (d === 1) c.set(x + dx, y + dy, C.amber);
        else if (d === 2 && (x + dx + y + dy) % 2 === 0) c.set(x + dx, y + dy, C.orange);
      }
    }
  }
  for (const [x, y] of pts) c.set(x, y, C.lemon);
}

/**
 * Place generators along rows. Each row: { ids (indexes into GENERATORS),
 * x0, x1 (span of centers), ground (profile) }. Lines join the generators in
 * order; rows are drawn back to front.
 */
function placeGenerators(c, rows) {
  const placed = [];
  for (const row of rows) {
    row.ids.forEach((id, i) => {
      const s = GENERATORS[id];
      const b = bbox(s);
      const cx = row.ids.length === 1 ? (row.x0 + row.x1) / 2 : row.x0 + ((row.x1 - row.x0) * i) / (row.ids.length - 1);
      const gy = Math.round(row.ground(cx));
      const x = Math.round(cx - b.x0 - b.w / 2);
      const y = gy - b.y1 + 1;
      placed.push({ s, x, y, anchor: [Math.round(cx), Math.round(y + b.y0 + b.h * 0.45)], row });
    });
  }
  return placed;
}

function drawGenerators(c, placed, sag) {
  for (let i = 1; i < placed.length; i++) powerLine(c, placed[i - 1].anchor, placed[i].anchor, sag);
  // Back rows first so nearer machines overlap farther ones.
  for (const p of placed) blit(c, p.s, p.x, p.y);
}

/** Trees and bushes on a hill, kept clear of the generators. */
function drawFoliage(c, ground, clear, seed, shore = c.height) {
  for (let x = 4; x < c.width - 4; x += 9) {
    const h = hash(x, seed);
    if (h % 3 === 0 || ground(x) > shore - 4 || clear.some(([a, b]) => x > a - 10 && x < b + 2)) continue;
    const s = h % 5 < 2 ? TREE : BUSH;
    const b = bbox(s);
    blit(c, s, x - b.x0 - Math.floor(b.w / 2) + ((h >> 4) % 5), Math.round(ground(x)) - b.y1 + 2);
  }
}

/**
 * The key scene on a w×h canvas (one canvas pixel = one sprite pixel).
 * `area` is the box the generators go in: one row of eight on a hill, or with
 * `rows: 2` (or a box too narrow for one row) two rows of four on two hills.
 * `hill` raises the middle of a one-row hill by that many pixels.
 */
function drawScene(w, h, area = { x: 0, y: 0, w, h }) {
  const c = new Canvas(w, h);
  const twoRows = area.rows === 2 || area.w < 8 * 52;
  const groundY = area.y + area.h - 6;
  const cx = area.x + area.w / 2;
  const spread = Math.max(area.w * 0.75, 120);
  const backY = groundY - 70;
  const horizon = twoRows ? backY + 6 : groundY - 16 - (area.hill ?? 0);
  drawSky(c, horizon);
  const sunX = Math.min(w - 30, area.x + area.w + 60);
  drawSun(c, sunX, horizon - 4, Math.max(10, Math.round(h * 0.05)));
  // Distant ridges.
  drawHill(c, (x) => horizon - 2 - 8 * Math.sin(x / 37) - 5 * Math.sin(x / 13 + 1), '403353');
  drawHill(c, (x) => horizon + 8 - 6 * Math.sin(x / 29 + 2) - 3 * Math.sin(x / 9), '242234');
  const inset = Math.min(34, area.w / 8);
  const span = { x0: area.x + inset, x1: area.x + area.w - inset };
  const clearOf = (placed) => placed.map((p) => [p.x, p.x + p.s.width]);
  const seaY = groundY + 14;
  const sea = () => drawSea(c, seaY, sunX);
  if (!twoRows) {
    sea();
    const ground = mound(groundY + 8, 12 + (area.hill ?? 0), cx, spread);
    drawHill(c, ground, C.forest, C.darkGreen, C.green, seaY);
    const placed = placeGenerators(c, [{ ids: [0, 1, 2, 3, 4, 5, 6, 7], ...span, ground: (x) => ground(x) + 3 }]);
    drawFoliage(c, ground, clearOf(placed), 1, seaY);
    drawGenerators(c, placed, 6);
    return c;
  }
  const back = mound(backY + 18, 20, cx, spread);
  const front = mound(groundY + 30, 32, cx, spread);
  drawHill(c, back, '23674e', C.darkGreen, C.green);
  const rows = [
    { ids: [0, 1, 2, 3], ...span, ground: (x) => back(x) + 3 },
    { ids: [4, 5, 6, 7], ...span, ground: (x) => front(x) + 3 },
  ];
  const placed = placeGenerators(c, rows);
  const backRow = placed.filter((p) => p.row === rows[0]);
  const frontRow = placed.filter((p) => p.row === rows[1]);
  drawFoliage(c, back, clearOf(backRow), 2);
  drawGenerators(c, backRow, 6);
  sea();
  powerLine(c, backRow[3].anchor, frontRow[0].anchor, 18);
  drawHill(c, front, C.forest, C.darkGreen, C.green, seaY);
  drawFoliage(c, front, clearOf(frontRow), 3, seaY);
  drawGenerators(c, frontRow, 6);
  return c;
}

// ---------- images ----------

/** Scene at canvas scale k, with the logo optionally laid on at scale `logoK`, centered at logoY. */
function capsule(W, H, k, { logoK, logoY, area, sceneH } = {}) {
  if (W % k || H % k) throw new Error(`${W}x${H} is not a whole multiple of ${k}`);
  const out = upscale(drawScene(W / k, sceneH ? sceneH / k : H / k, area), k);
  if (logoK) {
    const lw = LOGO.width * logoK;
    if (lw > W) throw new Error(`logo too wide for ${W}x${H}`);
    blit(out, LOGO, Math.round((W - lw) / 2), logoY, logoK);
  }
  return out;
}

function appIcon() {
  const n = 128; // ×8 = 1024
  const c = new Canvas(n, n);
  const r = 26;
  const inside = (x, y, inset) => {
    const lo = inset, hi = n - 1 - inset, rr = r - inset;
    const qx = x < lo + rr ? lo + rr : x > hi - rr ? hi - rr : x;
    const qy = y < lo + rr ? lo + rr : y > hi - rr ? hi - rr : y;
    return (x - qx) ** 2 + (y - qy) ** 2 <= rr * rr && x >= lo && x <= hi && y >= lo && y <= hi;
  };
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!inside(x, y, 0)) continue;
      if (!inside(x, y, 3)) c.set(x, y, '122020');
      else if (!inside(x, y, 5)) c.set(x, y, C.blue);
      else c.set(x, y, y > 98 ? '242234' : C.navy);
    }
  }
  // Glow behind the bolt: dithered rings.
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!inside(x, y, 5)) continue;
      const d = Math.hypot(x + 0.5 - 64, y + 0.5 - 46);
      if (d < 30) c.set(x, y, C.blue);
      else if (d < 38 && (x + y) % 2 === 0) c.set(x, y, C.blue);
    }
  }
  // Ground strip for the plant to stand on.
  for (let x = 0; x < n; x++) for (let y = 99; y < n; y++) if (inside(x, y, 5)) c.set(x, y, y === 99 ? C.green : C.forest);
  const pb = bbox(PLANT);
  blit(c, PLANT, Math.round(64 - pb.x0 - pb.w / 2), 101 - pb.y1, 1);
  blit(c, ENERGY_ICON, 64 - 32 - 4, 8, 2);
  return upscale(c, 8);
}

function write(rel, canvas) {
  const path = resolve(outRoot, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, canvas.toPNG());
  console.log(`${rel} ${canvas.width}x${canvas.height}`);
}

// logo.png: 1280 wide, the wordmark at the largest whole scale, centered.
const logoK = Math.floor(1280 / LOGO.width);
const logo = new Canvas(1280, LOGO.height * logoK);
blit(logo, LOGO, Math.floor((1280 - LOGO.width * logoK) / 2), 0, logoK);

const header = capsule(920, 430, 2, { logoK: 4, logoY: 30 });
const small = capsule(462, 174, 1, { logoK: 3, logoY: Math.round((174 - LOGO.height * 3) / 2) });
const main = capsule(1232, 706, 2, { logoK: 6, logoY: 40, area: { x: 0, y: 0, w: 616, h: 353, hill: 30 } });
const vertical = capsule(748, 896, 2, { logoK: 4, logoY: 50, area: { x: 8, y: 160, w: 358, h: 280 } });
const libCapsule = capsule(600, 900, 2, { logoK: 3, logoY: 70, area: { x: 6, y: 165, w: 288, h: 278 } });
// Hero: the generators sit inside the central 860×380 (430×190 at scale 2).
const hero = capsule(3840, 1240, 2, { area: { x: 745, y: 215, w: 430, h: 190, rows: 2 } });
const keyScene = capsule(1920, 1080, 3, { area: { x: 0, y: 0, w: 640, h: 330, hill: 40 } });

write('src/assets/brand/logo.png', logo);
write('src/assets/brand/app_icon_1024.png', appIcon());
write('src/assets/brand/key_scene.png', keyScene);
const caps = 'docs/steam/capsules';
write(`${caps}/header_capsule_920x430.png`, header);
write(`${caps}/small_capsule_462x174.png`, small);
write(`${caps}/main_capsule_1232x706.png`, main);
write(`${caps}/vertical_capsule_748x896.png`, vertical);
write(`${caps}/library_capsule_600x900.png`, libCapsule);
write(`${caps}/library_header_920x430.png`, header);
write(`${caps}/library_hero_3840x1240.png`, hero);
write(`${caps}/library_logo.png`, logo);
