// @vitest-environment node
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { FULL_GENERATOR_DEFS } from './generatorsFull';
import { FULL_PET_DEFS } from './petsFull';
import { FULL_PRODUCER_DEFS } from './producersFull';
import { FULL_RESEARCH_DEFS } from './researchFull';

/**
 * 2.04 (docs/RELEASE_DECISIONS.md, "Editions"): the demo's data for later content is not in the
 * bundle at all. Builds the demo (`VITE_EDITION=demo`) and looks for the Full Game's research ids,
 * machine, producer and pet descriptions in every script it ships.
 */
const root = resolve(__dirname, '../..');
const out = mkdtempSync(join(tmpdir(), 'megagen-demo-'));
afterAll(() => rmSync(out, { recursive: true, force: true }));

const scripts = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? scripts(join(dir, e.name)) : e.name.endsWith('.js') ? [join(dir, e.name)] : []));

describe('the demo bundle (2.04)', () => {
  it("has the free part and none of the Full Game's data", async () => {
    const { build } = await import('vite');
    const before = process.env.VITE_EDITION;
    process.env.VITE_EDITION = 'demo';
    process.env.VITE_CONFIG_NATIVE_IGNORE_WARNING = 'true'; // vitest loads vite.config.ts natively here
    try {
      await build({ root, configFile: resolve(root, 'vite.config.ts'), logLevel: 'silent', build: { outDir: out, emptyOutDir: true } });
    } finally {
      if (before === undefined) delete process.env.VITE_EDITION;
      else process.env.VITE_EDITION = before;
    }
    const js = scripts(out).map((f) => readFileSync(f, 'utf8')).join('\n');
    // the free part is there (so the check below means something)
    for (const marker of ['basic_solar', 'oil_drilling', 'Quiet and fuel-free. Small output.', 'Runs in its little wheel all day']) expect(js, marker).toContain(marker);
    const fullOnly = [
      ...FULL_RESEARCH_DEFS.flatMap((g) => g.items).flatMap((r) => [`"${r.id}"`, `'${r.id}'`, r.description]),
      ...Object.values(FULL_GENERATOR_DEFS).map((g) => g.description),
      ...Object.values(FULL_PRODUCER_DEFS).map((p) => p.requiresResearch!),
      ...FULL_PET_DEFS.flatMap((g) => g.items).flatMap((p) => [p.description, p.hint]),
    ];
    const found = fullOnly.filter((m) => js.includes(m));
    expect(found).toEqual([]);
  }, 180_000);
});
