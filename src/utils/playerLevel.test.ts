import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { MAX_PLAYER_LEVEL } from '../data/playerLevel';
import { migrateSave } from '../store/migrations';
import { useStore } from '../store';
import { energyForLevel, getPlayerLevel } from './playerLevel';
import { advanceTime } from './simulation';
import { buildGenerator } from './generatorSystem';
import { getBonuses } from './bonuses';
import { getUnlockedGeneratorTypes } from './researchSystem';
import { GeneratorType } from '../types/generator';

describe('player level (0.88)', () => {
  it('thresholds rise strictly with level', () => {
    for (let l = 2; l <= MAX_PLAYER_LEVEL; l++) expect(energyForLevel(l)).toBeGreaterThan(energyForLevel(l - 1));
  });

  it('maps lifetime energy to a level, exactly at the boundaries', () => {
    expect(getPlayerLevel(0)).toMatchObject({ level: 1, progress: 0, isMax: false });
    for (const l of [2, 5, 10, 40, 98]) {
      expect(getPlayerLevel(energyForLevel(l)).level).toBe(l);
      expect(getPlayerLevel(energyForLevel(l) * 0.9999999).level).toBe(l - 1);
    }
    const mid = getPlayerLevel((energyForLevel(10) + energyForLevel(11)) / 2);
    expect(mid.level).toBe(10);
    expect(mid.progress).toBeCloseTo(0.5);
    expect(getPlayerLevel(1e30)).toMatchObject({ level: MAX_PLAYER_LEVEL, progress: 1, isMax: true });
  });

  it('lifetime energy grows with production (online and offline) and is not lowered by spending', () => {
    let s = { ...createInitialState(0), resources: { ...createInitialState(0).resources, metal: 100 } };
    s = buildGenerator(s, GeneratorType.SOLAR, getUnlockedGeneratorTypes([]), getBonuses([]));
    expect(s.energy).toBe(0); // spent the starting energy
    expect(s.lifetimeEnergy).toBe(0);
    const { state } = advanceTime(s, 3600, 3_600_000);
    expect(state.lifetimeEnergy).toBeCloseTo(state.energy);
    expect(state.lifetimeEnergy).toBeGreaterThanOrEqual(0.5 * 3600); // plus the small level bonus
  });

  it('clicks add to lifetime energy', () => {
    useStore.getState().resetGame();
    useStore.getState().clickEnergy();
    useStore.getState().clickEnergy();
    expect(useStore.getState().lifetimeEnergy).toBe(2);
  });

  it('a version 7 save starts lifetime energy at its current energy', () => {
    const v7 = { ...createInitialState(0), energy: 12345 } as Record<string, unknown>;
    delete v7.lifetimeEnergy;
    expect(migrateSave(v7, 7).lifetimeEnergy).toBe(12345);
  });
});
