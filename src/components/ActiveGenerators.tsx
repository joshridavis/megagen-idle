import { memo, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { sprites } from '../assets';
import { GENERATORS } from '../data/generators';
import { useStore } from '../store';
import type { Generator } from '../types/generator';
import { getBonuses, getEnergyBonuses } from '../utils/bonuses';
import { generatorScrapRefund } from '../utils/generatorSystem';
import { NO_MODS } from '../utils/effectMods';
import { getPlacementBonuses } from '../utils/siteMap';
import { GENERATOR_SORTS, sortGenerators } from '../utils/generatorSort';
import type { GeneratorSort, Resources } from '../types/state';
import type { ResourceAmounts } from '../types/resource';
import { RESOURCE_IDS } from '../data/resources';
import { getGeneratorOutput } from '../utils/energyGeneration';
import { getUpgradeBlock, getUpgradeCost, maxLevel, upgradeGain } from '../utils/generatorSystem';
import CostList from './CostList';
import { GENERATOR_SPRITES } from './generatorSprites';
import { ScrapButton, ScrapConfirm } from './Scrap';
import { useNumberFormat } from './useNumberFormat';
import { useTipSide } from './useTipSide';
import FloatingTip from './FloatingTip';
import { zoneTipText } from './zoneTip';

/** Upgrade control: cost and gain in a tooltip; disabled with a reason when not affordable. */
function UpgradeButton({ generatorId, name }: { generatorId: string; name: string }) {
  // Only what the button shows, as plain values (0.42): with 200 generators, a whole-store
  // subscription re-rendered every button on every game tick.
  const { level, block, energyShort, short, costEnergy, costResources, gain } = useStore(
    useShallow((s) => {
      const g = s.activeGenerators.find((x) => x.id === generatorId)!;
      const bonuses = getEnergyBonuses(s);
      const cost = getUpgradeCost(g.type, g.level, bonuses);
      return {
        level: g.level,
        block: getUpgradeBlock(s, generatorId, bonuses),
        energyShort: s.energy < cost.energy,
        // the resources it cannot afford, and the resource cost, as strings so they compare by value
        short: RESOURCE_IDS.filter((id) => (s.resources[id] ?? 0) < (cost.resources[id] ?? 0)).join(','),
        costEnergy: cost.energy,
        costResources: JSON.stringify(cost.resources),
        gain: upgradeGain(g.type, g.level) * (1 + bonuses.globalEnergy),
      };
    }),
  );
  const upgrade = useStore((s) => s.upgradeGenerator);
  const fmt = useNumberFormat();
  const resources = useMemo(() => JSON.parse(costResources) as ResourceAmounts, [costResources]);
  // CostList marks a resource red when `have` is below its cost
  const have = useMemo(() => {
    const missing = new Set(short.split(','));
    return Object.fromEntries(RESOURCE_IDS.map((id) => [id, missing.has(id) ? -1 : Infinity])) as Resources;
  }, [short]);
  const tipId = `upgrade-tip-${generatorId}`;
  const { tip, below, place } = useTipSide<HTMLSpanElement>();
  return (
    <span className="group relative mt-1 inline-block" onMouseEnter={place} onFocus={place}>
      <button
        type="button"
        disabled={block !== null}
        onClick={() => upgrade(generatorId)}
        aria-label={`Upgrade ${name} to level ${level + 1}`}
        aria-describedby={tipId}
        className="whitespace-nowrap rounded bg-amber-700/80 px-2 py-0.5 text-xs font-semibold text-amber-50 hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        ⬆ Upgrade
      </button>
      <span
        ref={tip}
        id={tipId}
        role="tooltip"
        data-side={below ? 'below' : 'above'}
        className={`pointer-events-none absolute left-0 z-30 ${below ? 'top-full mt-1' : 'bottom-full mb-1'} hidden w-56 rounded bg-slate-950 p-2 text-xs text-slate-200 shadow-lg group-hover:block group-has-focus-visible:block`}
      >
        Level {level} → {level + 1}: +{fmt.rate(gain)} energy/s, no extra room.
        <span className="mt-1 block">
          Cost: <span className={energyShort ? 'text-red-400' : ''}>{fmt.num(costEnergy)} energy</span>{' '}
          <CostList cost={resources} have={have} />
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
  // Stable row handlers (0.42): rows are memoized, so a game tick only re-renders the
  // rows whose numbers changed. They read the latest drag state through a ref.
  const dragRef = useRef(dragId);
  dragRef.current = dragId;
  const handlers = useMemo<RowHandlers>(
    () => ({
      move,
      toggle,
      setDragId,
      dragId: () => dragRef.current,
      confirm: (id) => setConfirming(id),
      scrap: (id) => {
        scrap(id);
        setConfirming(null);
      },
    }),
    [move, toggle, scrap],
  );
  return (
    <section aria-label="Your generators" className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="panel-title">Your generators ({generators.length})</h2>
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
            return (
              <GeneratorRow
                key={g.id}
                g={g}
                i={i}
                count={generators.length}
                name={`${GENERATORS[g.type].name} #${g.id.split('-')[1] ?? i + 1}`}
                custom={custom}
                dragging={dragId === g.id}
                output={getGeneratorOutput(g, bonuses, placeMods)}
                placement={placeMods.placement[g.id] ?? 0}
                refund={confirming === g.id ? generatorScrapRefund(g, getBonuses(completed)) : null}
                h={handlers}
              />
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Row actions that never change identity (0.42). */
interface RowHandlers {
  move: (id: string, to: number) => void;
  toggle: (id: string) => void;
  setDragId: (id: string | null) => void;
  dragId: () => string | null;
  confirm: (id: string | null) => void;
  scrap: (id: string) => void;
}

/** One row of "Your generators". Memoized (0.42): a tick re-renders it only when its own numbers change. */
const GeneratorRow = memo(function GeneratorRow({
  g,
  i,
  count,
  name,
  custom,
  dragging,
  output,
  placement,
  refund,
  h,
}: {
  g: Generator;
  i: number;
  count: number;
  name: string;
  custom: boolean;
  dragging: boolean;
  output: number;
  placement: number;
  /** What scrapping gives back, while the scrap confirmation is open. */
  refund: ReturnType<typeof generatorScrapRefund> | null;
  h: RowHandlers;
}) {
  const fmt = useNumberFormat();
  const def = GENERATORS[g.type];
  const status = statusOf(g);
  return (
    <li
      key={g.id}
      className={`appear rounded-lg bg-slate-800 p-2 ${dragging ? 'opacity-50' : ''}`}
      data-testid={`generator-${g.id}`}
      draggable={custom}
      onDragStart={(e) => {
        h.setDragId(g.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => h.setDragId(null)}
      onDragOver={(e) => {
        if (h.dragId()) e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        const dragId = h.dragId();
        if (dragId && dragId !== g.id) h.move(dragId, i);
        h.setDragId(null);
      }}
    >
      {/* On narrow screens the buttons wrap under the name (0.41). */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <div className={`flex flex-col ${custom ? '' : 'hidden'}`}>
        <button
          type="button"
          disabled={i === 0}
          onClick={(e) => h.move(g.id, e.shiftKey ? 0 : i - 1)}
          aria-label={`Move ${name} up`}
          title="Move up (Shift: to top)"
          className="h-6 w-8 rounded text-xs text-slate-400 hover:bg-slate-700 hover:text-white disabled:opacity-30"
        >
          ▲
        </button>
        <button
          type="button"
          disabled={i === count - 1}
          onClick={(e) => h.move(g.id, e.shiftKey ? count - 1 : i + 1)}
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
      <div className="min-w-40 flex-1">
        <div className="font-medium">
          {name}{' '}
          <span className="text-xs font-normal text-amber-300" data-testid={`level-${g.id}`}>
            Lv {g.level}
            {g.level >= maxLevel(g.type) ? ' (max)' : `/${maxLevel(g.type)}`}
          </span>
        </div>
        <div className="text-xs">
          <span className={status.className}>{status.text}</span>
          <span className="text-slate-400"> · +{fmt.rate(output)} energy/s · {def.roomCost} room</span>
          {placement ? (
            <FloatingTip
              className="text-emerald-300"
              testId={`pin-${g.id}`}
              text={`${zoneTipText(g.type, placement)} Move machines in the Map tab.`}
            >
              {' '}· 📍 +{Math.round(placement * 100)}%
            </FloatingTip>
          ) : null}
        </div>
        {g.level < maxLevel(g.type) && (
          <UpgradeButton generatorId={g.id} name={name} />
        )}
      </div>
      <div className="ml-auto flex items-center gap-2">
      <button
        type="button"
        onClick={() => h.toggle(g.id)}
        aria-pressed={g.isActive}
        aria-label={`${g.isActive ? 'Turn off' : 'Turn on'} ${name}`}
        className={`min-h-11 min-w-16 rounded px-3 py-2 text-sm font-semibold ${g.isActive ? 'bg-slate-600 hover:bg-slate-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
      >
        {g.isActive ? 'Turn off' : 'Turn on'}
      </button>
      {!refund && (
        <ScrapButton id={g.id} name={name} what="generator" onClick={() => h.confirm(g.id)} />
      )}
      </div>
      </div>
      {refund && (
        <ScrapConfirm
          name={name}
          what="generator"
          refund={refund}
          onConfirm={() => h.scrap(g.id)}
          onCancel={() => h.confirm(null)}
        />
      )}
    </li>
  );
});
