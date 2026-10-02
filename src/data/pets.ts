import { GeneratorType } from '../types/generator';
import type { ResourceId } from '../types/state';

/**
 * Energy pets (0.92, playtest 11): a light collection activity. Pets fit the
 * energy theme. Each is found one way, grows baby -> young -> adult by being
 * fed and then waiting (real time, offline too), and gives a themed bonus
 * while it is the active pet. All numbers here.
 */
export type PetId = 'hamster' | 'firefly' | 'eel' | 'robodog' | 'cat' | 'jellyfish' | 'beetle' | 'tortoise';

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
  | { kind: 'click' };

export interface PetDef {
  id: PetId;
  name: string;
  description: string;
  find: PetFind;
  /** How to find it, shown while it is still a silhouette. */
  hint: string;
  bonus: PetBonus;
  /** Bonus at baby, young and adult stage (fractions). */
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
};
/** Hours to grow after feeding: to young, to adult. */
export const GROW_HOURS: [number, number] = [2, 8];

export const PETS: PetDef[] = [
  {
    id: 'hamster',
    name: 'Wheel Hamster',
    description: 'Runs in its little wheel all day. Your clicks feel stronger.',
    find: { kind: 'level', level: 8 },
    hint: 'Reach player level 8.',
    bonus: { kind: 'click' },
    bonusByStage: [0.5, 1, 2],
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
    bonusByStage: [0.05, 0.1, 0.2],
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
    bonusByStage: [0.03, 0.06, 0.1],
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
    bonusByStage: [0.03, 0.06, 0.1],
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
    bonusByStage: [0.03, 0.06, 0.1],
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
    bonusByStage: [0.01, 0.02, 0.03],
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
    bonusByStage: [0.05, 0.1, 0.15],
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
    bonusByStage: [0.1, 0.2, 0.3],
    food: 'energy',
    feedCost: [500_000, 10_000_000],
  },
];

export const PETS_BY_ID = Object.fromEntries(PETS.map((p) => [p.id, p])) as Record<PetId, PetDef>;
