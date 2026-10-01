// Draws the generic 32x32 lightning-bolt energy icon and records it in
// src/assets/generic-assets.json. Never overwrites an existing icon unless
// run with --force AND the icon is listed as generic (i.e. not real art).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Canvas } from './lib/canvas.mjs';
import { C } from './lib/palette.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rel = 'sprites/energy_currency_icon_32.png';
const out = resolve(root, 'src/assets', rel);
const manifestPath = resolve(root, 'src/assets/generic-assets.json');
const force = process.argv.includes('--force');

export function drawEnergyIcon() {
  const c = new Canvas(32, 32);
  const bolt = [[19, 2], [7, 18], [15, 18], [11, 30], [25, 12], [17, 12], [21, 2]];
  c.polygon(bolt, C.yellow);
  // highlight on the upper-left edge, shade on the lower half
  c.polygon([[19, 3], [9, 17], [12, 17], [20, 4]], C.lemon);
  c.polygon([[16, 19], [12, 29], [24, 13], [22, 13]], C.amber);
  c.outline(C.ink);
  return c;
}

function readManifest() {
  return existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { generic: [] };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manifest = readManifest();
  const listed = manifest.generic.includes(rel);
  if (existsSync(out) && !(force && listed)) {
    console.log(`skip ${rel} (exists${listed ? '; use --force to regenerate' : '; not generic, real art'})`);
  } else {
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, drawEnergyIcon().toPNG());
    if (!listed) manifest.generic.push(rel);
    manifest.generic.sort();
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`wrote ${rel}`);
  }
}
