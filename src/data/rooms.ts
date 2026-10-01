import type { ResourceAmounts } from '../types/resource';

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
export const ROOM_TIERS: RoomTier[] = [
  { tier: 1, capacity: 10, energy: 500, resources: { metal: 50, stone: 20 } },
  { tier: 2, capacity: 15, energy: 2000, resources: { metal: 150, stone: 80 } },
  { tier: 3, capacity: 25, energy: 8000, resources: { metal: 400, stone: 200 } },
];
