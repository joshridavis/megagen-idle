import {
  EFFECT_RATE_FACTOR,
  EVENTS,
  MAP_RATE_PER_HOUR,
  MAX_EVENTS_PER_CATCH_UP,
  MAX_EVENTS_PER_TICK,
  NEGATIVE_RATE_FACTOR,
  RARITY_PER_HOUR,
  type EventDef,
} from '../data/events';
import { meetsRequirement } from './eventEffects';
import type { GameState } from '../types/state';
import type { Rng } from './rng';

export interface RollOptions {
  /** The game screen is visible (foreground events may roll). */
  foreground: boolean;
  /** Returning from time away: only 'anytime' events, with a larger cap. */
  catchUp?: boolean;
  /** Rolling map events (1.12): only 'map' events, and only these. */
  map?: boolean;
}

type EventState = Pick<GameState, 'activeGenerators' | 'currentResearch' | 'resources' | 'producers'> & Partial<Pick<GameState, 'pets'>>;

/** Events that may happen now. */
export function eligibleEvents(state: EventState, opts: RollOptions, events: EventDef[] = EVENTS): EventDef[] {
  const built = new Set(state.activeGenerators.map((g) => g.type));
  return events.filter(
    (e) =>
      e.when !== 'never' &&
      (opts.map ? e.when === 'map' : e.when !== 'map') &&
      (e.when === 'anytime' || (opts.foreground && !opts.catchUp)) &&
      (e.requiresBuilt ?? []).every((t) => built.has(t)) &&
      meetsRequirement(e, state),
  );
}

/** Average times per hour an event happens (0.85: effect events rarer, negative ones a little rarer still). */
export function eventRatePerHour(e: EventDef): number {
  const effectFactor = e.effect && e.effect.kind !== 'find-pet' ? EFFECT_RATE_FACTOR : 1;
  if (e.when === 'map') return MAP_RATE_PER_HOUR[e.rarity] * (e.negative ? NEGATIVE_RATE_FACTOR : 1);
  return RARITY_PER_HOUR[e.rarity] * effectFactor * (e.negative ? NEGATIVE_RATE_FACTOR : 1);
}

/** Chance that an event with this hourly rate happens at least once in `seconds`. */
export const chanceIn = (perHour: number, seconds: number) => 1 - Math.exp((-perHour * Math.max(0, seconds)) / 3600);

/**
 * Rolls each eligible event for a stretch of time (timestamp-based: the
 * caller passes real elapsed seconds). Pure: the random source is passed in.
 */
export function rollEvents(state: EventState, seconds: number, rng: Rng, opts: RollOptions, events: EventDef[] = EVENTS): EventDef[] {
  if (seconds <= 0) return [];
  const cap = opts.catchUp ? MAX_EVENTS_PER_CATCH_UP : MAX_EVENTS_PER_TICK;
  const hits: EventDef[] = [];
  for (const e of eligibleEvents(state, opts, events)) {
    if (rng() < chanceIn(eventRatePerHour(e), seconds)) hits.push(e);
  }
  return hits.slice(0, cap);
}

/** Records an event as seen (count and first time). */
export function recordSeen(seen: GameState['seenEvents'], id: string, now: number): GameState['seenEvents'] {
  const prev = seen[id];
  return { ...seen, [id]: { count: (prev?.count ?? 0) + 1, firstSeen: prev?.firstSeen ?? now } };
}
