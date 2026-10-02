import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { EVENTS, RARITY_PER_HOUR, type EventDef } from '../data/events';
import { migrateSave } from '../store/migrations';
import { useStore } from '../store';
import { GeneratorType } from '../types/generator';
import { chanceIn, eligibleEvents, recordSeen, rollEvents } from './randomEvents';
import { seededRng } from './rng';

const s = createInitialState(0);
const fg = { foreground: true };

describe('random events (0.84)', () => {
  it('has a large variety: at least 10 sightings in every rarity tier', () => {
    const sightings = EVENTS.filter((e) => e.animation);
    expect(sightings.length).toBeGreaterThanOrEqual(10);
    expect(new Set(sightings.map((e) => e.rarity))).toEqual(new Set(['common', 'uncommon', 'rare', 'legendary']));
    expect(RARITY_PER_HOUR.legendary * 50).toBeLessThan(RARITY_PER_HOUR.common); // much rarer
  });

  it('rolls are deterministic with a seed', () => {
    const run = () => {
      const rng = seededRng(42);
      return Array.from({ length: 500 }, () => rollEvents(s, 60, rng, fg).map((e) => e.id)).flat();
    };
    expect(run()).toEqual(run());
  });

  it('frequencies match the rarity table over many simulated hours', () => {
    const tiers: EventDef[] = [
      { id: 'c', name: 'c', text: '', rarity: 'common', when: 'anytime' },
      { id: 'r', name: 'r', text: '', rarity: 'rare', when: 'anytime' },
    ];
    const rng = seededRng(7);
    const hours = 20000;
    const counts = { c: 0, r: 0 };
    // one-minute ticks; with one event per tick at most, keep the two counted separately
    for (let i = 0; i < hours * 60; i++) {
      for (const t of tiers) for (const e of rollEvents(s, 60, rng, fg, [t])) counts[e.id as 'c' | 'r']++;
    }
    expect(counts.c / hours).toBeCloseTo(RARITY_PER_HOUR.common, 1);
    expect(counts.r / hours).toBeGreaterThan(RARITY_PER_HOUR.rare * 0.8);
    expect(counts.r / hours).toBeLessThan(RARITY_PER_HOUR.rare * 1.2);
  });

  it('foreground events never roll while away or hidden', () => {
    const always = () => 0; // every roll succeeds
    expect(rollEvents(s, 3600, always, { foreground: false })).toEqual([]);
    expect(rollEvents(s, 3600, always, { foreground: true, catchUp: true })).toEqual([]);
    expect(rollEvents(s, 3600, always, fg)).toHaveLength(1); // capped per tick
  });

  it('events that need a building only roll once it is built', () => {
    expect(eligibleEvents(s, fg).map((e) => e.id)).not.toContain('whale');
    const withTidal = { ...s, activeGenerators: [{ id: 'g', type: GeneratorType.TIDAL, isActive: true, level: 1 }] };
    expect(eligibleEvents(withTidal, fg).map((e) => e.id)).toContain('whale');
  });

  it('chance grows with time and is 0 for no time', () => {
    expect(chanceIn(1, 0)).toBe(0);
    expect(chanceIn(1, 3600)).toBeCloseTo(1 - Math.exp(-1));
  });

  it('records seen events, saved and migrated', () => {
    const a = recordSeen({}, 'ufo', 5);
    expect(recordSeen(a, 'ufo', 9)).toEqual({ ufo: { count: 2, firstSeen: 5 } });
    const v8 = { ...createInitialState(0) } as Record<string, unknown>;
    delete v8.seenEvents;
    expect(migrateSave(v8, 8).seenEvents).toEqual({});
  });

  it('the store shows one sighting at a time and logs it', () => {
    useStore.getState().resetGame();
    const ids = useStore.getState().rollRandomEvents(60, fg, () => 0, 1000);
    expect(ids).toHaveLength(1);
    expect(useStore.getState().activeSighting).toEqual({ id: ids[0], at: 1000 });
    expect(useStore.getState().seenEvents[ids[0]].count).toBe(1);
    expect(useStore.getState().eventLog[0].kind).toBe('event');
    // while one is on screen, no new sighting starts
    expect(useStore.getState().rollRandomEvents(60, fg, () => 0, 2000)).toEqual([]);
  });
});

describe('sightings are hard to miss (0.91, playtest 11)', () => {
  it('every sighting lasts at least the minimum', async () => {
    const { MIN_SIGHTING_MS } = await import('../data/events');
    for (const e of EVENTS.filter((x) => x.animation)) expect(e.durationMs ?? 0, e.id).toBeGreaterThanOrEqual(MIN_SIGHTING_MS);
  });

  it('ending a sighting leaves a "You spotted" notice', () => {
    useStore.getState().resetGame();
    useStore.setState({ activeSighting: { id: 'aurora', at: 0 }, toasts: [] });
    useStore.getState().dismissSighting();
    expect(useStore.getState().activeSighting).toBeNull();
    expect(useStore.getState().toasts.at(-1)!.text).toBe('You spotted: Aurora!');
  });
});
