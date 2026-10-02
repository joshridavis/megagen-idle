import type { ResourceId } from '../types/state';

/**
 * Grid Contracts (0.86, playtest 10): a second activity. Timed delivery orders
 * that scale with the player's output; finishing one gives a reward of the
 * player's choice. All numbers here; tuned with the balance simulator.
 */
/** Contracts unlock at this research level. */
export const CONTRACTS_UNLOCK_LEVEL = 3;
/** Contracts open at once before perks. */
export const BASE_CONTRACT_SLOTS = 3;
/** A new offer fills an empty slot this often (minutes, real time, offline too). */
export const OFFER_INTERVAL_MINUTES = 30;

export type ContractKind = 'energy' | 'resources' | 'produce';

/** How each kind is sized: a number of minutes (or hours) of current output, a minimum, and a deadline. */
export const CONTRACT_KINDS: Record<ContractKind, { minMinutes: number; maxMinutes: number; min: number; deadlineHours: number }> = {
  /** Deliver energy: 20-60 minutes of energy/s. */
  energy: { minMinutes: 20, maxMinutes: 60, min: 500, deadlineHours: 2 },
  /** Deliver two resources: 30-90 minutes of their production each. */
  resources: { minMinutes: 30, maxMinutes: 90, min: 40, deadlineHours: 3 },
  /** Produce energy (lifetime total) within the deadline: 30-90 minutes of energy/s. */
  produce: { minMinutes: 30, maxMinutes: 90, min: 1000, deadlineHours: 4 },
};

/** Resources a delivery contract may ask for (only ones the player produces). */
export const CONTRACT_RESOURCES: ResourceId[] = ['metal', 'stone', 'coal', 'naturalGas', 'oil'];

/** Reward choices. The bundle is minutes of metal, stone and coal production; the boost is a timed energy effect. */
export const REWARDS = {
  bundleMinutes: 45,
  bundleMin: 50,
  /** Uses the 'contract_boost' timed effect in src/data/events.ts. */
  boostEventId: 'contract_boost',
  /** Contract Points by size tier (1-3). */
  pointsByTier: [1, 2, 3],
};

export type PerkId = 'slot' | 'deadline' | 'rewards' | 'offers';

/** Permanent perks bought with Contract Points. Each level costs the next price. */
export const PERKS: Record<PerkId, { name: string; description: string; costs: number[] }> = {
  slot: { name: 'Extra contract slot', description: 'One more contract open at a time.', costs: [5, 15] },
  deadline: { name: 'Patient customers', description: 'Deadlines are 50% longer.', costs: [10] },
  rewards: { name: 'Better terms', description: 'Bundles and boosts are 25% bigger.', costs: [10] },
  offers: { name: 'Busy grid', description: 'New offers arrive every 20 minutes instead of 30.', costs: [8] },
};
export const PERK_IDS = Object.keys(PERKS) as PerkId[];

/** Completion milestones for contracts done (0.86). */
export const CONTRACT_MILESTONES = [10, 50, 100, 200];
