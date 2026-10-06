// Generates the generic stand-in sprites listed in src/assets/sprite-manifest.json.
//
// Rules (see CLAUDE.md, "Assets"):
// - An existing file is never overwritten unless run with --force.
// - With --force, only files listed in src/assets/generic-assets.json are
//   regenerated. A file that exists but is not listed is real art: never touched.
// - energy_currency_icon_32.png is owned by generate-energy-icon.mjs and is
//   never touched here.
// - Every file created is recorded in src/assets/generic-assets.json.
// Output is deterministic: no randomness, no timestamps.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Canvas } from './lib/canvas.mjs';
import { C, nearestPaletteRgb } from './lib/palette.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// --assets-dir=<dir> targets another folder (used by tests).
const dirArg = process.argv.find((a) => a.startsWith('--assets-dir='));
const assetsDir = dirArg ? resolve(dirArg.slice('--assets-dir='.length)) : resolve(root, 'src/assets');
const spritesDir = resolve(assetsDir, 'sprites');
const genericListPath = resolve(assetsDir, 'generic-assets.json');
const manifest = JSON.parse(readFileSync(resolve(assetsDir, 'sprite-manifest.json'), 'utf8'));
const ENERGY_ICON = 'energy_currency_icon_32.png';

// ---------- drawing helpers ----------

/**
 * Rough isometric block lit from the top left: light top face, mid front face,
 * dark right side. (x, y) is the top-left of the front face.
 */
function isoBlock(c, x, y, w, h, d, top, front, side) {
  c.polygon([[x, y], [x + d, y - d], [x + w + d, y - d], [x + w, y]], top);
  c.rect(x, y, w, h, front);
  c.polygon([[x + w, y], [x + w + d, y - d], [x + w + d, y + h - d], [x + w, y + h]], side);
}

/** Vertical cylinder with a lit left half. */
function cylinder(c, cx, top, r, h, light, dark, cap) {
  c.rect(cx - r, top, r, h, light);
  c.rect(cx, top, r, h, dark);
  c.circle(cx, top, r, cap);
  for (let x = cx - r; x < cx + r; x++) {
    const dy = Math.sqrt(Math.max(0, r * r - (x + 0.5 - cx) ** 2)) * 0.45;
    c.set(x, top + h + Math.floor(dy), x < cx ? light : dark);
  }
}

function waves(c, y, w, color, step = 8) {
  for (let x = 0; x < w; x++) {
    const phase = x % step;
    c.set(x, y + (phase < step / 2 ? 0 : 1), color);
  }
}

// ---------- generators ----------

function solarPanel() {
  const c = new Canvas(48, 48);
  c.rect(22, 30, 4, 12, C.grey4); // post
  c.rect(23, 30, 1, 12, C.grey2);
  c.rect(14, 41, 20, 3, C.grey5); // foot
  const frame = [[6, 30], [16, 8], [44, 8], [34, 30]];
  c.polygon(frame, C.grey3);
  c.polygon([[8, 28], [17, 10], [42, 10], [33, 28]], C.navy);
  // cells: grid lines on the slanted panel
  for (let i = 1; i < 4; i++) {
    const t = i / 4;
    c.line(8 + 9 * t, 28 - 18 * t, 33 + 9 * t, 28 - 18 * t, C.steel);
  }
  for (let i = 1; i < 4; i++) {
    const x = 8 + (25 * i) / 4;
    c.line(x, 28, x + 9, 10, C.steel);
  }
  c.line(17, 11, 25, 11, C.sky); // glare
  c.line(16, 13, 21, 13, C.sky);
  c.outline(C.ink);
  return c;
}

function windTurbine() {
  const c = new Canvas(64, 64);
  c.polygon([[29, 20], [35, 20], [37, 60], [27, 60]], C.grey1); // tower
  c.polygon([[32, 20], [35, 20], [37, 60], [32, 60]], C.grey2);
  c.rect(24, 59, 16, 3, C.grey5);
  c.rect(29, 15, 9, 6, C.grey2); // nacelle
  c.rect(29, 15, 9, 2, C.white);
  // three blades from the hub
  c.polygon([[30, 17], [33, 16], [31, 2], [28, 3]], C.white);
  c.polygon([[32, 19], [33, 17], [50, 26], [48, 29]], C.grey1);
  c.polygon([[29, 17], [31, 19], [17, 31], [15, 29]], C.grey1);
  c.circle(31, 18, 2.5, C.red); // hub
  c.outline(C.ink);
  return c;
}

function coalPlant() {
  const c = new Canvas(64, 64);
  isoBlock(c, 6, 34, 34, 24, 8, C.brown2, C.brown3, C.brown4); // hall
  for (let i = 0; i < 4; i++) c.rect(10 + i * 8, 42, 4, 6, C.amber); // lit windows
  c.rect(18, 50, 8, 8, C.brown5); // door
  // smokestack
  c.rect(44, 12, 10, 46, C.grey3);
  c.rect(49, 12, 5, 46, C.grey4);
  c.rect(44, 18, 10, 3, C.red);
  c.rect(44, 28, 10, 3, C.red);
  c.rect(43, 10, 12, 3, C.grey5);
  // smoke
  c.circle(50, 6, 4, C.grey2);
  c.circle(56, 3, 3, C.grey2);
  c.circle(45, 3, 2.5, C.grey1);
  c.outline(C.ink);
  return c;
}

function hydroDam() {
  const c = new Canvas(80, 64);
  c.rect(0, 14, 30, 26, C.blue); // reservoir
  waves(c, 18, 30, C.sky);
  waves(c, 26, 30, C.sky);
  // concrete wall, trapezoid, lit from the left
  c.polygon([[26, 10], [52, 10], [62, 58], [18, 58]], C.grey2);
  c.polygon([[46, 10], [52, 10], [62, 58], [54, 58]], C.grey4);
  c.rect(24, 8, 30, 3, C.grey1); // crest road
  for (let i = 0; i < 3; i++) c.rect(29 + i * 7, 14, 4, 4, C.grey5); // gates
  // spillway water
  c.rect(30, 40, 16, 18, C.sky);
  for (let y = 41; y < 58; y += 3) c.line(31, y, 45, y, C.mint);
  c.rect(0, 56, 80, 8, C.blue); // river
  waves(c, 58, 80, C.sky);
  c.rect(62, 50, 14, 8, C.grey3); // powerhouse
  c.rect(64, 52, 3, 3, C.amber);
  c.rect(70, 52, 3, 3, C.amber);
  c.outline(C.ink);
  return c;
}

function gasPlant() {
  const c = new Canvas(64, 64);
  c.rect(4, 54, 56, 6, C.grey5); // pad
  cylinder(c, 17, 22, 10, 30, C.grey1, C.grey3, C.white);
  cylinder(c, 44, 30, 9, 22, C.grey1, C.grey3, C.white);
  c.rect(7, 34, 20, 3, C.orange); // stripes
  c.rect(35, 40, 18, 3, C.orange);
  // pipes
  c.rect(26, 46, 10, 3, C.grey4);
  c.rect(30, 14, 3, 33, C.grey4);
  c.rect(30, 14, 26, 3, C.grey4);
  c.rect(54, 8, 3, 9, C.grey4);
  // flare
  c.polygon([[55, 0], [52, 7], [58, 7]], C.amber);
  c.polygon([[55, 3], [54, 7], [56, 7]], C.yellow);
  c.outline(C.ink);
  return c;
}

function tidalStation() {
  const c = new Canvas(64, 48);
  c.rect(0, 30, 64, 18, C.blue); // sea
  waves(c, 32, 64, C.sky);
  waves(c, 38, 64, C.sky, 12);
  c.rect(10, 18, 4, 22, C.grey4); // legs
  c.rect(50, 18, 4, 22, C.grey4);
  isoBlock(c, 6, 14, 48, 6, 4, C.grey1, C.grey2, C.grey4); // deck
  isoBlock(c, 20, 4, 18, 10, 4, C.cream, C.steel, C.teal); // control room
  c.rect(24, 7, 3, 3, C.amber);
  c.rect(31, 7, 3, 3, C.amber);
  // underwater turbine
  c.rect(31, 20, 2, 18, C.grey5);
  c.circle(32, 40, 2, C.yellow);
  c.line(32, 40, 26, 44, C.grey1);
  c.line(32, 40, 38, 44, C.grey1);
  c.line(32, 40, 32, 35, C.grey1);
  c.outline(C.ink);
  return c;
}

function oilPlant() {
  const c = new Canvas(64, 64);
  c.rect(2, 54, 60, 6, C.grey5); // pad
  isoBlock(c, 4, 34, 30, 20, 5, C.grey1, C.grey2, C.grey4); // boiler house
  c.rect(8, 40, 4, 4, C.amber);
  c.rect(16, 40, 4, 4, C.amber);
  c.rect(24, 40, 4, 4, C.amber);
  c.rect(14, 8, 6, 27, C.grey3); // chimney
  c.rect(14, 12, 6, 3, C.red);
  c.rect(14, 20, 6, 3, C.red);
  c.circle(17, 5, 3, C.grey2, 200); // smoke
  c.circle(22, 3, 2, C.grey2, 160);
  // oil tank
  cylinder(c, 50, 36, 9, 16, C.brown3, C.brown5, C.brown2);
  c.rect(41, 42, 18, 2, C.black);
  c.rect(34, 46, 8, 3, C.grey4); // pipe
  c.outline(C.ink);
  return c;
}

function nuclearPlant() {
  const c = new Canvas(64, 64);
  c.rect(2, 56, 60, 6, C.grey5); // pad
  // cooling tower: hyperbolic outline
  for (let y = 10; y < 56; y++) {
    const t = (y - 10) / 46;
    const half = Math.round(10 + 6 * (2 * t - 1) ** 2 + 2 * t);
    c.rect(22 - half, y, half, 1, C.grey1);
    c.rect(22, y, half, 1, C.grey3);
  }
  c.rect(8, 10, 28, 2, C.grey2);
  c.circle(22, 6, 5, C.white, 220); // steam
  c.circle(30, 3, 3, C.white, 180);
  // reactor dome
  c.rect(40, 40, 20, 16, C.grey2);
  c.circle(50, 40, 10, C.grey1);
  c.rect(40, 40, 20, 2, C.grey3);
  c.rect(47, 47, 6, 9, C.grey4); // door
  c.circle(50, 34, 2, C.lime); // glow
  c.outline(C.ink);
  return c;
}

// fictional generators (0.34)
function fusionReactor() {
  const c = new Canvas(64, 64);
  c.rect(2, 56, 60, 6, C.grey5); // pad
  c.rect(8, 30, 48, 26, C.grey3); // hall
  c.rect(8, 30, 48, 3, C.grey2);
  c.circle(32, 30, 18, C.steel); // tokamak ring
  c.circle(32, 30, 12, C.navy);
  c.circle(32, 30, 8, C.purple); // plasma
  c.circle(32, 30, 5, C.cyan);
  c.circle(32, 30, 2, C.white);
  for (const x of [12, 50]) c.rect(x, 20, 3, 36, C.grey4); // magnets
  c.rect(26, 48, 12, 8, C.grey5); // door
  c.outline(C.ink);
  return c;
}

function supernovaCore() {
  const c = new Canvas(64, 64);
  c.rect(2, 56, 60, 6, C.plum); // pad
  // containment frame: four pylons
  for (const [x, y] of [[6, 10], [52, 10], [6, 42], [52, 42]]) c.rect(x, y, 6, 14, C.grey4);
  c.rect(6, 8, 52, 3, C.grey3);
  c.rect(6, 54, 52, 2, C.grey3);
  // the micro dimension: a bright star in a dark sphere
  c.circle(32, 32, 20, C.ink);
  c.circle(32, 32, 16, C.purple);
  c.circle(32, 32, 11, C.orange);
  c.circle(32, 32, 7, C.yellow);
  c.circle(32, 32, 3, C.white);
  for (const [x, y] of [[32, 12], [32, 50], [12, 32], [50, 32]]) c.circle(x, y, 1.5, C.lemon); // flares
  c.outline(C.ink);
  return c;
}

// ---------- resources ----------

function coalIcon() {
  const c = new Canvas(24, 24);
  c.polygon([[3, 16], [7, 9], [13, 8], [16, 13], [14, 19], [6, 20]], C.grey6);
  c.polygon([[11, 18], [14, 11], [19, 10], [21, 15], [19, 20], [13, 21]], C.ink);
  c.line(8, 11, 11, 10, C.grey4);
  c.line(15, 12, 17, 12, C.grey5);
  c.outline(C.black);
  return c;
}

function stoneIcon() {
  const c = new Canvas(24, 24);
  c.polygon([[3, 18], [5, 10], [11, 5], [18, 7], [21, 14], [18, 20], [8, 21]], C.grey3);
  c.polygon([[5, 12], [11, 6], [16, 8], [10, 11]], C.grey2);
  c.polygon([[15, 19], [20, 14], [18, 20]], C.grey4);
  c.line(9, 15, 13, 13, C.grey5);
  c.outline(C.ink);
  return c;
}

function metalIcon() {
  const c = new Canvas(24, 24);
  isoBlock(c, 3, 11, 15, 7, 4, C.grey1, C.grey3, C.grey4);
  c.line(5, 9, 12, 9, C.white);
  c.outline(C.ink);
  return c;
}

function naturalGasIcon() {
  const c = new Canvas(24, 24);
  c.polygon([[12, 2], [5, 13], [6, 19], [12, 22], [18, 19], [19, 13]], C.blue);
  c.polygon([[12, 8], [8, 15], [9, 19], [12, 21], [15, 19], [16, 15]], C.sky);
  c.polygon([[12, 13], [10, 17], [12, 20], [14, 17]], C.mint);
  c.outline(C.ink);
  return c;
}

function oilIcon() {
  const c = new Canvas(24, 24);
  c.polygon([[12, 2], [5, 13], [5, 18], [9, 22], [15, 22], [19, 18], [19, 13]], C.black);
  c.polygon([[9, 12], [7, 16], [9, 19], [10, 16]], C.grey5); // shine
  c.set(8, 15, C.grey3);
  c.outline(C.ink);
  return c;
}

function uraniumIcon() {
  const c = new Canvas(24, 24);
  // glowing pellet
  c.rect(6, 4, 12, 16, C.green);
  c.rect(6, 4, 4, 16, C.lime);
  c.rect(6, 4, 12, 3, C.lemon);
  c.rect(6, 18, 12, 2, C.darkGreen);
  c.rect(14, 7, 4, 11, C.forest);
  c.outline(C.ink);
  return c;
}

function deuteriumIcon() {
  const c = new Canvas(24, 24);
  // a flask of heavy water
  c.rect(10, 3, 4, 6, C.grey2);
  c.polygon([[10, 9], [14, 9], [20, 20], [4, 20]], C.sky);
  c.polygon([[10, 9], [12, 9], [7, 20], [4, 20]], C.mint);
  c.rect(4, 19, 16, 2, C.blue);
  c.set(13, 14, C.white);
  c.outline(C.ink);
  return c;
}

// ---------- producers ----------

function quarry() {
  const c = new Canvas(48, 48);
  // stepped pit, lit from top left
  c.polygon([[2, 26], [24, 14], [46, 26], [24, 40]], C.sand);
  c.polygon([[8, 27], [24, 18], [40, 27], [24, 36]], C.khaki);
  c.polygon([[14, 28], [24, 22], [34, 28], [24, 33]], C.mud);
  c.polygon([[19, 28], [24, 25], [29, 28], [24, 31]], C.brown5);
  // stone blocks on the rim
  isoBlock(c, 30, 14, 7, 5, 3, C.grey1, C.grey2, C.grey4);
  isoBlock(c, 36, 18, 6, 4, 3, C.grey1, C.grey2, C.grey4);
  // little crane
  c.rect(8, 6, 2, 18, C.amber);
  c.rect(8, 6, 14, 2, C.amber);
  c.line(20, 8, 20, 18, C.grey5);
  c.rect(19, 18, 3, 2, C.grey3);
  c.outline(C.ink);
  return c;
}

function mine() {
  const c = new Canvas(48, 48);
  c.polygon([[0, 40], [10, 14], [24, 6], [38, 14], [48, 40]], C.brown3); // hill
  c.polygon([[0, 40], [10, 14], [24, 6], [20, 18], [8, 40]], C.brown2);
  c.rect(16, 22, 16, 18, C.brown5); // entrance
  c.rect(14, 20, 20, 3, C.brown4); // timber frame
  c.rect(14, 20, 3, 20, C.brown4);
  c.rect(31, 20, 3, 20, C.brown4);
  c.rect(0, 40, 48, 3, C.grey4); // rail
  c.rect(4, 32, 12, 7, C.grey3); // cart
  c.rect(5, 30, 10, 3, C.steel); // ore
  c.circle(7, 40, 1.5, C.grey6);
  c.circle(13, 40, 1.5, C.grey6);
  c.outline(C.ink);
  return c;
}

function gasWell() {
  const c = new Canvas(48, 48);
  c.rect(2, 40, 44, 5, C.mud); // ground
  // pump jack: A-frame, walking beam, horse head, counterweight
  c.line(18, 40, 24, 16, C.grey4);
  c.line(30, 40, 24, 16, C.grey4);
  c.line(19, 40, 25, 16, C.grey5);
  c.polygon([[6, 14], [40, 10], [41, 14], [7, 18]], C.amber); // beam
  c.polygon([[4, 10], [10, 10], [11, 24], [5, 24]], C.orange); // horse head
  c.line(7, 24, 7, 38, C.grey3); // polished rod
  c.circle(38, 26, 6, C.grey4); // crank weight
  c.circle(38, 26, 3, C.grey5);
  c.line(38, 26, 38, 14, C.grey3);
  c.rect(3, 36, 9, 4, C.grey5); // wellhead
  c.circle(44, 6, 2.5, C.sky); // gas flame
  c.outline(C.ink);
  return c;
}

function coalMine() {
  const c = new Canvas(48, 48);
  c.rect(2, 38, 44, 6, C.mud); // ground
  // headframe tower
  c.line(10, 38, 18, 6, C.darkRed);
  c.line(11, 38, 19, 6, C.darkRed);
  c.line(30, 38, 22, 6, C.red);
  c.line(29, 38, 21, 6, C.red);
  c.line(14, 24, 26, 24, C.red);
  c.line(16, 16, 24, 16, C.red);
  c.circle(20, 7, 4, C.grey3); // wheel
  c.circle(20, 7, 2, C.grey5);
  isoBlock(c, 4, 30, 14, 8, 3, C.brown2, C.brown3, C.brown4); // shed
  // coal pile
  c.polygon([[28, 38], [36, 26], [46, 38]], C.grey6);
  c.polygon([[33, 30], [36, 26], [39, 30]], C.grey5);
  c.outline(C.ink);
  return c;
}

// ---------- UI ----------

function roomExpansion() {
  const c = new Canvas(96, 96);
  const pole = C.amber;
  for (const x of [8, 36, 64, 86]) c.rect(x, 20, 3, 72, pole); // uprights
  for (const y of [20, 44, 68, 90]) c.rect(8, y, 81, 3, pole); // ledgers
  for (let i = 0; i < 3; i++) {
    const x0 = [9, 37, 65][i];
    const x1 = [37, 65, 87][i];
    c.line(x0, 90, x1, 70, C.brown3); // braces
    c.line(x0, 68, x1, 46, C.brown3);
  }
  c.rect(8, 66, 81, 4, C.brown2); // planks
  c.rect(8, 42, 81, 4, C.brown2);
  // crane on top
  c.rect(70, 2, 3, 20, C.yellow);
  c.rect(30, 2, 52, 3, C.yellow);
  c.line(36, 5, 36, 18, C.grey5);
  c.rect(33, 18, 7, 4, C.grey3);
  c.outline(C.ink);
  c.fade(170); // semi-transparent overlay
  return c;
}

/** Room segment under construction: amber scaffold cross-bracing. */
function capacityBuilding() {
  const c = new Canvas(16, 16);
  c.box(1, 1, 14, 14, C.brown5, C.amber);
  c.line(2, 2, 13, 13, C.amber);
  c.line(13, 2, 2, 13, C.amber);
  c.rect(1, 7, 14, 2, C.yellow);
  return c;
}

function capacity(fill, light, border) {
  const c = new Canvas(16, 16);
  c.box(1, 1, 14, 14, fill, border);
  if (light) c.rect(2, 2, 12, 2, light);
  return c;
}

function oilRig() {
  const c = new Canvas(48, 48);
  c.rect(0, 38, 48, 10, C.blue); // sea
  waves(c, 40, 48, C.sky);
  c.rect(10, 26, 3, 16, C.grey4); // legs
  c.rect(34, 26, 3, 16, C.grey4);
  isoBlock(c, 6, 22, 34, 5, 3, C.grey1, C.grey2, C.grey4); // deck
  // derrick
  c.line(16, 22, 22, 4, C.amber);
  c.line(28, 22, 22, 4, C.amber);
  c.line(18, 16, 26, 16, C.amber);
  c.line(20, 10, 24, 10, C.amber);
  c.rect(30, 14, 8, 8, C.cream); // cabin
  c.rect(32, 16, 2, 2, C.sky);
  c.outline(C.ink);
  return c;
}

function uraniumMine() {
  const c = new Canvas(48, 48);
  c.polygon([[0, 40], [10, 22], [24, 16], [38, 22], [48, 40]], C.brown3); // hill
  c.polygon([[0, 40], [10, 22], [16, 20], [8, 40]], C.brown2);
  c.polygon([[18, 40], [20, 30], [28, 30], [30, 40]], C.ink); // tunnel
  c.rect(18, 28, 12, 2, C.brown5);
  c.rect(0, 40, 48, 8, C.mud);
  // ore cart with glowing ore
  c.rect(32, 36, 10, 5, C.grey4);
  c.rect(33, 34, 8, 2, C.lime);
  c.circle(34, 42, 1.5, C.grey6);
  c.circle(40, 42, 1.5, C.grey6);
  // hazard sign
  c.polygon([[8, 26], [3, 34], [13, 34]], C.yellow);
  c.rect(8, 29, 1, 3, C.ink);
  c.outline(C.ink);
  return c;
}

function deuteriumExtractor() {
  const c = new Canvas(48, 48);
  c.rect(0, 40, 48, 8, C.sand); // shore
  c.rect(0, 34, 48, 6, C.blue); // sea water in
  c.rect(6, 18, 14, 22, C.grey3); // tank
  c.rect(6, 18, 14, 3, C.grey1);
  c.rect(24, 24, 18, 16, C.grey2); // hall
  c.rect(24, 24, 18, 3, C.grey1);
  c.rect(20, 28, 4, 3, C.grey4); // pipe
  c.rect(30, 31, 6, 9, C.grey5); // door
  c.circle(13, 12, 3, C.sky); // droplet sign
  c.outline(C.ink);
  return c;
}

// ---------- research ----------

function researchBase(c, fill, border) {
  c.rect(2, 3, 28, 26, border);
  c.rect(3, 2, 26, 28, border);
  c.rect(3, 3, 26, 26, fill);
}

function researchEnergy() {
  const c = new Canvas(32, 32);
  researchBase(c, C.navy, C.ink);
  c.polygon([[18, 6], [9, 18], [15, 18], [12, 27], [23, 13], [17, 13], [20, 6]], C.yellow);
  c.line(17, 7, 11, 16, C.lemon);
  return c;
}

function researchMaterials() {
  const c = new Canvas(32, 32);
  researchBase(c, C.forest, C.ink);
  c.circle(16, 16, 9, C.grey2); // gear body
  for (const [dx, dy] of [[0, -10], [0, 10], [-10, 0], [10, 0], [-7, -7], [7, 7], [-7, 7], [7, -7]]) {
    c.rect(16 + dx - 2, 16 + dy - 2, 4, 4, C.grey2);
  }
  c.circle(16, 16, 4, C.forest);
  c.set(12, 11, C.white);
  c.set(13, 10, C.white);
  return c;
}

function researchEfficiency() {
  const c = new Canvas(32, 32);
  researchBase(c, C.plum, C.ink);
  c.circle(16, 19, 10, C.cream); // gauge face
  c.rect(4, 20, 24, 9, C.plum);
  c.rect(6, 19, 3, 1, C.red);
  c.rect(23, 19, 3, 1, C.green);
  c.line(16, 19, 23, 12, C.red); // needle
  c.circle(16, 19, 2, C.ink);
  return c;
}

function researchAdvanced() {
  const c = new Canvas(32, 32);
  researchBase(c, C.purple, C.ink);
  for (let a = 0; a < 3; a++) {
    const ang = (a * Math.PI) / 3;
    for (let t = 0; t < 360; t += 3) {
      const r = (t * Math.PI) / 180;
      const ex = Math.cos(r) * 11;
      const ey = Math.sin(r) * 4;
      c.set(16 + ex * Math.cos(ang) - ey * Math.sin(ang), 16 + ex * Math.sin(ang) + ey * Math.cos(ang), C.cyan);
    }
  }
  c.circle(16, 16, 3, C.mint);
  return c;
}

function progressSegment() {
  const c = new Canvas(8, 8);
  c.rect(0, 1, 8, 6, C.sky);
  c.rect(0, 1, 8, 2, C.mint);
  c.rect(0, 6, 8, 1, C.blue);
  c.rect(7, 1, 1, 6, C.blue); // segment gap
  return c;
}

function lock() {
  const c = new Canvas(16, 16);
  c.rect(4, 2, 8, 2, C.grey3); // shackle
  c.rect(4, 2, 2, 6, C.grey3);
  c.rect(10, 2, 2, 6, C.grey3);
  c.rect(3, 7, 10, 7, C.amber); // body
  c.rect(3, 7, 10, 2, C.yellow);
  c.rect(7, 9, 2, 3, C.brown5); // keyhole
  c.outline(C.ink);
  return c;
}

function check() {
  const c = new Canvas(16, 16);
  c.polygon([[2, 8], [5, 5], [7, 8], [12, 2], [15, 5], [7, 13]], C.green);
  c.polygon([[3, 8], [5, 6], [7, 9], [12, 3], [13, 4], [7, 10]], C.lime);
  c.outline(C.forest);
  return c;
}

function panelBg() {
  const c = new Canvas(128, 128);
  c.rect(0, 0, 128, 128, C.navy);
  for (let i = 0; i < 128; i += 16) {
    for (let j = 0; j < 128; j++) {
      c.set(i, j, C.blue);
      c.set(j, i, C.blue);
    }
  }
  for (let i = 0; i < 128; i += 64) {
    for (let j = 0; j < 128; j++) {
      c.set(i, j, C.steel);
      c.set(j, i, C.steel);
    }
  }
  for (let i = 0; i < 128; i += 16) for (let j = 0; j < 128; j += 16) c.set(i, j, C.sky); // grid nodes
  return c;
}

// ---------- random-event sightings (0.84) ----------

function spaceship() {
  const c = new Canvas(32, 16);
  c.polygon([[2, 9], [10, 5], [24, 5], [31, 9], [24, 12], [10, 12]], C.grey2); // hull
  c.polygon([[10, 5], [24, 5], [26, 8], [8, 8]], C.grey1);
  c.circle(17, 5, 4, C.cyan); // canopy
  c.rect(14, 3, 3, 2, C.white);
  c.rect(0, 8, 3, 3, C.orange); // engine flame
  c.set(0, 9, C.yellow);
  c.rect(12, 12, 2, 2, C.lime);
  c.rect(20, 12, 2, 2, C.lime);
  c.outline(C.ink);
  return c;
}

function birds() {
  const c = new Canvas(32, 16);
  for (const [x, y] of [[2, 6], [12, 2], [14, 10], [24, 5]]) {
    c.line(x, y, x + 3, y + 2, C.ink);
    c.line(x + 3, y + 2, x + 6, y, C.ink);
  }
  return c;
}

function balloon() {
  const c = new Canvas(16, 24);
  c.circle(8, 7, 6, C.red);
  c.rect(5, 3, 2, 2, C.orange);
  c.polygon([[7, 13], [9, 13], [8, 15]], C.darkRed);
  c.line(8, 15, 7, 23, C.grey3);
  c.outline(C.ink);
  return c;
}

function paperPlane() {
  const c = new Canvas(16, 16);
  c.polygon([[1, 8], [15, 3], [7, 10]], C.white);
  c.polygon([[7, 10], [15, 3], [9, 13]], C.grey2);
  c.outline(C.grey5);
  return c;
}

function cat() {
  const c = new Canvas(24, 16);
  c.rect(5, 6, 13, 6, C.orange); // body
  c.rect(16, 3, 6, 6, C.orange); // head
  c.polygon([[16, 3], [17, 0], [18, 3]], C.orange); // ears
  c.polygon([[20, 3], [21, 0], [22, 3]], C.orange);
  c.set(18, 5, C.ink);
  c.set(20, 5, C.ink);
  c.line(5, 7, 1, 2, C.orange); // tail
  for (const x of [6, 9, 13, 16]) c.rect(x, 12, 2, 3, C.orange); // legs
  c.rect(8, 7, 2, 4, C.amber); // stripes
  c.rect(12, 7, 2, 4, C.amber);
  c.outline(C.ink);
  return c;
}

function ufo() {
  const c = new Canvas(32, 24);
  c.circle(16, 8, 6, C.mint); // dome
  c.polygon([[2, 12], [8, 8], [24, 8], [30, 12], [24, 15], [8, 15]], C.grey3); // saucer
  c.polygon([[8, 8], [24, 8], [27, 11], [5, 11]], C.grey2);
  for (const x of [8, 14, 20, 26]) c.rect(x - 1, 12, 2, 2, C.yellow);
  c.polygon([[12, 16], [20, 16], [24, 23], [8, 23]], C.lime, 110); // beam
  c.outline(C.ink);
  return c;
}

function whale() {
  const c = new Canvas(48, 24);
  c.polygon([[4, 14], [10, 6], [30, 5], [40, 10], [40, 18], [10, 20]], C.navy); // body
  c.polygon([[10, 16], [36, 16], [40, 18], [10, 20]], C.sky); // belly
  c.polygon([[40, 12], [47, 6], [46, 12], [47, 18]], C.navy); // tail
  c.set(14, 11, C.white);
  c.line(18, 4, 16, 0, C.cyan); // spout
  c.line(18, 4, 20, 0, C.cyan);
  c.outline(C.ink);
  return c;
}

function meteor() {
  const c = new Canvas(16, 16);
  c.line(0, 0, 10, 10, C.amber);
  c.line(1, 0, 11, 10, C.yellow);
  c.circle(12, 12, 3, C.orange);
  c.circle(12, 12, 1.5, C.lemon);
  return c;
}

// ---------- map events (1.12; dedicated designs, playtest 19) ----------
// Everything that moves faces right: it travels left to right.

/**
 * One gull, side view, flying right (playtest 19.2: the flock of tiny marks
 * did not read as birds). Frame 1 has the wing up, frame 2 down; the body
 * stays on the same rows so the flap does not bob the bird.
 */
function mapBird(wingUp) {
  const c = new Canvas(16, 16);
  const up = [
    '.KK...........',
    '.KWW..........',
    '..WWW.........',
    '..WWWW........',
    '...WWWW.......',
    '....WWWW.HHH..',
    '.....WWWHHHEH.',
    'TT..BBBBBHHHkk',
    'TTTBBBBBBBHH..',
    '.T.Bgggggg....',
    '....gggg......',
  ];
  const down = [
    '..............',
    '..............',
    '..............',
    '..............',
    '..............',
    '.........HHH..',
    '........HHHEH.',
    'TT..BBBBBHHHkk',
    'TTTBBBBBBBHH..',
    '.T.BgWWWWgg...',
    '.....WWWW.....',
    '......WWW.....',
    '......KWW.....',
    '......KK......',
  ];
  const colors = { K: C.grey5, W: C.grey3, B: C.white, H: C.white, T: C.grey2, g: C.grey1, E: C.ink, k: C.amber };
  (wingUp ? up : down).forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (colors[ch]) c.set(x + 1, y + 1, colors[ch]);
    }),
  );
  c.outline(C.ink);
  return c;
}

function mapTruck() {
  const c = new Canvas(32, 16);
  c.rect(1, 3, 19, 9, C.brown2); // cargo box (back, on the left)
  c.rect(1, 3, 19, 2, C.brown1);
  for (const x of [5, 10, 15]) c.rect(x, 5, 1, 7, C.brown3); // crates
  c.rect(20, 5, 9, 7, C.red); // cab (front, on the right)
  c.rect(23, 6, 5, 3, C.sky); // windshield
  c.rect(29, 9, 2, 2, C.lemon); // headlight
  c.rect(0, 11, 31, 2, C.grey5); // chassis
  for (const x of [6, 24]) {
    c.circle(x, 13, 2, C.ink); // wheels
    c.set(x, 13, C.grey3);
  }
  c.outline(C.ink);
  return c;
}

function mapBolt() {
  const c = new Canvas(16, 32);
  c.polygon([[9, 0], [3, 15], [8, 15], [4, 31], [13, 12], [8, 12], [12, 0]], C.lemon);
  c.polygon([[10, 2], [6, 13], [9, 13], [7, 24]], C.white);
  c.outline(C.yellow);
  return c;
}

function mapFire(tall) {
  const c = new Canvas(16, 16);
  const top = tall ? 1 : 3;
  c.polygon([[3, 15], [2, 9], [5, top + 4], [7, top], [9, top + 3], [11, top + 1], [14, 9], [13, 15]], C.red);
  c.polygon([[5, 15], [4, 10], [7, top + 5], [9, top + 6], [12, 10], [11, 15]], C.orange);
  c.polygon([[6, 15], [6, 11], [8, top + 8], [10, 11], [10, 15]], C.yellow);
  c.rect(7, 13, 2, 2, C.lemon);
  return c;
}

function mapStar() {
  const c = new Canvas(24, 24);
  // the trail streams up and left: the star falls down and to the right
  for (let i = 0; i < 14; i++) c.set(2 + i, 2 + i, i < 5 ? C.purple : i < 10 ? C.sky : C.mint);
  for (let i = 3; i < 13; i++) c.set(3 + i, 2 + i, C.steel);
  c.circle(18, 18, 3, C.lemon);
  c.circle(18, 18, 1.5, C.white);
  for (const [x, y] of [[18, 13], [18, 23], [13, 18], [23, 18]]) c.set(x, y, C.yellow);
  return c;
}

function mapWave() {
  const c = new Canvas(16, 16);
  for (const y of [4, 10]) {
    c.line(1, y + 1, 4, y - 1, C.white);
    c.line(4, y - 1, 7, y + 1, C.white);
    c.line(8, y + 1, 11, y - 1, C.mint);
    c.line(11, y - 1, 14, y + 1, C.mint);
  }
  return c;
}

// ---------- map decorations (1.13): cosmetic, placed by the player ----------

function decorTree() {
  const c = new Canvas(16, 16);
  c.rect(7, 10, 2, 5, C.brown4); // trunk
  c.circle(8, 6, 5, C.darkGreen);
  c.circle(7, 5, 3, C.green);
  c.set(6, 4, C.lime);
  c.outline(C.ink);
  return c;
}
function decorPond() {
  const c = new Canvas(16, 16);
  c.circle(8, 9, 6, C.blue);
  c.circle(7, 8, 4, C.sky);
  c.rect(4, 7, 3, 1, C.mint); // shine
  c.circle(11, 11, 1, C.green); // lily pad
  c.outline(C.navy);
  return c;
}
function decorWindsock() {
  const c = new Canvas(16, 16);
  c.rect(3, 2, 1, 13, C.grey3); // pole
  c.polygon([[4, 2], [14, 4], [14, 6], [4, 6]], C.orange);
  c.rect(7, 3, 2, 3, C.white); // stripes
  c.rect(11, 4, 2, 2, C.white);
  c.outline(C.ink);
  return c;
}
function decorStatue() {
  const c = new Canvas(16, 16);
  c.rect(4, 12, 8, 3, C.grey4); // plinth
  c.rect(6, 6, 4, 6, C.grey2); // body
  c.circle(8, 4, 2, C.grey2); // head
  c.rect(10, 3, 1, 4, C.amber); // raised bolt
  c.set(11, 3, C.yellow);
  c.outline(C.grey6);
  return c;
}
function decorFlag() {
  const c = new Canvas(16, 16);
  c.rect(4, 1, 1, 14, C.grey2); // pole
  c.rect(5, 2, 8, 5, C.red);
  c.rect(5, 4, 8, 1, C.yellow); // a bolt stripe
  c.rect(3, 14, 3, 1, C.grey4);
  c.outline(C.ink);
  return c;
}
function decorLamp() {
  const c = new Canvas(16, 16);
  c.rect(7, 4, 2, 11, C.grey5); // post
  c.rect(5, 14, 6, 1, C.grey6);
  c.rect(6, 1, 4, 3, C.grey6); // lamp head
  c.rect(7, 2, 2, 2, C.lemon);
  c.outline(C.ink);
  return c;
}

// ---------- site map tiles (1.04) ----------

function groundTile() {
  const c = new Canvas(16, 16);
  c.rect(0, 0, 16, 16, C.forest);
  for (const [x, y] of [[2, 3], [9, 1], [13, 7], [5, 10], [11, 13], [1, 14], [7, 6]]) c.set(x, y, C.green);
  for (const [x, y] of [[4, 5], [12, 3], [8, 12]]) c.set(x, y, C.darkGreen);
  c.rect(0, 15, 16, 1, C.darkGreen); // faint grid line
  c.rect(15, 0, 1, 16, C.darkGreen);
  return c;
}

/** Terrain tiles (1.05): same 16x16 grid as ground, each with its own look. */
function terrainTile(base, dots, dark, extra) {
  const c = new Canvas(16, 16);
  c.rect(0, 0, 16, 16, base);
  for (const [x, y] of [[2, 3], [9, 1], [13, 7], [5, 10], [11, 13], [1, 14], [7, 6]]) c.set(x, y, dots);
  for (const [x, y] of [[4, 5], [12, 3], [8, 12]]) c.set(x, y, dark);
  if (extra) extra(c);
  c.rect(0, 15, 16, 1, dark);
  c.rect(15, 0, 1, 16, dark);
  return c;
}

const plateauTile = () => terrainTile(C.brown2, C.brown1, C.brown3, (c) => c.rect(3, 8, 3, 1, C.yellow));
const ridgeTile = () => terrainTile(C.teal, C.mint, C.grey5, (c) => {
  c.rect(2, 4, 5, 1, C.mint); // wind streaks
  c.rect(8, 9, 6, 1, C.mint);
});
const riverTile = () => terrainTile(C.blue, C.sky, C.navy, (c) => {
  c.rect(2, 4, 4, 1, C.sky); // ripples
  c.rect(9, 10, 4, 1, C.sky);
});
const coastTile = () => terrainTile(C.sand, C.cream, C.khaki, (c) => c.rect(10, 4, 3, 1, C.white));
// producer zones (1.18)
const coalfieldTile = () => terrainTile(C.brown5, C.grey5, C.black, (c) => {
  c.rect(3, 9, 2, 2, C.ink); // coal lumps
  c.rect(10, 5, 2, 2, C.ink);
  c.set(11, 5, C.grey4);
});
const outcropTile = () => terrainTile(C.grey5, C.grey3, C.grey6, (c) => {
  c.polygon([[2, 12], [5, 7], [8, 12]], C.grey4); // rock faces
  c.polygon([[8, 9], [11, 4], [14, 9]], C.grey3);
});
const oilfieldTile = () => terrainTile(C.mud, C.khaki, C.brown5, (c) => {
  c.circle(5, 10, 2, C.ink); // dark pools
  c.circle(11, 5, 1, C.ink);
  c.set(5, 9, C.purple);
});
// the cooling lake (1.38): calm, lighter water than the river
const lakeTile = () => terrainTile(C.steel, C.grey1, C.blue, (c) => {
  c.rect(3, 5, 3, 1, C.mint); // still ripples
  c.rect(9, 11, 3, 1, C.mint);
});
// the Exclusion Zone (1.23): a dark shielded floor with a glowing grid
const exclusionTile = () => terrainTile(C.plum, C.purple, C.ink, (c) => {
  c.rect(0, 7, 15, 1, C.purple); // grid lines
  c.rect(7, 0, 1, 15, C.purple);
  c.set(7, 7, C.cyan);
});
function seaTile() {
  const c = new Canvas(16, 16);
  c.rect(0, 0, 16, 16, C.navy);
  c.rect(2, 3, 5, 1, C.blue);
  c.rect(9, 8, 5, 1, C.blue);
  c.rect(4, 12, 4, 1, C.sky);
  return c;
}
function decoRock() {
  const c = new Canvas(16, 16);
  c.polygon([[4, 13], [6, 8], [10, 7], [12, 13]], C.grey4);
  c.rect(7, 8, 2, 1, C.grey2);
  return c;
}
function decoTuft() {
  const c = new Canvas(16, 16);
  for (const x of [5, 7, 9, 11]) c.rect(x, 9 + (x % 3), 1, 13 - 9 - (x % 3) + 1, C.lime);
  return c;
}
function decoFlower() {
  const c = new Canvas(16, 16);
  c.rect(7, 9, 1, 4, C.green);
  for (const [x, y] of [[6, 7], [8, 7], [7, 6], [7, 8]]) c.set(x, y, C.lemon);
  c.set(7, 7, C.orange);
  return c;
}

// more details (1.15): a few pixels each, drawn over a tile
const deco = (draw) => () => {
  const c = new Canvas(16, 16);
  draw(c);
  return c;
};
const decoBush = deco((c) => {
  c.circle(8, 10, 4, C.darkGreen);
  c.circle(6, 9, 2, C.green);
  c.set(10, 8, C.lime);
});
const decoStump = deco((c) => {
  c.rect(5, 9, 6, 4, C.brown4);
  c.rect(5, 8, 6, 1, C.brown2);
  c.set(7, 8, C.brown3);
});
const decoMushroom = deco((c) => {
  c.rect(7, 10, 2, 3, C.cream);
  c.rect(5, 8, 6, 2, C.red);
  c.set(6, 8, C.white);
  c.set(9, 9, C.white);
});
const decoLog = deco((c) => {
  c.rect(3, 10, 10, 3, C.brown3);
  c.rect(3, 10, 10, 1, C.brown2);
  c.rect(12, 10, 1, 3, C.brown1);
});
const decoCactus = deco((c) => {
  c.rect(7, 5, 2, 9, C.green);
  c.rect(4, 8, 2, 3, C.green);
  c.rect(5, 10, 2, 1, C.green);
  c.rect(10, 7, 2, 3, C.green);
  c.rect(9, 9, 2, 1, C.green);
  c.set(7, 6, C.lime);
});
const decoDryGrass = deco((c) => {
  for (const x of [4, 6, 8, 10, 12]) c.line(x, 13, x + (x % 4 ? 1 : -1), 9, C.brown1);
});
const decoBoulder = deco((c) => {
  c.circle(8, 10, 4, C.grey4);
  c.rect(5, 8, 3, 1, C.grey2);
  c.rect(4, 13, 9, 1, C.grey5);
});
const decoBentGrass = deco((c) => {
  for (const x of [4, 7, 10]) c.line(x, 13, x + 3, 8, C.mint);
});
const decoReeds = deco((c) => {
  for (const x of [5, 8, 11]) c.rect(x, 6 + (x % 3), 1, 8 - (x % 3), C.green);
  c.rect(5, 5, 1, 2, C.brown3);
  c.rect(11, 6, 1, 2, C.brown3);
});
const decoLily = deco((c) => {
  c.circle(8, 9, 3, C.green);
  c.set(8, 7, C.blue);
  c.set(9, 8, C.blue);
  c.set(7, 9, C.white);
});
const decoShell = deco((c) => {
  c.polygon([[5, 12], [8, 7], [11, 12]], C.brown1);
  c.line(8, 8, 8, 12, C.brown2);
  c.line(6, 11, 8, 8, C.brown2);
});
const decoDriftwood = deco((c) => {
  c.line(3, 12, 12, 9, C.khaki);
  c.line(3, 13, 12, 10, C.mud);
  c.set(9, 8, C.khaki);
});
const decoBoat = deco((c) => {
  c.polygon([[3, 10], [13, 10], [11, 13], [5, 13]], C.brown3);
  c.rect(8, 3, 1, 7, C.brown4);
  c.polygon([[9, 3], [9, 9], [13, 9]], C.white);
});
const decoWarning = deco((c) => {
  c.rect(7, 9, 2, 5, C.grey4); // post
  c.polygon([[8, 2], [3, 10], [13, 10]], C.yellow);
  c.rect(8, 5, 1, 3, C.ink);
  c.set(8, 9, C.ink);
});
const decoPylon = deco((c) => {
  c.rect(6, 4, 4, 10, C.grey3);
  c.rect(6, 4, 4, 1, C.grey1);
  c.circle(8, 3, 2, C.cyan);
  c.rect(5, 13, 6, 1, C.grey5);
});
const decoBuoy = deco((c) => {
  c.circle(8, 10, 3, C.red);
  c.rect(5, 10, 7, 1, C.white);
  c.rect(8, 5, 1, 3, C.grey3);
});

function lockedTile() {
  const c = new Canvas(16, 16);
  c.rect(0, 0, 16, 16, C.mud);
  for (const [x, y] of [[3, 4], [10, 2], [6, 11], [13, 12]]) c.set(x, y, C.brown2);
  c.rect(0, 6, 16, 1, C.brown3); // fence rails
  c.rect(0, 10, 16, 1, C.brown3);
  c.rect(2, 4, 2, 9, C.brown2); // posts
  c.rect(11, 4, 2, 9, C.brown2);
  return c;
}

// ---------- achievements (0.65) ----------

function trophy(cup, shine, base) {
  const c = new Canvas(24, 24);
  c.polygon([[5, 3], [19, 3], [17, 12], [12, 15], [7, 12]], cup); // cup
  c.rect(7, 4, 3, 6, shine);
  c.rect(1, 4, 4, 2, cup); // handles
  c.rect(1, 4, 2, 6, cup);
  c.rect(19, 4, 4, 2, cup);
  c.rect(21, 4, 2, 6, cup);
  c.rect(11, 15, 2, 4, cup); // stem
  c.rect(7, 19, 10, 3, base); // base
  c.outline(C.ink);
  return c;
}

// ---------- pets (0.92): adult drawn at 32x32, baby and young scaled down ----------

function hamster() {
  const c = new Canvas(32, 32);
  c.circle(16, 16, 14, C.grey4); // wheel
  c.circle(16, 16, 12, C.navy);
  for (let a = 0; a < 8; a++) c.line(16, 16, 16 + Math.cos((a * Math.PI) / 4) * 12, 16 + Math.sin((a * Math.PI) / 4) * 12, C.grey5);
  c.circle(16, 21, 6, C.orange); // body
  c.circle(19, 17, 4, C.orange); // head
  c.circle(20, 20, 3, C.cream); // belly
  c.set(20, 16, C.ink);
  c.circle(17, 13, 1.5, C.amber); // ear
  c.outline(C.ink);
  return c;
}

function firefly() {
  const c = new Canvas(32, 32);
  for (const [x, y] of [[8, 9], [22, 7], [14, 18], [25, 21], [7, 24]]) {
    c.circle(x, y, 4, C.lime, 90); // glow
    c.rect(x - 1, y - 1, 3, 2, C.ink); // body
    c.rect(x - 1, y + 1, 3, 2, C.lemon); // light
    c.set(x - 2, y - 2, C.sky);
    c.set(x + 2, y - 2, C.sky);
  }
  return c;
}

function tortoise() {
  const c = new Canvas(32, 32);
  c.polygon([[4, 22], [9, 11], [23, 11], [28, 22]], C.forest); // shell
  c.polygon([[9, 13], [16, 11], [23, 13], [21, 19], [11, 19]], C.navy); // solar panel shell
  c.line(16, 12, 16, 19, C.sky);
  c.line(10, 16, 22, 16, C.sky);
  c.rect(26, 18, 5, 4, C.lime); // head
  c.set(29, 19, C.ink);
  for (const x of [7, 22]) c.rect(x, 22, 3, 4, C.lime); // legs
  c.outline(C.ink);
  return c;
}

function eel() {
  const c = new Canvas(32, 32);
  for (let x = 2; x < 30; x++) {
    const y = 16 + Math.round(Math.sin(x / 4) * 5);
    c.rect(x, y - 2, 1, 5, C.teal);
    c.set(x, y + 2, C.sky);
  }
  c.circle(29, 16 + Math.round(Math.sin(29 / 4) * 5), 3, C.teal); // head
  c.set(30, 15 + Math.round(Math.sin(29 / 4) * 5), C.white);
  c.line(10, 3, 13, 8, C.yellow); // sparks
  c.line(13, 8, 11, 9, C.yellow);
  c.line(21, 26, 24, 30, C.yellow);
  c.outline(C.ink);
  return c;
}

function robodog() {
  const c = new Canvas(32, 32);
  c.rect(6, 13, 16, 9, C.grey2); // body
  c.rect(6, 13, 16, 2, C.grey1);
  c.rect(20, 7, 9, 8, C.grey2); // head
  c.rect(26, 9, 2, 2, C.cyan); // eye
  c.rect(20, 5, 2, 3, C.grey3); // ear
  for (const x of [7, 11, 16, 19]) c.rect(x, 22, 2, 5, C.grey4); // legs
  c.circle(12, 10, 3, C.amber); // wind-up key
  c.rect(11, 10, 2, 4, C.amber);
  c.line(4, 13, 2, 9, C.grey3); // tail
  c.outline(C.ink);
  return c;
}

function staticCat() {
  const c = new Canvas(32, 32);
  c.circle(14, 21, 8, C.grey5); // body
  c.circle(22, 13, 6, C.grey5); // head
  c.polygon([[17, 9], [18, 3], [21, 8]], C.grey5); // ears
  c.polygon([[23, 8], [26, 3], [27, 9]], C.grey5);
  c.set(20, 13, C.lime);
  c.set(24, 13, C.lime);
  c.line(6, 22, 3, 14, C.grey5); // tail
  c.line(4, 5, 7, 8, C.yellow); // static sparks
  c.line(28, 20, 31, 18, C.yellow);
  c.line(9, 12, 7, 10, C.sky);
  c.outline(C.ink);
  return c;
}

function beetle() {
  const c = new Canvas(32, 32);
  c.circle(16, 18, 9, C.red); // shell
  c.line(16, 9, 16, 27, C.darkRed);
  c.circle(16, 8, 4, C.ink); // head
  c.rect(10, 3, 4, 2, C.grey3); // magnet antenna (horseshoe)
  c.rect(18, 3, 4, 2, C.grey3);
  c.rect(10, 1, 2, 3, C.red);
  c.rect(20, 1, 2, 3, C.blue);
  for (const y of [14, 18, 22]) {
    c.line(6, y, 8, y, C.ink);
    c.line(24, y, 26, y, C.ink);
  }
  c.circle(12, 15, 1.5, C.ink);
  c.circle(20, 20, 1.5, C.ink);
  c.outline(C.ink);
  return c;
}

function jellyfish() {
  const c = new Canvas(32, 32);
  c.circle(16, 12, 9, C.mint, 160); // bell glow
  c.circle(16, 12, 7, C.cyan);
  c.rect(9, 12, 15, 4, C.cyan);
  c.circle(13, 10, 2, C.white);
  for (const x of [10, 14, 18, 22]) {
    for (let y = 16; y < 30; y++) c.set(x + Math.round(Math.sin(y / 2 + x) * 1), y, C.lime);
  }
  c.outline(C.teal);
  return c;
}

// ---------- pets added in 1.56 ----------

function mole() {
  const c = new Canvas(32, 32);
  c.rect(2, 26, 28, 4, C.brown2); // tunnel floor
  c.circle(10, 27, 3, C.black); // coal lumps
  c.circle(25, 28, 2, C.black);
  c.circle(15, 19, 9, C.brown4); // body
  c.circle(23, 18, 5, C.brown4); // head
  c.circle(27, 19, 2, C.red); // pink nose
  c.set(23, 16, C.ink); // eye
  c.rect(19, 11, 8, 3, C.amber); // miner's helmet
  c.rect(21, 9, 4, 2, C.yellow); // lamp
  c.rect(8, 25, 4, 3, C.cream); // paws
  c.rect(19, 25, 4, 3, C.cream);
  c.outline(C.ink);
  return c;
}

function toad() {
  const c = new Canvas(32, 32);
  c.circle(8, 6, 3, C.sky, 160); // gas bubbles
  c.circle(4, 12, 2, C.sky, 160);
  c.circle(12, 2, 2, C.sky, 160);
  c.circle(17, 21, 9, C.green); // body
  c.circle(17, 24, 6, C.lime); // belly
  c.circle(12, 13, 3, C.green); // eyes
  c.circle(22, 13, 3, C.green);
  c.set(12, 12, C.ink);
  c.set(22, 12, C.ink);
  c.line(13, 19, 21, 19, C.darkGreen); // mouth
  c.rect(7, 27, 5, 2, C.darkGreen); // feet
  c.rect(22, 27, 5, 2, C.darkGreen);
  c.outline(C.ink);
  return c;
}

function mouse() {
  const c = new Canvas(32, 32);
  c.circle(14, 21, 8, C.grey2); // body
  c.circle(22, 16, 5, C.grey2); // head
  c.circle(19, 10, 3, C.grey3); // ears
  c.circle(25, 10, 3, C.grey3);
  c.set(24, 15, C.ink);
  c.set(27, 17, C.red); // nose
  c.line(6, 24, 2, 18, C.red); // tail
  c.rect(26, 24, 3, 6, C.cyan); // test tube
  c.rect(26, 21, 3, 3, C.white);
  c.outline(C.ink);
  return c;
}

function pigeon() {
  const c = new Canvas(32, 32);
  c.circle(15, 19, 8, C.grey4); // body
  c.polygon([[7, 17], [1, 22], [9, 23]], C.grey3); // tail
  c.circle(22, 11, 5, C.grey4); // head
  c.circle(21, 15, 3, C.teal); // shiny neck
  c.set(23, 10, C.orange); // eye
  c.polygon([[26, 11], [30, 12], [26, 13]], C.amber); // beak
  c.polygon([[11, 15], [19, 15], [16, 22]], C.grey3); // wing
  c.rect(10, 21, 9, 6, C.cream); // letter
  c.line(10, 21, 14, 24, C.brown3);
  c.line(18, 21, 14, 24, C.brown3);
  c.rect(14, 27, 2, 3, C.orange); // legs
  c.rect(18, 27, 2, 3, C.orange);
  c.outline(C.ink);
  return c;
}

function owl() {
  const c = new Canvas(32, 32);
  c.rect(4, 26, 24, 5, C.brown3); // chimney top
  c.rect(4, 26, 24, 1, C.brown1);
  c.circle(16, 17, 9, C.grey2); // sooty body
  c.polygon([[8, 9], [10, 4], [13, 8]], C.grey2); // ear tufts
  c.polygon([[19, 8], [22, 4], [24, 9]], C.grey2);
  c.circle(12, 13, 3.5, C.cream); // eyes
  c.circle(20, 13, 3.5, C.cream);
  c.circle(12, 13, 1.5, C.orange);
  c.circle(20, 13, 1.5, C.orange);
  c.polygon([[15, 16], [17, 16], [16, 19]], C.amber); // beak
  c.circle(16, 22, 4, C.grey3); // chest
  c.circle(27, 6, 2, C.grey4, 140); // smoke puffs
  c.circle(29, 2, 1.5, C.grey4, 120);
  c.outline(C.ink);
  return c;
}

function axolotl() {
  const c = new Canvas(32, 32);
  c.circle(16, 18, 13, C.mint, 40); // reactor glow
  c.polygon([[3, 20], [9, 17], [9, 23]], C.plum); // tail
  c.rect(8, 17, 14, 7, C.red); // body (pink-red)
  c.circle(23, 17, 6, C.red); // head
  for (const [x, y] of [[19, 10], [23, 9], [27, 10]]) c.line(x, y + 3, x, y, C.lime); // glowing gills
  c.set(25, 16, C.ink);
  c.line(23, 20, 26, 20, C.darkRed); // smile
  c.rect(10, 24, 2, 3, C.red); // legs
  c.rect(18, 24, 2, 3, C.red);
  c.circle(12, 20, 1.5, C.lime); // glowing spots
  c.circle(17, 19, 1, C.lime);
  c.outline(C.ink);
  return c;
}

/** A 32x32 sprite scaled down (nearest neighbor) and centerd near the bottom, for baby and young pets. */
function scaledPet(src, factor) {
  const c = new Canvas(32, 32);
  const size = Math.round(32 * factor);
  const ox = Math.round((32 - size) / 2);
  const oy = 32 - size - 1;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = src.getRGBA(Math.floor(x / factor), Math.floor(y / factor));
      if (px[3] > 0) c.setRGBA(ox + x, oy + y, px);
    }
  }
  return c;
}

const PET_DRAW = { hamster, firefly, tortoise, eel, robodog, cat: staticCat, beetle, jellyfish, mole, toad, mouse, pigeon, owl, axolotl };
// keep in step with PET_STAGE_HEIGHT in src/data/pets.ts (where bubbles sit above a walking pet)
const PET_STAGE_SCALE = { 1: 0.55, 2: 0.78, 3: 1 };

/** The same sprite desaturated by 40%, snapped back onto the AAP-64 palette. */
export function inactiveVariant(src) {
  const c = new Canvas(src.width, src.height);
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const [r, g, b, a] = src.getRGBA(x, y);
      if (a === 0) continue;
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      const mix = (v) => v + (l - v) * 0.4;
      const [nr, ng, nb] = nearestPaletteRgb([mix(r), mix(g), mix(b)]);
      c.setRGBA(x, y, [nr, ng, nb, a]);
    }
  }
  return c;
}

const DRAW = {
  solar_panel: solarPanel,
  wind_turbine: windTurbine,
  coal_plant: coalPlant,
  hydro_dam: hydroDam,
  gas_plant: gasPlant,
  tidal_station: tidalStation,
  oil_plant: oilPlant,
  nuclear_plant: nuclearPlant,
  fusion_reactor: fusionReactor,
  supernova_core: supernovaCore,
  resource_coal: coalIcon,
  resource_stone: stoneIcon,
  resource_metal: metalIcon,
  resource_natural_gas: naturalGasIcon,
  resource_oil: oilIcon,
  resource_uranium: uraniumIcon,
  resource_deuterium: deuteriumIcon,
  producer_quarry: quarry,
  producer_mine: mine,
  producer_coal_mine: coalMine,
  producer_gas_well: gasWell,
  producer_oil_rig: oilRig,
  producer_uranium_mine: uraniumMine,
  producer_deuterium_extractor: deuteriumExtractor,
  room_expansion: roomExpansion,
  tile_ground: groundTile,
  map_bird_1: () => mapBird(true),
  map_bird_2: () => mapBird(false),
  map_truck: mapTruck,
  map_bolt: mapBolt,
  map_fire_1: () => mapFire(true),
  map_fire_2: () => mapFire(false),
  map_star: mapStar,
  map_wave: mapWave,
  tile_locked: lockedTile,
  tile_plateau: plateauTile,
  tile_ridge: ridgeTile,
  tile_river: riverTile,
  tile_coast: coastTile,
  tile_sea: seaTile,
  tile_exclusion: exclusionTile,
  tile_coalfield: coalfieldTile,
  tile_outcrop: outcropTile,
  tile_oilfield: oilfieldTile,
  tile_lake: lakeTile,
  deco_rock: decoRock,
  deco_tuft: decoTuft,
  deco_flower: decoFlower,
  deco_bush: decoBush,
  deco_stump: decoStump,
  deco_mushroom: decoMushroom,
  deco_log: decoLog,
  deco_cactus: decoCactus,
  deco_drygrass: decoDryGrass,
  deco_boulder: decoBoulder,
  deco_bentgrass: decoBentGrass,
  deco_reeds: decoReeds,
  deco_lily: decoLily,
  deco_shell: decoShell,
  deco_driftwood: decoDriftwood,
  deco_boat: decoBoat,
  deco_buoy: decoBuoy,
  deco_warning: decoWarning,
  deco_pylon: decoPylon,
  decor_tree: decorTree,
  decor_pond: decorPond,
  decor_windsock: decorWindsock,
  decor_statue: decorStatue,
  decor_flag: decorFlag,
  decor_lamp: decorLamp,
  achievement_unlocked: () => trophy(C.yellow, C.lemon, C.brown3),
  achievement_locked: () => trophy(C.grey5, C.grey4, C.grey6),
  sighting_spaceship: spaceship,
  sighting_birds: birds,
  sighting_balloon: balloon,
  sighting_paper_plane: paperPlane,
  sighting_cat: cat,
  sighting_ufo: ufo,
  sighting_whale: whale,
  sighting_meteor: meteor,
  capacity_empty: () => capacity(C.grey6, null, C.grey4),
  capacity_filled: () => capacity(C.green, C.lime, C.forest),
  capacity_critical: () => capacity(C.red, C.orange, C.darkRed),
  capacity_building: capacityBuilding,
  research_energy: researchEnergy,
  research_materials: researchMaterials,
  research_efficiency: researchEfficiency,
  research_advanced: researchAdvanced,
  research_progress_segment: progressSegment,
  research_lock: lock,
  research_check: check,
  research_panel_bg: panelBg,
};

/** Draws one manifest sprite by ID. Inactive variants derive from the active one. */
export function drawSprite(id) {
  if (id.endsWith('_inactive')) return inactiveVariant(drawSprite(id.slice(0, -'_inactive'.length)));
  const pet = id.match(/^pet_(\w+)_(\d)$/);
  if (pet && PET_DRAW[pet[1]]) {
    const adult = PET_DRAW[pet[1]]();
    return Number(pet[2]) === 3 ? adult : scaledPet(adult, PET_STAGE_SCALE[pet[2]]);
  }
  const fn = DRAW[id];
  if (!fn) throw new Error(`No generic drawing for sprite "${id}"`);
  return fn();
}

function run() {
  const force = process.argv.includes('--force');
  const generic = existsSync(genericListPath)
    ? JSON.parse(readFileSync(genericListPath, 'utf8'))
    : { generic: [] };
  const listed = new Set(generic.generic);
  let wrote = 0;
  let skipped = 0;
  for (const [id, entry] of Object.entries(manifest)) {
    if (entry.file === ENERGY_ICON) continue; // owned by generate-energy-icon.mjs
    const rel = `sprites/${entry.file}`;
    const out = resolve(spritesDir, entry.file);
    if (existsSync(out)) {
      if (!listed.has(rel)) {
        console.log(`keep  ${rel} (real art, not listed as generic)`);
        skipped++;
        continue;
      }
      if (!force) {
        skipped++;
        continue;
      }
    }
    const c = drawSprite(id);
    if (c.width !== entry.width || c.height !== entry.height) {
      throw new Error(`${id}: drew ${c.width}x${c.height}, manifest says ${entry.width}x${entry.height}`);
    }
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, c.toPNG());
    listed.add(rel);
    wrote++;
    console.log(`wrote ${rel}`);
  }
  generic.generic = [...listed].sort();
  writeFileSync(genericListPath, JSON.stringify(generic, null, 2) + '\n');
  console.log(`done: ${wrote} written, ${skipped} left as they were${force ? '' : ' (use --force to regenerate generic files)'}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run();
