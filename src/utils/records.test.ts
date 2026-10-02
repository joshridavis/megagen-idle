import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { GENERATOR_TYPES, GENERATORS, UPGRADES } from '../data/generators';
import { migrateSave } from '../store/migrations';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { getBonuses } from './bonuses';
import { getCompletion } from './completion';
import { buildGenerator, scrapGenerator, upgradeGenerator } from './generatorSystem';
import { noteGenerator, recordsFromGenerators } from './records';
import { getUnlockedGeneratorTypes } from './researchSystem';

const rich = (): GameState => ({
  ...createInitialState(0),
  energy: 1e12,
  resources: { coal: 1e9, stone: 1e9, metal: 1e9, naturalGas: 1e9, oil: 0, uranium: 0 },
  roomCapacity: 1000,
});

describe('generator records (0.82)', () => {
  it('building and upgrading update the records; scrapping keeps them', () => {
    let s = rich();
    const b = getBonuses(s.completedResearch);
    s = buildGenerator(s, GeneratorType.SOLAR, getUnlockedGeneratorTypes(s.completedResearch), b);
    expect(s.records).toEqual({ builtTypes: ['solar'], bestLevel: { solar: 1 } });
    const id = s.activeGenerators[0].id;
    s = upgradeGenerator(s, id, b);
    s = upgradeGenerator(s, id, b);
    expect(s.records.bestLevel.solar).toBe(3);
    s = scrapGenerator(s, id);
    expect(s.activeGenerators).toHaveLength(0);
    expect(s.records).toEqual({ builtTypes: ['solar'], bestLevel: { solar: 3 } });
  });

  it('noteGenerator never lowers a best level', () => {
    const r = noteGenerator({ builtTypes: [GeneratorType.WIND], bestLevel: { wind: 7 } }, { type: GeneratorType.WIND, level: 2 });
    expect(r.bestLevel.wind).toBe(7);
  });

  it('records from generators keep the highest level per type', () => {
    const r = recordsFromGenerators([
      { id: 'a', type: GeneratorType.COAL, level: 2 },
      { id: 'b', type: GeneratorType.COAL, level: 5 },
      { id: 'c', type: GeneratorType.SOLAR, level: 1 },
    ] as GameState['activeGenerators']);
    expect(r).toEqual({ builtTypes: ['coal', 'solar'], bestLevel: { coal: 5, solar: 1 } });
  });

  it('a version 5 save gets records from its current generators', () => {
    const v5 = { ...createInitialState(0), activeGenerators: [{ id: 'x', type: 'hydro', level: 4 }] } as Record<string, unknown>;
    delete v5.records;
    const s = migrateSave(v5, 5);
    expect(s.records).toEqual({ builtTypes: ['hydro'], bestLevel: { hydro: 4 } });
  });
});

describe('completion with max levels (0.82)', () => {
  it('counts a type only at max level, and scrapping does not lower it', () => {
    const s = createInitialState(0);
    const part = (st: GameState) => getCompletion(st).parts.find((p) => p.label === 'Generator types at max level')!;
    expect(part(s)).toMatchObject({ label: 'Generator types at max level', done: 0, total: GENERATOR_TYPES.length });
    const max = GENERATORS.solar.maxLevel ?? UPGRADES.maxLevel;
    const almost = { ...s, records: { builtTypes: [GeneratorType.SOLAR], bestLevel: { solar: max - 1 } } };
    expect(part(almost).done).toBe(0);
    const maxed = { ...s, records: { builtTypes: [GeneratorType.SOLAR], bestLevel: { solar: max } } };
    expect(part(maxed).done).toBe(1);
    expect(maxed.activeGenerators).toHaveLength(0);
  });
});
