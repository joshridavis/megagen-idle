import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { EVENTS, EVENTS_BY_ID } from '../data/events';
import { createInitialState } from '../data/initialState';
import { GeneratorType, type Generator } from '../types/generator';
import { useStore } from '../store';
import { getEffectMods } from './effectMods';
import { applyMapEvent, pickMapTarget } from './mapEvents';
import { layoutSite } from './siteMap';
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
    expect(getEffectMods(after.activeEffects).generator.coal).toBe(0.5);
    expect(after.energyPerSecond).toBeCloseTo(s.energyPerSecond * 1.5);
  });

  it('another strike adds time to the same type, and a strike on another type boosts it separately (playtest 19.3)', () => {
    const s = site([gen('gen-1', GeneratorType.COAL), gen('gen-2', GeneratorType.WIND)]);
    const strike = (st: typeof s, key: string, now: number) => {
      const p = layoutSiteFor(st).find((x) => x.key === key)!;
      return applyMapEvent(st, { id: 'map_lightning', at: now, cells: p.cells, key, generatorType: p.type as GeneratorType }, now, first);
    };
    const one = strike(s, 'gen-1', 1000);
    expect(one.text).toBe('Lightning struck a Coal Plant: +50% from your Coal Plants for 3 minutes.');
    // a minute later, the same type again: 2 minutes were left, now 5
    const two = strike(one.state, 'gen-1', 61_000);
    expect(two.state.activeEffects).toEqual([{ id: 'map_lightning', until: 1000 + 6 * 60_000, generator: GeneratorType.COAL }]);
    expect(two.text).toContain('runs 3 minutes longer');
    // another type keeps the first boost and gets its own
    const three = strike(two.state, 'gen-2', 61_000);
    expect(three.state.activeEffects).toHaveLength(2);
    const mods = getEffectMods(three.state.activeEffects, 61_000);
    expect(mods.generator.coal).toBe(0.5);
    expect(mods.generator.wind).toBe(0.5);
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
