import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
// @ts-expect-error pngjs ships no types
import { PNG } from 'pngjs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
// @ts-expect-error plain .mjs module without types
import { AAP64 } from '../../scripts/lib/palette.mjs';

const repo = resolve(__dirname, '../..');
const script = resolve(repo, 'scripts/generate-brand.mjs');

const IMAGES: Record<string, [number, number]> = {
  'src/assets/brand/logo.png': [1280, 0],
  'src/assets/brand/app_icon_1024.png': [1024, 1024],
  'src/assets/brand/key_scene.png': [1920, 1080],
  'src/assets/brand/og_1200x630.png': [1200, 630],
  'src/assets/brand/favicon_64.png': [64, 64],
  'src/assets/brand/apple_touch_icon_256.png': [256, 256],
  'docs/steam/capsules/header_capsule_920x430.png': [920, 430],
  'docs/steam/capsules/small_capsule_462x174.png': [462, 174],
  'docs/steam/capsules/main_capsule_1232x706.png': [1232, 706],
  'docs/steam/capsules/vertical_capsule_748x896.png': [748, 896],
  'docs/steam/capsules/library_capsule_600x900.png': [600, 900],
  'docs/steam/capsules/library_header_920x430.png': [920, 430],
  'docs/steam/capsules/library_hero_3840x1240.png': [3840, 1240],
  'docs/steam/capsules/library_logo.png': [1280, 0],
};

/** Decoding and scanning every pixel of these large images takes seconds on a busy CI runner. */
const PIXEL_SCAN_MS = 60_000;

const palette = new Set((AAP64 as string[]).map((h) => parseInt(h, 16)));

describe('generate-brand script', () => {
  let tmp = '';
  beforeAll(() => {
    tmp = mkdtempSync(join(tmpdir(), 'megagen-brand-'));
    execFileSync(process.execPath, [script, `--out-root=${tmp}`]);
  }, 60_000);
  afterAll(() => tmp && rmSync(tmp, { recursive: true, force: true }));

  const read = (base: string, rel: string) => PNG.sync.read(readFileSync(join(base, rel)));

  it('writes every image at its store size', () => {
    for (const [rel, [w, h]] of Object.entries(IMAGES)) {
      const png = read(tmp, rel);
      expect(png.width, rel).toBe(w);
      if (h) expect(png.height, rel).toBe(h);
    }
  }, PIXEL_SCAN_MS);

  it('uses only AAP-64 colors, fully opaque or fully transparent', () => {
    for (const rel of Object.keys(IMAGES)) {
      const { data } = read(tmp, rel);
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] === 0) continue;
        const rgb = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
        if (data[i + 3] !== 255 || !palette.has(rgb)) {
          throw new Error(`${rel}: pixel ${i / 4} is not an opaque AAP-64 color`);
        }
      }
    }
  }, PIXEL_SCAN_MS);

  it('has a transparent background around the logo and the icon corners', () => {
    const logo = read(tmp, 'src/assets/brand/logo.png');
    expect(logo.data[3]).toBe(0);
    const icon = read(tmp, 'src/assets/brand/app_icon_1024.png');
    expect(icon.data[3]).toBe(0);
    expect(icon.data[(512 * 1024 + 512) * 4 + 3]).toBe(255);
  });

  it('scales the app icon by a whole number (8×8 blocks)', () => {
    const { data, width } = read(tmp, 'src/assets/brand/app_icon_1024.png');
    for (let y = 0; y < width; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const j = ((y - (y % 8)) * width + (x - (x % 8))) * 4;
        if (data.readUInt32BE(i) !== data.readUInt32BE(j)) throw new Error(`pixel ${x},${y} breaks its 8×8 block`);
      }
    }
  }, PIXEL_SCAN_MS);

  it('matches the committed images (run npm run brand after changing the script)', () => {
    for (const rel of Object.keys(IMAGES)) {
      expect(readFileSync(join(tmp, rel)).equals(readFileSync(join(repo, rel))), rel).toBe(true);
    }
  });
});
