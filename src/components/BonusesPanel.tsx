import { useMemo } from 'react';
import { useStore } from '../store';
import type { BonusType } from '../types/research';
import { getBonusSummary } from '../utils/bonusSummary';

const LABEL: Record<BonusType, string> = {
  globalEnergy: '⚡ Energy from all generators',
  clickPower: '👆 Energy per click',
  clickRateShare: '👆 Energy/s added to each click',
  buildDiscount: '🏗️ Cheaper building',
  researchSpeed: '⏩ Faster research',
  researchCostReduction: '💰 Cheaper research',
  resourceProduction: '⛏️ Output from all producers',
  metalProduction: '🔩 Metal from mines',
  stoneProduction: '🪨 Stone from quarries',
  producerDiscount: '🏭 Cheaper producers',
  fuelEfficiency: '🔥 Less fuel burned',
};

const pct = (n: number) => `${Math.round(n * 100)}%`;

/** Lists every active permanent bonus, its total and where it comes from. */
export default function BonusesPanel() {
  const completed = useStore((s) => s.completedResearch);
  const lines = useMemo(() => getBonusSummary(completed), [completed]);
  return (
    <section aria-label="Bonuses" className="mb-4 rounded-lg bg-slate-800 p-3">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Active bonuses</h2>
      {lines.length === 0 ? (
        <p className="text-sm text-slate-400">None yet. Research gives permanent bonuses.</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {lines.map((l) => (
            <li key={l.type} className="rounded bg-slate-900/60 p-2 text-sm" data-testid={`bonus-${l.type}`}>
              <div className="flex justify-between gap-2">
                <span>{LABEL[l.type]}</span>
                <strong className="text-emerald-300">+{pct(l.total)}</strong>
              </div>
              <div className="text-xs text-slate-400">
                {l.sources.map((s) => `${s.name} +${pct(s.value)}`).join(' · ')}
                {l.cap !== undefined && l.raw > l.cap && <span className="text-amber-300"> · capped at {pct(l.cap)}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
