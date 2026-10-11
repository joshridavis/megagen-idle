import { describe, expect, it } from 'vitest';
import { BUILD_EDITION, DEMO_BUILD, spliceAfter } from './edition';
import { FULL_GENERATOR_DEFS } from './generatorsFull';
import { GENERATORS } from './generators';
import { FULL_PET_DEFS } from './petsFull';
import { PETS } from './pets';
import { FREE_MAX_RESEARCH_LEVEL, FULL_GAME_GATEWAYS } from './purchases';
import { FULL_PRODUCER_DEFS } from './producersFull';
import { RESEARCH } from './research';
import { FULL_RESEARCH_DEFS } from './researchFull';

const fullResearch = FULL_RESEARCH_DEFS.flatMap((g) => g.items);

describe('editions: the data split (2.04)', () => {
  it('tests and the simulator run the full edition with all the data', () => {
    expect(BUILD_EDITION).toBe('full');
    expect(DEMO_BUILD).toBe(false);
    for (const r of fullResearch) expect(RESEARCH.some((x) => x.id === r.id)).toBe(true);
    for (const t of Object.keys(FULL_GENERATOR_DEFS)) expect(GENERATORS[t as keyof typeof GENERATORS].fullGame).toBeUndefined();
    for (const p of FULL_PET_DEFS.flatMap((g) => g.items)) expect(PETS.some((x) => x.id === p.id)).toBe(true);
  });

  it('every research past the free boundary is in researchFull.ts, and only those', () => {
    for (const r of fullResearch) expect(r.requiredLevel, r.id).toBeGreaterThan(FREE_MAX_RESEARCH_LEVEL);
    const ids = new Set(fullResearch.map((r) => r.id));
    for (const r of RESEARCH.filter((x) => !ids.has(x.id))) expect(r.requiredLevel, r.id).toBeLessThanOrEqual(FREE_MAX_RESEARCH_LEVEL);
  });

  it("the Full Game's machines, producers and pets come only from that research", () => {
    const unlocked = new Set(fullResearch.flatMap((r) => r.unlocks.generators ?? []));
    expect([...unlocked].sort()).toEqual(Object.keys(FULL_GENERATOR_DEFS).sort());
    for (const p of Object.values(FULL_PRODUCER_DEFS)) expect(fullResearch.some((r) => r.id === p.requiresResearch)).toBe(true);
    for (const p of FULL_PET_DEFS.flatMap((g) => g.items)) {
      expect(p.find.kind).toBe('build');
      if (p.find.kind === 'build') expect(unlocked.has(p.find.generator)).toBe(true);
    }
  });

  it('the research order is the same as before the split', () => {
    const ids = RESEARCH.map((r) => r.id);
    expect(ids.indexOf('kinetic_capture')).toBe(ids.indexOf('geared_crank') + 1);
    expect(ids.slice(ids.indexOf('oil_drilling') + 1)).toEqual(FULL_RESEARCH_DEFS[1].items.map((r) => r.id));
  });

  it("the demo's boundary prerequisites match the research data", () => {
    const ids = new Set(fullResearch.map((r) => r.id));
    const firstPaid = fullResearch.filter((r) => r.prerequisites.every((p) => !ids.has(p)));
    expect(firstPaid.map((r) => r.prerequisites)).toEqual(FULL_GAME_GATEWAYS);
  });

  it('spliceAfter puts each group after its anchor and refuses a missing one', () => {
    const key = (x: string) => x;
    expect(spliceAfter(['a', 'b', 'c'], [{ after: 'a', items: ['x'] }, { after: 'c', items: ['y', 'z'] }], key)).toEqual(['a', 'x', 'b', 'c', 'y', 'z']);
    expect(() => spliceAfter(['a'], [{ after: 'q', items: ['x'] }], key)).toThrow();
  });
});
