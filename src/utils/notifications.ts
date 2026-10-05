import { ENTRY_ICONS } from '../data/logIcons';
import { MAX_PER_HOUR, NOTIFY_LABELS, NOTIFY_WINDOW_MS, type NotifySettings, type NotifyType } from '../data/notifyRules';
import type { LogInput } from './eventLog';

/** Which notification switch a log entry falls under, by its icon (1.40); null if it never notifies. */
export function notifyTypeOf(e: Pick<LogInput, 'icon' | 'kind'>): NotifyType | null {
  switch (e.icon) {
    case ENTRY_ICONS.researchComplete:
      return 'research';
    case ENTRY_ICONS.playerLevel:
      return 'level';
    case ENTRY_ICONS.contractComplete:
      return 'contract';
    case ENTRY_ICONS.petGrown:
      return 'pet';
    case ENTRY_ICONS.fuel:
      return 'fuel';
    default:
      return null;
  }
}

export interface Notice {
  title: string;
  body: string;
}

/**
 * What to send for new log entries (1.07). Pure. Nothing without the master
 * switch, only switched-on types, at most MAX_PER_HOUR per hour (`history` is
 * the send times), and several entries at once become one summary. The
 * caller checks permission and that the game is in the background.
 */
export function selectNotifications(
  entries: Pick<LogInput, 'icon' | 'kind' | 'text'>[],
  settings: NotifySettings | undefined,
  history: number[],
  now: number,
): { notice: Notice | null; history: number[] } {
  const recent = history.filter((t) => t > now - NOTIFY_WINDOW_MS && t <= now);
  if (!settings?.enabled) return { notice: null, history: recent };
  const wanted = entries.filter((e) => {
    const t = notifyTypeOf(e);
    return t !== null && settings.types[t];
  });
  if (!wanted.length || recent.length >= MAX_PER_HOUR) return { notice: null, history: recent };
  const first = wanted[0];
  const type = notifyTypeOf(first)!;
  const more = wanted.length - 1;
  const notice = {
    title: more === 0 ? `MegaGen Idle: ${NOTIFY_LABELS[type]}` : `MegaGen Idle: ${wanted.length} things happened`,
    body: more === 0 ? first.text : `${first.text}, and ${more} more`,
  };
  return { notice, history: [...recent, now] };
}
