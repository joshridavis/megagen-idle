import { GENERATOR_ENERGY_COST_SECONDS, GENERATORS } from '../data/generators';
import { NO_BONUSES, type Bonuses } from '../types/bonus';
import type { Generator, GeneratorType } from '../types/generator';
import type { ResourceAmounts } from '../types/resource';
import type { GameState } from '../types/state';
import { canAfford, consumeResource } from './resourceSystem';
import { deriveRates } from './simulation';

export interface GeneratorStats {
  energyPerSecond: number;
  roomCost: number;
  buildCost: ResourceAmounts;
  /** Energy paid to build: base output over GENERATOR_ENERGY_COST_SECONDS. */
  energyCost: number;
  maintenanceCost: ResourceAmounts;
}

/** Stats of a generator type with research bonuses applied. Costs round up. */
export function getGeneratorStats(type: GeneratorType, bonuses: Bonuses = NO_BONUSES): GeneratorStats {
  const def = GENERATORS[type];
  const buildCost: ResourceAmounts = {};
  for (const [id, n] of Object.entries(def.buildCost)) {
    buildCost[id as keyof ResourceAmounts] = Math.ceil((n ?? 0) * (1 - bonuses.buildDiscount));
  }
  return {
    energyPerSecond: def.energyPerSecond * (1 + bonuses.globalEnergy),
    roomCost: def.roomCost,
    buildCost,
    energyCost: Math.ceil(def.energyPerSecond * GENERATOR_ENERGY_COST_SECONDS * (1 - bonuses.buildDiscount)),
    maintenanceCost: def.maintenanceCost ?? {},
  };
}

export type BuildBlock = 'locked' | 'level' | 'room' | 'resources' | 'energy';

/** Why a generator cannot be built right now, or null if it can. */
export function getBuildBlock(
  state: GameState,
  type: GeneratorType,
  unlocked: GeneratorType[],
  bonuses: Bonuses = NO_BONUSES,
): BuildBlock | null {
  if (!unlocked.includes(type)) return 'locked';
  if (state.researchLevel < GENERATORS[type].requiredLevel) return 'level';
  const stats = getGeneratorStats(type, bonuses);
  if (state.roomUsed + stats.roomCost > state.roomCapacity) return 'room';
  if (!canAfford(state.resources, stats.buildCost)) return 'resources';
  if (state.energy < stats.energyCost) return 'energy';
  return null;
}

export function canBuildGenerator(
  state: GameState,
  type: GeneratorType,
  unlocked: GeneratorType[],
  bonuses: Bonuses = NO_BONUSES,
): boolean {
  return getBuildBlock(state, type, unlocked, bonuses) === null;
}

/** Next unique generator ID ("gen-1", "gen-2", ...). */
export function nextGeneratorId(generators: Generator[]): string {
  const max = generators.reduce((m, g) => Math.max(m, Number(g.id.split('-')[1]) || 0), 0);
  return `gen-${max + 1}`;
}

/** Builds a generator (active immediately). Returns the state unchanged if blocked. */
export function buildGenerator(
  state: GameState,
  type: GeneratorType,
  unlocked: GeneratorType[],
  bonuses: Bonuses = NO_BONUSES,
): GameState {
  if (!canBuildGenerator(state, type, unlocked, bonuses)) return state;
  const stats = getGeneratorStats(type, bonuses);
  const paid = consumeResource(state.resources, stats.buildCost);
  const generator: Generator = { id: nextGeneratorId(state.activeGenerators), type, isActive: true, level: 1 };
  return deriveRates({
    ...state,
    energy: state.energy - stats.energyCost,
    resources: paid.resources,
    activeGenerators: [...state.activeGenerators, generator],
  });
}

/** Switches a generator on or off. Switching on clears its out-of-fuel flag. */
export function toggleGenerator(state: GameState, id: string): GameState {
  if (!state.activeGenerators.some((g) => g.id === id)) return state;
  const activeGenerators = state.activeGenerators.map((g) =>
    g.id === id ? { ...g, isActive: !g.isActive, outOfFuel: false } : g,
  );
  return deriveRates({ ...state, activeGenerators });
}

/** Removes a generator for good, freeing its room. No refund. */
export function scrapGenerator(state: GameState, id: string): GameState {
  if (!state.activeGenerators.some((g) => g.id === id)) return state;
  return deriveRates({ ...state, activeGenerators: state.activeGenerators.filter((g) => g.id !== id) });
}

/**
 * Moves a generator to `toIndex` (clamped to the list). The list order is
 * saved and is also the fuel priority: higher generators burn fuel first.
 */
export function moveGenerator(state: GameState, id: string, toIndex: number): GameState {
  const from = state.activeGenerators.findIndex((g) => g.id === id);
  if (from < 0) return state;
  const to = Math.max(0, Math.min(state.activeGenerators.length - 1, Math.trunc(toIndex)));
  if (to === from) return state;
  const list = [...state.activeGenerators];
  const [g] = list.splice(from, 1);
  list.splice(to, 0, g);
  return { ...state, activeGenerators: list };
}
