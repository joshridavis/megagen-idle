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

/**
 * Permanent perks bought with Contract Points. Each level costs the next
 * price; prices climb steeply so maxing every perk is a long goal (playtest
 * 19: about 600 points in all, it was 48).
 */
export const PERKS: Record<PerkId, { name: string; description: string; costs: number[] }> = {
  slot: { name: 'Extra contract slot', description: 'One more contract open at a time per level.', costs: [10, 30, 80] },
  deadline: { name: 'Patient customers', description: 'Deadlines are 25% longer per level.', costs: [12, 35, 80] },
  rewards: { name: 'Better terms', description: 'Bundles and boosts are 15% bigger per level.', costs: [12, 30, 60, 120] },
  offers: { name: 'Busy grid', description: 'New offers arrive 5 minutes sooner per level (30 minutes at first).', costs: [10, 35, 90] },
};
/**
 * Player level needed for each perk level: the 1st level of any perk needs player level 10, the 2nd 30,
 * the 3rd 55 and the 4th 75 (owner, playtest 22: a hard requirement, 1.61).
 */
export const PERK_PLAYER_LEVELS = [10, 30, 55, 75];
/** What each perk level adds. */
export const PERK_STEP = { deadline: 0.25, rewards: 0.15, offerMinutes: 5 };
export const PERK_IDS = Object.keys(PERKS) as PerkId[];

/** Completion milestones for contracts done (0.86). */
export const CONTRACT_MILESTONES = [10, 50, 100, 200];
