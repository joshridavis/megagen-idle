import { describe, expect, it } from 'vitest';
import { ACCENTS, ACHIEVEMENTS } from '../data/achievements';
import { createInitialState } from '../data/initialState';
import { migrateSave } from '../store/migrations';
import { useStore } from '../store';
import { GeneratorType } from '../types/generator';
import { canUseAccent, canUseTitle } from './achievements';
import { deriveRates } from './simulation';

const unlock = (n: number) => Object.fromEntries(ACHIEVEMENTS.slice(0, n).map((a) => [a.id, 1]));

describe('cosmetic achievement rewards (1.01)', () => {
  it('titles unlock with their achievement; accents with the number unlocked', () => {
    const titled = ACHIEVEMENTS.find((a) => a.title)!;
    expect(canUseTitle({ achievements: {} }, titled.id)).toBe(false);
    expect(canUseTitle({ achievements: { [titled.id]: 1 } }, titled.id)).toBe(true);
    expect(canUseTitle({ achievements: { gens_1: 1 } }, 'gens_1')).toBe(false); // not a title
    expect(canUseTitle({ achievements: {} }, null)).toBe(true);
    for (const x of ACCENTS) {
      expect(canUseAccent({ achievements: unlock(x.need) }, x.id)).toBe(true);
      if (x.need > 0) expect(canUseAccent({ achievements: unlock(x.need - 1) }, x.id)).toBe(false);
    }
  });

  it('the store refuses locked choices and keeps unlocked ones', () => {
    useStore.getState().resetGame();
    useStore.getState().setCosmetics({ accent: 'rose' });
    expect(useStore.getState().settings.cosmetics.accent).toBe('amber');
    useStore.setState({ achievements: unlock(6) });
    useStore.getState().setCosmetics({ accent: 'emerald' });
    expect(useStore.getState().settings.cosmetics.accent).toBe('emerald');
  });

  it('cosmetics never change the game', () => {
    const base = { ...createInitialState(0), activeGenerators: [{ id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 }] };
    const plain = deriveRates(base);
    const dressed = deriveRates({ ...base, settings: { ...base.settings, cosmetics: { title: 'energy_1b', accent: 'rose' } } });
    expect(dressed.energyPerSecond).toBe(plain.energyPerSecond);
  });

  it('older saves get default cosmetics', () => {
    const v15 = { ...createInitialState(0), settings: { notation: 'short', reduceMotion: false, tutorial: { step: 4, replay: false }, generatorSort: 'custom' } };
    expect(migrateSave(v15, 15).settings.cosmetics).toEqual({ title: null, accent: 'amber' });
  });
});
