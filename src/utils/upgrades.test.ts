import { describe, expect, it } from 'vitest';
import { GENERATORS, UPGRADES } from '../data/generators';
import { createInitialState } from '../data/initialState';
import { NO_BONUSES } from '../types/bonus';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { getBonuses } from './bonuses';
import { getEnergyBreakdown } from './breakdown';
import { calculateEnergyRate, levelMultiplier } from './energyGeneration';
import { getGeneratorStats, getUpgradeBlock, getUpgradeCost, maxLevel, upgradeGain, upgradeGenerator } from './generatorSystem';
import { deriveRates } from './simulation';

const rich = (level = 1): GameState =>
  deriveRates({
    ...createInitialState(0),
    energy: 1e12,
    resources: { metal: 1e9, stone: 1e9, coal: 0, naturalGas: 0 },
    activeGenerators: [{ id: 'gen-1', type: GeneratorType.WIND, isActive: true, level }],
  });

describe('generator upgrades (0.32)', () => {
  it('output grows by outputPerLevel of the base per level', () => {
    expect(levelMultiplier(1)).toBe(1);
    expect(levelMultiplier(3)).toBeCloseTo(1 + 2 * UPGRADES.outputPerLevel);
    const g = { id: 'g', type: GeneratorType.WIND, isActive: true, level: 5 };
    expect(calculateEnergyRate([g])).toBeCloseTo(0.8 * (1 + 4 * 0.25));
    expect(upgradeGain(GeneratorType.WIND, 1)).toBeCloseTo(0.8 * 0.25);
  });

  it('energy cost grows by costGrowth and resources by resourceGrowth per level', () => {
    const build = getGeneratorStats(GeneratorType.WIND);
    expect(getUpgradeCost(GeneratorType.WIND, 1)).toEqual({
      energy: Math.ceil(build.energyCost * 1.6),
      resources: { metal: Math.ceil(15 * 1.3), stone: Math.ceil(8 * 1.3) },
    });
    expect(getUpgradeCost(GeneratorType.WIND, 4).resources.metal).toBe(Math.ceil(15 * 1.3 ** 4));
    expect(getUpgradeCost(GeneratorType.WIND, 4).energy).toBe(Math.ceil(build.energyCost * 1.6 ** 4));
    expect(getUpgradeCost(GeneratorType.WIND, 2).energy).toBeGreaterThan(getUpgradeCost(GeneratorType.WIND, 1).energy);
  });

  it('build discount applies to upgrades', () => {
    const b = getBonuses(['standard_parts']);
    expect(getUpgradeCost(GeneratorType.WIND, 1, b).energy).toBeLessThan(getUpgradeCost(GeneratorType.WIND, 1, NO_BONUSES).energy);
  });

  it('upgrading raises level and output, pays the cost, and never changes room', () => {
    const s = rich();
    const after = upgradeGenerator(s, 'gen-1');
    expect(after.activeGenerators[0].level).toBe(2);
    expect(after.roomUsed).toBe(s.roomUsed);
    expect(after.energyPerSecond).toBeCloseTo(0.8 * 1.25);
    expect(after.energy).toBe(s.energy - getUpgradeCost(GeneratorType.WIND, 1).energy);
  });

  it('stops at the max level', () => {
    const top = rich(maxLevel(GeneratorType.WIND));
    expect(maxLevel(GeneratorType.WIND)).toBe(GENERATORS[GeneratorType.WIND].maxLevel ?? UPGRADES.maxLevel);
    expect(getUpgradeBlock(top, 'gen-1')).toBe('max');
    expect(upgradeGenerator(top, 'gen-1')).toBe(top);
  });

  it('is blocked without energy or resources', () => {
    expect(getUpgradeBlock({ ...rich(), energy: 0 }, 'gen-1')).toBe('energy');
    expect(getUpgradeBlock({ ...rich(), resources: { metal: 0, stone: 0, coal: 0, naturalGas: 0 } }, 'gen-1')).toBe('resources');
    expect(getUpgradeBlock(rich(), 'nope')).toBe('unknown');
  });

  it('the energy breakdown includes upgrade levels in the base', () => {
    const s = upgradeGenerator(rich(), 'gen-1');
    expect(getEnergyBreakdown(s).base).toBeCloseTo(1);
  });
});
