import { useEffect, useRef } from 'react';
import { sprites } from '../assets';
import { GENERATORS } from '../data/generators';
import { RESEARCH_BY_ID } from '../data/research';
import { useStore } from '../store';
import type { BonusType } from '../types/research';
import { getBonuses } from '../utils/bonuses';
import {
  getResearchBlock,
  getResearchCost,
  getResearchDuration,
  researchProgress,
  type ResearchBlock,
} from '../utils/researchSystem';
import CostList from './CostList';
import ProgressBar from './ProgressBar';
import { RESEARCH_ICONS } from './researchSprites';

const BONUS_TEXT: Record<BonusType, string> = {
  buildDiscount: 'cheaper building',
  researchCostReduction: 'cheaper research',
  researchSpeed: 'faster research',
  globalEnergy: 'energy from all generators',
  clickPower: 'energy per click',
};

const BLOCK_TEXT: Record<ResearchBlock, string> = {
  unknown: 'Unknown research',
  done: 'Completed',
  busy: 'Another research is running',
  prerequisites: 'Needs earlier research',
  building: 'Build the required generator first',
  level: 'Research level too low',
  cost: 'Not enough energy or resources',
};

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${r ? `${r}s` : ''}`.trim();
  return `${r}s`;
}

export default function ResearchPanel({ id, onClose }: { id: string; onClose: () => void }) {
  const state = useStore((s) => s);
  const start = useStore((s) => s.startResearch);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const def = RESEARCH_BY_ID[id];

  // Focus once on open; Escape closes. Runs only on mount so ticks never steal focus.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, []);

  if (!def) return null;
  const bonuses = getBonuses(state.completedResearch);
  const cost = getResearchCost(def, bonuses);
  const block = getResearchBlock(state, id);
  const running = state.currentResearch?.id === id;
  const done = state.completedResearch.includes(id);
  const now = state.lastSavedTimestamp;
  const remaining = running ? state.currentResearch!.startTime / 1000 + state.currentResearch!.duration - now / 1000 : 0;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="research-panel-title"
        className="w-full max-w-md rounded-lg border border-slate-600 bg-slate-800 p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start gap-3">
          <img src={sprites[RESEARCH_ICONS[def.category]]} alt="" width={32} height={32} className="pixelated" />
          <div className="flex-1">
            <h3 id="research-panel-title" className="text-lg font-semibold">
              {def.name}
            </h3>
            <div className="text-xs text-slate-400">
              Needs research level {def.requiredLevel} (yours: {state.researchLevel}). Completing it raises your level by 1.
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="min-h-11 min-w-11 rounded hover:bg-slate-700">
            ✕
          </button>
        </div>
        <p className="mb-3 text-sm">{def.description}</p>
        <dl className="mb-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="text-slate-400">Cost</dt>
          <dd className="flex flex-wrap gap-x-2">
            <span className={state.energy < cost.energy && !done && !running ? 'text-red-400' : ''}>
              {cost.energy.toLocaleString('en-US')} energy
            </span>
            {cost.resources && Object.keys(cost.resources).length > 0 && (
              <CostList cost={cost.resources} have={done || running ? undefined : state.resources} />
            )}
          </dd>
          <dt className="text-slate-400">Time</dt>
          <dd>{formatDuration(getResearchDuration(def, bonuses))}</dd>
          {def.prerequisites.length > 0 && (
            <>
              <dt className="text-slate-400">Requires</dt>
              <dd>
                {def.prerequisites.map((p) => (
                  <span key={p} className={state.completedResearch.includes(p) ? 'text-emerald-400' : 'text-red-400'}>
                    {RESEARCH_BY_ID[p]?.name ?? p}{' '}
                  </span>
                ))}
              </dd>
            </>
          )}
          {def.requiresBuilt && def.requiresBuilt.length > 0 && (
            <>
              <dt className="text-slate-400">Needs built</dt>
              <dd>
                {def.requiresBuilt.map((t) => (
                  <span key={t} className={state.activeGenerators.some((g) => g.type === t) ? 'text-emerald-400' : 'text-red-400'}>
                    {GENERATORS[t].name}{' '}
                  </span>
                ))}
              </dd>
            </>
          )}
          <dt className="text-slate-400">Gives</dt>
          <dd>
            {[
              ...(def.unlocks.generators ?? []).map((g) => `Unlocks ${GENERATORS[g].name}`),
              ...(def.effects ?? []).map((e) => `+${Math.round(e.value * 100)}% ${BONUS_TEXT[e.type]}`),
            ].join(' · ') || '—'}
          </dd>
        </dl>
        {running ? (
          <div className="space-y-1">
            <ProgressBar value={researchProgress(state, now)} label={`${def.name} progress`} />
            <div className="text-xs text-slate-400">{formatDuration(remaining)} left</div>
          </div>
        ) : (
          <button
            type="button"
            disabled={block !== null}
            onClick={() => start(id)}
            className="min-h-11 w-full rounded bg-sky-600 px-3 py-2 font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {block ? BLOCK_TEXT[block] : 'Start research'}
          </button>
        )}
      </div>
    </div>
  );
}
