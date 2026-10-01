import { useState } from 'react';
import { useStore } from '../store';
import type { LogKind } from '../utils/eventLog';

export const LOG_ICONS: Record<LogKind, string> = {
  research: '🔬',
  unlock: '🔓',
  fuel: '🔥',
  room: '📦',
  event: '✨',
};

const time = (at: number) => new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

/** Collapsible list of what happened this session, newest first (0.38). */
export default function EventLog() {
  const log = useStore((s) => s.eventLog);
  const clear = useStore((s) => s.clearLog);
  const [open, setOpen] = useState(false);
  return (
    <section aria-label="Event log" className="rounded-lg bg-slate-800 p-3">
      <div className="flex items-center justify-between gap-2">
        <button type="button" aria-expanded={open} aria-controls="event-log-list" onClick={() => setOpen(!open)} className="font-semibold">
          <span aria-hidden="true" className="mr-1 inline-block w-3 text-slate-400">
            {open ? '▾' : '▸'}
          </span>
          Event log <span className="font-mono text-sm text-slate-400">({log.length})</span>
        </button>
        {open && log.length > 0 && (
          <button type="button" onClick={clear} className="text-xs text-slate-400 hover:text-white">
            Clear
          </button>
        )}
      </div>
      {open &&
        (log.length === 0 ? (
          <p className="mt-2 text-sm text-slate-400">Nothing yet this session.</p>
        ) : (
          <ul id="event-log-list" className="mt-2 flex max-h-64 flex-col gap-1 overflow-y-auto text-sm" data-testid="event-log-list">
            {log.map((e) => (
              <li key={e.id} className="flex gap-2">
                <span className="shrink-0 font-mono text-xs leading-5 text-slate-500">{time(e.at)}</span>
                <span aria-hidden="true">{LOG_ICONS[e.kind]}</span>
                <span>{e.text}</span>
              </li>
            ))}
          </ul>
        ))}
    </section>
  );
}
