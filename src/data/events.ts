import { GeneratorType } from '../types/generator';
import type { ResourceId } from '../types/state';

/**
 * Random events (0.84, playtest 10). Each event rolls on its own; its tier
 * sets how often it happens on average per hour of eligible time. Legendary
 * ones should truly surprise: about once in a few hundred hours.
 */
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export const RARITY_PER_HOUR: Record<Rarity, number> = {
  common: 0.2,
  uncommon: 0.07,
  rare: 0.02,
  legendary: 0.003,
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  legendary: 'Legendary',
};

/** Every sighting stays on screen at least this long (ms), so it is hard to miss (playtest 11). */
export const MIN_SIGHTING_MS = 15000;

/** Effect events (0.85) roll at this share of their tier's rate, so they stay rare. */
export const EFFECT_RATE_FACTOR = 0.5;
/** Negative effect events roll a little less often than positive ones (playtest 12). */
export const NEGATIVE_RATE_FACTOR = 0.75;
/** A negative event never takes more than this share of a resource. */
export const MAX_LOSS_FRACTION = 0.1;

/** What an effect event does (0.85). Timed effects are saved with an end time. */
export type EventEffect =
  /** For `minutes`: energy from `generator` (or all generators) and/or production of `resource` (or all) changes by the fractions given. */
  | { kind: 'timed'; minutes: number; energy?: number; generator?: GeneratorType; production?: number; resource?: ResourceId }
  /** Energy equal to `minutes` of current output (at least `min`). */
  | { kind: 'grant-energy'; minutes: number; min: number }
  /** A resource equal to `minutes` of its production (at least `min`). */
  | { kind: 'grant-resource'; resource: ResourceId; minutes: number; min: number }
  /** The running research moves this share of its duration closer to done. */
  | { kind: 'research-boost'; fraction: number }
  /** One random running generator switches off until the player turns it on. */
  | { kind: 'grid-fault' }
  /** Lose a share (capped by MAX_LOSS_FRACTION) of each listed resource. */
  | { kind: 'lose-resource'; resources: ResourceId[]; fraction: number }
  /** A pet joins you (0.92). Only rolls while that pet is not found yet. */
  | { kind: 'find-pet'; pet: string };

/** How a map event (1.12) plays on the map. */
export type MapAnimation = 'flock' | 'bolt' | 'truck' | 'flood' | 'fire' | 'star';

export interface MapEventInfo {
  animation: MapAnimation;
  /** What it happens to: a random machine of that kind, the river in the site, the sea, or the sky over the map. */
  target: 'generator' | 'producer' | 'river' | 'sea' | 'sky';
  /** Only this generator type can be the target (a fire breaks out at a coal plant). */
  generatorType?: GeneratorType;
  /** Click within this many seconds to get the effect (put out the fire); otherwise it just ends. */
  claimSeconds?: number;
  /** How long it stays on the map (ms). */
  durationMs: number;
}

/** Map events (1.12): average times per hour each one happens while the Map tab is open, so a watcher sees one every few minutes. */
export const MAP_RATE_PER_HOUR: Record<Rarity, number> = {
  common: 5,
  uncommon: 2.5,
  rare: 1,
  legendary: 0.2,
};

/** Extra conditions for an event to roll. */
export type EventRequirement = 'research-running' | 'two-running' | 'gas-or-oil' | 'coal-mine' | 'pet-missing';

/** At most this many events per live tick, and per return from time away. */
export const MAX_EVENTS_PER_TICK = 1;
export const MAX_EVENTS_PER_CATCH_UP = 3;

/** How a sighting moves across the screen. */
export type SightingAnimation = 'fly-right' | 'fly-left' | 'rise' | 'walk' | 'fall' | 'glow' | 'arc' | 'streak' | 'beam' | 'swim';

export interface EventDef {
  id: string;
  name: string;
  /** Shown in the event log. */
  text: string;
  rarity: Rarity;
  /** 'foreground' only rolls while the game screen is visible; 'anytime' also while idle or away; 'never' is not random (rewards); 'map' only while the Map tab is open (1.12). */
  when: 'foreground' | 'anytime' | 'never' | 'map';
  /** Map events (1.12): what they look like on the map and what they happen to. */
  map?: MapEventInfo;
  /** Needs at least one of each built (on or off). */
  requiresBuilt?: GeneratorType[];
  /** Cosmetic sightings have an animation and no effect. */
  animation?: SightingAnimation;
  /** Animation length, ms. */
  durationMs?: number;
  /** Effect events (0.85) change the game; sightings have none. */
  effect?: EventEffect;
  negative?: boolean;
  requires?: EventRequirement;
}

export const EVENTS: EventDef[] = [
  { id: 'birds', name: 'Flock of birds', text: 'A flock of birds swept past.', rarity: 'common', when: 'foreground', animation: 'fly-left', durationMs: 16000 },
  { id: 'shooting_star', name: 'Shooting star', text: 'A shooting star streaked across the sky. Make a wish!', rarity: 'common', when: 'foreground', animation: 'streak', durationMs: 15000 },
  { id: 'balloon', name: 'Lost balloon', text: 'Someone lost a balloon. It drifts up and away.', rarity: 'common', when: 'foreground', animation: 'rise', durationMs: 20000 },
  { id: 'paper_plane', name: 'Paper plane', text: 'A paper plane glided by. Who folded it?', rarity: 'common', when: 'foreground', animation: 'fly-right', durationMs: 16000 },
  { id: 'cat', name: 'Plant cat', text: 'A cat strolled along the top of the screen, unimpressed.', rarity: 'uncommon', when: 'foreground', animation: 'walk', durationMs: 20000 },
  { id: 'aurora', name: 'Aurora', text: 'An aurora shimmered over the plant.', rarity: 'uncommon', when: 'foreground', animation: 'glow', durationMs: 20000 },
  {
    id: 'rainbow',
    name: 'Rainbow over the dam',
    text: 'Spray from the dam made a rainbow.',
    rarity: 'uncommon',
    when: 'foreground',
    requiresBuilt: [GeneratorType.HYDRO],
    animation: 'arc',
    durationMs: 18000,
  },
  { id: 'spaceship', name: 'Small spaceship', text: 'A small spaceship zipped across the screen!', rarity: 'rare', when: 'foreground', animation: 'fly-right', durationMs: 15000 },
  { id: 'meteor_shower', name: 'Meteor shower', text: 'Meteors rained down far away. Beautiful.', rarity: 'rare', when: 'foreground', animation: 'fall', durationMs: 15000 },
  {
    id: 'whale',
    name: 'Whale at the tidal station',
    text: 'A whale surfaced next to the tidal station.',
    rarity: 'rare',
    when: 'foreground',
    requiresBuilt: [GeneratorType.TIDAL],
    animation: 'swim',
    durationMs: 20000,
  },
  { id: 'ufo', name: 'UFO', text: 'A UFO hovered, beamed something up, and vanished. Nobody will believe you.', rarity: 'legendary', when: 'foreground', animation: 'beam', durationMs: 18000 },
  // ---- Effect events (0.85, playtest 10). Some help, some hurt; negative ones never remove anything permanently. ----
  {
    id: 'sunny_spell',
    name: 'Sunny spell',
    text: 'Clear skies: +50% energy from solar panels for 10 minutes.',
    rarity: 'common',
    when: 'anytime',
    requiresBuilt: [GeneratorType.SOLAR],
    effect: { kind: 'timed', minutes: 10, energy: 0.5, generator: GeneratorType.SOLAR },
  },
  {
    id: 'strong_winds',
    name: 'Strong winds',
    text: 'A strong breeze: +50% energy from wind turbines for 10 minutes.',
    rarity: 'common',
    when: 'anytime',
    requiresBuilt: [GeneratorType.WIND],
    effect: { kind: 'timed', minutes: 10, energy: 0.5, generator: GeneratorType.WIND },
  },
  {
    id: 'rich_seam',
    name: 'Rich seam',
    text: 'Your miners hit a rich seam of metal.',
    rarity: 'common',
    when: 'anytime',
    effect: { kind: 'grant-resource', resource: 'metal', minutes: 15, min: 30 },
  },
  {
    id: 'coal_find',
    name: 'Coal find',
    text: 'An old coal store turned up behind the mine.',
    rarity: 'uncommon',
    when: 'anytime',
    effect: { kind: 'grant-resource', resource: 'coal', minutes: 20, min: 20 },
  },
  {
    id: 'grant',
    name: 'Government grant',
    text: 'The government rewards your clean energy work.',
    rarity: 'uncommon',
    when: 'anytime',
    effect: { kind: 'grant-energy', minutes: 10, min: 200 },
  },
  {
    id: 'eureka',
    name: 'Eureka!',
    text: 'A breakthrough in the lab: your current research jumps ahead.',
    rarity: 'uncommon',
    when: 'anytime',
    requires: 'research-running',
    effect: { kind: 'research-boost', fraction: 0.1 },
  },
  {
    id: 'volunteer_crew',
    name: 'Volunteer crew',
    text: 'Volunteers help out: +50% output from all producers for 15 minutes.',
    rarity: 'uncommon',
    when: 'anytime',
    effect: { kind: 'timed', minutes: 15, production: 0.5 },
  },
  {
    id: 'overcast',
    name: 'Overcast',
    text: 'Gray clouds roll in: −30% energy from solar panels for 10 minutes.',
    rarity: 'common',
    when: 'anytime',
    negative: true,
    requiresBuilt: [GeneratorType.SOLAR],
    effect: { kind: 'timed', minutes: 10, energy: -0.3, generator: GeneratorType.SOLAR },
  },
  {
    id: 'calm_air',
    name: 'Calm air',
    text: 'Not a breath of wind: −30% energy from wind turbines for 10 minutes.',
    rarity: 'common',
    when: 'anytime',
    negative: true,
    requiresBuilt: [GeneratorType.WIND],
    effect: { kind: 'timed', minutes: 10, energy: -0.3, generator: GeneratorType.WIND },
  },
  {
    id: 'coal_shortage',
    name: 'Coal shortage',
    text: 'A flooded shaft: −20% coal production for 15 minutes.',
    rarity: 'uncommon',
    when: 'anytime',
    negative: true,
    requires: 'coal-mine',
    effect: { kind: 'timed', minutes: 15, production: -0.2, resource: 'coal' },
  },
  {
    id: 'grid_fault',
    name: 'Grid fault',
    text: 'A fault tripped one of your generators. Turn it back on in your generator list.',
    rarity: 'rare',
    when: 'anytime',
    negative: true,
    requires: 'two-running',
    effect: { kind: 'grid-fault' },
  },
  {
    id: 'pipe_leak',
    name: 'Pipe leak',
    text: 'A leaking pipe cost you some fuel.',
    rarity: 'uncommon',
    when: 'anytime',
    negative: true,
    requires: 'gas-or-oil',
    effect: { kind: 'lose-resource', resources: ['naturalGas', 'oil'], fraction: 0.1 },
  },
  {
    id: 'equipment_wear',
    name: 'Equipment wear',
    text: 'Worn parts slow everything down: −10% energy from all generators for 10 minutes.',
    rarity: 'uncommon',
    when: 'anytime',
    negative: true,
    effect: { kind: 'timed', minutes: 10, energy: -0.1 },
  },
  // ---- Pet finds (0.92): rare, and only until that pet is found. ----
  {
    id: 'firefly_swarm',
    name: 'Firefly swarm',
    text: 'A swarm of fireflies settled by your solar panels. It wants to stay!',
    rarity: 'rare',
    when: 'foreground',
    requiresBuilt: [GeneratorType.SOLAR],
    requires: 'pet-missing',
    effect: { kind: 'find-pet', pet: 'firefly' },
  },
  {
    id: 'stray_cat',
    name: 'Stray cat',
    text: 'A crackling stray cat wandered in and curled up by a generator.',
    rarity: 'rare',
    when: 'anytime',
    requires: 'pet-missing',
    effect: { kind: 'find-pet', pet: 'cat' },
  },
  // ---- Not random: the Grid Contracts boost reward (0.86) reuses the timed effects. ----
  {
    id: 'contract_boost',
    name: 'Contract bonus',
    text: 'A grateful customer: +25% energy from all generators for 30 minutes.',
    rarity: 'common',
    when: 'never',
    effect: { kind: 'timed', minutes: 30, energy: 0.25 },
  },
  // ---- Map events (1.12, playtest 15): only while the Map tab is open, and they happen on the map ----
  {
    id: 'map_flock',
    name: 'Birds over the site',
    text: 'A flock of birds circled over your site.',
    rarity: 'common',
    when: 'map',
    map: { animation: 'flock', target: 'sky', durationMs: 12000 },
  },
  {
    id: 'map_lightning',
    name: 'Lightning strike',
    text: 'Lightning struck one of your generators and supercharged it: +50% from that type for 3 minutes.',
    rarity: 'common',
    when: 'map',
    map: { animation: 'bolt', target: 'generator', durationMs: 6000 },
    // the struck generator's type is saved with the effect
    effect: { kind: 'timed', minutes: 3, energy: 0.5 },
  },
  {
    id: 'map_delivery',
    name: 'Delivery truck',
    text: 'A delivery truck dropped off supplies at one of your producers.',
    rarity: 'common',
    when: 'map',
    map: { animation: 'truck', target: 'producer', durationMs: 9000 },
    // the producer's own resource: 15 minutes of its production
    effect: { kind: 'grant-resource', resource: 'metal', minutes: 15, min: 10 },
  },
  {
    id: 'map_fire',
    name: 'Small fire',
    text: 'A small fire broke out at a coal plant!',
    rarity: 'uncommon',
    when: 'map',
    requiresBuilt: [GeneratorType.COAL],
    map: { animation: 'fire', target: 'generator', generatorType: GeneratorType.COAL, claimSeconds: 30, durationMs: 30000 },
    // the crew's thanks for putting it out
    effect: { kind: 'grant-energy', minutes: 5, min: 500 },
  },
  {
    id: 'map_flood',
    name: 'River flood',
    text: 'The river flooded: Hydropower Dams make 20% less for 5 minutes.',
    rarity: 'uncommon',
    when: 'map',
    negative: true,
    requiresBuilt: [GeneratorType.HYDRO],
    map: { animation: 'flood', target: 'river', durationMs: 10000 },
    effect: { kind: 'timed', minutes: 5, energy: -0.2, generator: GeneratorType.HYDRO },
  },
  {
    id: 'map_star',
    name: 'Falling star at sea',
    text: 'A falling star dropped into the sea, far out. It glowed for a moment.',
    rarity: 'rare',
    when: 'map',
    map: { animation: 'star', target: 'sea', durationMs: 8000 },
  },
];

export const EVENTS_BY_ID: Record<string, EventDef> = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
