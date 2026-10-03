import { EVENTS_BY_ID } from '../data/events';
import { GENERATORS } from '../data/generators';
import { useStore } from '../store';
import { describeEffect, effectiveDef } from '../utils/eventEffects';
import { formatDuration } from '../utils/format';
import { useNumberFormat } from './useNumberFormat';

/**
 * Timed random-event effects in progress, with time left (0.85). Hovering or
 * focusing a chip shows exactly what it does right now (playtest 15).
 */
export default function ActiveEffects() {
  const effects = useStore((s) => s.activeEffects);
  const generators = useStore((s) => s.activeGenerators);
  const producers = useStore((s) => s.producers);
  const completedResearch = useStore((s) => s.completedResearch);
  // re-render each tick so the time left counts down
  const now = useStore((s) => s.lastSavedTimestamp);
  const fmt = useNumberFormat();
  const live = effects.filter((a) => a.until > now);
  if (!live.length) return null;
  return (
    <ul aria-label="Active events" className="flex flex-wrap justify-center gap-2" data-testid="active-effects">
      {live.map((a) => {
        const def = EVENTS_BY_ID[a.id];
        if (!def) return null;
        const exact = describeEffect(effectiveDef(def, a), { activeGenerators: generators, producers, completedResearch }, fmt.rate);
        const key = a.generator ? `${a.id}-${a.generator}` : a.id;
        const tipId = `effect-tip-${key}`;
        return (
          <li key={key} className="group relative">
            <span
              tabIndex={0}
              aria-describedby={tipId}
              data-testid={`effect-chip-${key}`}
              className={`inline-block cursor-help rounded-full border px-3 py-1 text-xs font-semibold ${def.negative ? 'border-red-500/60 bg-red-950/60 text-red-200' : 'border-emerald-500/60 bg-emerald-950/60 text-emerald-200'}`}
            >
              {def.negative ? '▼' : '▲'} {def.name}{a.generator ? ` (${GENERATORS[a.generator].name})` : ''} · {formatDuration((a.until - now) / 1000)} ⓘ
            </span>
            <span
              id={tipId}
              role="tooltip"
              data-testid={`effect-tip-${key}`}
              className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-72 -translate-x-1/2 rounded border border-slate-600 bg-slate-950 p-2 text-left text-xs text-slate-100 shadow-xl group-hover:block group-focus-within:block"
            >
              <span className="block font-semibold">{def.name}</span>
              <span className="block">{exact}</span>
              <span className="mt-1 block text-slate-400">Ends in {formatDuration((a.until - now) / 1000)}. Nothing is lost when it ends.</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
