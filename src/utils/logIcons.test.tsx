import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import EventLog, { LOG_ICONS, logIcon } from '../components/EventLog';
import { createInitialState } from '../data/initialState';
import { EVENTS, EVENTS_BY_ID } from '../data/events';
import { ENTRY_ICONS, eventIcon } from '../data/logIcons';
import { useStore } from '../store';
import { contractLogEntries } from '../store/slices/contractSlice';
import { petLogEntries } from '../store/slices/petSlice';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { deriveEvents, type LogInput } from './eventLog';
import { energyForLevel } from './playerLevel';

afterEach(cleanup);

const base = (): GameState => createInitialState(0);
const iconOf = (entries: LogInput[], start: string) => entries.find((e) => e.text.startsWith(start))?.icon;

describe('a distinct emoji for every kind of log entry (1.40)', () => {
  it('no two kinds of entry share an emoji, events included', () => {
    const own = EVENTS.flatMap((e) => (e.icon ? [e.icon] : []));
    const all = [...Object.values(ENTRY_ICONS), ...own];
    expect(new Set(all).size).toBe(all.length);
  });

  it('research, unlocks and levels each write their own icon', () => {
    const prev = { ...base(), completedResearch: ['fossil_fuels'], lifetimeEnergy: 0 };
    const next = { ...prev, completedResearch: ['fossil_fuels', 'gas_extraction'], lifetimeEnergy: energyForLevel(3), researchLevel: prev.researchLevel + 1 };
    const out = deriveEvents(prev, next);
    expect(iconOf(out, 'Research complete')).toBe(ENTRY_ICONS.researchComplete);
    expect(iconOf(out, 'New producer')).toBe(ENTRY_ICONS.producerUnlocked);
    expect(iconOf(out, 'Player level')).toBe(ENTRY_ICONS.playerLevel);
    expect(iconOf(out, 'Research level')).toBe(ENTRY_ICONS.researchLevel);
    const wind = deriveEvents({ ...base(), completedResearch: ['basic_solar'] }, { ...base(), completedResearch: ['basic_solar', 'wind_power'] });
    expect(iconOf(wind, 'New generator')).toBe(ENTRY_ICONS.generatorUnlocked);
    expect(iconOf(wind, 'New research')).toBe(ENTRY_ICONS.researchAvailable);
  });

  it('fuel and room warnings keep their icons', () => {
    const coal = (on: boolean, outOfFuel = false) => ({ id: 'a', type: GeneratorType.COAL, isActive: on, level: 1, outOfFuel });
    const fuel = deriveEvents({ ...base(), activeGenerators: [coal(true)] }, { ...base(), activeGenerators: [coal(false, true)] });
    expect(fuel[0].icon).toBe(ENTRY_ICONS.fuel);
    const room = deriveEvents({ ...base(), roomCapacity: 20, roomUsed: 0 }, { ...base(), roomCapacity: 20, roomUsed: 20 });
    expect(room[0].icon).toBe(ENTRY_ICONS.room);
  });

  it('random events: weather by what it touches, good and bad effects, sightings and map events', () => {
    expect(eventIcon(EVENTS_BY_ID.sunny_spell)).toBe('☀️');
    expect(eventIcon(EVENTS_BY_ID.overcast)).toBe('☁️');
    expect(eventIcon(EVENTS_BY_ID.strong_winds)).toBe('🌬️');
    expect(eventIcon(EVENTS_BY_ID.calm_air)).toBe('🍃');
    expect(eventIcon(EVENTS_BY_ID.grant)).toBe(ENTRY_ICONS.eventGood);
    expect(eventIcon(EVENTS_BY_ID.grid_fault)).toBe(ENTRY_ICONS.eventBad);
    expect(eventIcon(EVENTS_BY_ID.ufo)).toBe(ENTRY_ICONS.sighting);
    expect(eventIcon(EVENTS_BY_ID.map_flock)).toBe(ENTRY_ICONS.mapEvent);
    expect(eventIcon(EVENTS_BY_ID.map_lightning)).toBe('⚡');
    expect(eventIcon(EVENTS_BY_ID.map_fire)).not.toBe(ENTRY_ICONS.fuel);
  });

  it('the store logs a rolled event with its icon', () => {
    useStore.getState().resetGame();
    const [id] = useStore.getState().rollRandomEvents(60, { foreground: true }, () => 0, 1000);
    expect(useStore.getState().eventLog[0].icon).toBe(eventIcon(EVENTS_BY_ID[id]));
  });

  it('contracts: offers, completions and expiries', () => {
    const out = contractLogEntries({ completed: [1], expired: [1], offered: [1, 2] });
    expect(out.map((e) => e.icon)).toEqual([ENTRY_ICONS.contractComplete, ENTRY_ICONS.contractExpired, ENTRY_ICONS.contractOffer]);
  });

  it('pets: found and grown up', () => {
    const out = petLogEntries(['hamster'], ['eel'], { eel: { stage: 2 } as never });
    expect(out.map((e) => e.icon)).toEqual([ENTRY_ICONS.petFound, ENTRY_ICONS.petGrown]);
  });

  it('an old saved entry with no icon still shows its kind', () => {
    expect(logIcon({ kind: 'event' })).toBe(LOG_ICONS.event);
    useStore.setState({ eventLog: [{ id: 'old', at: 0, kind: 'level', text: 'Player level 2 reached', toast: false }] });
    render(<EventLog />);
    fireEvent.click(screen.getByRole('button', { name: /Event log/ }));
    expect(screen.getByText('Player level 2 reached').parentElement!.textContent).toContain(LOG_ICONS.level);
  });
});
