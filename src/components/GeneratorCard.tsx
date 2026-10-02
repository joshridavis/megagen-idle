import { sprites } from '../assets';
import { GENERATORS } from '../data/generators';
import { ZONES } from '../data/map';
import { zoneFor } from '../utils/mapTerrain';
import { useStore } from '../store';
import type { Bonuses } from '../types/bonus';
import type { GeneratorType } from '../types/generator';
import { getGeneratorStats, type BuildBlock } from '../utils/generatorSystem';
import { findUnlockingResearch } from '../utils/researchSystem';
import CostList, { FUEL_CLASS } from './CostList';
import { GENERATOR_SPRITES } from './generatorSprites';
import { useNumberFormat } from './useNumberFormat';

const BLOCK_TEXT: Record<BuildBlock, string> = {
  locked: 'Locked',
  level: 'Research level too low',
  resources: 'Not enough resources',
  energy: 'Not enough energy',
  room: 'Not enough room',
  site: 'No free spot in its zone',
};

export default function GeneratorCard({
  type,
  block,
  bonuses,
}: {
  type: GeneratorType;
  block: BuildBlock | null;
  bonuses: Bonuses;
}) {
  const resources = useStore((s) => s.resources);
  const energy = useStore((s) => s.energy);
  const build = useStore((s) => s.buildGenerator);
  const def = GENERATORS[type];
  const fmt = useNumberFormat();
  const stats = getGeneratorStats(type, bonuses);
  const unlockedBy = findUnlockingResearch(type);
  const locked = block === 'locked' || block === 'level';
  const level = useStore((s) => s.researchLevel);
  const tooltipId = `gen-tip-${type}`;
  const zoneId = zoneFor(type);
  const zone = zoneId ? ZONES[zoneId] : null;

  return (
    <article
      className={`group relative flex flex-col rounded-lg border p-3 hover:z-40 focus-within:z-40 ${locked ? 'border-slate-700 bg-slate-800/50' : 'border-slate-600 bg-slate-800'}`}
      data-testid={`generator-card-${type}`}
    >
      {/* Fade the content, not the card, so the tooltip stays fully opaque (0.80). */}
      <div className={`flex flex-1 flex-col gap-2 ${locked ? 'opacity-60' : ''}`} data-testid={`generator-card-body-${type}`}>
      <div className="flex items-center gap-3">
        <img
          src={sprites[locked ? GENERATOR_SPRITES[type].inactive : GENERATOR_SPRITES[type].active]}
          alt=""
          className="pixelated h-16 w-16 object-contain"
        />
        <div>
          <h3 className="font-semibold">{def.name}</h3>
          <div className="text-sm text-yellow-300">+{fmt.rate(stats.energyPerSecond)} energy/s</div>
          <div className="text-xs text-slate-400">{stats.roomCost} room</div>
        </div>
      </div>
      <div className="text-sm">
        <span className="text-slate-400">Cost: </span>
        <span className="inline-flex flex-wrap gap-x-2 gap-y-1">
          <span className={`inline-flex items-center gap-1 ${energy < stats.energyCost ? 'text-red-400' : ''}`} data-testid={`energy-cost-${type}`}>
            <img src={sprites.energy_icon} alt="" width={16} height={16} className="pixelated" />
            {fmt.num(stats.energyCost)} energy
          </span>
          <CostList cost={stats.buildCost} have={resources} />
        </span>
      </div>
      {def.maintenanceCost && (
        <div className="text-sm" data-testid={`fuel-${type}`}>
          <span className={FUEL_CLASS}>🔥 Burns: </span>
          <CostList cost={def.maintenanceCost} suffix="/h" className={FUEL_CLASS} />
        </div>
      )}
      {zone && (
        <div className={`text-xs ${block === 'site' ? 'text-red-400' : 'text-emerald-300'}`} data-testid={`zone-${type}`}>
          {zone.required ? `Must be built on the ${zone.name.toLowerCase()}` : `+${Math.round(zone.bonus * 100)}% on a ${zone.name.toLowerCase()}`} (Map tab)
        </div>
      )}
      {block === 'locked' && unlockedBy && (
        <div className="text-xs text-sky-300">Needs research: {unlockedBy.name}</div>
      )}
      {def.requiredLevel > 1 && (
        <div className={`text-xs ${level >= def.requiredLevel ? 'text-slate-400' : 'text-sky-300'}`} data-testid={`level-req-${type}`}>
          Requires research level {def.requiredLevel} (you have {level})
        </div>
      )}
      <button
        type="button"
        disabled={block !== null}
        onClick={() => build(type)}
        data-tutorial={`build-${type}`}
        aria-describedby={tooltipId}
        className="mt-auto min-h-11 rounded bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        {block === 'site' && zone ? `No free spot on the ${zone.name.toLowerCase()}` : block ? BLOCK_TEXT[block] : `Build ${def.name}`}
      </button>
      </div>
      <div
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-56 -translate-x-1/2 rounded border border-slate-600 bg-slate-950 p-2 text-xs text-slate-100 shadow-xl group-hover:block group-has-focus-visible:block"
      >
        {def.description} {(stats.energyPerSecond / stats.roomCost).toFixed(2)} energy/s per room.
      </div>
    </article>
  );
}
