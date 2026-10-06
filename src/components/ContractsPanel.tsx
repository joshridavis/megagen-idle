import { CONTRACTS_UNLOCK_LEVEL, PERK_IDS, PERKS, REWARDS } from '../data/contracts';
import { RESOURCE_NAMES } from '../data/resources';
import { useStore } from '../store';
import type { Contract, ResourceId } from '../types/state';
import {
  canDeliver,
  contractProgress,
  contractRewards,
  contractShortfall,
  contractSlots,
  contractsUnlocked,
  perkCost,
  perkPlayerLevel,
  perkEffectText,
  perkLevel,
  sharesNeed,
} from '../utils/contracts';
import { formatDuration } from '../utils/format';
import { getPlayerLevel } from '../utils/playerLevel';
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
  const missing = contractShortfall(state, c);
  const name = (id: 'energy' | ResourceId) => (id === 'energy' ? 'energy' : RESOURCE_NAMES[id].toLowerCase());
  const produced = Math.max(0, state.lifetimeEnergy - (c.startLifetime ?? 0));
  return (
    <li className="flex flex-col gap-2 rounded-lg border border-slate-600 bg-slate-800 p-3" data-testid={`contract-${c.id}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${c.kind === 'produce' ? 'bg-violet-900 text-violet-200' : 'bg-amber-900 text-amber-200'}`}
            data-testid={`contract-kind-${c.id}`}
          >
            {c.kind === 'produce' ? 'Production' : 'Delivery'}
          </span>
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-slate-400">
            <span title={`Worth ${r.points} Contract Point${r.points > 1 ? 's' : ''} if you choose points`}>{'★'.repeat(c.tier)}</span>
            <span className="text-amber-300"> · 🏅 {r.points} pt{r.points > 1 ? 's' : ''}</span>
            {c.status === 'open' ? ` · ${formatDuration((c.deadline - now) / 1000)} left` : ' · Complete!'}
          </div>
        </div>
        {c.status === 'open' && c.kind === 'resources' && c.resources && <CostList cost={c.resources} have={state.resources} />}
      </div>
      <ProgressBar value={progress} label={`${title} progress`} />
      {c.status === 'open' ? (
        c.kind === 'produce' ? (
          <p className="text-xs text-slate-400">
            Produced so far: {fmt.num(Math.min(produced, c.produce ?? 0))} of {fmt.num(c.produce ?? 0)}. Counts the energy your generators make from
            now on; nothing is spent. Completes by itself.
          </p>
        ) : (
          <>
            <p className="text-xs text-slate-400">
              {c.energy ? `You have ${fmt.num(Math.min(state.energy, c.energy))} of ${fmt.num(c.energy)} energy. ` : ''}
              {Object.entries(c.resources ?? {})
                .map(([id, n]) => `You have ${fmt.num(Math.min(state.resources[id as ResourceId], n ?? 0))} of ${fmt.num(n ?? 0)} ${name(id as ResourceId)}.`)
                .join(' ')}{' '}
              Delivering hands it over: it is spent.
              {sharesNeed(state.contracts.open, c) && ' Each delivery contract is paid separately.'}
            </p>
            <button
              type="button"
              disabled={!canDeliver(state, c)}
              onClick={() => deliver(c.id)}
              className="min-h-11 rounded bg-emerald-600 px-3 py-2 font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {canDeliver(state, c) ? 'Deliver' : `Need ${missing.map((m) => `${fmt.num(m.missing)} more ${name(m.id)}`).join(' and ')}`}
            </button>
          </>
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
  const playerLevel = getPlayerLevel(state.lifetimeEnergy).level;
  if (!contractsUnlocked(state)) {
    return (
      <section aria-label="Contracts" className="max-w-2xl panel">
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
          <h2 className="panel-title">
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
          <h2 className="panel-title">Perk shop</h2>
          <span className="flex items-center gap-1 font-mono text-sm text-amber-300" data-testid="contract-points">
            <span aria-hidden="true">🏅</span>
            {points} Contract Points
          </span>
        </div>
        <div className="mb-3 rounded border border-amber-700/50 bg-amber-950/40 p-2 text-xs text-amber-100" data-testid="points-help">
          <p className="mb-1 font-semibold">How Contract Points work</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>When a contract is done, choose 🏅 Contract Points as its reward.</li>
            <li>
              Bigger contracts give more: ★ = {REWARDS.pointsByTier[0]}, ★★ = {REWARDS.pointsByTier[1]}, ★★★ = {REWARDS.pointsByTier[2]} points.
            </li>
            <li>Spend points here on permanent perks. The number on each button is its price.</li>
          </ul>
        </div>
        <p className="mb-2 text-xs text-slate-400">{done} contracts completed.</p>
        <ul className="flex flex-col gap-2">
          {PERK_IDS.map((id) => {
            const cost = perkCost(state, id);
            const needLevel = perkPlayerLevel(state, id) ?? 0;
            const lacksLevel = playerLevel < needLevel;
            const lv = perkLevel(state, id);
            const effect = perkEffectText(state, id);
            return (
              <li key={id} className="rounded bg-slate-900/60 p-2 text-sm">
                <div className="font-semibold">
                  {PERKS[id].name}
                  {PERKS[id].costs.length > 1 && (
                    <span className="text-xs font-normal text-slate-400">
                      {' '}
                      · level {lv} of {PERKS[id].costs.length}
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">{PERKS[id].description}</div>
                <div className="mt-1 text-xs text-sky-200" data-testid={`perk-effect-${id}`}>
                  {effect.now}
                  {effect.next && <span> → {effect.next}</span>}
                </div>
                <div className="mt-2">
                  {cost === null ? (
                    <span className="text-xs text-emerald-400">✔ Owned (max level)</span>
                  ) : (
                    <button
                      type="button"
                      disabled={points < cost || lacksLevel}
                      onClick={() => buy(id)}
                      data-testid={`perk-buy-${id}`}
                      className="min-h-9 w-full rounded bg-amber-600 px-2 text-xs font-semibold hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                    >
                      {lacksLevel
                        ? `Needs player level ${needLevel} · costs ${cost} points`
                        : points >= cost
                          ? `Buy for ${cost} points`
                          : `Costs ${cost} points · need ${cost - points} more`}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </aside>
    </section>
  );
}
