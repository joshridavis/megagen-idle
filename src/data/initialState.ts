import type { GameState } from '../types/state';
import { STARTING_ENERGY } from './player';
import { STARTING_PRODUCERS } from './producers';
import { STARTING_RESOURCES } from './resources';
import { BASE_ROOM_CAPACITY } from './rooms';

/** Starting values for a fresh save. `lastSavedTimestamp` is set at creation. */
export const createInitialState = (now = Date.now()): GameState => ({
  energy: STARTING_ENERGY,
  energyPerSecond: 0,
  lastSavedTimestamp: now,
  lifetimeEnergy: 0,
  resources: { ...STARTING_RESOURCES },
  producers: { ...STARTING_PRODUCERS },
  depletedResources: [],
  activeGenerators: [],
  records: { builtTypes: [], bestLevel: {} },
  researchLevel: 1,
  currentResearch: null,
  completedResearch: [],
  roomCapacity: BASE_ROOM_CAPACITY,
  roomUsed: 3, // the three starting producers
  expansionLevel: 0,
  lastExpansionAt: null,
  settings: { notation: 'short', reduceMotion: false, tutorial: { step: 0, replay: false }, generatorSort: 'custom' },
  seenEvents: {},
  activeEffects: [],
  contracts: { open: [], nextOfferAt: 0, done: 0, points: 0, perks: {}, seq: 0 },
  pets: { owned: {}, active: null },
  achievements: {},
  stats: { clicks: 0, returns: 0 },
});
