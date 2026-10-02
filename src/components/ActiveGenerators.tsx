import { useMemo, useState } from 'react';
import { sprites } from '../assets';
import { GENERATORS } from '../data/generators';
import { useStore } from '../store';
import type { Generator } from '../types/generator';
import { getEnergyBonuses } from '../utils/bonuses';
import { NO_MODS } from '../utils/effectMods';
import { getPlacementBonuses } from '../utils/siteMap';
import { GENERATOR_SORTS, sortGenerators } from '../utils/generatorSort';
import type { GeneratorSort } from '../types/state';
import { getGeneratorOutput } from '../utils/energyGeneration';
import { getUpgradeBlock, getUpgradeCost, maxLevel, upgradeGain } from '../utils/generatorSystem';
import CostList from './CostList';
import { GENERATOR_SPRITES } from './generatorSprites';
import { ScrapButton, ScrapConfirm } from './Scrap';
import { useNumberFormat } from './useNumberFormat';
import { zoneTipText } from './zoneTip';

/** Upgrade control: cost and gain in a tooltip; disabled with a reason when not affordable. */
function UpgradeButton({ generatorId, name }: { generatorId: string; name: string }) {
  const state = useStore((s) => s);
  const upgrade = useStore((s) => s.upgradeGenerator);
  const fmt = useNumberFormat();
  const g = state.activeGenerators.find((x) => x.id === generatorId)!;
  const bonuses = getEnergyBonuses(state);
  const cost = getUpgradeCost(g.type, g.level, bonuses);
  const block = getUpgradeBlock(state, generatorId, bonuses);
  const gain = upgradeGain(g.type, g.level) * (1 + bonuses.globalEnergy);
  const tipId = `upgrade-tip-${generatorId}`;
  return (
    <span className="group relative mt-1 inline-block">
      <button
        type="button"
        disabled={block !== null}
        onClick={() => upgrade(generatorId)}
        aria-label={`Upgrade ${name} to level ${g.level + 1}`}
        aria-describedby={tipId}
        className="rounded bg-amber-700/80 px-2 py-0.5 text-xs font-semibold text-amber-50 hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        ⬆ Upgrade
      </button>
      <span
        id={tipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-0 z-30 mb-1 hidden w-56 rounded bg-slate-950 p-2 text-xs text-slate-200 shadow-lg group-hover:block group-has-focus-visible:block"
      >
        Level {g.level} → {g.level + 1}: +{fmt.rate(gain)} energy/s, no extra room.
        <span className="mt-1 block">
          Cost: <span className={state.energy < cost.energy ? 'text-red-400' : ''}>{fmt.num(cost.energy)} energy</span>{' '}
          <CostList cost={cost.resources} have={state.resources} />
        </span>
      </span>
    </span>
  );
}

function statusOf(g: Generator) {
  if (g.isActive) return { text: 'Running', className: 'text-emerald-400' };
  if (g.outOfFuel) return { text: 'Out of fuel', className: 'text-red-400' };
  return { text: 'Off', className: 'text-slate-400' };
}

export default function ActiveGenerators() {
  const generators = useStore((s) => s.activeGenerators);
  const toggle = useStore((s) => s.toggleGenerator);
  const scrap = useStore((s) => s.scrapGenerator);
  const move = useStore((s) => s.moveGenerator);
  const [dragId, setDragId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const completed = useStore((s) => s.completedResearch);
  const lifetime = useStore((s) => s.lifetimeEnergy);
  const bonuses = useMemo(() => getEnergyBonuses({ completedResearch: completed, lifetimeEnergy: lifetime }), [completed, lifetime]);
  const fmt = useNumberFormat();
  const producers = useStore((s) => s.producers);
  const capacity = useStore((s) => s.roomCapacity);
  const pins = useStore((s) => s.mapPins);
  // where each stands on the map changes its output (1.05)
  const placeMods = useMemo(
    () => ({ ...NO_MODS, placement: getPlacementBonuses({ activeGenerators: generators, producers, completedResearch: completed, roomCapacity: capacity, mapPins: pins }) }),
    [generators, producers, completed, capacity, pins],
  );
  const sort = useStore((s) => s.settings.generatorSort ?? 'custom');
  const setSort = useStore((s) => s.setGeneratorSort);
  const custom = sort === 'custom';
  // 'upgradable' depends on what you can afford, so it re-sorts as energy and resources change
  const fullState = useStore((s) => (sort === 'upgradable' ? s : null));
  const shown = useMemo(
    () =>
      sortGenerators(generators, sort, bonuses, (g) =>
        fullState ? getUpgradeBlock(fullState, g.id, getEnergyBonuses(fullState)) === null : false,
      ),
    [generators, sort, bonuses, fullState],
  );
  return (
    <section aria-label="Your generators" className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Your generators ({generators.length})</h2>
        {generators.length > 1 && (
          <label className="flex items-center gap-1 text-xs text-slate-400">
            Sort by
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as GeneratorSort)}
              className="min-h-9 rounded border border-slate-600 bg-slate-800 px-2 text-xs text-slate-100"
              data-testid="generator-sort"
            >
              {GENERATOR_SORTS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {generators.length > 1 && (
        <p className="mb-2 text-xs text-slate-400">
          {custom
            ? 'Drag or use ▲▼ to reorder (Shift for top/bottom). When fuel runs short, generators higher up get it first.'
            : 'Sorted for viewing only: fuel still goes in your order. Choose "Your order" to reorder.'}
        </p>
      )}
      {generators.length === 0 ? (
        <p className="rounded-lg bg-slate-800 p-3 text-sm text-slate-400">
          None yet. Build one above: a Solar Panel costs 10 metal.
        </p>
      ) : (
        <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
          {shown.map((g) => {
            const i = generators.indexOf(g);
            const def = GENERATORS[g.type];
            const status = statusOf(g);
            const name = `${def.name} #${g.id.split('-')[1] ?? i + 1}`;
            return (
              <li
                key={g.id}
                className={`rounded-lg bg-slate-800 p-2 ${dragId === g.id ? 'opacity-50' : ''}`}
                data-testid={`generator-${g.id}`}
                draggable={custom}
                onDragStart={(e) => {
                  setDragId(g.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => {
                  if (dragId) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId && dragId !== g.id) move(dragId, i);
                  setDragId(null);
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                <div className={`flex flex-col ${custom ? '' : 'hidden'}`}>
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={(e) => move(g.id, e.shiftKey ? 0 : i - 1)}
                    aria-label={`Move ${name} up`}
                    title="Move up (Shift: to top)"
                    className="h-6 w-8 rounded text-xs text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={i === generators.length - 1}
                    onClick={(e) => move(g.id, e.shiftKey ? generators.length - 1 : i + 1)}
                    aria-label={`Move ${name} down`}
                    title="Move down (Shift: to bottom)"
                    className="h-6 w-8 rounded text-xs text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
                <img
                  src={sprites[g.isActive ? GENERATOR_SPRITES[g.type].active : GENERATOR_SPRITES[g.type].inactive]}
                  alt=""
                  className="pixelated h-12 w-12 object-contain"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">
                    {name}{' '}
                    <span className="text-xs font-normal text-amber-300" data-testid={`level-${g.id}`}>
                      Lv {g.level}
                      {g.level >= maxLevel(g.type) ? ' (max)' : `/${maxLevel(g.type)}`}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className={status.className}>{status.text}</span>
                    <span className="text-slate-400"> · +{fmt.rate(getGeneratorOutput(g, bonuses, placeMods))} energy/s · {def.roomCost} room</span>
                    {placeMods.placement[g.id] ? (
                      <span className="group/pin relative text-emerald-300" tabIndex={0} data-testid={`pin-${g.id}`}>
                        {' '}· 📍 +{Math.round(placeMods.placement[g.id] * 100)}%
                        <span
                          role="tooltip"
                          className="pointer-events-none absolute bottom-full left-0 z-50 mb-1 hidden w-56 rounded border border-slate-600 bg-slate-950 p-2 text-xs text-slate-100 shadow-xl group-hover/pin:block group-focus/pin:block"
                        >
                          {zoneTipText(g.type, placeMods.placement[g.id])} Move machines in the Map tab.
                        </span>
                      </span>
                    ) : null}
                  </div>
                  {g.level < maxLevel(g.type) && (
                    <UpgradeButton generatorId={g.id} name={name} />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => toggle(g.id)}
                  aria-pressed={g.isActive}
                  aria-label={`${g.isActive ? 'Turn off' : 'Turn on'} ${name}`}
                  className={`min-h-11 min-w-16 rounded px-3 py-2 text-sm font-semibold ${g.isActive ? 'bg-slate-600 hover:bg-slate-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                >
                  {g.isActive ? 'Turn off' : 'Turn on'}
                </button>
                {confirming !== g.id && (
                  <ScrapButton id={g.id} name={name} what="generator" onClick={() => setConfirming(g.id)} />
                )}
                </div>
                {confirming === g.id && (
                  <ScrapConfirm
                    name={name}
                    what="generator"
                    onConfirm={() => {
                      scrap(g.id);
                      setConfirming(null);
                    }}
                    onCancel={() => setConfirming(null)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
