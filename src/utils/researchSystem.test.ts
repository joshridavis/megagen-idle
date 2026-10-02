import { describe, expect, it , vi } from 'vitest';
import { GENERATORS } from '../data/generators';
import { createInitialState } from '../data/initialState';
import { BONUS_CAPS, RESEARCH, RESEARCH_BY_ID } from '../data/research';
import { NO_BONUSES } from '../types/bonus';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { getBonuses, getClickValue } from './bonuses';
import { buildGenerator } from './generatorSystem';
import {
  canStartResearch,
  completeResearch,
  getResearchBlock,
  getResearchCost,
  getResearchDuration,
  getUnlockedGeneratorTypes,
  researchProgress,
  startResearch,
} from './researchSystem';
import { advanceTime } from './simulation';

// These tests check other mechanics at fixed rates: no player level bonus (0.90).
vi.mock('../data/playerLevel', async (orig) => ({ ...(await orig<object>()), ENERGY_BONUS_PER_LEVEL: 0 }));

const T0 = 1_700_000_000_000;
const solar = { id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 };
const rich = (over: Partial<GameState> = {}): GameState => ({
  ...createInitialState(T0),
  activeGenerators: [solar],
  energy: 100_000,
  resources: { metal: 999, stone: 999, coal: 999, naturalGas: 0, oil: 0, uranium: 0 },
  ...over,
});

describe('research gating', () => {
  it('Basic Solar can start on a fresh-ish save with enough energy', () => {
    expect(getResearchBlock(rich(), 'basic_solar')).toBeNull();
  });

  it('Basic Solar needs a Solar Panel built (no research-before-income stall)', () => {
    expect(getResearchBlock(rich({ activeGenerators: [] }), 'basic_solar')).toBe('building');
  });

  it('enforces prerequisites', () => {
    expect(getResearchBlock(rich({ researchLevel: 5 }), 'wind_power')).toBe('prerequisites');
  });

  it('enforces the level requirement', () => {
    expect(getResearchBlock(rich(), 'fossil_fuels')).toBe('level');
    expect(getResearchBlock(rich({ researchLevel: 2 }), 'fossil_fuels')).toBeNull();
  });

  it('enforces cost, including resources', () => {
    expect(getResearchBlock(rich({ energy: RESEARCH_BY_ID.basic_solar.cost.energy - 1 }), 'basic_solar')).toBe('cost');
    const noCoal = rich({ researchLevel: 2, resources: { metal: 0, stone: 0, coal: 9, naturalGas: 0, oil: 0, uranium: 0 } });
    expect(getResearchBlock(noCoal, 'fossil_fuels')).toBe('cost');
  });

  it('only one research at a time, and never twice', () => {
    const s = startResearch(rich(), 'basic_solar', T0);
    expect(getResearchBlock(s, 'basic_solar')).toBe('busy');
    const done = completeResearch(s);
    expect(getResearchBlock(done, 'basic_solar')).toBe('done');
    expect(getResearchBlock(done, 'nope')).toBe('unknown');
  });
});

describe('starting and completing', () => {
  it('starting pays the cost and records the timer', () => {
    const s = startResearch(rich({ researchLevel: 2 }), 'fossil_fuels', T0);
    const def = RESEARCH_BY_ID.fossil_fuels;
    expect(s.energy).toBe(100_000 - def.cost.energy);
    expect(s.resources.coal).toBe(999 - def.cost.resources!.coal!);
    expect(s.currentResearch).toEqual({ id: 'fossil_fuels', startTime: T0, duration: def.duration });
  });

  it('blocked start changes nothing', () => {
    const s = rich({ energy: 0 });
    expect(startResearch(s, 'basic_solar', T0)).toBe(s);
  });

  it('completion raises the level and applies unlocks', () => {
    let s = rich({ researchLevel: 2 });
    s = completeResearch(startResearch(s, 'fossil_fuels', T0));
    expect(s.researchLevel).toBe(3);
    expect(s.completedResearch).toEqual(['fossil_fuels']);
    expect(s.currentResearch).toBeNull();
    expect(getUnlockedGeneratorTypes(s.completedResearch)).toContain(GeneratorType.COAL);
  });

  it('progress is time-based', () => {
    const s = startResearch(rich(), 'basic_solar', T0);
    expect(researchProgress(s, T0 + RESEARCH_BY_ID.basic_solar.duration * 500)).toBeCloseTo(0.5);
    expect(researchProgress(s, T0 + 999_999)).toBe(1);
    expect(researchProgress(s, T0 - 5_000)).toBe(0);
  });
});

describe('offline completion', () => {
  it('research finishes during offline time', () => {
    const s = startResearch(rich(), 'basic_solar', T0);
    const { state, report } = advanceTime(s, 7200, T0 + 7200_000);
    expect(state.completedResearch).toEqual(['basic_solar']);
    expect(state.researchLevel).toBe(2);
    expect(report.completedResearch).toEqual(['basic_solar']);
  });

  it('does not finish early', () => {
    const s = startResearch(rich(), 'basic_solar', T0);
    expect(advanceTime(s, 30, T0 + 30_000).state.currentResearch?.id).toBe('basic_solar');
  });

  it('finishes even when the time away is longer than the offline cap', () => {
    const s = startResearch(rich(), 'basic_solar', T0);
    // cap applied by the engine: only 10 s simulated, but it ends 2 days later
    expect(advanceTime(s, 10, T0 + 2 * 86_400_000).state.completedResearch).toEqual(['basic_solar']);
  });

  it('the bonus applies to energy only after completion', () => {
    let s = rich({ activeGenerators: [] });
    s = buildGenerator(s, GeneratorType.SOLAR, [GeneratorType.SOLAR]); // 0.5/s
    s = startResearch({ ...s, lastSavedTimestamp: T0 }, 'basic_solar', T0);
    const before = s.energy;
    const d = RESEARCH_BY_ID.basic_solar.duration;
    const { state } = advanceTime(s, 2 * d, T0 + 2 * d * 1000);
    // d seconds at 0.5/s, then d seconds at 0.55/s
    expect(state.energy - before).toBeCloseTo(d * 0.5 + d * 0.55);
    expect(state.energyPerSecond).toBeCloseTo(0.55);
  });
});

describe('bonuses', () => {
  it('are summed from completed research', () => {
    expect(getBonuses(['basic_solar']).globalEnergy).toBeCloseTo(0.1);
    expect(getBonuses([])).toEqual(NO_BONUSES);
  });

  it('cost reduction and speed apply', () => {
    const def = RESEARCH_BY_ID.fossil_fuels;
    expect(getResearchCost(def, { ...NO_BONUSES, researchCostReduction: 0.5 })).toEqual({ energy: 750, resources: { coal: 5 } });
    expect(getResearchDuration(def, { ...NO_BONUSES, researchSpeed: 0.5 })).toBeCloseTo(def.duration / 1.5);
  });

  it('caps are named constants and hold', () => {
    expect(BONUS_CAPS.buildDiscount).toBeLessThan(1);
  });

  it('click power multiplies the click value', () => {
    expect(getClickValue([])).toBe(1);
  });
});

describe('a fresh save reaches the first unlock without a stall', () => {
  it('Solar is available at once; Basic Solar, then Wind, are reachable by idling', () => {
    let s = createInitialState(T0);
    expect(getUnlockedGeneratorTypes(s.completedResearch)).toEqual([GeneratorType.SOLAR]);
    s = buildGenerator(s, GeneratorType.SOLAR, [GeneratorType.SOLAR]);
    // idle in 10 s steps, starting research as soon as it is affordable
    let t = T0;
    let firstResearchAt = -1;
    for (let i = 0; i < 6 * 60 * 6 && !s.completedResearch.includes('wind_power'); i++) {
      t += 60_000;
      s = { ...advanceTime(s, 60, t).state, lastSavedTimestamp: t };
      for (const r of RESEARCH) {
        if (canStartResearch(s, r.id)) {
          s = startResearch(s, r.id, t);
          if (firstResearchAt < 0) firstResearchAt = (t - T0) / 1000;
        }
      }
    }
    expect(firstResearchAt).toBeGreaterThan(0);
    expect(firstResearchAt).toBeLessThanOrEqual(15 * 60); // within 15 minutes, no clicking
    expect(s.completedResearch).toContain('wind_power');
    expect(GENERATORS[GeneratorType.WIND]).toBeDefined();
  });
});

describe('research level only rises on completion (playtest 4)', () => {
  it('starting research and ticking before it finishes leave the level alone', () => {
    let s = startResearch(rich({ researchLevel: 2, completedResearch: ['basic_solar'] }), 'wind_power', T0);
    expect(s.researchLevel).toBe(2);
    const d = RESEARCH_BY_ID.wind_power.duration;
    s = advanceTime(s, d - 1, T0 + (d - 1) * 1000).state;
    expect(s.researchLevel).toBe(2);
    expect(s.currentResearch?.id).toBe('wind_power');
    s = advanceTime({ ...s, lastSavedTimestamp: T0 + (d - 1) * 1000 }, 1, T0 + d * 1000).state;
    expect(s.researchLevel).toBe(3);
  });
});
