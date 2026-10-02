import { EVENTS_BY_ID } from '../data/events';
import type { GeneratorType } from '../types/generator';
import type { ResourceId } from '../types/state';

/** A timed event effect in progress (saved). */
export interface ActiveEffect {
  id: string;
  /** Epoch ms when it ends. */
  until: number;
}

/** Combined changes from timed effects, as fractions added to output. */
export interface EffectMods {
  allEnergy: number;
  generator: Partial<Record<GeneratorType, number>>;
  allProduction: number;
  resource: Partial<Record<ResourceId, number>>;
  /** Per generator id: bonus from where it stands on the site map (1.05). */
  placement?: Record<string, number>;
}

export const NO_MODS: EffectMods = { allEnergy: 0, generator: {}, allProduction: 0, resource: {} };

/** Sums the timed effects still running at `now` (all of them if `now` is omitted). */
export function getEffectMods(active: ActiveEffect[] | undefined, now?: number): EffectMods {
  const mods: EffectMods = { allEnergy: 0, generator: {}, allProduction: 0, resource: {} };
  for (const a of active ?? []) {
    if (now !== undefined && a.until <= now) continue;
    const e = EVENTS_BY_ID[a.id]?.effect;
    if (e?.kind !== 'timed') continue;
    if (e.energy) {
      if (e.generator) mods.generator[e.generator] = (mods.generator[e.generator] ?? 0) + e.energy;
      else mods.allEnergy += e.energy;
    }
    if (e.production) {
      if (e.resource) mods.resource[e.resource] = (mods.resource[e.resource] ?? 0) + e.production;
      else mods.allProduction += e.production;
    }
  }
  return mods;
}

/** Drops effects that have ended by `now`; returns the same array if none did. */
export function expireEffects(active: ActiveEffect[] | undefined, now: number): ActiveEffect[] {
  const list = active ?? [];
  return list.some((a) => a.until <= now) ? list.filter((a) => a.until > now) : list;
}

