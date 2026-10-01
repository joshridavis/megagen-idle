import type { GameState } from '../types/state';
import { STARTING_ENERGY } from './player';
import { STARTING_PRODUCERS } from './producers';
import { STARTING_RESOURCES } from './resources';

/** Starting values for a fresh save. `lastSavedTimestamp` is set at creation. */
export const createInitialState = (now = Date.now()): GameState => ({
  energy: STARTING_ENERGY,
  energyPerSecond: 0,
  lastSavedTimestamp: now,
  resources: { ...STARTING_RESOURCES },
  producers: { ...STARTING_PRODUCERS },
  depletedResources: [],
  activeGenerators: [],
  researchLevel: 1,
  currentResearch: null,
  completedResearch: [],
  roomCapacity: 10,
  roomUsed: 0,
  expansionLevel: 0,
  settings: { notation: 'short' },
});
