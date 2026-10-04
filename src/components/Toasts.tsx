import { useEffect, useState } from 'react';
import { EVENT_TOAST_MS, TOAST_MS } from '../data/notifications';
import { useStore } from '../store';
import type { LogEntry } from '../utils/eventLog';
import { LOG_ICONS } from './EventLog';

/** How long a notice stays: events and achievements longer, since they need reading. */
export const toastDuration = (t: Pick<LogEntry, 'kind'>) => (t.kind === 'event' || t.kind === 'achievement' ? EVENT_TOAST_MS : TOAST_MS);

function Toast({ t }: { t: LogEntry }) {
  const dismiss = useStore((s) => s.dismissToast);
  const [paused, setPaused] = useState(false);
  const ms = toastDuration(t);
  // the timer restarts after hovering, so a notice being read never vanishes
  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => dismiss(t.id), ms);
    return () => clearTimeout(timer);
  }, [t.id, dismiss, paused, ms]);
  return (
    <button
      type="button"
      onClick={() => dismiss(t.id)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      title="Click to close"
      className="celebrate pointer-events-auto flex w-full items-start gap-2 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-left text-sm shadow-xl"
      data-testid="toast"
    >
      <span aria-hidden="true">{LOG_ICONS[t.kind]}</span>
      <span>{t.text}</span>
    </button>
  );
}

/** Short-lived notices for important events (0.38), capped by TOAST_CAP. */
export default function Toasts() {
  const toasts = useStore((s) => s.toasts);
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-4 top-24 z-40 sm:top-4 flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} t={t} />
      ))}
    </div>
  );
}
