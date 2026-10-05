import { sprites } from '../assets';
import { RESEARCH_BY_ID } from '../data/research';
import { useStore } from '../store';
import { formatDuration } from '../utils/format';
import { researchFinishTime, researchProgress } from '../utils/researchSystem';
import { RESEARCH_ICONS } from './researchSprites';

/**
 * Shows the running research with time left on every tab. Re-renders on the
 * idle tick (lastSavedTimestamp changes every second). Click opens Research
 * with the running research's details (1.41).
 */
export default function ResearchChip({ onOpen }: { onOpen: (researchId: string) => void }) {
  const state = useStore((s) => s);
  const current = state.currentResearch;
  if (!current) return null;
  const def = RESEARCH_BY_ID[current.id];
  if (!def) return null;
  const now = Math.max(state.lastSavedTimestamp, current.startTime);
  const left = Math.max(0, ((researchFinishTime(state) ?? now) - now) / 1000);
  const pct = Math.round(researchProgress(state, now) * 100);
  return (
    <button
      type="button"
      onClick={() => onOpen(current.id)}
      data-testid="research-chip"
      aria-label={`Researching ${def.name}, ${formatDuration(left)} left. Open its details.`}
      className="flex w-full items-center gap-2 rounded-full border border-sky-500/70 bg-sky-950 px-3 py-2 text-left text-sm hover:bg-sky-900"
    >
      <img src={sprites[RESEARCH_ICONS[def.category]]} alt="" width={20} height={20} className="pixelated research-running-icon" />
      <span className="min-w-0 flex-1">
        <span className="flex justify-between gap-2">
          <span className="truncate">🔬 {def.name}</span>
          <span className="shrink-0 font-mono text-sky-200">{formatDuration(left)} left</span>
        </span>
        <span className="mt-1 block h-1 overflow-hidden rounded bg-slate-800">
          <span className="block h-full bg-sky-400 transition-[width] duration-1000 ease-linear motion-reduce:transition-none" style={{ width: `${pct}%` }} />
        </span>
      </span>
    </button>
  );
}
