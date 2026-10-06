import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { EVENTS, EVENTS_BY_ID } from '../data/events';
import { createInitialState } from '../data/initialState';
import { GeneratorType, type Generator } from '../types/generator';
import { useStore } from '../store';
import { getEffectMods } from './effectMods';
import { applyMapEvent, FLOCK_MAX_SLOPE, pickMapTarget, type MapEventState } from './mapEvents';
import { seededRng } from './rng';
import { MAP_COLUMNS, SEA_COLUMNS } from '../data/map';
import { layoutSite } from './siteMap';
import { energyForLevel } from './playerLevel';
import type { GameState } from '../types/state';
const layoutSiteFor = (st: GameState) => layoutSite(st).placed;
import { eligibleEvents } from './randomEvents';
import { deriveRates } from './simulation';
import MapPanel from '../components/MapPanel';

afterEach(cleanup);
const gen = (id: string, type: GeneratorType): Generator => ({ id, type, isActive: true, level: 1 });
const site = (gens: Generator[]) => deriveRates({ ...createInitialState(0), activeGenerators: gens, roomCapacity: 60 });
const first = () => 0;

describe('map events (1.12)', () => {
  it('roll only for the Map tab, and other events never do there', () => {
    const s = site([gen('gen-1', GeneratorType.COAL), gen('gen-2', GeneratorType.HYDRO)]);
    const onMap = eligibleEvents(s, { foreground: true, map: true });
    expect(onMap.length).toBeGreaterThan(0);
    expect(onMap.every((e) => e.when === 'map')).toBe(true);
    expect(eligibleEvents(s, { foreground: true }).some((e) => e.when === 'map')).toBe(false);
    // a flood needs a dam; a fire needs a coal plant
    const plain = site([gen('gen-1', GeneratorType.SOLAR)]);
    const ids = eligibleEvents(plain, { foreground: true, map: true }).map((e) => e.id);
    expect(ids).not.toContain('map_flood');
    expect(ids).not.toContain('map_fire');
  });

  it('a lightning strike boosts just the struck generator type for 3 minutes', () => {
    const s = site([gen('gen-1', GeneratorType.COAL)]);
    const ev = pickMapTarget(s, EVENTS_BY_ID.map_lightning, first, 1000)!;
    expect(ev).toMatchObject({ key: 'gen-1', generatorType: GeneratorType.COAL });
    const after = deriveRates(applyMapEvent(s, ev, 1000, first).state);
    expect(after.activeEffects).toEqual([{ id: 'map_lightning', until: 1000 + 3 * 60_000, generator: GeneratorType.COAL }]);
    expect(getEffectMods(after.activeEffects).generator.coal).toBe(0.25);
    expect(after.energyPerSecond).toBeCloseTo(s.energyPerSecond * 1.25);
  });

  it('another strike adds time to the same type, and a strike on another type boosts it separately (playtest 19.3)', () => {
    const s = site([gen('gen-1', GeneratorType.COAL), gen('gen-2', GeneratorType.WIND)]);
    const strike = (st: typeof s, key: string, now: number) => {
      const p = layoutSiteFor(st).find((x) => x.key === key)!;
      return applyMapEvent(st, { id: 'map_lightning', at: now, cells: p.cells, key, generatorType: p.type as GeneratorType }, now, first);
    };
    const one = strike(s, 'gen-1', 1000);
    expect(one.text).toBe('Lightning struck a Coal Plant: +25% from your Coal Plants for 3 minutes.');
    // a minute later, the same type again: 2 minutes were left, now 5
    const two = strike(one.state, 'gen-1', 61_000);
    expect(two.state.activeEffects).toEqual([{ id: 'map_lightning', until: 1000 + 6 * 60_000, generator: GeneratorType.COAL }]);
    expect(two.text).toContain('runs 3 minutes longer');
    // another type keeps the first boost and gets its own
    const three = strike(two.state, 'gen-2', 61_000);
    expect(three.state.activeEffects).toHaveLength(2);
    const mods = getEffectMods(three.state.activeEffects, 61_000);
    expect(mods.generator.coal).toBe(0.25);
    expect(mods.generator.wind).toBe(0.25);
    // an ended boost starts fresh
    const late = strike(two.state, 'gen-1', 1000 + 7 * 60_000);
    expect(late.state.activeEffects).toEqual([{ id: 'map_lightning', until: 1000 + 10 * 60_000, generator: GeneratorType.COAL }]);
  });

  it('a delivery brings the resource of the producer it drives to', () => {
    const s = site([]);
    const ev = pickMapTarget(s, EVENTS_BY_ID.map_delivery, () => 0.99, 0)!;
    expect(ev.producer).toBeDefined();
    const res = { quarry: 'stone', mine: 'metal', coalMine: 'coal' } as const;
    const r = res[ev.producer as keyof typeof res];
    const after = applyMapEvent(s, ev, 0, first).state;
    expect(after.resources[r]).toBeGreaterThan(s.resources[r]);
  });

  it('a delivery brings more to a higher-level player (playtest 19.4)', () => {
    const low = site([]);
    const high = { ...low, lifetimeEnergy: energyForLevel(21) };
    const ev = { id: 'map_delivery', at: 0, cells: [], producer: 'quarry' as const };
    const got = (st: GameState) => applyMapEvent(st, ev, 0, first).state.resources.stone - st.resources.stone;
    // 8 minutes of stone at level 1; +3% per level above 1, so x1.6 at level 21
    expect(got(low)).toBeCloseTo(Math.max(5, 0.1 * 8 * 60));
    expect(got(high)).toBeCloseTo(got(low) * 1.6);
  });

  it('a fire pays only if put out in time', () => {
    useStore.setState({ ...site([gen('gen-1', GeneratorType.COAL)]), mapEvent: null });
    const ev = pickMapTarget(useStore.getState(), EVENTS_BY_ID.map_fire, first, 1000)!;
    expect(ev.claimUntil).toBe(31_000);
    useStore.setState({ mapEvent: ev });
    expect(useStore.getState().claimMapEvent(40_000)).toBe(false);
    const before = useStore.getState().energy;
    expect(useStore.getState().claimMapEvent(20_000)).toBe(true);
    expect(useStore.getState().energy).toBeGreaterThan(before);
    expect(useStore.getState().mapEvent).toBeNull();
  });

  it('every map event has a look on the map', () => {
    for (const e of EVENTS.filter((x) => x.when === 'map')) expect(e.map?.durationMs, e.id).toBeGreaterThan(0);
  });

  it('the Map tab shows a fire as a button that puts it out', () => {
    const s = site([gen('gen-1', GeneratorType.COAL)]);
    const now = Date.now();
    useStore.setState({ ...s, mapEvent: pickMapTarget(s, EVENTS_BY_ID.map_fire, first, now) });
    render(<MapPanel onSelect={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Small fire: click to put it out' }));
    expect(useStore.getState().mapEvent).toBeNull();
  });
});

describe('map events in random places (1.67)', () => {
  const seeds = Array.from({ length: 300 }, (_, i) => i + 1);
  const roll = (s: GameState, id: string, seed: number) => pickMapTarget(s, EVENTS_BY_ID[id], seededRng(seed), 0)!;

  it('the birds fly at any height, either way, on a slight slope, and different seeds give different places', () => {
    const s = site([]);
    const evs = seeds.map((x) => roll(s, 'map_flock', x));
    const ys = evs.map((e) => e.pos!.y!);
    expect(Math.min(...ys)).toBeLessThan(0.05);
    expect(Math.max(...ys)).toBeGreaterThan(0.95);
    expect(new Set(ys.map((y) => Math.floor(y * 10))).size).toBe(10);
    expect(new Set(evs.map((e) => e.pos!.dir))).toEqual(new Set([1, -1]));
    for (const e of evs) expect(Math.abs(e.pos!.slope!)).toBeLessThanOrEqual(FLOCK_MAX_SLOPE);
    expect(roll(s, 'map_flock', 1).pos).not.toEqual(roll(s, 'map_flock', 2).pos);
    // the same seed gives the same place
    expect(roll(s, 'map_flock', 7)).toEqual(roll(s, 'map_flock', 7));
  });

  it('the falling star reaches every row of the sea', () => {
    const s = site([]);
    const siteRows = Math.ceil(layoutSite(s).capacity / MAP_COLUMNS);
    const rowsHit = new Set(seeds.map((x) => Math.floor(roll(s, 'map_star', x).cells[0] / (MAP_COLUMNS + SEA_COLUMNS))));
    expect(rowsHit.size).toBe(siteRows);
    expect(Math.max(...rowsHit)).toBe(siteRows - 1);
  });

  it('the truck comes from either side', () => {
    const s = site([]);
    expect(new Set(seeds.map((x) => roll(s, 'map_delivery', x).pos!.dir))).toEqual(new Set([1, -1]));
  });

  const show = (ev: MapEventState, reduceMotion = false) => {
    const s = site([]);
    useStore.setState({ ...s, settings: { ...s.settings, reduceMotion }, mapEvent: { ...ev, at: Date.now() } });
    render(<MapPanel onSelect={() => {}} />);
    return screen.getByTestId('map-event');
  };

  it('the birds and the truck face the way they travel', () => {
    const flockRight = show({ id: 'map_flock', at: 0, cells: [], pos: { y: 0.5, dir: 1, slope: 0 } });
    expect(flockRight.style.transform).toBe('');
    expect(flockRight.style.getPropertyValue('--to')).toBe('105%');
    cleanup();
    const flockLeft = show({ id: 'map_flock', at: 0, cells: [], pos: { y: 0.5, dir: -1, slope: 0 } });
    expect(flockLeft.style.transform).toBe('scaleX(-1)');
    expect(flockLeft.style.getPropertyValue('--to')).toBe('-10%');
    cleanup();
    const s = site([]);
    const base = roll(s, 'map_delivery', 1);
    const xs = base.cells.map((c) => c % MAP_COLUMNS);
    const fromLeft = show({ ...base, pos: { dir: 1 } });
    expect(fromLeft.style.transform).toBe('');
    expect(Number(fromLeft.dataset.stop)).toBeLessThan(Math.min(...xs));
    cleanup();
    const fromRight = show({ ...base, pos: { dir: -1 } });
    expect(fromRight.style.transform).toBe('scaleX(-1)');
    expect(Number(fromRight.dataset.stop)).toBeGreaterThan(Math.max(...xs));
  });

  it('draws at the rolled place, which stays put while the event plays, and is still under reduce motion', () => {
    const high = show({ id: 'map_flock', at: 0, cells: [], pos: { y: 0, dir: 1, slope: 0 } }, true);
    const low = parseFloat(high.style.top);
    cleanup();
    const el = show({ id: 'map_flock', at: 0, cells: [], pos: { y: 0.9, dir: 1, slope: 0 } }, true);
    expect(parseFloat(el.style.top)).toBeGreaterThan(low + 20);
    expect(el.className).not.toContain('map-flock');
    const stored = useStore.getState().mapEvent;
    useStore.setState({ energy: useStore.getState().energy + 1 });
    expect(useStore.getState().mapEvent?.pos).toEqual(stored?.pos);
  });

  it('events from before 1.67 (no position) still draw in the old places', () => {
    const flock = show({ id: 'map_flock', at: 0, cells: [] });
    expect(flock.style.transform).toBe('');
    expect(flock.dataset.dir).toBe('1');
    cleanup();
    const star = show({ id: 'map_star', at: 0, cells: [MAP_COLUMNS] });
    expect(star.dataset.sprite).toBe('map_star');
    cleanup();
    const s = site([]);
    const { pos: _pos, ...old } = roll(s, 'map_delivery', 1);
    const truck = show(old);
    expect(truck.dataset.dir).toBe('1');
  });
});
