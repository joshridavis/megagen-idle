import type { ResourceAmounts } from '../types/resource';
import { ROOM_ENERGY_FACTOR, scaleMaterials } from './balance';

export interface RoomTier {
  tier: number;
  /** Room added by this expansion. */
  capacity: number;
  energy: number;
  resources: ResourceAmounts;
}

/**
 * Room every save starts with. Producers take room since 0.31; the three
 * starting producers use 3, leaving the same 10 for generators as before.
 */
export const BASE_ROOM_CAPACITY = 13;

/** Share of room used at which the panel warns (0.9 = 90%). */
export const ROOM_WARNING_RATIO = 0.9;

/** Length of the construction animation after an expansion (ms): fade in, then out. */
export const EXPANSION_ANIMATION_MS = 2000;

/** Expansions, bought in order. */
const ROOM_TIER_DEFS: RoomTier[] = [
  { tier: 1, capacity: 10, energy: 500, resources: { metal: 50, stone: 20 } },
  { tier: 2, capacity: 15, energy: 2000, resources: { metal: 150, stone: 80 } },
  { tier: 3, capacity: 25, energy: 8000, resources: { metal: 400, stone: 200 } },
  // Playtest 7: more tiers (finite). First guesses, tuned by the balance simulator (0.35).
  { tier: 4, capacity: 35, energy: 30_000, resources: { metal: 1000, stone: 500 } },
  { tier: 5, capacity: 50, energy: 100_000, resources: { metal: 2500, stone: 1200, coal: 100 } },
  { tier: 6, capacity: 70, energy: 350_000, resources: { metal: 3000, stone: 1500, coal: 150 } },
  { tier: 7, capacity: 100, energy: 1_200_000, resources: { metal: 5000, stone: 2500, coal: 300 } },
  { tier: 8, capacity: 140, energy: 4_000_000, resources: { metal: 10_000, stone: 5000, coal: 600, naturalGas: 50 } },
  // 0.34: room for the fictional generators (fusion 16, supernova 25). First guesses, tuned by the simulator.
  { tier: 9, capacity: 180, energy: 20_000_000, resources: { metal: 25_000, stone: 12_000, uranium: 40 } },
  { tier: 10, capacity: 240, energy: 80_000_000, resources: { metal: 50_000, stone: 25_000, uranium: 100, deuterium: 30 } },
];

/** The expansions, slightly harder (playtest 19.3): energy x ROOM_ENERGY_FACTOR, metal and stone x MATERIAL_COST_FACTOR. */
export const ROOM_TIERS: RoomTier[] = ROOM_TIER_DEFS.map((t) => ({
  ...t,
  energy: Math.round(t.energy * ROOM_ENERGY_FACTOR),
  resources: scaleMaterials(t.resources),
}));
