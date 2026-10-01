import type { GameState } from '../types/state';
import { BASE_PRODUCTION_PER_SECOND } from './time';

/** Starting values for a fresh save. `lastSavedTimestamp` is set at creation. */
export const createInitialState = (now = Date.now()): GameState => ({
  energy: 0,
  energyPerSecond: BASE_PRODUCTION_PER_SECOND,
  lastSavedTimestamp: now,
  resources: { coal: 0, stone: 0, metal: 0, naturalGas: 0 },
  activeGenerators: [],
  researchLevel: 1,
  roomCapacity: 10,
  roomUsed: 0,
  expansionLevel: 0,
  settings: { notation: 'short' },
});
