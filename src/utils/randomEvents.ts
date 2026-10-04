import {
  EFFECT_RATE_FACTOR,
  EVENTS,
  EVENTS_BY_ID,
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
  /** The time of the roll (ms), to tell which timed effects are still running. */
  now?: number;
}

type EventState = Pick<GameState, 'activeGenerators' | 'currentResearch' | 'resources' | 'producers'> &
  Partial<Pick<GameState, 'pets' | 'activeEffects'>>;

/** What a timed effect acts on: one generator type, one resource, or everything. */
function timedTarget(e: EventDef, generator?: string): string | null {
  const fx = e.effect;
  if (fx?.kind !== 'timed') return null;
  if (fx.energy) return `energy:${generator ?? fx.generator ?? 'all'}`;
  return `production:${fx.resource ?? 'all'}`;
}

/**
 * Whether a timed event would clash with a timed effect still running on the
 * same target (no overcast during a sunny spell; item 1.37).
 */
function clashesWithActive(e: EventDef, state: EventState, now: number): boolean {
  const target = timedTarget(e);
  if (!target) return false;
  return (state.activeEffects ?? []).some((a) => {
    if (a.until <= now || a.id === e.id) return false;
    const def = EVENTS_BY_ID[a.id];
    return !!def && timedTarget(def, a.generator) === target;
  });
}

/** Events that may happen now. */
export function eligibleEvents(state: EventState, opts: RollOptions, events: EventDef[] = EVENTS): EventDef[] {
  const built = new Set(state.activeGenerators.map((g) => g.type));
  return events.filter(
    (e) =>
      e.when !== 'never' &&
      (opts.map ? e.when === 'map' : e.when !== 'map') &&
      (e.when === 'anytime' || (opts.foreground && !opts.catchUp)) &&
      (e.requiresBuilt ?? []).every((t) => built.has(t)) &&
      meetsRequirement(e, state) &&
      // a timed effect that rolled during time away would have ended long ago (item 1.37)
      !(opts.catchUp && e.effect?.kind === 'timed') &&
      !clashesWithActive(e, state, opts.now ?? Date.now()),
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
    // a long stretch (a resumed app) would start a timed effect that had already run out
    if (e.effect?.kind === 'timed' && seconds > e.effect.minutes * 60) continue;
    if (rng() < chanceIn(eventRatePerHour(e), seconds)) hits.push(e);
  }
  return hits.slice(0, cap);
}

/** Records an event as seen (count and first time). */
export function recordSeen(seen: GameState['seenEvents'], id: string, now: number): GameState['seenEvents'] {
  const prev = seen[id];
  return { ...seen, [id]: { count: (prev?.count ?? 0) + 1, firstSeen: prev?.firstSeen ?? now } };
}
