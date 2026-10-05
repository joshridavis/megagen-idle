import { useState } from 'react';
import { sprites, type SpriteId } from '../assets';
import { GENERATORS } from '../data/generators';
import { ZONES, type Zone } from '../data/map';
import { PRODUCERS } from '../data/producers';
import type { GeneratorType } from '../types/generator';
import type { ProducerId } from '../types/resource';
import FloatingTip from './FloatingTip';
import { GENERATOR_SPRITES } from './generatorSprites';
import { PRODUCER_SPRITES } from './producerSprites';

/** Map legend order: the early zones first. */
export const LEGEND_ZONES: Zone[] = ['plateau', 'ridge', 'river', 'coast', 'coalfield', 'outcrop', 'oilfield', 'lake', 'exclusion'];

export const ZONE_SPRITE: Record<Zone, SpriteId> = {
  plateau: 'tile_plateau',
  ridge: 'tile_ridge',
  river: 'tile_river',
  coast: 'tile_coast',
  coalfield: 'tile_coalfield',
  outcrop: 'tile_outcrop',
  oilfield: 'tile_oilfield',
  lake: 'tile_lake',
  exclusion: 'tile_exclusion',
};

const isGenerator = (t: string): t is GeneratorType => t in GENERATORS;
const machineName = (t: string) => (isGenerator(t) ? GENERATORS[t].name : PRODUCERS[t as ProducerId].name);
const machineSprite = (t: string): SpriteId => (isGenerator(t) ? GENERATOR_SPRITES[t].active : PRODUCER_SPRITES[t as ProducerId]);
const pctBonus = (b: number) => `+${Math.round(b * 100)}%`;

/** Remembers "Show all zones", on this device only (1.39). */
const ALL_KEY = 'megagen-idle-legend-all';
const readAll = () => {
  try {
    return localStorage.getItem(ALL_KEY) === '1';
  } catch {
    return false;
  }
};
const writeAll = (all: boolean) => {
  try {
    localStorage.setItem(ALL_KEY, all ? '1' : '0');
  } catch {
    // storage blocked: the toggle still works, it just forgets
  }
};

function MachineIcons({ types, label }: { types: string[]; label: string }) {
  return (
    <span className="flex flex-wrap items-center gap-0.5" aria-label={`${label}: ${types.map(machineName).join(', ')}`} role="img">
      {types.map((t) => (
        <img key={t} src={sprites[machineSprite(t)]} alt="" title={machineName(t)} width={18} height={18} className="pixelated" data-machine={t} />
      ))}
    </span>
  );
}

/**
 * The map legend (1.39): one compact row per zone with its tile, name, bonus
 * and the machines it suits as small icons. The full description is in each
 * row's tooltip. Only zones on the site show until "Show all zones" is on.
 * Hovering, focusing or tapping a row highlights that zone on the map.
 */
export default function MapLegend({
  onSite,
  highlight,
  onHighlight,
}: {
  /** Zones with at least one tile inside the site. */
  onSite: Set<Zone>;
  highlight: Zone | null;
  onHighlight: (zone: Zone | null) => void;
}) {
  const [all, setAll] = useState(readAll);
  const hidden = LEGEND_ZONES.filter((z) => !onSite.has(z)).length;
  const shown = all ? LEGEND_ZONES : LEGEND_ZONES.filter((z) => onSite.has(z));
  const toggle = () => {
    setAll(!all);
    writeAll(!all);
  };
  return (
    <div className="flex flex-col gap-1 text-xs text-slate-300" data-testid="map-legend">
      <ul className="grid grid-cols-1 gap-y-1" aria-label="Map legend">
        {shown.map((z) => {
          const def = ZONES[z];
          const own = [...def.generators, ...(def.producers ?? [])];
          return (
            <li
              key={z}
              className={`flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 rounded px-1 py-0.5 ${highlight === z ? 'bg-amber-300/15 ring-1 ring-amber-300/60' : ''}`}
              data-testid={`legend-${z}`}
              data-site={onSite.has(z) || undefined}
              onMouseEnter={() => onHighlight(z)}
              onMouseLeave={() => onHighlight(null)}
              onFocus={() => onHighlight(z)}
              onBlur={() => onHighlight(null)}
              onClick={() => onHighlight(z)}
            >
              <FloatingTip text={`${def.name}: ${def.description}`} className="flex items-center gap-1" testId={`legend-tip-${z}`}>
                <img src={sprites[ZONE_SPRITE[z]]} alt="" width={14} height={14} className="pixelated" />
                <span className="font-semibold text-slate-200">{def.name}</span>
                <span className="text-emerald-300">{pctBonus(def.bonus)}</span>
                {def.required && <span className="rounded bg-slate-700 px-1 text-[10px] uppercase text-amber-200">only here</span>}
              </FloatingTip>
              <MachineIcons types={own} label={def.required ? 'Only here' : 'Suits'} />
              {def.visitors && (
                <span className="flex items-center gap-1 text-slate-400">
                  also
                  <MachineIcons types={def.visitors} label="Also suits" />
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400">
        <span>⭐ = on its bonus zone (the whole machine) · plain land: no bonus</span>
        {hidden > 0 && (
          <button type="button" className="rounded bg-slate-700 px-2 py-0.5 text-slate-200 hover:bg-slate-600" aria-pressed={all} onClick={toggle} data-testid="legend-toggle">
            {all ? 'Only zones on your site' : `Show all zones (${hidden} more)`}
          </button>
        )}
      </div>
    </div>
  );
}
