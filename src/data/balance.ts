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

/**
 * Harder middle and late game (1.87, owner playtest 26: level 73, every room
 * expansion and 80% completion in under two weeks). The first hours (first
 * generator to first Natural Gas Plant) are untouched.
 */
/** Research needing at least this research level is middle or late game. */
export const MID_RESEARCH_LEVEL = 9;
/** Middle and late research: energy cost multiplied by this. */
export const MID_RESEARCH_COST_FACTOR = 6;
/** Middle and late research: duration multiplied by this (on top of RESEARCH_TIME_FACTOR). */
export const MID_RESEARCH_TIME_FACTOR = 5;
/** Room expansions from this tier on are middle or late game. */
export const LATE_ROOM_TIER = 8;
/** Those expansions: energy cost multiplied by this (on top of ROOM_ENERGY_FACTOR). */
export const LATE_ROOM_ENERGY_FACTOR = 10;

/** A cost with its metal and stone multiplied by MATERIAL_COST_FACTOR (rounded); other resources unchanged. */
export function scaleMaterials(cost: ResourceAmounts): ResourceAmounts {
  const out: ResourceAmounts = { ...cost };
  for (const id of ['metal', 'stone'] as const) {
    if (out[id] !== undefined) out[id] = Math.round(out[id]! * MATERIAL_COST_FACTOR);
  }
  return out;
}
