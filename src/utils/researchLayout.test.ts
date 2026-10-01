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
  }
  return layout;
}

describe('computeResearchLayout', () => {
  it('lays out the real tree with prerequisites to the left', () => {
    const l = check(RESEARCH);
    expect(l.positions.wind_power.col).toBe(1);
    expect(l.edges).toContainEqual({ from: 'basic_solar', to: 'wind_power' });
  });

  it('stays readable for a 30-node tree: no overlaps, bounded size', () => {
    const nodes: LayoutInput[] = Array.from({ length: 30 }, (_, i) => ({
      id: `n${i}`,
      requiredLevel: 1 + Math.floor(i / 3),
      prerequisites: i < 3 ? [] : [`n${i - 3}`, ...(i % 4 === 0 ? [`n${i - 1}`] : [])],
    }));
    const l = check(nodes);
    expect(l.cols * l.rows).toBeGreaterThanOrEqual(30);
    expect(l.rows).toBeLessThanOrEqual(6);
  });

  it('handles an empty tree and unknown prerequisites', () => {
    expect(computeResearchLayout([])).toMatchObject({ cols: 0, rows: 0 });
    expect(computeResearchLayout([{ id: 'a', requiredLevel: 1, prerequisites: ['ghost'] }]).positions.a).toEqual({ col: 0, row: 0 });
  });
});
