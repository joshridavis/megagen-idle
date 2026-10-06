import { GENERATORS } from '../data/generators';
import { ZONES, type Zone } from '../data/map';
import { PRODUCERS } from '../data/producers';
import { RESOURCE_NAMES } from '../data/resources';
import type { GeneratorType } from '../types/generator';
import type { ProducerId } from '../types/resource';
import type { GameState, ResourceId } from '../types/state';
import { getBonuses, getEnergyBonuses } from './bonuses';
import { getResourceBreakdown } from './breakdown';
import { getEffectMods } from './effectMods';
import { getGeneratorOutput } from './energyGeneration';
import { maxLevel } from './generatorSystem';
import { zoneFor, zoneRequiredFor } from './mapTerrain';
import { getPlacementBonuses, type Placed } from './siteMap';

export interface TipFormat {
  /** Energy per second, for example "1.25". */
  rate: (perSecond: number) => string;
  /** An amount per second shown in the unit that reads best, for example "12/h". */
  ratePer: (perSecond: number) => string;
}

export interface MachineTip {
  title: string;
  /** Whether it makes energy or a resource (owner, playtest 25: say so briefly and clearly). */
  kind: 'Generator' | 'Producer';
  lines: string[];
  /** A line to show in red: off, or on the wrong land. */
  warning?: string;
}

const pct = (b: number) => `+${Math.round(b * 100)}%`;

/** Zone line: its bonus here, or the zone it needs / would like. */
function zoneLine(p: Placed): { line?: string; warning?: string } {
  const zone = zoneFor(p.type) as Zone | null;
  if (!zone) return {};
  const name = ZONES[zone].name.toLowerCase();
  if (p.misplaced) return { warning: `Needs the ${name} to run` };
  if (p.zoneBonus > 0) return { line: `${pct(p.zoneBonus)} on the ${name} ⭐` };
  return { line: zoneRequiredFor(p.type) ? `Built on the ${name}` : `${pct(ZONES[zone].bonus)} if moved onto the ${name}` };
}

/**
 * What the tooltip beside a machine on the map says (1.63): name and number, output, fuel,
 * level and its zone bonus. A producer shows what one of them makes, with its own map bonus.
 * Each says briefly whether it is a generator (makes energy) or a producer (makes a resource).
 */
export function machineTip(state: GameState, p: Placed, fmt: TipFormat): MachineTip {
  const zone = zoneLine(p);
  if (p.kind === 'generator') {
    const g = state.activeGenerators.find((x) => x.id === p.id);
    const def = GENERATORS[p.type as GeneratorType];
    const title = `${def.name} #${p.id.split('-')[1]}`;
    if (!g) return { title, kind: 'Generator', lines: [] };
    const mods = { ...getEffectMods(state.activeEffects), placement: getPlacementBonuses(state) };
    const lines: string[] = [];
    if (g.isActive) lines.push(`+${fmt.rate(getGeneratorOutput(g, getEnergyBonuses(state), mods))} energy/s`);
    if (def.maintenanceCost) {
      const eff = getBonuses(state.completedResearch).fuelEfficiency;
      const burns = Object.entries(def.maintenanceCost)
        .map(([r, perHour]) => `${fmt.ratePer(((perHour ?? 0) / 3600) * (1 - eff))} ${RESOURCE_NAMES[r as ResourceId].toLowerCase()}`)
        .join(', ');
      lines.push(`🔥 Burns ${burns}`);
    }
    lines.push(`Level ${g.level} of ${maxLevel(g.type)} · ${p.cells.length} tiles`);
    if (zone.line) lines.push(zone.line);
    const warning = zone.warning ?? (g.isActive ? undefined : g.outOfFuel ? 'Off: out of fuel' : 'Switched off');
    return { title, kind: 'Generator', lines, ...(warning ? { warning } : {}) };
  }
  const id = p.id as ProducerId;
  const def = PRODUCERS[id];
  const owned = state.producers[id] ?? 0;
  // one producer's share of the resource: research, events and pet boosts, plus its own map bonus
  const b = getResourceBreakdown({ ...state }, def.resource);
  const boosts = b.modifiers.filter((m) => m.amount > 0 && m.source !== 'Placement on the map').reduce((sum, m) => sum + (m.percent ?? 0), 0);
  const each = owned > 0 ? (b.base / owned) * (1 + boosts + p.zoneBonus) : 0;
  const lines = [`+${fmt.ratePer(each)} ${RESOURCE_NAMES[def.resource].toLowerCase()}`, `${p.cells.length} tile${p.cells.length > 1 ? 's' : ''} · you have ${owned}`];
  if (zone.line) lines.push(zone.line);
  return { title: def.name, kind: 'Producer', lines, ...(zone.warning ? { warning: zone.warning } : {}) };
}
