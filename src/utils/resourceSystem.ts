import { GENERATORS } from '../data/generators';
import { PRODUCERS, PRODUCER_IDS } from '../data/producers';
import type { Generator } from '../types/generator';
import type { ProducerId, ResourceAmounts } from '../types/resource';
import type { ResourceId, Resources } from '../types/state';

const entries = (amounts: ResourceAmounts) =>
  Object.entries(amounts).filter(([, n]) => (n ?? 0) > 0) as [ResourceId, number][];

/** True if every resource in `cost` is available. */
export function canAfford(resources: Resources, cost: ResourceAmounts): boolean {
  return entries(cost).every(([id, n]) => resources[id] >= n);
}

/** Adds `amount` of one resource. Negative amounts are ignored. */
export function gatherResource(resources: Resources, id: ResourceId, amount: number): Resources {
  if (!(amount > 0)) return resources;
  return { ...resources, [id]: resources[id] + amount };
}

/** Deducts `cost` if affordable. On failure resources are returned unchanged. */
export function consumeResource(
  resources: Resources,
  cost: ResourceAmounts,
): { success: boolean; resources: Resources } {
  if (!canAfford(resources, cost)) return { success: false, resources };
  const next = { ...resources };
  for (const [id, n] of entries(cost)) next[id] -= n;
  return { success: true, resources: next };
}

/** Per-second production of each resource from producers. */
export function getProductionRates(producers: Record<ProducerId, number>): Resources {
  const rates: Resources = { coal: 0, stone: 0, metal: 0, naturalGas: 0 };
  for (const id of PRODUCER_IDS) {
    const def = PRODUCERS[id];
    rates[def.resource] += ((producers[id] ?? 0) * def.amount) / def.intervalSeconds;
  }
  return rates;
}

/** Per-second fuel use of active generators. */
export function getFuelUseRates(generators: Generator[]): Resources {
  const rates: Resources = { coal: 0, stone: 0, metal: 0, naturalGas: 0 };
  for (const g of generators) {
    const upkeep = GENERATORS[g.type]?.maintenanceCost;
    if (!g.isActive || !upkeep) continue;
    for (const [id, perHour] of entries(upkeep)) rates[id] += perHour / 3600;
  }
  return rates;
}

/** Resources after producers run for `seconds`. */
export function accrueResources(
  resources: Resources,
  producers: Record<ProducerId, number>,
  seconds: number,
): Resources {
  if (!(seconds > 0)) return resources;
  const rates = getProductionRates(producers);
  const next = { ...resources };
  for (const id of Object.keys(rates) as ResourceId[]) next[id] += rates[id] * seconds;
  return next;
}

export interface FuelResult {
  resources: Resources;
  generators: Generator[];
  /** Resources that ran out during this step (each listed once). */
  depleted: ResourceId[];
  /** IDs of generators switched off for lack of fuel. */
  deactivated: string[];
}

/**
 * Burns fuel for active generators over `seconds`, in build order. A generator
 * whose fuel is not fully available for the step is switched off and flagged
 * `outOfFuel`; it burns nothing for that step.
 */
export function burnFuel(resources: Resources, generators: Generator[], seconds: number): FuelResult {
  let res = resources;
  const depleted = new Set<ResourceId>();
  const deactivated: string[] = [];
  if (!(seconds > 0)) return { resources, generators, depleted: [], deactivated };
  const next = generators.map((g) => {
    const upkeep = GENERATORS[g.type]?.maintenanceCost;
    if (!g.isActive || !upkeep) return g;
    const need: ResourceAmounts = {};
    for (const [id, perHour] of entries(upkeep)) need[id] = (perHour / 3600) * seconds;
    const r = consumeResource(res, need);
    if (r.success) {
      res = r.resources;
      return g;
    }
    for (const [id, n] of entries(need)) if (res[id] < n) depleted.add(id);
    deactivated.push(g.id);
    return { ...g, isActive: false, outOfFuel: true };
  });
  return { resources: res, generators: deactivated.length ? next : generators, depleted: [...depleted], deactivated };
}
