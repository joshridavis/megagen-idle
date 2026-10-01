import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import manifest from './sprite-manifest.json';
import generic from './generic-assets.json';
import { sprites } from '.';

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
