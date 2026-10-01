import type { GameState } from '../types/state';
import { BASE_PRODUCTION_PER_SECOND } from './time';

/** Starting values for a fresh save. `lastSavedTimestamp` is set at creation. */
export const initialGameState: Omit<GameState, 'lastSavedTimestamp'> = {
  energy: 0,
  resources: { coal: 0, stone: 0, metal: 0, naturalGas: 0 },
  researchLevel: 1,
  activeGenerators: [],
  roomCapacity: 10,
  roomUsed: 0,
  totalProductionPerSecond: BASE_PRODUCTION_PER_SECOND,
};

export const createInitialState = (now = Date.now()): GameState => ({
  ...initialGameState,
  resources: { ...initialGameState.resources },
  activeGenerators: [],
  lastSavedTimestamp: now,
});
