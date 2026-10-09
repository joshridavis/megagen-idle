import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Sightings from '../components/Sightings';
import { sprites } from '../assets';
import { EVENTS, EVENTS_BY_ID, RARITY_PER_HOUR } from '../data/events';
import { createInitialState } from '../data/initialState';
import { eventIcon, ENTRY_ICONS } from '../data/logIcons';
import { useStore } from '../store';
import { GeneratorType, type Generator } from '../types/generator';
import type { GameState } from '../types/state';
import { getEffectMods } from './effectMods';
import { baseOutput } from './energyGeneration';
import { applyEventEffect, describeEffect } from './eventEffects';
import { applyMapEvent, pickMapTarget } from './mapEvents';
import { eligibleEvents, eventRatePerHour } from './randomEvents';
import { deriveRates } from './simulation';

// fixed rates: no player level bonus in these checks
vi.mock('../data/playerLevel', async (orig) => ({ ...(await orig<object>()), ENERGY_BONUS_PER_LEVEL: 0 }));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const gen = (n: number, type: GeneratorType): Generator => ({ id: `gen-${n}`, type, isActive: true, level: 1 });
const ALL = [GeneratorType.SOLAR, GeneratorType.WIND, GeneratorType.HYDRO, GeneratorType.TIDAL, GeneratorType.GAS, GeneratorType.NUCLEAR];
const base = (over: Partial<GameState> = {}): GameState =>
  deriveRates({ ...createInitialState(0), activeGenerators: ALL.map((t, i) => gen(i + 1, t)), roomCapacity: 80, ...over });
const apply = (s: GameState, id: string, now = 0) => deriveRates(applyEventEffect(s, EVENTS_BY_ID[id], now, () => 0).state);

const SIGHTINGS = ['drone', 'hot_air_balloon', 'comet'];
const EFFECTS = ['heat_wave', 'grid_surge', 'spring_tide', 'warm_cooling_water', 'drought', 'equipment_recall'];
const MAP = ['map_maintenance', 'map_gas_flare'];

describe('more random events (1.55)', () => {
  it('adds about 10 events: sightings, good and bad effects, and map events', () => {
    const added = [...SIGHTINGS, ...EFFECTS, ...MAP];
    expect(added.length).toBeGreaterThanOrEqual(10);
    for (const id of added) expect(EVENTS_BY_ID[id], id).toBeDefined();
    expect(EVENTS.length).toBe(new Set(EVENTS.map((e) => e.id)).size);
    for (const id of SIGHTINGS) expect(EVENTS_BY_ID[id].animation).toBeDefined();
    expect(EFFECTS.filter((id) => EVENTS_BY_ID[id].negative).length).toBe(3);
    for (const id of MAP) expect(EVENTS_BY_ID[id].when).toBe('map');
  });

  it('the same rarity rules: effects rarer than sightings, bad ones a little rarer than good ones', () => {
    expect(eventRatePerHour(EVENTS_BY_ID.drone)).toBe(RARITY_PER_HOUR.common);
    expect(eventRatePerHour(EVENTS_BY_ID.drought)).toBeLessThan(eventRatePerHour(EVENTS_BY_ID.spring_tide));
    expect(eventRatePerHour(EVENTS_BY_ID.spring_tide)).toBeLessThan(RARITY_PER_HOUR.uncommon);
  });

  it('each has a log emoji: its own, never shared, or its kind of event', () => {
    for (const id of [...EFFECTS, ...MAP]) expect(EVENTS_BY_ID[id].icon, id).toBeDefined();
    for (const id of SIGHTINGS) expect(eventIcon(EVENTS_BY_ID[id])).toBe(ENTRY_ICONS.sighting);
  });

  it('a heat wave, a spring tide and a grid surge raise energy by their share', () => {
    const s = base();
    const typeOut = (t: GeneratorType) => s.activeGenerators.filter((g) => g.type === t).reduce((n, g) => n + baseOutput(g), 0);
    expect(apply(s, 'heat_wave').energyPerSecond).toBeCloseTo(s.energyPerSecond + typeOut(GeneratorType.SOLAR) * 0.3);
    expect(apply(s, 'spring_tide').energyPerSecond).toBeCloseTo(s.energyPerSecond + typeOut(GeneratorType.TIDAL) * 0.4);
    expect(apply(s, 'grid_surge').energyPerSecond).toBeGreaterThan(s.energyPerSecond * 1.15);
    expect(apply(s, 'grid_surge').activeEffects).toEqual([{ id: 'grid_surge', until: 5 * 60_000 }]);
  });

  it('warm cooling water and a drought lower fission and hydro, and only those', () => {
    const s = base();
    const typeOut = (t: GeneratorType) => s.activeGenerators.filter((g) => g.type === t).reduce((n, g) => n + baseOutput(g), 0);
    expect(apply(s, 'warm_cooling_water').energyPerSecond).toBeCloseTo(s.energyPerSecond - typeOut(GeneratorType.NUCLEAR) * 0.2);
    expect(apply(s, 'drought').energyPerSecond).toBeCloseTo(s.energyPerSecond - typeOut(GeneratorType.HYDRO) * 0.25);
    expect(getEffectMods(apply(s, 'drought').activeEffects).generator).toEqual({ [GeneratorType.HYDRO]: -0.25 });
  });

  it('an equipment recall lowers producer output for 10 minutes, then it ends', () => {
    const s = base({ producers: { ...createInitialState(0).producers, quarry: 2 } });
    const after = apply(s, 'equipment_recall');
    expect(getEffectMods(after.activeEffects, 1).allProduction).toBeCloseTo(-0.15);
    expect(getEffectMods(after.activeEffects, 10 * 60_000).allProduction).toBe(0);
  });

  it('effects need what they act on: no drought without a dam, no tide without a tidal station', () => {
    const solarOnly = deriveRates({ ...createInitialState(0), activeGenerators: [gen(1, GeneratorType.SOLAR)] });
    const ids = eligibleEvents(solarOnly, { foreground: true }).map((e) => e.id);
    expect(ids).toContain('heat_wave');
    for (const id of ['drought', 'spring_tide', 'warm_cooling_water']) expect(ids).not.toContain(id);
  });

  it('the hover text states the exact effect', () => {
    const s = base();
    const fmt = (n: number) => n.toFixed(2);
    expect(describeEffect(EVENTS_BY_ID.heat_wave, s, fmt)).toMatch(/^\+30% energy from Solar Panels: \+[\d.]+ energy\/s from your 1 running$/);
    expect(describeEffect(EVENTS_BY_ID.drought, s, fmt)).toMatch(/^−25% energy from /);
    expect(describeEffect(EVENTS_BY_ID.equipment_recall, s, fmt)).toMatch(/^−15% output from all producers/);
  });

  it('a gas flare breaks out at a gas plant and pays when put out in time', () => {
    const s = base();
    const ev = pickMapTarget(s, EVENTS_BY_ID.map_gas_flare, () => 0, 1000)!;
    expect(ev.generatorType).toBe(GeneratorType.GAS);
    expect(ev.claimUntil).toBe(1000 + 30_000);
    const after = applyMapEvent(s, ev, 2000, () => 0).state;
    expect(after.energy).toBeGreaterThan(s.energy);
    // no gas plant, no flare
    const noGas = deriveRates({ ...createInitialState(0), activeGenerators: [gen(1, GeneratorType.SOLAR)] });
    expect(eligibleEvents(noGas, { foreground: true, map: true }).map((e) => e.id)).not.toContain('map_gas_flare');
  });

  it('a maintenance crew drives to a producer and boosts all producers for 5 minutes', () => {
    const s = base();
    const ev = pickMapTarget(s, EVENTS_BY_ID.map_maintenance, () => 0.5, 0)!;
    expect(ev.producer).toBeDefined();
    const after = applyMapEvent(s, ev, 0, () => 0).state;
    expect(after.activeEffects).toEqual([{ id: 'map_maintenance', until: 5 * 60_000 }]);
    expect(getEffectMods(after.activeEffects, 1).allProduction).toBeCloseTo(0.15);
  });

  it('each new sighting plays with its own sprite', async () => {
    vi.useFakeTimers();
    for (const id of SIGHTINGS) {
      useStore.getState().resetGame();
      render(<Sightings />);
      await act(async () => {
        useStore.setState({ activeSighting: { id, at: Date.now() } });
      });
      const el = screen.getByTestId(`sighting-${id}`);
      expect(el.querySelector('img')!.getAttribute('src')).toBe(sprites[`sighting_${id}` as keyof typeof sprites]);
      cleanup();
    }
  });
});
