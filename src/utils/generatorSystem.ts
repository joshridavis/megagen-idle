import { GENERATORS } from '../data/generators';
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
    maintenanceCost: def.maintenanceCost ?? {},
  };
}

export type BuildBlock = 'locked' | 'resources' | 'room';

/** Why a generator cannot be built right now, or null if it can. */
export function getBuildBlock(
  state: GameState,
  type: GeneratorType,
  unlocked: GeneratorType[],
  bonuses: Bonuses = NO_BONUSES,
): BuildBlock | null {
  if (!unlocked.includes(type)) return 'locked';
  const stats = getGeneratorStats(type, bonuses);
  if (state.roomUsed + stats.roomCost > state.roomCapacity) return 'room';
  if (!canAfford(state.resources, stats.buildCost)) return 'resources';
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
  const paid = consumeResource(state.resources, getGeneratorStats(type, bonuses).buildCost);
  const generator: Generator = { id: nextGeneratorId(state.activeGenerators), type, isActive: true, level: 1 };
  return deriveRates({ ...state, resources: paid.resources, activeGenerators: [...state.activeGenerators, generator] });
}

/** Switches a generator on or off. Switching on clears its out-of-fuel flag. */
export function toggleGenerator(state: GameState, id: string): GameState {
  if (!state.activeGenerators.some((g) => g.id === id)) return state;
  const activeGenerators = state.activeGenerators.map((g) =>
    g.id === id ? { ...g, isActive: !g.isActive, outOfFuel: false } : g,
  );
  return deriveRates({ ...state, activeGenerators });
}
