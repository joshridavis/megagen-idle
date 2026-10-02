import { describe, expect, it, vi } from 'vitest';
import { EVENTS, EVENTS_BY_ID, MAX_LOSS_FRACTION, RARITY_PER_HOUR } from '../data/events';
import { createInitialState } from '../data/initialState';
import { migrateSave } from '../store/migrations';
import { useStore } from '../store';
import { GeneratorType, type Generator } from '../types/generator';
import type { GameState } from '../types/state';
import { getEnergyBreakdown, getResourceBreakdown } from './breakdown';
import { expireEffects, getEffectMods } from './effectMods';
import { applyEventEffect } from './eventEffects';
import { eligibleEvents, eventRatePerHour } from './randomEvents';
import { advanceTime, deriveRates } from './simulation';

// fixed rates: no player level bonus in these checks
vi.mock('../data/playerLevel', async (orig) => ({ ...(await orig<object>()), ENERGY_BONUS_PER_LEVEL: 0 }));

const gen = (n: number, type: GeneratorType, isActive = true): Generator => ({ id: `gen-${n}`, type, isActive, level: 1 });
const base = (over: Partial<GameState> = {}): GameState =>
  deriveRates({ ...createInitialState(0), activeGenerators: [gen(1, GeneratorType.SOLAR), gen(2, GeneratorType.WIND)], ...over });
const apply = (s: GameState, id: string, now = 0) => applyEventEffect(s, EVENTS_BY_ID[id], now, () => 0);

describe('effect events (0.85)', () => {
  it('has at least 12, with positive and negative ones; negatives slightly rarer', () => {
    const effects = EVENTS.filter((e) => e.effect);
    expect(effects.length).toBeGreaterThanOrEqual(12);
    expect(effects.some((e) => e.negative)).toBe(true);
    expect(effects.some((e) => !e.negative)).toBe(true);
    const sunny = eventRatePerHour(EVENTS_BY_ID.sunny_spell);
    const overcast = eventRatePerHour(EVENTS_BY_ID.overcast);
    expect(overcast).toBeLessThan(sunny);
    expect(overcast).toBeGreaterThan(sunny * 0.5);
    expect(sunny).toBeLessThan(RARITY_PER_HOUR.common); // effects rarer than sightings
  });

  it('a timed effect changes energy until it ends, then stops (also across offline time)', () => {
    let s = base();
    const before = s.energyPerSecond; // 0.5 + 0.8
    s = deriveRates(apply(s, 'sunny_spell').state);
    expect(s.energyPerSecond).toBeCloseTo(before + 0.25);
    expect(getEnergyBreakdown(s).total).toBeCloseTo(s.energyPerSecond);
    expect(getEnergyBreakdown(s).modifiers.at(-1)!.source).toBe('Sunny spell (event)');
    // two hours offline: 10 minutes boosted, the rest normal
    const { state } = advanceTime({ ...s, lastSavedTimestamp: 0 }, 7200, 7_200_000);
    expect(state.activeEffects).toEqual([]);
    expect(state.energyPerSecond).toBeCloseTo(before);
    expect(state.energy - s.energy).toBeCloseTo(before * 7200 + 0.25 * 600, 0);
  });

  it('the same effect refreshes instead of stacking, and expired ones are dropped', () => {
    let s = apply(base(), 'overcast', 0).state;
    s = apply(s, 'overcast', 60_000).state;
    expect(s.activeEffects).toEqual([{ id: 'overcast', until: 60_000 + 600_000 }]);
    expect(getEffectMods(s.activeEffects).generator.solar).toBeCloseTo(-0.3);
    expect(expireEffects(s.activeEffects, 660_000)).toEqual([]);
  });

  it('production effects change resource output and show in the breakdown', () => {
    const s = apply(base(), 'volunteer_crew').state;
    const b = getResourceBreakdown(s, 'stone');
    expect(b.modifiers.find((m) => m.source === 'Volunteer crew (event)')!.percent).toBe(0.5);
    const coal = apply(base(), 'coal_shortage').state;
    expect(getResourceBreakdown(coal, 'stone').modifiers.some((m) => m.source.includes('Coal shortage'))).toBe(false);
    expect(getResourceBreakdown(coal, 'coal').modifiers.some((m) => m.source.includes('Coal shortage'))).toBe(true);
  });

  it('grants energy or resources and boosts research', () => {
    const s = { ...base(), energyPerSecond: 10 };
    const granted = apply(s, 'grant').state;
    expect(granted.energy - s.energy).toBe(6000); // 10 minutes of 10/s
    expect(granted.lifetimeEnergy - s.lifetimeEnergy).toBe(6000);
    expect(apply(s, 'rich_seam').state.resources.metal).toBeGreaterThanOrEqual(s.resources.metal + 30);
    const researching = { ...s, currentResearch: { id: 'basic_solar', startTime: 1000, duration: 600 } };
    expect(apply(researching, 'eureka').state.currentResearch!.startTime).toBe(1000 - 60_000);
  });

  it('negative events are mild: capped losses, nothing permanent, never below 0', () => {
    const s = base({ resources: { ...createInitialState(0).resources, naturalGas: 100, oil: 5 } });
    const leak = apply(s, 'pipe_leak').state;
    expect(leak.resources.naturalGas).toBe(100 - 100 * MAX_LOSS_FRACTION);
    expect(leak.resources.oil).toBeGreaterThanOrEqual(5 * (1 - MAX_LOSS_FRACTION));
    const fault = apply(s, 'grid_fault').state;
    expect(fault.activeGenerators.filter((g) => !g.isActive)).toHaveLength(1);
    expect(fault.activeGenerators).toHaveLength(2); // nothing removed
    expect(apply(s, 'equipment_wear').state.activeEffects).toHaveLength(1);
  });

  it('events only roll when relevant', () => {
    const ids = (s: GameState) => eligibleEvents(s, { foreground: false }).map((e) => e.id);
    const noWind = base({ activeGenerators: [gen(1, GeneratorType.SOLAR)] });
    expect(ids(noWind)).not.toContain('calm_air');
    expect(ids(noWind)).not.toContain('grid_fault'); // needs two running
    expect(ids(noWind)).not.toContain('eureka'); // needs a running research
    expect(ids(noWind)).not.toContain('pipe_leak'); // no gas or oil
    expect(ids(base())).toContain('calm_air');
  });

  it('the store applies effects, logs them with a notice, and saves them', () => {
    useStore.getState().resetGame();
    useStore.setState(base());
    const always = () => 0;
    const hits = useStore.getState().rollRandomEvents(60, { foreground: false }, always, 1000);
    expect(hits).toHaveLength(1);
    const def = EVENTS_BY_ID[hits[0]];
    expect(def.effect).toBeDefined();
    expect(useStore.getState().toasts.at(-1)!.text.startsWith(def.name)).toBe(true);
    const v11 = { ...createInitialState(0) } as Record<string, unknown>;
    delete v11.activeEffects;
    expect(migrateSave(v11, 11).activeEffects).toEqual([]);
  });
});
