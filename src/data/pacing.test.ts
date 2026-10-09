import { describe, expect, it } from 'vitest';
import { migrateSave, pickSaved, SAVE_VERSION } from '../store/migrations';
import { GeneratorType } from '../types/generator';
import { getUpgradeCost, getGeneratorStats } from '../utils/generatorSystem';
import { LATE_ROOM_ENERGY_FACTOR, LATE_ROOM_TIER, MID_RESEARCH_COST_FACTOR, MID_RESEARCH_LEVEL, MID_RESEARCH_TIME_FACTOR, RESEARCH_TIME_FACTOR, ROOM_ENERGY_FACTOR } from './balance';
import { UPGRADES } from './generators';
import { createInitialState } from './initialState';
import { PACING_TARGETS } from './pacingTargets';
import { RESEARCH } from './research';
import { ROOM_TIERS } from './rooms';

describe('harder middle and late game (1.87)', () => {
  it('the new pacing targets are in place; the early ones are unchanged', () => {
    const range = (id: string) => PACING_TARGETS.find((t) => t.id === id)?.hours;
    expect(range(`room:${ROOM_TIERS.length}`)![0]).toBeGreaterThanOrEqual(250);
    expect(range('completion:75')![0]).toBeGreaterThanOrEqual(300);
    expect(range('completion:100')).toEqual([600, 900]);
    expect(range('generator:gas')).toEqual([6, 20]);
    expect(range('firstGenerator')).toEqual([0, 2 / 60]);
  });

  it('upgrades get steeper from level 5 on', () => {
    const build = getGeneratorStats(GeneratorType.WIND).energyCost;
    expect(getUpgradeCost(GeneratorType.WIND, 4).energy).toBe(Math.ceil(build * UPGRADES.costGrowth ** 4));
    expect(getUpgradeCost(GeneratorType.WIND, 5).energy).toBe(Math.ceil(build * UPGRADES.costGrowth ** 5 * UPGRADES.steepGrowth));
    expect(getUpgradeCost(GeneratorType.WIND, 9).energy).toBe(Math.ceil(build * UPGRADES.costGrowth ** 9 * UPGRADES.steepGrowth ** 5));
  });

  it('middle and late research costs and takes more; early research is unchanged', () => {
    const solar = RESEARCH.find((r) => r.id === 'basic_solar')!;
    expect(solar.cost.energy).toBe(250);
    expect(solar.duration).toBe(Math.round((10 * 60 * RESEARCH_TIME_FACTOR) / 60) * 60);
    const fusion = RESEARCH.find((r) => r.id === 'fusion_ignition')!;
    expect(fusion.requiredLevel).toBeGreaterThanOrEqual(MID_RESEARCH_LEVEL);
    expect(fusion.cost.energy).toBe(2_000_000 * MID_RESEARCH_COST_FACTOR);
    expect(fusion.duration).toBe(Math.round((480 * 60 * RESEARCH_TIME_FACTOR * MID_RESEARCH_TIME_FACTOR) / 60) * 60);
  });

  it('late room expansions cost more energy; early ones are unchanged', () => {
    expect(ROOM_TIERS[0].energy).toBe(Math.round(500 * ROOM_ENERGY_FACTOR));
    const late = ROOM_TIERS.find((t) => t.tier === LATE_ROOM_TIER)!;
    const before = ROOM_TIERS.find((t) => t.tier === LATE_ROOM_TIER - 1)!;
    expect(late.energy / before.energy).toBeGreaterThan(LATE_ROOM_ENERGY_FACTOR);
  });

  it('an existing save loads unchanged: nothing bought, built or researched is taken away', () => {
    const base = createInitialState(1_000);
    const save = pickSaved({
      ...base,
      energy: 5e9,
      completedResearch: RESEARCH.slice(0, 30).map((r) => r.id),
      researchLevel: 31,
      expansionLevel: 10,
      roomCapacity: 900,
      activeGenerators: [{ id: 'g1', type: GeneratorType.FUSION, isActive: true, level: 10 }],
      achievements: { gens_1: 1 },
    });
    const loaded = migrateSave(JSON.parse(JSON.stringify(save)), SAVE_VERSION);
    expect(loaded.energy).toBe(5e9);
    expect(loaded.completedResearch).toEqual(save.completedResearch);
    expect(loaded.expansionLevel).toBe(10);
    expect(loaded.roomCapacity).toBe(900);
    expect(loaded.activeGenerators).toEqual(save.activeGenerators);
    expect(loaded.achievements).toEqual({ gens_1: 1 });
  });
});
