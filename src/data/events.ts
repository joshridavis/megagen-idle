import { GeneratorType } from '../types/generator';

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
  /** 'foreground' only rolls while the game screen is visible; 'anytime' also while idle or away. */
  when: 'foreground' | 'anytime';
  /** Needs at least one of each built (on or off). */
  requiresBuilt?: GeneratorType[];
  /** Cosmetic sightings have an animation and no effect. */
  animation?: SightingAnimation;
  /** Animation length, ms. */
  durationMs?: number;
}

export const EVENTS: EventDef[] = [
  { id: 'birds', name: 'Flock of birds', text: 'A flock of birds swept past.', rarity: 'common', when: 'foreground', animation: 'fly-left', durationMs: 7000 },
  { id: 'shooting_star', name: 'Shooting star', text: 'A shooting star streaked across the sky. Make a wish!', rarity: 'common', when: 'foreground', animation: 'streak', durationMs: 2500 },
  { id: 'balloon', name: 'Lost balloon', text: 'Someone lost a balloon. It drifts up and away.', rarity: 'common', when: 'foreground', animation: 'rise', durationMs: 9000 },
  { id: 'paper_plane', name: 'Paper plane', text: 'A paper plane glided by. Who folded it?', rarity: 'common', when: 'foreground', animation: 'fly-right', durationMs: 6000 },
  { id: 'cat', name: 'Plant cat', text: 'A cat strolled along the top of the screen, unimpressed.', rarity: 'uncommon', when: 'foreground', animation: 'walk', durationMs: 10000 },
  { id: 'aurora', name: 'Aurora', text: 'An aurora shimmered over the plant.', rarity: 'uncommon', when: 'foreground', animation: 'glow', durationMs: 9000 },
  {
    id: 'rainbow',
    name: 'Rainbow over the dam',
    text: 'Spray from the dam made a rainbow.',
    rarity: 'uncommon',
    when: 'foreground',
    requiresBuilt: [GeneratorType.HYDRO],
    animation: 'arc',
    durationMs: 8000,
  },
  { id: 'spaceship', name: 'Small spaceship', text: 'A small spaceship zipped across the screen!', rarity: 'rare', when: 'foreground', animation: 'fly-right', durationMs: 4000 },
  { id: 'meteor_shower', name: 'Meteor shower', text: 'Meteors rained down far away. Beautiful.', rarity: 'rare', when: 'foreground', animation: 'fall', durationMs: 5000 },
  {
    id: 'whale',
    name: 'Whale at the tidal station',
    text: 'A whale surfaced next to the tidal station.',
    rarity: 'rare',
    when: 'foreground',
    requiresBuilt: [GeneratorType.TIDAL],
    animation: 'swim',
    durationMs: 9000,
  },
  { id: 'ufo', name: 'UFO', text: 'A UFO hovered, beamed something up, and vanished. Nobody will believe you.', rarity: 'legendary', when: 'foreground', animation: 'beam', durationMs: 7000 },
];

export const EVENTS_BY_ID: Record<string, EventDef> = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
