import { EVENTS_BY_ID } from '../data/events';
import { useStore } from '../store';
import { formatDuration } from '../utils/format';

/** Timed random-event effects in progress, with time left (0.85). */
export default function ActiveEffects() {
  const effects = useStore((s) => s.activeEffects);
  // re-render each tick so the time left counts down
  const now = useStore((s) => s.lastSavedTimestamp);
  const live = effects.filter((a) => a.until > now);
  if (!live.length) return null;
  return (
    <ul aria-label="Active events" className="flex flex-wrap justify-center gap-2" data-testid="active-effects">
      {live.map((a) => {
        const def = EVENTS_BY_ID[a.id];
        if (!def) return null;
        return (
          <li
            key={a.id}
            title={def.text}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${def.negative ? 'border-red-500/60 bg-red-950/60 text-red-200' : 'border-emerald-500/60 bg-emerald-950/60 text-emerald-200'}`}
          >
            {def.negative ? '▼' : '▲'} {def.name} · {formatDuration((a.until - now) / 1000)}
          </li>
        );
      })}
    </ul>
  );
}
