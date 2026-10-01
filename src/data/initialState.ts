import type { GameState } from '../types/state';
import { STARTING_PRODUCERS } from './producers';
import { STARTING_RESOURCES } from './resources';
import { BASE_PRODUCTION_PER_SECOND } from './time';

/** Starting values for a fresh save. `lastSavedTimestamp` is set at creation. */
export const createInitialState = (now = Date.now()): GameState => ({
  energy: 0,
  energyPerSecond: BASE_PRODUCTION_PER_SECOND,
  lastSavedTimestamp: now,
  resources: { ...STARTING_RESOURCES },
  producers: { ...STARTING_PRODUCERS },
  depletedResources: [],
  activeGenerators: [],
  researchLevel: 1,
  roomCapacity: 10,
  roomUsed: 0,
  expansionLevel: 0,
  settings: { notation: 'short' },
});
