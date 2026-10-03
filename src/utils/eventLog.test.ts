import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { EVENT_LOG_CAP, TOAST_CAP } from '../data/notifications';
import { useStore } from '../store';
import { GeneratorType, type Generator } from '../types/generator';
import type { GameState } from '../types/state';
import { appendLog, appendToasts, deriveEvents, stamp } from './eventLog';
import { energyForLevel } from './playerLevel';

const base = (): GameState => createInitialState(0);
const coal = (id: string, on: boolean, outOfFuel = false): Generator => ({ id, type: GeneratorType.COAL, isActive: on, level: 1, outOfFuel });

describe('event log (0.38)', () => {
  it('logs completed research, its unlocks and newly available research', () => {
    const prev = { ...base(), completedResearch: ['basic_solar'] };
    const next = { ...prev, completedResearch: ['basic_solar', 'wind_power'] };
    const texts = deriveEvents(prev, next).map((e) => e.text);
    expect(texts[0]).toBe('Research complete: Wind Power Fundamentals');
    expect(texts).toContain('New generator available: Wind Turbine');
    expect(texts.find((t) => t.startsWith('New research available'))).toContain('Hydropower');
  });

  it('logs granted producers', () => {
    const prev = { ...base(), completedResearch: ['fossil_fuels'] };
    const next = { ...prev, completedResearch: ['fossil_fuels', 'gas_extraction'] };
    expect(deriveEvents(prev, next).map((e) => e.text)).toContain('New producer: Gas Well');
  });

  it('logs generators switched off for lack of fuel once, grouped by fuel', () => {
    const prev = { ...base(), activeGenerators: [coal('a', true), coal('b', true)] };
    const next = { ...prev, activeGenerators: [coal('a', false, true), coal('b', false, true)] };
    const out = deriveEvents(prev, next);
    expect(out).toEqual([{ kind: 'fuel', text: 'Out of coal: 2 generators switched off', toast: true }]);
    expect(deriveEvents(next, next)).toEqual([]); // already off: not logged again
  });

  it('warns when room crosses into nearly full, not on every change', () => {
    const prev = { ...base(), roomCapacity: 20, roomUsed: 15 };
    expect(deriveEvents(prev, { ...prev, roomUsed: 18 })[0]).toMatchObject({ kind: 'room', text: 'Room nearly full: 2 free' });
    expect(deriveEvents({ ...prev, roomUsed: 18 }, { ...prev, roomUsed: 19 })).toEqual([]);
    expect(deriveEvents(prev, { ...prev, roomUsed: 20 })[0].text).toBe('Room is full: expand it to build more');
  });

  it('keeps the log capped, newest first, and caps the toasts', () => {
    const many = stamp(
      Array.from({ length: EVENT_LOG_CAP + 20 }, (_, i) => ({ kind: 'event' as const, text: `e${i}`, toast: true })),
      0,
    );
    const log = appendLog([], many);
    expect(log).toHaveLength(EVENT_LOG_CAP);
    expect(log[0].text).toBe(`e${EVENT_LOG_CAP + 19}`);
    const toasts = appendToasts([], many);
    expect(toasts).toHaveLength(TOAST_CAP);
    expect(toasts.at(-1)!.text).toBe(`e${EVENT_LOG_CAP + 19}`);
  });

  it('the store logs events from state changes, but not from a reset or a loaded save', () => {
    useStore.getState().resetGame();
    useStore.setState({ completedResearch: ['basic_solar'] });
    expect(useStore.getState().eventLog.map((e) => e.text)).toContain('Research complete: Basic Solar');
    useStore.getState().loadSave({ ...base(), completedResearch: ['basic_solar', 'wind_power', 'fossil_fuels'] });
    expect(useStore.getState().eventLog.map((e) => e.text)).not.toContain('Research complete: Fossil Fuels 101');
    useStore.getState().resetGame();
    expect(useStore.getState().eventLog).toEqual([]);
  });
});

describe('level ups in the event log (playtest 19.3)', () => {
  it('logs a new player level and a new research level', () => {
    const prev = createInitialState(0);
    const next = { ...prev, lifetimeEnergy: energyForLevel(3), researchLevel: prev.researchLevel + 1 };
    const texts = deriveEvents(prev, next).map((e) => e.text);
    expect(texts).toContain('Player level 3 reached: +0.2% energy from all generators');
    expect(texts).toContain(`Research level ${prev.researchLevel + 1} reached`);
    expect(deriveEvents(next, next)).toEqual([]);
  });
});
