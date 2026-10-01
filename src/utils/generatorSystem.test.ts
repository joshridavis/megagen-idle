import { describe, expect, it } from 'vitest';
import { GENERATOR_TYPES } from '../data/generators';
import { createInitialState } from '../data/initialState';
import { NO_BONUSES } from '../types/bonus';
import { GeneratorType, type Generator } from '../types/generator';
import type { GameState } from '../types/state';
import { calculateEnergyRate, getGeneratorEfficiency, getGeneratorOutput } from './energyGeneration';
import {
  buildGenerator,
  canBuildGenerator,
  getBuildBlock,
  getGeneratorStats,
  nextGeneratorId,
  scrapGenerator,
  toggleGenerator,
} from './generatorSystem';
import { advanceTime } from './simulation';

const ALL = GENERATOR_TYPES;
const fresh = (over: Partial<GameState> = {}): GameState => ({ ...createInitialState(0), ...over });
const gen = (type: GeneratorType, isActive = true, id = 'gen-1'): Generator => ({ id, type, isActive, level: 1 });

describe('energyGeneration', () => {
  it('inactive generators produce nothing', () => {
    expect(getGeneratorOutput(gen(GeneratorType.COAL, false))).toBe(0);
    expect(calculateEnergyRate([gen(GeneratorType.COAL, false)])).toBe(0);
  });
  it('sums active generators', () => {
    expect(calculateEnergyRate([gen(GeneratorType.SOLAR), gen(GeneratorType.WIND), gen(GeneratorType.COAL)])).toBeCloseTo(3.3);
  });
  it('applies the global energy bonus', () => {
    expect(calculateEnergyRate([gen(GeneratorType.COAL)], { ...NO_BONUSES, globalEnergy: 0.5 })).toBeCloseTo(3);
  });
  it('efficiency is energy per room', () => {
    expect(getGeneratorEfficiency(GeneratorType.SOLAR)).toBeCloseTo(0.25);
    expect(getGeneratorEfficiency(GeneratorType.COAL)).toBeCloseTo(0.4);
  });
});

describe('getGeneratorStats', () => {
  it('returns data-file values without bonuses', () => {
    expect(getGeneratorStats(GeneratorType.WIND)).toMatchObject({ energyPerSecond: 0.8, roomCost: 3, buildCost: { metal: 15, stone: 8 } });
  });
  it('applies build discount, rounding costs up', () => {
    expect(getGeneratorStats(GeneratorType.WIND, { ...NO_BONUSES, buildDiscount: 0.1 }).buildCost).toEqual({ metal: 14, stone: 8 });
  });
});

describe('building', () => {
  it('a fresh save can build its first generator', () => {
    const s = fresh();
    expect(canBuildGenerator(s, GeneratorType.SOLAR, ALL)).toBe(true);
    const after = buildGenerator(s, GeneratorType.SOLAR, ALL);
    expect(after.activeGenerators).toHaveLength(1);
    expect(after.resources.metal).toBe(5);
    expect(after.roomUsed).toBe(2);
    expect(after.energyPerSecond).toBeCloseTo(0.5);
  });

  it('is blocked without resources', () => {
    const s = fresh({ resources: { metal: 5, stone: 0, coal: 0, naturalGas: 0 } });
    expect(getBuildBlock(s, GeneratorType.SOLAR, ALL)).toBe('resources');
    expect(buildGenerator(s, GeneratorType.SOLAR, ALL)).toBe(s);
  });

  it('is blocked without room', () => {
    const s = fresh({ resources: { metal: 999, stone: 999, coal: 0, naturalGas: 0 }, roomUsed: 9 });
    expect(getBuildBlock(s, GeneratorType.SOLAR, ALL)).toBe('room');
    expect(buildGenerator(s, GeneratorType.SOLAR, ALL)).toBe(s);
  });

  it('is blocked when locked', () => {
    expect(getBuildBlock(fresh(), GeneratorType.SOLAR, [])).toBe('locked');
  });

  it('fills room exactly to capacity, then blocks', () => {
    let s = fresh({ energy: 99_999, resources: { metal: 999, stone: 999, coal: 0, naturalGas: 0 } });
    for (let i = 0; i < 5; i++) s = buildGenerator(s, GeneratorType.SOLAR, ALL);
    expect(s.roomUsed).toBe(10);
    expect(s.activeGenerators).toHaveLength(5);
    expect(canBuildGenerator(s, GeneratorType.SOLAR, ALL)).toBe(false);
  });

  it('gives unique IDs', () => {
    expect(nextGeneratorId([])).toBe('gen-1');
    expect(nextGeneratorId([gen(GeneratorType.SOLAR, true, 'gen-4'), gen(GeneratorType.SOLAR, true, 'gen-2')])).toBe('gen-5');
  });
});

describe('toggling', () => {
  it('switches off and on, updating the rate', () => {
    let s = buildGenerator(fresh(), GeneratorType.SOLAR, ALL);
    const id = s.activeGenerators[0].id;
    s = toggleGenerator(s, id);
    expect(s.activeGenerators[0].isActive).toBe(false);
    expect(s.energyPerSecond).toBe(0);
    expect(s.roomUsed).toBe(2); // still takes room while off
    s = toggleGenerator(s, id);
    expect(s.energyPerSecond).toBeCloseTo(0.5);
  });

  it('switching on clears the out-of-fuel flag', () => {
    const s = fresh({ activeGenerators: [{ ...gen(GeneratorType.COAL, false), outOfFuel: true }] });
    expect(toggleGenerator(s, 'gen-1').activeGenerators[0]).toMatchObject({ isActive: true, outOfFuel: false });
  });

  it('unknown IDs change nothing', () => {
    const s = fresh();
    expect(toggleGenerator(s, 'nope')).toBe(s);
  });
});

describe('energy over time', () => {
  it('a coal plant stops adding energy once its fuel is gone', () => {
    let s = fresh({
      energy: 3600,
      producers: { quarry: 0, mine: 0, coalMine: 0, gasWell: 0 },
      resources: { metal: 20, stone: 15, coal: 5, naturalGas: 0 },
    });
    s = buildGenerator(s, GeneratorType.COAL, ALL);
    const { state } = advanceTime(s, 3600);
    // 5 coal = 5 minutes at 2/s
    expect(state.energy).toBeCloseTo(600);
    expect(state.energyPerSecond).toBe(0);
  });
});

describe('energy cost (playtest 3: 30 minutes of output)', () => {
  it('is base output times 1800 s', () => {
    expect(getGeneratorStats(GeneratorType.SOLAR).energyCost).toBe(900);
    expect(getGeneratorStats(GeneratorType.WIND).energyCost).toBe(1440);
    expect(getGeneratorStats(GeneratorType.COAL).energyCost).toBe(3600);
  });

  it('the build discount applies, rounding up', () => {
    expect(getGeneratorStats(GeneratorType.WIND, { ...NO_BONUSES, buildDiscount: 0.15 }).energyCost).toBe(1224);
    expect(getGeneratorStats(GeneratorType.SOLAR, { ...NO_BONUSES, buildDiscount: 0.333 }).energyCost).toBe(601);
  });

  it('a global energy bonus does not raise the cost', () => {
    expect(getGeneratorStats(GeneratorType.SOLAR, { ...NO_BONUSES, globalEnergy: 1 }).energyCost).toBe(900);
  });

  it('building deducts the energy', () => {
    const s = buildGenerator(fresh({ energy: 950 }), GeneratorType.SOLAR, ALL);
    expect(s.energy).toBe(50);
  });

  it('is blocked without enough energy', () => {
    const s = fresh({ energy: 899 });
    expect(getBuildBlock(s, GeneratorType.SOLAR, ALL)).toBe('energy');
    expect(buildGenerator(s, GeneratorType.SOLAR, ALL)).toBe(s);
  });

  it('reports missing resources before missing energy', () => {
    const s = fresh({ energy: 0, resources: { metal: 0, stone: 0, coal: 0, naturalGas: 0 } });
    expect(getBuildBlock(s, GeneratorType.SOLAR, ALL)).toBe('resources');
  });

  it('a fresh save can still build a Solar Panel at once', () => {
    expect(canBuildGenerator(fresh(), GeneratorType.SOLAR, ALL)).toBe(true);
  });
});

describe('scrapping', () => {
  it('removes the generator and frees its room, with no refund', () => {
    let s = buildGenerator(fresh(), GeneratorType.SOLAR, ALL);
    const metal = s.resources.metal;
    s = scrapGenerator(s, s.activeGenerators[0].id);
    expect(s.activeGenerators).toEqual([]);
    expect(s.roomUsed).toBe(0);
    expect(s.energyPerSecond).toBe(0);
    expect(s.resources.metal).toBe(metal);
  });
  it('unknown IDs change nothing', () => {
    const s = fresh();
    expect(scrapGenerator(s, 'nope')).toBe(s);
  });
});
