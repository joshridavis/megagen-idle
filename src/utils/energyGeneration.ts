import { GENERATORS, UPGRADES } from '../data/generators';
import { NO_BONUSES, type Bonuses } from '../types/bonus';
import type { Generator, GeneratorType } from '../types/generator';

/** Energy per second of one active generator, with bonuses applied. */
export function getGeneratorOutput(generator: Generator, bonuses: Bonuses = NO_BONUSES): number {
  if (!generator.isActive) return 0;
  const def = GENERATORS[generator.type];
  if (!def) return 0;
  return baseOutput(generator) * (1 + bonuses.globalEnergy);
}

/** Output multiplier from upgrade level: 1 at level 1, +outputPerLevel per level. */
export function levelMultiplier(level: number): number {
  return 1 + UPGRADES.outputPerLevel * (Math.max(1, level) - 1);
}

/** A generator's output before research bonuses (base x upgrade level). */
export function baseOutput(generator: Generator): number {
  return (GENERATORS[generator.type]?.energyPerSecond ?? 0) * levelMultiplier(generator.level);
}

/** Total energy per second of all active generators. */
export function calculateEnergyRate(generators: Generator[], bonuses: Bonuses = NO_BONUSES): number {
  return generators.reduce((sum, g) => sum + getGeneratorOutput(g, bonuses), 0);
}

/** Energy per second per unit of room: how well a type uses space. */
export function getGeneratorEfficiency(type: GeneratorType, bonuses: Bonuses = NO_BONUSES): number {
  const def = GENERATORS[type];
  return (def.energyPerSecond * (1 + bonuses.globalEnergy)) / def.roomCost;
}
