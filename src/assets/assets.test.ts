import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import manifest from './sprite-manifest.json';
import generic from './generic-assets.json';
import { sprites } from '.';
// @ts-expect-error pngjs ships no types
import { PNG } from 'pngjs';
// @ts-expect-error plain .mjs module without types
import { AAP64 } from '../../scripts/lib/palette.mjs';

const assetsDir = resolve(__dirname);
const script = resolve(__dirname, '../../scripts/generate-generic-assets.mjs');

function pngSize(path: string) {
  const buf = readFileSync(path);
  expect(buf.subarray(1, 4).toString('ascii')).toBe('PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe('sprite assets', () => {
  it('every manifest sprite exists at its manifest size', () => {
    for (const [id, e] of Object.entries(manifest)) {
      const size = pngSize(join(assetsDir, 'sprites', e.file));
      expect(size, id).toEqual({ width: e.width, height: e.height });
    }
  });

  it('the typed sprites index covers exactly the manifest IDs', () => {
    expect(Object.keys(sprites).sort()).toEqual(Object.keys(manifest).sort());
  });

  it('every generated file is recorded as generic', () => {
    for (const e of Object.values(manifest)) expect(generic.generic).toContain(`sprites/${e.file}`);
  });
});

describe('generate-generic-assets script', () => {
  let tmp = '';
  afterEach(() => tmp && rmSync(tmp, { recursive: true, force: true }));

  const setup = () => {
    tmp = mkdtempSync(join(tmpdir(), 'megagen-assets-'));
    copyFileSync(join(assetsDir, 'sprite-manifest.json'), join(tmp, 'sprite-manifest.json'));
    return tmp;
  };
  const run = (...args: string[]) =>
    execFileSync(process.execPath, [script, `--assets-dir=${tmp}`, ...args], { encoding: 'utf8' });

  it('creates every sprite at the right size, deterministically', () => {
    setup();
    run();
    const first = readFileSync(join(tmp, 'sprites/generators/coal_plant.png'));
    for (const [id, e] of Object.entries(manifest)) {
      if (id === 'energy_icon') continue; // owned by generate-energy-icon.mjs
      expect(pngSize(join(tmp, 'sprites', e.file)), id).toEqual({ width: e.width, height: e.height });
    }
    run('--force');
    expect(readFileSync(join(tmp, 'sprites/generators/coal_plant.png')).equals(first)).toBe(true);
  });

  it('never touches the energy icon', () => {
    setup();
    run('--force');
    expect(existsSync(join(tmp, 'sprites/energy_currency_icon_32.png'))).toBe(false);
  });

  it('never overwrites unlisted (real) art, even with --force', () => {
    setup();
    const real = join(tmp, 'sprites/generators/solar_panel.png');
    mkdirSync(join(tmp, 'sprites/generators'), { recursive: true });
    writeFileSync(real, 'real art');
    run('--force');
    expect(readFileSync(real, 'utf8')).toBe('real art');
    const list = JSON.parse(readFileSync(join(tmp, 'generic-assets.json'), 'utf8')).generic;
    expect(list).not.toContain('sprites/generators/solar_panel.png');
  });

  it('does not overwrite listed files without --force', () => {
    setup();
    run();
    const listed = join(tmp, 'sprites/research/lock.png');
    writeFileSync(listed, 'edited');
    run();
    expect(readFileSync(listed, 'utf8')).toBe('edited');
    run('--force');
    expect(readFileSync(listed, 'utf8')).not.toBe('edited');
  });
});

describe('logo sprites (1.50)', () => {
  const read = (file: string) => PNG.sync.read(readFileSync(join(assetsDir, 'sprites', file)));
  const palette = new Set((AAP64 as string[]).map((h) => parseInt(h, 16)));

  it('the wordmark and icon use AAP-64 colors only, on a transparent background', () => {
    for (const file of ['ui/logo_wordmark.png', 'ui/logo_icon.png']) {
      const png = read(file);
      for (let i = 0; i < png.data.length; i += 4) {
        if (png.data[i + 3] === 0) continue;
        expect(png.data[i + 3], file).toBe(255);
        expect(palette.has((png.data[i] << 16) | (png.data[i + 1] << 8) | png.data[i + 2]), file).toBe(true);
      }
      expect(png.data[3], `${file} top-left corner`).toBe(0);
    }
  });
});

describe('machines without drawn-in water (2.01)', () => {
  const WATER = new Set(['285cc4', '249fde']); // C.blue, C.sky
  const files = [
    'generators/hydro_dam.png', 'generators/hydro_dam_2.png', 'generators/tidal_station.png', 'generators/tidal_station_2.png',
    'producers/oil_rig.png', 'producers/oil_rig_2.png', 'producers/deuterium_extractor.png',
  ];

  it('no water-colored band across the picture: at most a few water pixels in any row', () => {
    for (const file of files) {
      const png = PNG.sync.read(readFileSync(join(assetsDir, 'sprites', file)));
      for (let y = 0; y < png.height; y++) {
        let water = 0;
        for (let x = 0; x < png.width; x++) {
          const i = (y * png.width + x) * 4;
          const hex = [0, 1, 2].map((k) => png.data[i + k].toString(16).padStart(2, '0')).join('');
          if (png.data[i + 3] > 0 && WATER.has(hex)) water++;
        }
        expect(water, `${file} row ${y}`).toBeLessThanOrEqual(6);
      }
    }
  });
});
