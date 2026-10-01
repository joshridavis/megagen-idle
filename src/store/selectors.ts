import type { GameState } from '../types/state';

/** Typed selectors. Components read derived values through these. */
export const selectEnergy = (s: GameState) => s.energy;
export const getTotalEnergyRate = (s: GameState) => s.energyPerSecond;
export const getAvailableRoom = (s: GameState) => Math.max(0, s.roomCapacity - s.roomUsed);
/** Generator types the player may build (research gating arrives in 0.07/0.10). */
export const getUnlockedGenerators = (_s: GameState): string[] => [];
