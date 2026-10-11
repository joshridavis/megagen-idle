import { GeneratorType, type GeneratorDef } from '../types/generator';

/**
 * The machines past the free part (2.04): each comes from a research past FREE_MAX_RESEARCH_LEVEL.
 * Kept apart so the demo bundle leaves them out (src/data/generators.ts puts name-only stand-ins
 * there, shown as "Full Game").
 */
export const FULL_GENERATOR_DEFS: Pick<Record<GeneratorType, GeneratorDef>, FullGeneratorType> = {
  // ---- Tier 3 (0.33): about 2.5x the energy per room of the tier before, more fuel. ----
  [GeneratorType.OIL]: {
    type: GeneratorType.OIL,
    requiredLevel: 9,
    name: 'Oil Power Plant',
    description: 'Burns 6 oil per hour for 2.5x the output per room of a gas plant.',
    energyPerSecond: 20,
    roomCost: 10,
    buildCost: { metal: 300, stone: 150 },
    maintenanceCost: { oil: 6 },
  },
  [GeneratorType.NUCLEAR]: {
    type: GeneratorType.NUCLEAR,
    requiredLevel: 10,
    name: 'Nuclear Fission Plant',
    description: 'Splits uranium: huge, steady output. Burns 1 uranium per hour.',
    energyPerSecond: 60,
    roomCost: 12,
    buildCost: { metal: 800, stone: 600 },
    maintenanceCost: { uranium: 1 },
  },
  // ---- Fictional (0.34): the few methods that do not exist (yet). About 2.5x the energy per room again each. ----
  [GeneratorType.FUSION]: {
    type: GeneratorType.FUSION,
    requiredLevel: 12,
    name: 'Fusion Reactor',
    description: 'A star in a magnetic bottle. Burns 1 deuterium per hour for 2.5x the output per room of fission.',
    energyPerSecond: 200,
    roomCost: 16,
    buildCost: { metal: 4000, stone: 2500, deuterium: 5 },
    maintenanceCost: { deuterium: 1 },
  },
  [GeneratorType.SUPERNOVA]: {
    type: GeneratorType.SUPERNOVA,
    requiredLevel: 14,
    name: 'Micro-Supernova',
    description: 'A supernova in a fast-time micro dimension: a star lives and dies every second, and we catch the light. Burns 2 deuterium per hour.',
    energyPerSecond: 780,
    roomCost: 25,
    buildCost: { metal: 12000, stone: 8000, deuterium: 10 },
    maintenanceCost: { deuterium: 2 },
  },
};

export type FullGeneratorType = GeneratorType.OIL | GeneratorType.NUCLEAR | GeneratorType.FUSION | GeneratorType.SUPERNOVA;
