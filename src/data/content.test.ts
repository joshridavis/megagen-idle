import { describe, expect, it } from 'vitest';
import { GENERATOR_TYPES, GENERATORS } from './generators';
import { createInitialState } from './initialState';
import { PRODUCER_IDS, PRODUCERS, STARTING_PRODUCERS } from './producers';
import { RESEARCH } from './research';
import type { ResourceId } from '../types/state';
import { completeResearch, getUnlockedGeneratorTypes, startResearch, canStartResearch } from '../utils/researchSystem';
import { GeneratorType } from '../types/generator';

/** Completes every research a rich player can, in data order, until nothing more is possible. */
function researchEverything() {
  let s = {
    ...createInitialState(0),
    energy: 1e12,
    resources: { metal: 1e9, stone: 1e9, coal: 1e9, naturalGas: 1e9 },
    activeGenerators: GENERATOR_TYPES.map((type, i) => ({ id: `gen-${i + 1}`, type, isActive: true, level: 1 })),
  };
  for (let changed = true; changed; ) {
    changed = false;
    for (const r of RESEARCH) {
      if (canStartResearch(s, r.id)) {
        s = completeResearch(startResearch(s, r.id, 0));
        changed = true;
      }
    }
  }
  return s;
}

describe('content reachability', () => {
  it('every research can be completed', () => {
    const s = researchEverything();
    expect(s.completedResearch.sort()).toEqual(RESEARCH.map((r) => r.id).sort());
  });

  it('every generator is unlockable and its level requirement is reachable', () => {
    const s = researchEverything();
    expect(getUnlockedGeneratorTypes(s.completedResearch).sort()).toEqual([...GENERATOR_TYPES].sort());
    for (const t of GENERATOR_TYPES) expect(s.researchLevel, t).toBeGreaterThanOrEqual(GENERATORS[t].requiredLevel);
  });

  it('every fuel-burning generator has a reachable fuel source', () => {
    const s = researchEverything();
    for (const t of GENERATOR_TYPES) {
      for (const fuel of Object.keys(GENERATORS[t].maintenanceCost ?? {}) as ResourceId[]) {
        const source = PRODUCER_IDS.find((p) => PRODUCERS[p].resource === fuel && s.producers[p] > 0);
        expect(source, `${t} burns ${fuel}`).toBeDefined();
      }
    }
  });

  it('natural gas comes from a gas well granted by research, not at the start', () => {
    expect(STARTING_PRODUCERS.gasWell).toBe(0);
    expect(researchEverything().producers.gasWell).toBe(1);
  });

  it('mid-tier generators need research levels 5 to 7', () => {
    expect(GENERATORS[GeneratorType.HYDRO].requiredLevel).toBe(5);
    expect(GENERATORS[GeneratorType.TIDAL].requiredLevel).toBe(6);
    expect(GENERATORS[GeneratorType.GAS].requiredLevel).toBe(7);
  });
});
