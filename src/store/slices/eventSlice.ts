import { EVENTS_BY_ID } from '../../data/events';
import type { EventsState } from '../../types/state';
import { rollEvents, recordSeen, type RollOptions } from '../../utils/randomEvents';
import type { Rng } from '../../utils/rng';
import type { SliceCreator, TransientState } from '../types';
import type { GameState } from '../../types/state';
import { applyEventEffect } from '../../utils/eventEffects';
import { applyMapEvent, pickMapTarget } from '../../utils/mapEvents';
import { deriveRates } from '../../utils/simulation';
import { pickSaved } from '../migrations';

export interface EventActions {
  /** Rolls random events for elapsed time; returns the ids that happened. */
  rollRandomEvents: (seconds: number, opts: RollOptions, rng?: Rng, now?: number) => string[];
  dismissSighting: () => void;
  /** Rolls map events for time spent watching the Map tab (1.12); returns the id that happened, if any. */
  rollMapEvents: (seconds: number, rng?: Rng, now?: number) => string | null;
  /** Clicks the map event (puts out the fire): its effect, if still in time. */
  claimMapEvent: (now?: number, rng?: Rng) => boolean;
  /** Ends the map event (its animation finished, or its time ran out). */
  endMapEvent: (now?: number) => void;
}

/** Random events (0.84): seen records are saved; the sighting on screen is not. */
export const createEventSlice =
  (initial: EventsState): SliceCreator<EventsState & Pick<TransientState, 'activeSighting' | 'mapEvent'> & EventActions> =>
  (set, get) => ({
    ...initial,
    activeSighting: null,
    mapEvent: null,
    rollMapEvents: (seconds, rng = Math.random, now = Date.now()) => {
      const s = get();
      if (s.mapEvent) return null; // one at a time
      for (const def of rollEvents(s, seconds, rng, { foreground: true, map: true })) {
        const ev = pickMapTarget(s, def, rng, now);
        if (!ev) continue;
        let game: GameState = pickSaved(s);
        let text = def.text;
        if (def.effect && !ev.claimUntil) {
          const applied = applyMapEvent(game, ev, now, rng);
          game = applied.state;
          text = applied.text || def.text;
        }
        set({ ...(def.effect && !ev.claimUntil ? deriveRates(game) : {}), seenEvents: recordSeen(s.seenEvents, def.id, now), mapEvent: ev }, undefined, 'events/map');
        s.logEvents([{ kind: 'event', text: `${def.name}: ${text}`, toast: true }], now);
        return def.id;
      }
      return null;
    },
    claimMapEvent: (now = Date.now(), rng = Math.random) => {
      const s = get();
      const ev = s.mapEvent;
      if (!ev?.claimUntil || now > ev.claimUntil) return false;
      const applied = applyMapEvent(pickSaved(s), ev, now, rng);
      set({ ...deriveRates(applied.state), mapEvent: null }, undefined, 'events/mapClaim');
      const def = EVENTS_BY_ID[ev.id];
      s.logEvents([{ kind: 'event', text: `${def.name}: put out in time. ${applied.text}`, toast: true }], now);
      return true;
    },
    endMapEvent: (now = Date.now()) => {
      const s = get();
      const ev = s.mapEvent;
      if (!ev) return;
      set({ mapEvent: null }, undefined, 'events/mapEnd');
      if (ev.claimUntil && now >= ev.claimUntil) s.logEvents([{ kind: 'event', text: `${EVENTS_BY_ID[ev.id].name}: it burned out on its own.`, toast: false }], now);
    },
    dismissSighting: () => {
      const s = get();
      const def = s.activeSighting && EVENTS_BY_ID[s.activeSighting.id];
      set({ activeSighting: null }, undefined, 'events/dismissSighting');
      // a notice after the animation, for a player who looked away (playtest 11)
      if (def && !s.settings.reduceMotion) s.pushToast({ kind: 'event', text: `You spotted: ${def.name}!`, toast: true });
    },
    rollRandomEvents: (seconds, opts, rng = Math.random, now = Date.now()) => {
      const s = get();
      // one sighting on screen at a time
      const hits = rollEvents(s, seconds, rng, opts).filter((e) => !(e.animation && s.activeSighting));
      if (!hits.length) return [];
      let seen = s.seenEvents;
      for (const e of hits) seen = recordSeen(seen, e.id, now);
      const sighting = hits.find((e) => e.animation && opts.foreground && !opts.catchUp);
      // effect events change the game (0.85)
      let game: GameState = pickSaved(s);
      const texts: Record<string, string> = {};
      for (const e of hits) {
        if (!e.effect) continue;
        const applied = applyEventEffect(game, e, now, rng);
        game = applied.state;
        texts[e.id] = applied.text;
      }
      set(
        {
          ...(Object.keys(texts).length ? deriveRates(game) : {}),
          seenEvents: seen,
          ...(sighting ? { activeSighting: { id: sighting.id, at: now } } : {}),
        },
        undefined,
        'events/roll',
      );
      s.logEvents(
        hits.map((e) => ({
          kind: 'event' as const,
          text: `${EVENTS_BY_ID[e.id].name}: ${texts[e.id] ?? e.text}`,
          // effects always get a notice; sightings only with animations off
          toast: !!e.effect || !e.animation || s.settings.reduceMotion,
        })),
        now,
      );
      return hits.map((e) => e.id);
    },
  });
