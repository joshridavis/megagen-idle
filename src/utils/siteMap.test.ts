import { describe, expect, it } from 'vitest';
import { GENERATORS } from '../data/generators';
import { createInitialState } from '../data/initialState';
import { PRODUCERS } from '../data/producers';
import { GeneratorType, type Generator } from '../types/generator';
import type { GameState } from '../types/state';
import { footprint, layoutSite } from './siteMap';
import { deriveRates } from './simulation';

const gen = (n: number, type: GeneratorType): Generator => ({ id: `gen-${n}`, type, isActive: true, level: 1 });

function check(s: GameState) {
  const map = layoutSite(s);
  const all = map.placed.flatMap((p) => p.cells);
  expect(new Set(all).size).toBe(all.length); // no overlap
  expect(all.every((c) => c >= 0 && c < map.capacity)).toBe(true);
  for (const p of map.placed) {
    const size = p.kind === 'generator' ? GENERATORS[p.type as GeneratorType].roomCost : PRODUCERS[p.type as keyof typeof PRODUCERS].roomCost;
    expect(p.cells).toHaveLength(size);
  }
  return map;
}

describe('site map (1.04)', () => {
  it('footprints cover exactly the room cost, as square as possible', () => {
    for (const n of [1, 2, 3, 5, 8, 9, 10, 12]) {
      const f = footprint(n);
      expect(f).toHaveLength(n);
      expect(Math.max(...f.map(([x]) => x)) + 1).toBe(Math.ceil(Math.sqrt(n)));
    }
  });

  it('places every machine once, by its size, with no overlap', () => {
    const s = deriveRates({
      ...createInitialState(0),
      roomCapacity: 60,
      activeGenerators: [gen(1, GeneratorType.SOLAR), gen(2, GeneratorType.HYDRO), gen(3, GeneratorType.COAL), gen(4, GeneratorType.WIND)],
    });
    const map = check(s);
    expect(map.placed.filter((p) => p.kind === 'generator').map((p) => p.id)).toEqual(['gen-1', 'gen-2', 'gen-3', 'gen-4']);
    expect(map.placed.filter((p) => p.kind === 'producer')).toHaveLength(3); // the starting quarry, mine and coal mine
  });

  it('a full, fragmented site still gets a valid layout (old saves, any order)', () => {
    const types = [GeneratorType.SOLAR, GeneratorType.WIND, GeneratorType.COAL, GeneratorType.HYDRO, GeneratorType.TIDAL, GeneratorType.GAS];
    const gens = Array.from({ length: 30 }, (_, i) => gen(i + 1, types[(i * 7) % types.length]));
    const room = gens.reduce((n, g) => n + GENERATORS[g.type].roomCost, 0) + 3;
    const map = check(deriveRates({ ...createInitialState(0), roomCapacity: room, activeGenerators: gens }));
    expect(map.placed.flatMap((p) => p.cells)).toHaveLength(room); // exactly full
  });

  it('research-granted producers take no room and are not placed', () => {
    const s = { ...createInitialState(0), completedResearch: ['fossil_fuels', 'gas_extraction'], producers: { ...createInitialState(0).producers, gasWell: 1 } };
    expect(layoutSite(s).placed.some((p) => p.type === 'gasWell')).toBe(false);
  });
});
