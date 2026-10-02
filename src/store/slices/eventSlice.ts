import { EVENTS_BY_ID } from '../../data/events';
import type { EventsState } from '../../types/state';
import { rollEvents, recordSeen, type RollOptions } from '../../utils/randomEvents';
import type { Rng } from '../../utils/rng';
import type { SliceCreator, TransientState } from '../types';

export interface EventActions {
  /** Rolls random events for elapsed time; returns the ids that happened. */
  rollRandomEvents: (seconds: number, opts: RollOptions, rng?: Rng, now?: number) => string[];
  dismissSighting: () => void;
}

/** Random events (0.84): seen records are saved; the sighting on screen is not. */
export const createEventSlice =
  (initial: EventsState): SliceCreator<EventsState & Pick<TransientState, 'activeSighting'> & EventActions> =>
  (set, get) => ({
    ...initial,
    activeSighting: null,
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
      set(
        {
          seenEvents: seen,
          ...(sighting ? { activeSighting: { id: sighting.id, at: now } } : {}),
        },
        undefined,
        'events/roll',
      );
      s.logEvents(
        hits.map((e) => ({
          kind: 'event' as const,
          text: `${EVENTS_BY_ID[e.id].name}: ${e.text}`,
          // with animations off, a toast is how the player notices it
          toast: !e.animation || s.settings.reduceMotion,
        })),
        now,
      );
      return hits.map((e) => e.id);
    },
  });
