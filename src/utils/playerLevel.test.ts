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

describe('early levels take real effort (0.95, playtest 12)', () => {
  it('level 2 needs at least 100 seconds of fast clicking at the base click value', async () => {
    const { BASE_CLICK_VALUE } = await import('../data/player');
    const clicksPerSecond = 2;
    expect(energyForLevel(2) / (clicksPerSecond * BASE_CLICK_VALUE)).toBeGreaterThanOrEqual(100);
    expect(getPlayerLevel(100 * clicksPerSecond * BASE_CLICK_VALUE - 1).level).toBe(1);
  });

  it('a lower level after a curve change is not celebrated', () => {
    useStore.getState().resetGame();
    useStore.setState({ lifetimeEnergy: 500, celebrations: [] });
    useStore.getState().clickEnergy();
    expect(useStore.getState().celebrations).toEqual([]);
  });
});

describe('late player levels are slower (2.10, owner: level 87 to 92 in one night)', () => {
  it('levels up to the late start keep their old thresholds', async () => {
    const { LATE_LEVEL_START, LEVEL_EXPONENT, LEVEL_SCALE } = await import('../data/playerLevel');
    for (let l = 2; l <= LATE_LEVEL_START; l++) expect(energyForLevel(l)).toBeCloseTo(LEVEL_SCALE * (l - 1) ** LEVEL_EXPONENT, 6);
  });

  it('from the late start on, each level costs a larger share more than the one before', async () => {
    const { LATE_LEVEL_START } = await import('../data/playerLevel');
    const step = (l: number) => energyForLevel(l) / energyForLevel(l - 1);
    for (let l = LATE_LEVEL_START + 2; l <= MAX_PLAYER_LEVEL; l++) expect(step(l)).toBeGreaterThan(step(l - 1));
    expect(step(MAX_PLAYER_LEVEL)).toBeGreaterThan(1.15);
  });

  it('a 12-hour night at the end-game energy rate from level 87 gives at most 2 levels', () => {
    const endGameRate = 60_000; // energy/s of the balance simulator at 100% completion
    const night = energyForLevel(87) + endGameRate * 12 * 3600;
    expect(getPlayerLevel(night).level).toBeLessThanOrEqual(89);
  });
});
