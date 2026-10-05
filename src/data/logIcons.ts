import type { EventDef } from './events';

/**
 * One emoji per kind of event log entry (1.40, owner request): the log is
 * easy to scan when no two kinds share an icon. Toasts use the same icons.
 * Some events bring their own (`EventDef.icon`), which must not clash either.
 */
export const ENTRY_ICONS = {
  researchComplete: '🔬',
  researchAvailable: '🔓',
  generatorUnlocked: '⚙️',
  producerUnlocked: '⛏️',
  playerLevel: '⭐',
  researchLevel: '🎓',
  fuel: '🔥',
  room: '📦',
  achievement: '🏆',
  save: '🛟',
  eventGood: '🍀',
  eventBad: '⚠️',
  sighting: '👀',
  mapEvent: '🗺️',
  contractOffer: '📜',
  contractComplete: '✅',
  contractExpired: '⌛',
  petFound: '🐾',
  petGrown: '🐣',
} as const;

export type EntryType = keyof typeof ENTRY_ICONS;

/** The icon of a random event's log entry: its own, else map event, sighting, or good or bad effect. */
export function eventIcon(def: Pick<EventDef, 'icon' | 'map' | 'effect' | 'negative'>): string {
  if (def.icon) return def.icon;
  if (def.map) return ENTRY_ICONS.mapEvent;
  if (!def.effect) return ENTRY_ICONS.sighting;
  return def.negative ? ENTRY_ICONS.eventBad : ENTRY_ICONS.eventGood;
}
