import { describe, expect, it } from 'vitest';
import { RESEARCH } from '../data/research';
import { computeResearchLayout, type LayoutInput } from './researchLayout';

function check(nodes: LayoutInput[]) {
  const layout = computeResearchLayout(nodes);
  const seen = new Set<string>();
  for (const n of nodes) {
    const p = layout.positions[n.id];
    expect(p, n.id).toBeDefined();
    const key = `${p.col}:${p.row}`;
    expect(seen.has(key), `overlap at ${key}`).toBe(false);
    seen.add(key);
    for (const pre of n.prerequisites) expect(layout.positions[pre].col).toBeLessThan(p.col);
    const band = layout.bands[p.band];
    expect(p.row).toBeGreaterThanOrEqual(band.startRow);
    expect(p.row).toBeLessThan(band.startRow + band.rows);
  }
  return layout;
}

describe('computeResearchLayout (branches, 0.81)', () => {
  it('splits the real tree into the three starting branches', () => {
    const l = check(RESEARCH);
    expect(l.bands.map((b) => b.root)).toEqual(['basic_solar', 'basic_mining', 'fossil_fuels']);
    const band = (id: string) => l.bands[l.positions[id].band].root;
    expect(band('wind_power')).toBe('basic_solar');
    expect(band('better_picks')).toBe('basic_mining');
    expect(band('deep_drilling')).toBe('basic_mining');
    expect(band('gas_extraction')).toBe('fossil_fuels');
    expect(band('gas_turbines')).toBe('fossil_fuels');
    // roots start their bands in the first column
    for (const b of l.bands) expect(l.positions[b.root]).toMatchObject({ col: 0, row: b.startRow });
  });

  it('bands do not overlap and edges inside a branch are marked as such', () => {
    const l = computeResearchLayout(RESEARCH);
    for (let i = 1; i < l.bands.length; i++) expect(l.bands[i].startRow).toBe(l.bands[i - 1].startRow + l.bands[i - 1].rows);
    expect(l.edges.find((e) => e.from === 'basic_solar' && e.to === 'wind_power')!.crossBranch).toBe(false);
  });

  it('stays readable for a 30-node tree with several roots', () => {
    const nodes: LayoutInput[] = Array.from({ length: 30 }, (_, i) => ({
      id: `n${i}`,
      requiredLevel: 1 + Math.floor(i / 3),
      prerequisites: i < 3 ? [] : [`n${i - 3}`, ...(i % 4 === 0 ? [`n${i - 1}`] : [])],
    }));
    const l = check(nodes);
    expect(l.bands).toHaveLength(3);
    expect(l.rows).toBeLessThanOrEqual(12);
  });

  it('handles an empty tree, unknown prerequisites and cycles', () => {
    expect(computeResearchLayout([])).toMatchObject({ cols: 0, rows: 0, bands: [] });
    expect(computeResearchLayout([{ id: 'a', requiredLevel: 1, prerequisites: ['ghost'] }]).positions.a).toEqual({ col: 0, row: 0, band: 0 });
    const cyc = computeResearchLayout([
      { id: 'a', requiredLevel: 1, prerequisites: ['b'] },
      { id: 'b', requiredLevel: 1, prerequisites: ['a'] },
    ]);
    expect(Object.keys(cyc.positions).sort()).toEqual(['a', 'b']);
  });
});

describe('chains stay on one line (playtest 11)', () => {
  it('the click chain runs straight along the Ergonomic Handle row', () => {
    const layout = check(RESEARCH);
    const row = (id: string) => layout.positions[id].row;
    for (const id of ['flywheel', 'geared_crank', 'kinetic_capture', 'grid_tap']) {
      expect(row(id), id).toBe(row('ergonomic_handle'));
    }
  });

  it('a lone child sits on its parent row, not the top of the column', () => {
    const layout = check([
      { id: 'a', prerequisites: [], requiredLevel: 1 },
      { id: 'b', prerequisites: ['a'], requiredLevel: 2 },
      { id: 'c', prerequisites: ['a'], requiredLevel: 2 },
      { id: 'd', prerequisites: ['a'], requiredLevel: 2 },
      { id: 'e', prerequisites: ['d'], requiredLevel: 3 },
    ]);
    expect(layout.positions.e.row).toBe(layout.positions.d.row);
  });
});
