import { useMemo, useState } from 'react';
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

const pct = (n: number) => `${+(n * 100).toFixed(1)}%`;

/** Remembers whether the panel is open, on this device only (1.21). */
const OPEN_KEY = 'megagen-idle-bonuses-open';
const readOpen = () => {
  try {
    return localStorage.getItem(OPEN_KEY) !== '0';
  } catch {
    return true;
  }
};
const writeOpen = (open: boolean) => {
  try {
    localStorage.setItem(OPEN_KEY, open ? '1' : '0');
  } catch {
    // storage blocked: the panel still works, it just forgets
  }
};

/** Lists every active permanent bonus, its total and where it comes from. */
export default function BonusesPanel() {
  const completed = useStore((s) => s.completedResearch);
  const lifetime = useStore((s) => s.lifetimeEnergy);
  const lines = useMemo(() => getBonusSummary(completed, lifetime), [completed, lifetime]);
  const [open, setOpen] = useState(readOpen);
  // closed, the header still shows each bonus as icon and total (playtest 17: the list gets long)
  const short = lines.map((l) => `${LABEL[l.type].split(' ')[0]} +${pct(l.total)}`).join('  ');
  return (
    <details
      aria-label="Bonuses"
      className="mb-4 rounded-lg bg-slate-800 p-3"
      open={open}
      onToggle={(e) => {
        const now = (e.currentTarget as HTMLDetailsElement).open;
        setOpen(now);
        writeOpen(now);
      }}
      data-testid="bonuses-panel"
    >
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 gap-y-1 [&::-webkit-details-marker]:hidden">
        <h2 className="panel-title">
          Active bonuses{lines.length > 0 ? ` (${lines.length})` : ''} <span aria-hidden="true">{open ? '▾' : '▸'}</span>
        </h2>
        {!open && lines.length > 0 && <span className="text-xs text-emerald-300" data-testid="bonuses-short">{short}</span>}
      </summary>
      <div className="mt-2">
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
      </div>
    </details>
  );
}
