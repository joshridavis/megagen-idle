import type { ResourceAmounts } from '../types/resource';

/**
 * Global tuning knobs (playtest 19.3), applied where the data is defined so
 * the numbers in each data file stay as written and one change rebalances them all.
 */

/** Metal and stone were piling up: every metal and stone cost (builds, upgrades, producers, research, room) is multiplied by this. */
export const MATERIAL_COST_FACTOR = 2;
/** Research felt too short: every research takes this much longer than the duration written in research.ts. */
export const RESEARCH_TIME_FACTOR = 1.25;
/** Room expansions should be slightly harder: their energy cost is multiplied by this (materials also get MATERIAL_COST_FACTOR). */
export const ROOM_ENERGY_FACTOR = 1.2;

/** A cost with its metal and stone multiplied by MATERIAL_COST_FACTOR (rounded); other resources unchanged. */
export function scaleMaterials(cost: ResourceAmounts): ResourceAmounts {
  const out: ResourceAmounts = { ...cost };
  for (const id of ['metal', 'stone'] as const) {
    if (out[id] !== undefined) out[id] = Math.round(out[id]! * MATERIAL_COST_FACTOR);
  }
  return out;
}
