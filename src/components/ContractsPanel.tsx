import { sprites } from '../assets';
import { CONTRACTS_UNLOCK_LEVEL, PERK_IDS, PERKS } from '../data/contracts';
import { RESOURCE_NAMES } from '../data/resources';
import { useStore } from '../store';
import type { Contract, ResourceId } from '../types/state';
import { canDeliver, contractProgress, contractRewards, contractSlots, contractsUnlocked, perkCost, perkLevel } from '../utils/contracts';
import { formatDuration } from '../utils/format';
import CostList from './CostList';
import ProgressBar from './ProgressBar';
import { useNumberFormat } from './useNumberFormat';

function ContractCard({ c }: { c: Contract }) {
  const state = useStore((s) => s);
  const deliver = useStore((s) => s.deliverContract);
  const claim = useStore((s) => s.claimContract);
  const fmt = useNumberFormat();
  const now = state.lastSavedTimestamp;
  const title =
    c.kind === 'produce'
      ? `Produce ${fmt.num(c.produce ?? 0)} energy`
      : c.kind === 'energy'
        ? `Supply ${fmt.num(c.energy ?? 0)} energy`
        : `Deliver ${Object.entries(c.resources ?? {})
            .map(([id, n]) => `${fmt.num(n ?? 0)} ${RESOURCE_NAMES[id as ResourceId].toLowerCase()}`)
            .join(' and ')}`;
  const progress = contractProgress(state, c);
  const r = contractRewards(state, c);
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-slate-600 bg-slate-800 p-3" data-testid={`contract-${c.id}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-slate-400">
            {'★'.repeat(c.tier)}
            {c.status === 'open' ? ` · ${formatDuration((c.deadline - now) / 1000)} left` : ' · Complete!'}
          </div>
        </div>
        {c.status === 'open' && c.kind === 'resources' && c.resources && <CostList cost={c.resources} have={state.resources} />}
      </div>
      <ProgressBar value={progress} label={`${title} progress`} />
      {c.status === 'open' ? (
        c.kind === 'produce' ? (
          <p className="text-xs text-slate-400">Completes by itself as your generators produce energy.</p>
        ) : (
          <button
            type="button"
            disabled={!canDeliver(state, c)}
            onClick={() => deliver(c.id)}
            className="min-h-11 rounded bg-emerald-600 px-3 py-2 font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {canDeliver(state, c) ? 'Deliver' : 'Not enough yet'}
          </button>
        )
      ) : (
        <div>
          <p className="mb-1 text-sm text-emerald-300">Choose your reward:</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <button type="button" onClick={() => claim(c.id, 'bundle')} className="min-h-11 rounded bg-sky-700 px-2 py-2 text-sm hover:bg-sky-600">
              📦 Materials
              <span className="block text-xs text-sky-100">
                {Object.entries(r.bundle)
                  .map(([id, n]) => `${fmt.num(n ?? 0)} ${RESOURCE_NAMES[id as ResourceId].toLowerCase()}`)
                  .join(', ')}
              </span>
            </button>
            <button type="button" onClick={() => claim(c.id, 'boost')} className="min-h-11 rounded bg-sky-700 px-2 py-2 text-sm hover:bg-sky-600">
              ⚡ Boost
              <span className="block text-xs text-sky-100">+25% energy for {Math.round(r.boostMinutes)} min</span>
            </button>
            <button type="button" onClick={() => claim(c.id, 'points')} className="min-h-11 rounded bg-sky-700 px-2 py-2 text-sm hover:bg-sky-600">
              🏅 Contract Points
              <span className="block text-xs text-sky-100">+{r.points} for the perk shop</span>
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

/** Grid Contracts tab (0.86, playtest 10): timed orders, reward choice, perk shop. */
export default function ContractsPanel() {
  const state = useStore((s) => s);
  const buy = useStore((s) => s.buyPerk);
  if (!contractsUnlocked(state)) {
    return (
      <section aria-label="Contracts" className="max-w-2xl rounded-lg bg-slate-800 p-4">
        <h2 className="mb-1 font-semibold">Grid Contracts</h2>
        <p className="text-sm text-slate-300">
          Customers will order energy and materials from you, with a reward of your choice for each order. Contracts open at research
          level {CONTRACTS_UNLOCK_LEVEL} (you have {state.researchLevel}).
        </p>
      </section>
    );
  }
  const { open, points, done, nextOfferAt } = state.contracts;
  const full = open.length >= contractSlots(state);
  return (
    <section aria-label="Contracts" className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div>
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Contracts ({open.length}/{contractSlots(state)})
          </h2>
          <span className="text-xs text-slate-400" data-testid="next-offer">
            {full ? 'All slots full' : `Next offer in ${formatDuration((nextOfferAt - state.lastSavedTimestamp) / 1000)}`}
          </span>
        </div>
        {open.length === 0 ? (
          <p className="rounded-lg bg-slate-800 p-3 text-sm text-slate-400">No offers right now. New ones arrive over time, even while you are away.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {open.map((c) => (
              <ContractCard key={c.id} c={c} />
            ))}
          </ul>
        )}
      </div>
      <aside className="rounded-lg bg-slate-800 p-3" aria-label="Perk shop">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Perk shop</h2>
          <span className="flex items-center gap-1 font-mono text-sm text-amber-300" data-testid="contract-points">
            <img src={sprites.research_check} alt="" width={16} height={16} className="pixelated" />
            {points} points
          </span>
        </div>
        <p className="mb-2 text-xs text-slate-400">{done} contracts completed. Perks are permanent.</p>
        <ul className="flex flex-col gap-2">
          {PERK_IDS.map((id) => {
            const cost = perkCost(state, id);
            const lv = perkLevel(state, id);
            return (
              <li key={id} className="rounded bg-slate-900/60 p-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    {PERKS[id].name}
                    {PERKS[id].costs.length > 1 && <span className="text-xs text-slate-400"> ({lv}/{PERKS[id].costs.length})</span>}
                  </span>
                  {cost === null ? (
                    <span className="text-xs text-emerald-400">Owned</span>
                  ) : (
                    <button
                      type="button"
                      disabled={points < cost}
                      onClick={() => buy(id)}
                      className="min-h-9 rounded bg-amber-600 px-2 text-xs font-semibold hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                    >
                      Buy · {cost}
                    </button>
                  )}
                </div>
                <div className="text-xs text-slate-400">{PERKS[id].description}</div>
              </li>
            );
          })}
        </ul>
      </aside>
    </section>
  );
}
