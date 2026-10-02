import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { DETAILS, MAP_COLUMNS, MIN_ZONE_RUN, ZONES } from '../data/map';
import { GeneratorType, type Generator } from '../types/generator';
import type { GameState } from '../types/state';
import { getBuildBlock } from './generatorSystem';
import { detailAt, terrainAt } from './mapTerrain';
import { migrateSave } from '../store/migrations';
import { cellsAt, getPlacementBonuses, getProducerPlacement, hasSpotFor, layoutSite, moveOnMap, moveTargets, withPlacementMods, zoneAllows, zoneBonusFor } from './siteMap';
import { getProductionRates } from './resourceSystem';
import { getResourceBreakdown } from './breakdown';
import { NO_MODS } from './effectMods';
import { deriveRates } from './simulation';

const gen = (n: number, type: GeneratorType): Generator => ({ id: `gen-${n}`, type, isActive: true, level: 1 });
const site = (gens: Generator[], roomCapacity = 13, extra: Partial<GameState> = {}): GameState =>
  deriveRates({ ...createInitialState(0), activeGenerators: gens, roomCapacity, ...extra });

describe('map terrain (1.05)', () => {
  it('is the same every time, with a river in every row and the coast on the right', () => {
    for (let y = 0; y < 30; y++) {
      const row = Array.from({ length: MAP_COLUMNS }, (_, x) => terrainAt(x, y));
      expect(row.filter((t) => t === 'river').length).toBeGreaterThanOrEqual(4);
      expect(row.slice(-3).every((t) => t === 'coast')).toBe(true);
      expect(row).toEqual(Array.from({ length: MAP_COLUMNS }, (_, x) => terrainAt(x, y)));
    }
  });

  it('never leaves a zone sliver too narrow for a whole machine (playtest 17)', () => {
    for (let y = 0; y < 60; y++) {
      for (let x = 0; x < MAP_COLUMNS; x++) {
        const t = terrainAt(x, y);
        if (t === 'plain' || t === 'river' || t === 'coast') continue;
        // the run of this zone in this row, around x
        let a = x;
        let b = x;
        while (a > 0 && terrainAt(a - 1, y) === t) a--;
        while (b < MAP_COLUMNS - 1 && terrainAt(b + 1, y) === t) b++;
        expect(b - a + 1, `${t} at ${x},${y}`).toBeGreaterThanOrEqual(MIN_ZONE_RUN);
      }
    }
  });

  it('starts with plain land; the first expansion opens a ridge and a plateau', () => {
    for (let x = 0; x < 9; x++) expect(terrainAt(x, 0)).toBe('plain');
    expect(terrainAt(13, 0)).toBe('ridge');
    expect(terrainAt(16, 0)).toBe('plateau');
  });

  it('every terrain has at least two kinds of details, and each appears on the map (1.15)', () => {
    for (const d of Object.values(DETAILS)) expect(d.kinds.length).toBeGreaterThanOrEqual(2);
    const seen = new Set<string>();
    for (let y = 0; y < 60; y++) for (let x = 0; x < MAP_COLUMNS + 2; x++) {
      const d = detailAt(x, y);
      if (!d) continue;
      seen.add(d);
      expect(DETAILS[x >= MAP_COLUMNS ? 'sea' : terrainAt(x, y)].kinds).toContain(d);
    }
    expect([...seen].sort()).toEqual([...new Set(Object.values(DETAILS).flatMap((d) => d.kinds))].sort());
  });
});

describe('zone rules (1.05)', () => {
  it('hydro needs at least half its tiles on the river; others go anywhere', () => {
    const onRiver = cellsAt(9, 8)!; // river starts at column 9
    const offRiver = cellsAt(0, 8)!;
    expect(zoneAllows(GeneratorType.HYDRO, onRiver)).toBe(true);
    expect(zoneAllows(GeneratorType.HYDRO, offRiver)).toBe(false);
    expect(zoneAllows(GeneratorType.SOLAR, onRiver)).toBe(true);
  });

  it('a bonus applies only when the whole machine stands in its zone', () => {
    expect(zoneBonusFor(GeneratorType.SOLAR, cellsAt(16, 2)!)).toBe(ZONES.plateau.bonus);
    expect(zoneBonusFor(GeneratorType.SOLAR, cellsAt(15, 2)!)).toBe(0); // half on the ridge
    expect(zoneBonusFor(GeneratorType.COAL, cellsAt(4, 5)!)).toBe(0);
  });

  it('places hydro and tidal on their zones automatically, and others off the zones', () => {
    const s = site([gen(1, GeneratorType.HYDRO), gen(2, GeneratorType.TIDAL), gen(3, GeneratorType.COAL)], 150);
    const map = layoutSite(s);
    const byKey = Object.fromEntries(map.placed.map((p) => [p.key, p]));
    expect(byKey['gen-1'].misplaced).toBe(false);
    expect(byKey['gen-1'].cells.every((c) => terrainAt(c % MAP_COLUMNS, Math.floor(c / MAP_COLUMNS)) === 'river')).toBe(true);
    expect(byKey['gen-2'].cells.every((c) => terrainAt(c % MAP_COLUMNS, Math.floor(c / MAP_COLUMNS)) === 'coast')).toBe(true);
    expect(byKey['gen-3'].cells.every((c) => terrainAt(c % MAP_COLUMNS, Math.floor(c / MAP_COLUMNS)) === 'plain')).toBe(true);
    // hydro and tidal fully on their zones get its bonus
    expect(getPlacementBonuses(s)).toEqual({ 'gen-1': ZONES.river.bonus, 'gen-2': ZONES.coast.bonus });
  });

  it('blocks a hydro build when no river spot is free, with the "site" reason', () => {
    // one row of land: the river there is only 4 tiles, and a dam needs 4 of 8 on it
    const one = site([gen(1, GeneratorType.HYDRO)], 24);
    expect(layoutSite(one).placed.find((p) => p.key === 'gen-1')!.misplaced).toBe(true);
    const roomy = site([], 150);
    expect(hasSpotFor(roomy, GeneratorType.HYDRO)).toBe(true);
    const rich = { ...site([], 24), researchLevel: 99, energy: 1e12, resources: { ...createInitialState(0).resources, metal: 1e9, stone: 1e9, coal: 1e9 } };
    expect(getBuildBlock(rich, GeneratorType.HYDRO, [GeneratorType.HYDRO])).toBe('site');
    expect(hasSpotFor(rich, GeneratorType.SOLAR)).toBe(true);
  });
});

describe('moving machines (1.05)', () => {
  it('moves a solar panel onto the plateau, pins everything and adds the bonus', () => {
    const s = site([gen(1, GeneratorType.SOLAR), gen(2, GeneratorType.SOLAR)], 40, { mapPins: { 'gen-1': 0, 'gen-2': 2 } });
    const map = layoutSite(s);
    expect(moveTargets(map, 'gen-1').has(16)).toBe(true);
    const pins = moveOnMap(s, 'gen-1', 16)!;
    expect(pins['gen-1']).toBe(16);
    expect(Object.keys(pins).length).toBe(map.placed.length); // the rest stay where they were
    const after = deriveRates({ ...s, mapPins: pins });
    expect(after.energyPerSecond).toBeCloseTo(s.energyPerSecond + 0.5 * ZONES.plateau.bonus);
  });

  it('refuses overlaps, tiles outside the site and zone breaks', () => {
    const s = site([gen(1, GeneratorType.SOLAR), gen(2, GeneratorType.SOLAR)], 150);
    const map = layoutSite(s);
    const other = map.placed.find((p) => p.key === 'gen-2')!;
    expect(moveOnMap(s, 'gen-1', other.cells[0])).toBeNull();
    expect(moveOnMap(s, 'gen-1', 149)).toBeNull(); // would run past the site
    expect(moveOnMap(s, 'gen-1', MAP_COLUMNS - 1)).toBeNull(); // runs off the right edge
    const dam = site([gen(1, GeneratorType.HYDRO)], 150);
    expect(moveOnMap(dam, 'gen-1', 0)).toBeNull(); // off the river
  });

  it('keeps pinned machines in place when new ones are built', () => {
    const s = site([gen(1, GeneratorType.SOLAR)], 40, { mapPins: { 'gen-1': 0 } });
    const pins = moveOnMap(s, 'gen-1', 16)!;
    const later = site([gen(1, GeneratorType.SOLAR), gen(2, GeneratorType.WIND)], 40, { mapPins: pins });
    const p = layoutSite(later).placed.find((x) => x.key === 'gen-1')!;
    expect(p.cells).toEqual([16, 17]);
    expect(p.pinned).toBe(true);
  });
});

describe('new machines and staying put (1.17)', () => {
  it('a new solar lands fully on a free plateau spot, and wind on a ridge', () => {
    const s = site([gen(1, GeneratorType.SOLAR), gen(2, GeneratorType.WIND)], 40);
    const placed = Object.fromEntries(layoutSite(s).placed.map((p) => [p.key, p]));
    expect(placed['gen-1'].zoneBonus).toBe(ZONES.plateau.bonus);
    expect(placed['gen-2'].zoneBonus).toBe(ZONES.ridge.bonus);
    expect(s.mapPins['gen-1']).toBeDefined(); // deriveRates saved where it landed
  });

  it('machines keep their tiles when others are built or scrapped', () => {
    const a = site([gen(1, GeneratorType.SOLAR), gen(2, GeneratorType.COAL), gen(3, GeneratorType.SOLAR)], 60);
    const where = (s: GameState) => Object.fromEntries(layoutSite(s).placed.map((p) => [p.key, p.cells.join()]));
    const before = where(a);
    const built = deriveRates({ ...a, activeGenerators: [...a.activeGenerators, gen(4, GeneratorType.NUCLEAR), gen(5, GeneratorType.SOLAR)] });
    const scrapped = deriveRates({ ...built, activeGenerators: built.activeGenerators.filter((g) => g.id !== 'gen-2') });
    for (const k of ['gen-1', 'gen-3']) {
      expect(where(built)[k]).toBe(before[k]);
      expect(where(scrapped)[k]).toBe(before[k]);
    }
    expect(scrapped.mapPins['gen-2']).toBeUndefined();
  });

  it('a machine on the river gives way to a new dam, and nothing else moves', () => {
    // all plain and ridge land in the first rows is full, so a coal plant sits on the river
    const s = site([gen(1, GeneratorType.COAL)], 60, { mapPins: { 'gen-1': 9 } });
    const withDam = deriveRates({ ...s, activeGenerators: [...s.activeGenerators, gen(2, GeneratorType.HYDRO)] });
    const placed = Object.fromEntries(layoutSite(withDam).placed.map((p) => [p.key, p]));
    expect(placed['gen-2'].misplaced).toBe(false);
    expect(placed['gen-2'].zoneBonus).toBe(ZONES.river.bonus);
  });

  it('old saves load with no pins', () => {
    expect(migrateSave({ energy: 5 }, 16).mapPins).toEqual({});
  });
});

describe('producer zones (1.18)', () => {
  const findZone = (zone: string) => {
    for (let y = 0; y < 40; y++) for (let x = 0; x < MAP_COLUMNS; x++) if (terrainAt(x, y) === zone) return y * MAP_COLUMNS + x;
    return -1;
  };

  it('the map has coal fields, rocky outcrops and oil and gas fields', () => {
    for (const z of ['coalfield', 'outcrop', 'oilfield']) expect(findZone(z)).toBeGreaterThanOrEqual(0);
  });

  it('a coal mine fully on a coal field raises coal output, averaged over all coal mines', () => {
    const field = findZone('coalfield');
    const base = site([], 200, { producers: { ...createInitialState(0).producers, coalMine: 2 } });
    // one mine on the field, the other on plain land at the top left
    const on = { ...base, mapPins: { 'coalMine-1': field, 'coalMine-2': 5 } };
    const settled = deriveRates(on);
    const placed = layoutSite(settled).placed.find((p) => p.key === 'coalMine-1')!;
    expect(placed.cells).toEqual([field]);
    expect(placed.zoneBonus).toBe(ZONES.coalfield.bonus);
    // the other mine is on plain land: coal gets half the bonus
    const other = layoutSite(settled).placed.find((p) => p.key === 'coalMine-2')!;
    expect(other.zoneBonus).toBe(0);
    expect(getProducerPlacement(settled).coal).toBeCloseTo(ZONES.coalfield.bonus / 2);
    const rates = getProductionRates(settled.producers, undefined, withPlacementMods(NO_MODS, settled));
    const plain = getProductionRates(settled.producers);
    expect(rates.coal).toBeCloseTo(plain.coal * (1 + ZONES.coalfield.bonus / 2));
    // the quarry found a free rocky outcrop on its own
    expect(rates.stone).toBeCloseTo(plain.stone * (1 + ZONES.outcrop.bonus));
  });

  it('the resource breakdown shows the placement row and still adds up', () => {
    const field = findZone('coalfield');
    const s = deriveRates({ ...site([], 200), mapPins: { 'coalMine-1': field } });
    const b = getResourceBreakdown(s, 'coal');
    expect(b.modifiers.find((m) => m.source === 'Placement on the map')?.percent).toBeCloseTo(ZONES.coalfield.bonus);
    expect(b.total).toBeCloseTo(getProductionRates(s.producers, undefined, withPlacementMods(NO_MODS, s)).coal);
  });

  it('new producers go onto their zone when a spot is free', () => {
    const s = site([], 200, { producers: { ...createInitialState(0).producers, quarry: 3 } });
    const quarries = layoutSite(s).placed.filter((p) => p.id === 'quarry');
    expect(quarries.some((p) => p.zoneBonus === ZONES.outcrop.bonus)).toBe(true);
  });
});
