import { describe, expect, it } from 'vitest';
import { ACCENTS, ACHIEVEMENTS, DEFAULT_ACCENT, TITLE_TIERS } from '../data/achievements';
import { createInitialState } from '../data/initialState';
import { migrateSave } from '../store/migrations';
import { useStore } from '../store';
import { GeneratorType } from '../types/generator';
import { canUseAccent, canUseTitle, resolveAccent } from './achievements';
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
    expect(useStore.getState().settings.cosmetics.accent).toBe('slate');
    useStore.setState({ achievements: unlock(6) });
    useStore.getState().setCosmetics({ accent: 'lime' });
    expect(useStore.getState().settings.cosmetics.accent).toBe('lime');
  });

  it('cosmetics never change the game', () => {
    const base = { ...createInitialState(0), activeGenerators: [{ id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 }] };
    const plain = deriveRates(base);
    const dressed = deriveRates({ ...base, settings: { ...base.settings, cosmetics: { title: 'energy_1b', accent: 'rose' } } });
    expect(dressed.energyPerSecond).toBe(plain.energyPerSecond);
  });

  it('older saves get default cosmetics', () => {
    const v15 = { ...createInitialState(0), settings: { notation: 'short', reduceMotion: false, tutorial: { step: 4, replay: false }, generatorSort: 'custom' } };
    expect(migrateSave(v15, 15).settings.cosmetics).toEqual({ title: null, accent: 'slate' });
  });
});

describe('accents follow the title tiers (1.89)', () => {
  it('one accent per tier, in tier order, in the tier color', () => {
    expect(ACCENTS.map((x) => x.tier)).toEqual(TITLE_TIERS.map((t) => t.id));
    ACCENTS.forEach((x, i) => expect(x.color).toBe(TITLE_TIERS[i].color));
    for (let i = 1; i < ACCENTS.length; i++) expect(ACCENTS[i].need).toBeGreaterThan(ACCENTS[i - 1].need);
  });

  it('Common is free and the default; Legendary needs the most achievements', () => {
    expect(ACCENTS[0].tier).toBe('common');
    expect(ACCENTS[0].need).toBe(0);
    expect(DEFAULT_ACCENT).toBe(ACCENTS[0].id);
    expect(createInitialState(0).settings.cosmetics.accent).toBe(DEFAULT_ACCENT);
    const legendary = ACCENTS.find((x) => x.tier === 'legendary')!;
    expect(legendary.need).toBe(Math.max(...ACCENTS.map((x) => x.need)));
    expect(legendary.need).toBeLessThanOrEqual(ACHIEVEMENTS.length);
  });

  it('old accents map to the same color, or to the highest unlocked', () => {
    const all = unlock(ACHIEVEMENTS.length);
    expect(resolveAccent({ achievements: all }, 'amber')).toBe('gold');
    expect(resolveAccent({ achievements: all }, 'emerald')).toBe('lime');
    expect(resolveAccent({ achievements: all }, 'sky')).toBe('sky');
    expect(resolveAccent({ achievements: all }, 'rose')).toBe('rose');
    expect(resolveAccent({ achievements: all }, 'violet')).toBe('gold');
    // Few achievements: amber (was free) is now Gold, still locked: highest unlocked.
    expect(resolveAccent({ achievements: unlock(6) }, 'amber')).toBe('lime');
    expect(resolveAccent({ achievements: {} }, 'amber')).toBe('slate');
    expect(resolveAccent({ achievements: unlock(16) }, 'violet')).toBe('sky');
    expect(resolveAccent({ achievements: unlock(16) }, 'nonsense')).toBe('sky');
  });

  it('old saves with each old accent load with a valid accent', () => {
    for (const old of ['amber', 'emerald', 'sky', 'violet', 'rose']) {
      const base = createInitialState(0);
      const v22 = { ...base, achievements: unlock(26), settings: { ...base.settings, cosmetics: { title: null, accent: old } } };
      const accent = migrateSave(v22, 22).settings.cosmetics.accent;
      expect(canUseAccent({ achievements: unlock(26) }, accent)).toBe(true);
    }
    const base = createInitialState(0);
    const rose = migrateSave({ ...base, achievements: unlock(26), settings: { ...base.settings, cosmetics: { title: null, accent: 'rose' } } }, 22);
    expect(rose.settings.cosmetics.accent).toBe('rose');
  });
});
