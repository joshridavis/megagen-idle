import type { GameState } from '../types/state';
import { getFuelUseRates, getProductionRates } from '../utils/resourceSystem';

/** Typed selectors. Components read state and derived values through these. */
export const selectEnergy = (s: GameState) => s.energy;
export const selectResources = (s: GameState) => s.resources;
export const getTotalEnergyRate = (s: GameState) => s.energyPerSecond;
export const getAvailableRoom = (s: GameState) => Math.max(0, s.roomCapacity - s.roomUsed);
/** Generator types the player may build (research gating arrives in 0.07/0.10). */
export const getUnlockedGenerators = (_s: GameState): string[] => [];
/** Derived, not stable references: call inside useMemo, not as a store selector. */
export const selectProductionRates = (s: Pick<GameState, 'producers'>) => getProductionRates(s.producers);
export const selectFuelUseRates = (s: Pick<GameState, 'activeGenerators'>) => getFuelUseRates(s.activeGenerators);
