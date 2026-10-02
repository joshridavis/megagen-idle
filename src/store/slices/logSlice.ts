import { TOAST_CAP } from '../../data/notifications';
import { appendLog, appendToasts, stamp, type LogEntry, type LogInput } from '../../utils/eventLog';
import type { SliceCreator, TransientState } from '../types';

export interface LogActions {
  /** Adds entries to the event log (and toasts for those marked). */
  logEvents: (entries: LogInput[], now?: number) => void;
  /** Shows a toast without adding a log entry. */
  pushToast: (entry: LogInput, now?: number) => void;
  dismissToast: (id: string) => void;
  clearLog: () => void;
}

export type LogState = Pick<TransientState, 'eventLog' | 'toasts' | 'eventEpoch'>;

/** Event log and toasts (0.38). In memory only; never saved. */
export const createLogSlice = (): SliceCreator<LogState & LogActions> => (set) => ({
  eventLog: [] as LogEntry[],
  toasts: [] as LogEntry[],
  eventEpoch: 0,
  logEvents: (entries, now = Date.now()) =>
    set(
      (s) => {
        const stamped = stamp(entries, now);
        return { eventLog: appendLog(s.eventLog, stamped), toasts: appendToasts(s.toasts, stamped, TOAST_CAP) };
      },
      undefined,
      'log/add',
    ),
  pushToast: (entry, now = Date.now()) =>
    set((s) => ({ toasts: appendToasts(s.toasts, stamp([{ ...entry, toast: true }], now), TOAST_CAP) }), undefined, 'log/toast'),
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }), undefined, 'log/dismissToast'),
  clearLog: () => set({ eventLog: [] }, undefined, 'log/clear'),
});
