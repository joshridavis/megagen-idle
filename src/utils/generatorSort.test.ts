import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { migrateSave } from '../store/migrations';
import { useStore } from '../store';
import { NO_BONUSES } from '../types/bonus';
import { GeneratorType, type Generator } from '../types/generator';
import { sortGenerators } from './generatorSort';

const g = (n: number, type: GeneratorType, level = 1, isActive = true): Generator => ({ id: `gen-${n}`, type, level, isActive });
const list = [g(1, GeneratorType.SOLAR, 3), g(2, GeneratorType.COAL, 1, false), g(3, GeneratorType.HYDRO, 2), g(4, GeneratorType.WIND, 5)];
const ids = (l: Generator[]) => l.map((x) => x.id);

describe('generator list sorting (0.96)', () => {
  it('your order is the saved order', () => {
    expect(sortGenerators(list, 'custom', NO_BONUSES)).toBe(list);
  });

  it('sorts by energy per second, with switched-off generators as 0', () => {
    // hydro 5*1.25=6.25, wind 0.8*2=1.6, solar 0.5*1.5=0.75, coal off=0
    expect(ids(sortGenerators(list, 'output-desc', NO_BONUSES))).toEqual(['gen-3', 'gen-4', 'gen-1', 'gen-2']);
    expect(ids(sortGenerators(list, 'output-asc', NO_BONUSES))).toEqual(['gen-2', 'gen-1', 'gen-4', 'gen-3']);
  });

  it('sorts by level and by type', () => {
    expect(ids(sortGenerators(list, 'level-desc', NO_BONUSES))).toEqual(['gen-4', 'gen-1', 'gen-3', 'gen-2']);
    expect(ids(sortGenerators(list, 'level-asc', NO_BONUSES))).toEqual(['gen-2', 'gen-3', 'gen-1', 'gen-4']);
    expect(ids(sortGenerators(list, 'type', NO_BONUSES))).toEqual(['gen-1', 'gen-4', 'gen-2', 'gen-3']);
  });

  it('never changes the saved order, and the choice is saved', () => {
    const before = ids(list);
    sortGenerators(list, 'output-desc', NO_BONUSES);
    expect(ids(list)).toEqual(before);
    useStore.getState().resetGame();
    useStore.getState().setGeneratorSort('level-desc');
    expect(useStore.getState().settings.generatorSort).toBe('level-desc');
    const v10 = { ...createInitialState(0), settings: { notation: 'short', reduceMotion: false, tutorial: { step: 4, replay: false } } };
    expect(migrateSave(v10, 10).settings.generatorSort).toBe('custom');
  });
});

describe('upgradable first (1.03, playtest 14)', () => {
  it('puts affordable upgrades first, then not-maxed, then maxed; ties keep your order', () => {
    const l = [g(1, GeneratorType.SOLAR, 10), g(2, GeneratorType.COAL, 2), g(3, GeneratorType.HYDRO, 4), g(4, GeneratorType.WIND, 1)];
    const affordable = new Set(['gen-3']);
    expect(ids(sortGenerators(l, 'upgradable', NO_BONUSES, (x) => affordable.has(x.id)))).toEqual(['gen-3', 'gen-2', 'gen-4', 'gen-1']);
  });

  it('uses the real upgrade rules in the game', async () => {
    const { getUpgradeBlock } = await import('./generatorSystem');
    const { getEnergyBonuses } = await import('./bonuses');
    const s = { ...createInitialState(0), energy: 1e9, resources: { ...createInitialState(0).resources, metal: 1e6, stone: 1e6 }, activeGenerators: list };
    const can = (x: Generator) => getUpgradeBlock(s, x.id, getEnergyBonuses(s)) === null;
    expect(sortGenerators(list, 'upgradable', NO_BONUSES, can).every((x) => can(x))).toBe(true);
  });
});

describe('sorting edge cases (0.18)', () => {
  it('"Your order" returns the same list, untouched', () => {
    expect(sortGenerators(list, 'custom', NO_BONUSES)).toBe(list);
  });

  it('"upgradable" without an affordability check puts maxed generators last', () => {
    const maxed = g(5, GeneratorType.SOLAR, 99);
    expect(ids(sortGenerators([maxed, ...list], 'upgradable', NO_BONUSES)).at(-1)).toBe('gen-5');
  });

  it('an empty list stays empty', () => {
    expect(sortGenerators([], 'output-desc', NO_BONUSES)).toEqual([]);
  });
});
