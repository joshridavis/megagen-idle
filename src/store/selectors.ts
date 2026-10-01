import type { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { getBonuses } from '../utils/bonuses';
import { getUnlockedGeneratorTypes } from '../utils/researchSystem';
import { getFuelUseRates, getProductionRates } from '../utils/resourceSystem';

/** Typed selectors. Components read state and derived values through these. */
export const selectEnergy = (s: GameState) => s.energy;
export const selectResources = (s: GameState) => s.resources;
export const getTotalEnergyRate = (s: GameState) => s.energyPerSecond;
export const getAvailableRoom = (s: GameState) => Math.max(0, s.roomCapacity - s.roomUsed);
/** Generator types the player may build: starting ones plus research unlocks. */
export const getUnlockedGenerators = (s: Pick<GameState, 'completedResearch'>): GeneratorType[] =>
  getUnlockedGeneratorTypes(s.completedResearch);
/** Active research bonuses. Not a stable reference: use inside useMemo or with completedResearch. */
export const selectBonuses = (s: Pick<GameState, 'completedResearch'>) => getBonuses(s.completedResearch);
/** Derived, not stable references: call inside useMemo, not as a store selector. */
export const selectProductionRates = (s: Pick<GameState, 'producers' | 'completedResearch'>) =>
  getProductionRates(s.producers, getBonuses(s.completedResearch));
export const selectFuelUseRates = (s: Pick<GameState, 'activeGenerators' | 'completedResearch'>) =>
  getFuelUseRates(s.activeGenerators, getBonuses(s.completedResearch));
