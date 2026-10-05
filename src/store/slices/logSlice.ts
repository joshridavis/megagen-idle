import { EVENT_LOG_CAP, TOAST_CAP } from '../../data/notifications';
import { appendLog, appendToasts, stamp, type LogEntry, type LogInput } from '../../utils/eventLog';
import type { SliceCreator, TransientState } from '../types';
import { platform } from '../../platform';
import { selectNotifications } from '../../utils/notifications';

export interface LogActions {
  /** Adds entries to the event log (and toasts for those marked). */
  logEvents: (entries: LogInput[], now?: number) => void;
  /** Shows a toast without adding a log entry. */
  pushToast: (entry: LogInput, now?: number) => void;
  dismissToast: (id: string) => void;
  clearLog: () => void;
}

export type LogState = Pick<TransientState, 'eventLog' | 'toasts' | 'eventEpoch'>;

/** Where the event log is kept between visits (playtest 15: entries vanished on reload). Per device. */
export const LOG_KEY = 'megagen-idle-log';

/** The saved event log, or empty if missing, unreadable or storage is blocked. */
export function loadLog(): LogEntry[] {
  try {
    const raw = typeof localStorage === 'undefined' ? null : localStorage.getItem(LOG_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as LogEntry[]).filter((e) => e && typeof e.text === 'string').slice(0, EVENT_LOG_CAP) : [];
  } catch {
    return [];
  }
}

export function saveLog(log: LogEntry[]): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch {
    // storage full or blocked: the log is a convenience, so skip
  }
}

/** When notifications went out this visit (1.07): for the hourly limit. Not saved. */
let notifyHistory: number[] = [];
export const resetNotifyHistory = () => {
  notifyHistory = [];
};

/** Sends a browser notification for new entries, only in the background and with permission (1.07). */
function maybeNotify(entries: LogInput[], settings: Parameters<typeof selectNotifications>[1], now: number) {
  if (!settings?.enabled || !platform.isBackground() || platform.notifyPermission() !== 'granted') return;
  const r = selectNotifications(entries, settings, notifyHistory, now);
  notifyHistory = r.history;
  if (r.notice) platform.notify(r.notice.title, r.notice.body);
}

/** Event log and toasts (0.38). The log is kept on this device across visits; toasts are not. */
export const createLogSlice = (): SliceCreator<LogState & LogActions> => (set, get) => ({
  eventLog: loadLog(),
  toasts: [] as LogEntry[],
  eventEpoch: 0,
  logEvents: (entries, now = Date.now()) => {
    maybeNotify(entries, get().settings?.notifications, now);
    set(
      (s) => {
        const stamped = stamp(entries, now);
        const eventLog = appendLog(s.eventLog, stamped);
        saveLog(eventLog);
        return { eventLog, toasts: appendToasts(s.toasts, stamped, TOAST_CAP) };
      },
      undefined,
      'log/add',
    );
  },
  pushToast: (entry, now = Date.now()) =>
    set((s) => ({ toasts: appendToasts(s.toasts, stamp([{ ...entry, toast: true }], now), TOAST_CAP) }), undefined, 'log/toast'),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }), undefined, 'log/dismissToast'),
  clearLog: () => {
    saveLog([]);
    set({ eventLog: [] }, undefined, 'log/clear');
  },
});
