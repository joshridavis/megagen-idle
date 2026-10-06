import { GeneratorType } from '../types/generator';
import type { ResourceId } from '../types/state';
import { MATERIAL_COST_FACTOR } from './balance';

/**
 * Energy pets (0.92, playtest 11): a light collection activity. Pets fit the
 * energy theme. Each is found one way, grows baby -> young -> adult by being
 * fed and then waiting (real time, offline too), and gives a themed bonus
 * while it is the active pet. All numbers here.
 */
export type PetId =
  | 'hamster'
  | 'firefly'
  | 'eel'
  | 'robodog'
  | 'cat'
  | 'jellyfish'
  | 'beetle'
  | 'tortoise'
  | 'mole'
  | 'toad'
  | 'mouse'
  | 'pigeon'
  | 'owl'
  | 'axolotl';

export type PetFind =
  | { kind: 'level'; level: number }
  | { kind: 'build'; generator: GeneratorType }
  | { kind: 'research'; id: string }
  | { kind: 'contracts'; count: number }
  /** Found through a rare random event (see src/data/events.ts). */
  | { kind: 'event'; eventId: string };

export type PetBonus =
  /** More energy from these generator types. */
  | { kind: 'generator'; generators: GeneratorType[] }
  /** More production: one resource, or all. */
  | { kind: 'production'; resource?: ResourceId }
  /** More energy from all generators. */
  | { kind: 'energy' }
  /** More energy per click. */
  | { kind: 'click' }
  /** Faster research (1.56): research takes less time. */
  | { kind: 'research' }
  /** Bigger contract rewards (1.56): bundles and boosts, like the Rewards perk. */
  | { kind: 'contracts' };

export interface PetDef {
  id: PetId;
  name: string;
  description: string;
  find: PetFind;
  /** How to find it, shown while it is still a silhouette. */
  hint: string;
  bonus: PetBonus;
  /** Bonus at baby, young and adult stage (fractions): the adult value × PET_STAGE_MULTIPLIERS ÷ 4 (1.57). */
  bonusByStage: [number, number, number];
  /** What feeding uses: energy or a resource. */
  food: ResourceId | 'energy';
  /** Food to grow to young and to adult. */
  feedCost: [number, number];
}

export const PET_STAGES = ['Baby', 'Young', 'Adult'] as const;
/** How long a pet's reaction plays when clicked (0.99, ms). */
export const PET_REACT_MS = 2500;
/** Particles a pet shows when clicked. */
export const PET_PARTICLES: Record<PetId, string> = {
  hamster: '❤',
  firefly: '✦',
  tortoise: '☀',
  eel: '⚡',
  robodog: '⚙',
  cat: '⚡',
  beetle: '✧',
  jellyfish: '✦',
  mole: '◆',
  toad: '○',
  mouse: '✎',
  pigeon: '✉',
  owl: '☁',
  axolotl: '☢',
};
/**
 * Bonus by stage as a share of the adult bonus (1.57, owner request playtest
 * 22): Baby 1×, Young 2×, Adult 4× of a base value, so growing a pet clearly
 * pays off.
 */
export const PET_STAGE_MULTIPLIERS: [number, number, number] = [1, 2, 4];
/** Bonus by stage from the adult bonus. */
const stages = (adult: number): [number, number, number] => PET_STAGE_MULTIPLIERS.map((m) => (adult * m) / 4) as [number, number, number];

/**
 * Extra active pet slots (1.59, owner request playtest 22): the 2nd and 3rd
 * slot, bought with energy only and gated by player level. Very expensive,
 * since the bonuses stack.
 */
export const PET_SLOT_UPGRADES: { energy: number; playerLevel: number }[] = [
  { energy: 100_000_000, playerLevel: 45 },
  { energy: 1_000_000_000, playerLevel: 80 },
];
/** Most active pets at once. */
export const MAX_PET_SLOTS = 1 + PET_SLOT_UPGRADES.length;

/**
 * Active pets walking along the bottom of the screen (1.60, owner request
 * playtest 22). One timer moves every pet; walks are CSS transitions.
 */
export const PET_WALK = {
  /** How often the walkers decide what to do next (ms). */
  tickMs: 1000,
  /** Walking speed, as a share of the screen width per second. */
  speed: 0.04,
  /** Chance that a pet stops to do something when a walk ends (owner, playtest 25: not walking nonstop). */
  actionChance: 0.75,
  /** Chance that a pet rests a while after an action, before walking again. */
  restAfterAction: 0.35,
  /** Sprite size on screen (px). */
  size: 40,
};
export const PET_ACTIONS = ['eat', 'play', 'rest', 'sit', 'jump', 'sleep'] as const;
export type PetAction = (typeof PET_ACTIONS)[number];
/** How often each action is picked, relative to the others: resting (standing still) is the most common. */
export const PET_ACTION_WEIGHTS: Record<PetAction, number> = { eat: 2, play: 2, rest: 4, sit: 2, jump: 1, sleep: 1 };
/** How long each action lasts (ms): shortest and longest. A nap is long (owner, playtest 25), not a few seconds. */
export const PET_ACTION_MS: Record<PetAction, [number, number]> = {
  eat: [4_000, 8_000],
  play: [4_000, 8_000],
  rest: [5_000, 20_000],
  sit: [6_000, 15_000],
  jump: [2_000, 4_000],
  sleep: [45_000, 120_000],
};
/** The emoji each action shows: above the pet as a bubble, or on the ground in front of it (PET_GROUND_ACTIONS). Resting shows none. */
export const PET_ACTION_BUBBLES: Record<PetAction, string> = { eat: '🍎', play: '⚽', rest: '', sleep: '💤', sit: '💭', jump: '❗' };
/**
 * How tall a pet is drawn in its 32x32 sprite by stage (baby, young, adult), as
 * a share of the sprite; the same scale as scripts/generate-generic-assets.mjs.
 * Bubbles sit just above the pet, not above the empty top of the sprite.
 */
export const PET_STAGE_HEIGHT: [number, number, number] = [0.55, 0.78, 1];
/** A sleeping pet curls up to this share of its height (the pet-sleep pose in index.css). */
export const PET_SLEEP_SQUASH = 0.8;
/** Actions whose emoji is a thing on the ground in front of the pet's mouth, not a thought bubble (owner, playtest 25). */
export const PET_GROUND_ACTIONS: PetAction[] = ['eat', 'play'];

/** Hours to grow after feeding: to young, to adult. */
export const GROW_HOURS: [number, number] = [2, 8];

const PET_DEFS: PetDef[] = [
  {
    id: 'hamster',
    name: 'Wheel Hamster',
    description: 'Runs in its little wheel all day. Your clicks feel stronger.',
    find: { kind: 'level', level: 8 },
    hint: 'Reach player level 8.',
    bonus: { kind: 'click' },
    bonusByStage: stages(2),
    food: 'energy',
    feedCost: [20_000, 400_000],
  },
  {
    id: 'firefly',
    name: 'Firefly Swarm',
    description: 'A glowing swarm that loves sunlight. Boosts solar panels.',
    find: { kind: 'event', eventId: 'firefly_swarm' },
    hint: 'Watch the screen on a quiet evening... (rare event)',
    bonus: { kind: 'generator', generators: [GeneratorType.SOLAR] },
    bonusByStage: stages(0.2),
    food: 'energy',
    feedCost: [30_000, 600_000],
  },
  {
    id: 'tortoise',
    name: 'Solar Tortoise',
    description: 'Basks on the panels and keeps the turbines company. Boosts solar and wind.',
    find: { kind: 'research', id: 'smart_grid' },
    hint: 'Research Smart Grid.',
    bonus: { kind: 'generator', generators: [GeneratorType.SOLAR, GeneratorType.WIND] },
    bonusByStage: stages(0.1),
    food: 'stone',
    feedCost: [300, 3_000],
  },
  {
    id: 'eel',
    name: 'Electric Eel',
    description: 'Lives by the turbines and adds a little spark. Boosts hydro and tidal.',
    find: { kind: 'build', generator: GeneratorType.TIDAL },
    hint: 'Build a Tidal Power Station.',
    bonus: { kind: 'generator', generators: [GeneratorType.HYDRO, GeneratorType.TIDAL] },
    bonusByStage: stages(0.1),
    food: 'metal',
    feedCost: [400, 4_000],
  },
  {
    id: 'robodog',
    name: 'Wind-up Robot Dog',
    description: 'Fetches parts for your producers. Boosts all producers.',
    find: { kind: 'contracts', count: 10 },
    hint: 'Complete 10 contracts.',
    bonus: { kind: 'production' },
    bonusByStage: stages(0.1),
    food: 'metal',
    feedCost: [500, 5_000],
  },
  {
    id: 'cat',
    name: 'Static Cat',
    description: 'Crackles when you pet it. Boosts energy from all generators.',
    find: { kind: 'event', eventId: 'stray_cat' },
    hint: 'A stray might wander in one day... (rare event)',
    bonus: { kind: 'energy' },
    bonusByStage: stages(0.03),
    food: 'energy',
    feedCost: [100_000, 2_000_000],
  },
  {
    id: 'beetle',
    name: 'Magnetic Beetle',
    description: 'Sniffs out metal ore. Boosts metal production.',
    find: { kind: 'level', level: 25 },
    hint: 'Reach player level 25.',
    bonus: { kind: 'production', resource: 'metal' },
    bonusByStage: stages(0.15),
    food: 'coal',
    feedCost: [200, 2_000],
  },
  {
    id: 'jellyfish',
    name: 'Glowing Jellyfish',
    description: 'Drifts in the cooling pond, glowing softly. Boosts uranium production.',
    find: { kind: 'build', generator: GeneratorType.NUCLEAR },
    hint: 'Build a Nuclear Fission Plant.',
    bonus: { kind: 'production', resource: 'uranium' },
    bonusByStage: stages(0.3),
    food: 'energy',
    feedCost: [500_000, 10_000_000],
  },
  // ---- 1.56 (owner request, playtest 22): six more, each with a bonus no other pet gives ----
  {
    id: 'mole',
    name: 'Coal Mole',
    description: 'Digs tunnels toward the richest seams. Boosts coal production.',
    find: { kind: 'level', level: 15 },
    hint: 'Reach player level 15.',
    bonus: { kind: 'production', resource: 'coal' },
    bonusByStage: stages(0.15),
    food: 'energy',
    feedCost: [60_000, 1_200_000],
  },
  {
    id: 'toad',
    name: 'Bubble Toad',
    description: 'Puffs up by the gas wells and sniffs out new pockets. Boosts natural gas production.',
    find: { kind: 'build', generator: GeneratorType.GAS },
    hint: 'Build a Gas Power Plant.',
    bonus: { kind: 'production', resource: 'naturalGas' },
    bonusByStage: stages(0.15),
    food: 'coal',
    feedCost: [300, 3_000],
  },
  {
    id: 'mouse',
    name: 'Lab Mouse',
    description: 'Runs the lab mazes faster than your scientists. Research takes less time.',
    find: { kind: 'research', id: 'automated_labs' },
    hint: 'Research Automated Labs.',
    bonus: { kind: 'research' },
    bonusByStage: stages(0.1),
    food: 'stone',
    feedCost: [400, 4_000],
  },
  {
    id: 'pigeon',
    name: 'Courier Pigeon',
    description: 'Carries the paperwork for your contracts. Bigger contract bundles and longer boosts.',
    find: { kind: 'contracts', count: 25 },
    hint: 'Complete 25 contracts.',
    bonus: { kind: 'contracts' },
    bonusByStage: stages(0.2),
    food: 'metal',
    feedCost: [600, 6_000],
  },
  {
    id: 'owl',
    name: 'Soot Owl',
    description: 'Roosts on warm chimneys and keeps the burners tidy. Boosts coal, gas and oil plants.',
    find: { kind: 'level', level: 35 },
    hint: 'Reach player level 35.',
    bonus: { kind: 'generator', generators: [GeneratorType.COAL, GeneratorType.GAS, GeneratorType.OIL] },
    bonusByStage: stages(0.08),
    food: 'energy',
    feedCost: [2_000_000, 40_000_000],
  },
  {
    id: 'axolotl',
    name: 'Atomic Axolotl',
    description: 'Glows happily in the reactor cooling tanks. Boosts fission and fusion plants.',
    find: { kind: 'build', generator: GeneratorType.FUSION },
    hint: 'Build a Fusion Reactor.',
    bonus: { kind: 'generator', generators: [GeneratorType.NUCLEAR, GeneratorType.FUSION] },
    bonusByStage: stages(0.1),
    food: 'energy',
    feedCost: [20_000_000, 400_000_000],
  },
];

/** The pets; feeding with metal or stone costs MATERIAL_COST_FACTOR times more (playtest 19.3). */
export const PETS: PetDef[] = PET_DEFS.map((p) =>
  p.food === 'metal' || p.food === 'stone'
    ? { ...p, feedCost: [Math.round(p.feedCost[0] * MATERIAL_COST_FACTOR), Math.round(p.feedCost[1] * MATERIAL_COST_FACTOR)] }
    : p,
);

export const PETS_BY_ID = Object.fromEntries(PETS.map((p) => [p.id, p])) as Record<PetId, PetDef>;
