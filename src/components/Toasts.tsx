import { useEffect } from 'react';
import { TOAST_MS } from '../data/notifications';
import { useStore } from '../store';
import type { LogEntry } from '../utils/eventLog';
import { LOG_ICONS } from './EventLog';

function Toast({ t }: { t: LogEntry }) {
  const dismiss = useStore((s) => s.dismissToast);
  useEffect(() => {
    const timer = setTimeout(() => dismiss(t.id), TOAST_MS);
    return () => clearTimeout(timer);
  }, [t.id, dismiss]);
  return (
    <button
      type="button"
      onClick={() => dismiss(t.id)}
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
    <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-40 flex w-72 max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} t={t} />
      ))}
    </div>
  );
}
