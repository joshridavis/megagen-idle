import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { ENERGY_BONUS_PER_LEVEL, MAX_PLAYER_LEVEL, PLAYER_LEVEL_BONUS_CAP } from '../data/playerLevel';
import { useStore } from '../store';
import { GeneratorType } from '../types/generator';
import { buildAwayReport, takeAwaySnapshot } from './awayReport';
import { getEnergyBonuses } from './bonuses';
import { getBonusSummary } from './bonusSummary';
import { getEnergyBreakdown } from './breakdown';
import { energyForLevel, playerLevelEnergyBonus } from './playerLevel';
import { deriveRates } from './simulation';

const solar = { id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 };

describe('player level reward (0.90)', () => {
  it('gives +0.1% energy per level above 1, capped', () => {
    expect(playerLevelEnergyBonus(0)).toBe(0);
    expect(playerLevelEnergyBonus(energyForLevel(11))).toBeCloseTo(10 * ENERGY_BONUS_PER_LEVEL);
    expect(playerLevelEnergyBonus(1e40)).toBeLessThanOrEqual(PLAYER_LEVEL_BONUS_CAP);
    expect(playerLevelEnergyBonus(1e40)).toBeCloseTo((MAX_PLAYER_LEVEL - 1) * ENERGY_BONUS_PER_LEVEL);
  });

  it('is applied to the energy rate and shown in the breakdown and bonuses panel', () => {
    const lifetimeEnergy = energyForLevel(21); // +2%
    const s = deriveRates({ ...createInitialState(0), activeGenerators: [solar], lifetimeEnergy });
    expect(s.energyPerSecond).toBeCloseTo(0.5 * 1.02);
    expect(getEnergyBonuses(s).globalEnergy).toBeCloseTo(0.02);
    const b = getEnergyBreakdown(s);
    expect(b.total).toBeCloseTo(s.energyPerSecond);
    expect(b.modifiers.at(-1)).toMatchObject({ source: 'Player level 21', percent: expect.closeTo(0.02) });
    expect(getBonusSummary([], lifetimeEnergy)[0]).toMatchObject({ type: 'globalEnergy', total: expect.closeTo(0.02) });
  });

  it('a level-up during live play queues one celebration for the highest level reached', () => {
    useStore.getState().resetGame();
    useStore.setState({ lifetimeEnergy: energyForLevel(5) - 0.5, celebrations: [] });
    useStore.getState().clickEnergy();
    const c = useStore.getState().celebrations;
    expect(c).toHaveLength(1);
    expect(c[0]).toMatchObject({ kind: 'level', level: 5 });
    // several quick level-ups merge into the newest one (the one on screen stays)
    useStore.setState({ lifetimeEnergy: energyForLevel(6) - 0.5 });
    useStore.getState().clickEnergy();
    useStore.setState({ lifetimeEnergy: energyForLevel(7) - 0.5 });
    useStore.getState().clickEnergy();
    expect(useStore.getState().celebrations.map((x) => (x.kind === 'level' ? x.level : x.id))).toEqual([5, 7]);
  });

  it('a level-up from a click raises the energy rate at once', () => {
    useStore.getState().resetGame();
    useStore.setState(deriveRates({ ...useStore.getState(), activeGenerators: [solar], lifetimeEnergy: energyForLevel(30) - 0.5 }));
    const before = useStore.getState().energyPerSecond;
    useStore.getState().clickEnergy();
    expect(useStore.getState().energyPerSecond).toBeGreaterThan(before);
  });

  it('the welcome-back report lists levels gained', () => {
    const s = { ...createInitialState(0), lifetimeEnergy: energyForLevel(12) };
    const snap = takeAwaySnapshot(s, 0);
    expect(buildAwayReport(snap, { ...s, lifetimeEnergy: energyForLevel(15) }, 120_000).levels).toEqual({ from: 12, to: 15 });
    expect(buildAwayReport(snap, s, 120_000).levels).toBeUndefined();
    useStore.getState().resetGame();
    useStore.setState(deriveRates({ ...useStore.getState(), activeGenerators: [solar], lifetimeEnergy: 0, lastSavedTimestamp: 0 }));
    useStore.getState().applyIdleGains(3600, 3_600_000, { catchUp: true });
    expect(useStore.getState().welcomeBack?.levels?.from).toBe(1);
    expect(useStore.getState().welcomeBack?.levels?.to).toBeGreaterThan(1);
  });
});
