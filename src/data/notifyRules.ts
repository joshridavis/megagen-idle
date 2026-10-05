/**
 * Browser notifications (1.07, playtest 14): opt-in, only while the game is
 * in the background, and rate-limited so they never get annoying. Tune here.
 */
/** Sightings are not here: they only happen while the game is on screen, so there is nothing to miss. */
export type NotifyType = 'research' | 'level' | 'contract' | 'pet' | 'fuel';

export interface NotifySettings {
  /** Master switch; off by default. Turning it on asks the browser for permission. */
  enabled: boolean;
  types: Record<NotifyType, boolean>;
}

/** At most this many notifications per hour; the rest are dropped (the event log still has them). */
export const MAX_PER_HOUR = 3;
export const NOTIFY_WINDOW_MS = 3_600_000;

export const NOTIFY_LABELS: Record<NotifyType, string> = {
  research: 'Research complete',
  level: 'Player level up',
  contract: 'Contract complete',
  pet: 'Pet grown up',
  fuel: 'Fuel ran out',
};

export const DEFAULT_NOTIFY: NotifySettings = {
  enabled: false,
  types: { research: true, level: false, contract: true, pet: true, fuel: true },
};
