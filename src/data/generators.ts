import { GeneratorType, type GeneratorDef } from '../types/generator';

/**
 * Every generator also costs energy: its base output over this many seconds
 * (playtest 2: "the amount it creates in 10 minutes").
 */
export const GENERATOR_ENERGY_COST_SECONDS = 600;

/** First-tier generators. Costs in resources; maintenance in resources per hour. */
export const GENERATORS: Record<GeneratorType, GeneratorDef> = {
  [GeneratorType.SOLAR]: {
    type: GeneratorType.SOLAR,
    name: 'Solar Panel',
    description: 'Quiet and fuel-free. Small output.',
    energyPerSecond: 0.5,
    roomCost: 2,
    buildCost: { metal: 10 },
  },
  [GeneratorType.WIND]: {
    type: GeneratorType.WIND,
    name: 'Wind Turbine',
    description: 'More output than solar, needs a stone foundation.',
    energyPerSecond: 0.8,
    roomCost: 3,
    buildCost: { metal: 15, stone: 5 },
  },
  [GeneratorType.COAL]: {
    type: GeneratorType.COAL,
    name: 'Coal Plant',
    description: 'Strong output, burns 1 coal per minute.',
    energyPerSecond: 2,
    roomCost: 5,
    buildCost: { metal: 20, stone: 10 },
    maintenanceCost: { coal: 60 },
  },
};

export const GENERATOR_TYPES = Object.values(GeneratorType);
