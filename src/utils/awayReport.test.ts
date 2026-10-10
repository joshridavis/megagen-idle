import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { GeneratorType, type Generator } from '../types/generator';
import { buildAwayReport, levelsGained, takeAwaySnapshot } from './awayReport';

const T0 = 1_700_000_000_000;
const gen = (id: string, over: Partial<Generator> = {}): Generator => ({ id, type: GeneratorType.COAL, isActive: true, level: 1, ...over });

describe('time away summary (0.79, test coverage 0.18)', () => {
  it('reports only what changed while hidden', () => {
    const before = {
      ...createInitialState(T0),
      energy: 100,
      completedResearch: ['a'],
      activeGenerators: [gen('gen-1', { isActive: false, outOfFuel: true }), gen('gen-2')],
    };
    const snap = takeAwaySnapshot(before, T0);
    // the snapshot is a copy: later changes to the game do not leak into it
    before.resources.coal += 999;
    expect(snap.outOfFuel).toEqual(['gen-1']);
    const after = {
      ...before,
      energy: 400,
      resources: { ...snap.resources, metal: snap.resources.metal + 5 },
      completedResearch: ['a', 'b'],
      activeGenerators: [gen('gen-1', { isActive: false, outOfFuel: true }), gen('gen-2', { isActive: false, outOfFuel: true })],
    };
    const r = buildAwayReport(snap, after, T0 + 90_000);
    expect(r.awaySeconds).toBe(90);
    expect(r.creditedSeconds).toBe(90);
    expect(r.energyGained).toBe(300);
    expect(r.resourcesGained.metal).toBe(5);
    expect(r.resourcesGained.coal).toBe(0);
    expect(r.completedResearch).toEqual(['b']);
    expect(r.outOfFuel).toEqual(['gen-2']); // gen-1 was already out of fuel
    expect(r.levels).toBeUndefined();
  });

  it('never reports negative time when the clock went backwards', () => {
    const s = createInitialState(T0);
    expect(buildAwayReport(takeAwaySnapshot(s, T0), s, T0 - 60_000).awaySeconds).toBe(0);
  });

  it('names the levels gained, if any', () => {
    expect(levelsGained(0, 0)).toBeUndefined();
    const gained = levelsGained(0, 1e12);
    expect(gained!.from).toBe(1);
    expect(gained!.to).toBeGreaterThan(1);
  });
});
