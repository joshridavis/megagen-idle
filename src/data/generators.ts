import { GeneratorType, type GeneratorDef } from '../types/generator';

/**
 * Every generator also costs energy: its base output over this many seconds.
 * Playtest 2 set 10 minutes; playtest 3 found that too easy, so 30 minutes.
 */
export const GENERATOR_ENERGY_COST_SECONDS = 1800;

/** Generators, cheapest first. Costs in resources; maintenance in resources per hour. */
export const GENERATORS: Record<GeneratorType, GeneratorDef> = {
  [GeneratorType.SOLAR]: {
    type: GeneratorType.SOLAR,
    requiredLevel: 1,
    name: 'Solar Panel',
    description: 'Quiet and fuel-free. Small output.',
    energyPerSecond: 0.5,
    roomCost: 2,
    buildCost: { metal: 10 },
  },
  [GeneratorType.WIND]: {
    type: GeneratorType.WIND,
    requiredLevel: 1,
    name: 'Wind Turbine',
    description: 'More output than solar, needs a stone foundation.',
    energyPerSecond: 0.8,
    roomCost: 3,
    buildCost: { metal: 15, stone: 8 },
  },
  [GeneratorType.COAL]: {
    type: GeneratorType.COAL,
    requiredLevel: 1,
    name: 'Coal Plant',
    description: 'Strong output, burns 1 coal per minute.',
    energyPerSecond: 2,
    roomCost: 5,
    buildCost: { metal: 20, stone: 15 },
    maintenanceCost: { coal: 60 },
  },
  [GeneratorType.HYDRO]: {
    type: GeneratorType.HYDRO,
    requiredLevel: 5,
    name: 'Hydropower Dam',
    description: 'Big, fuel-free and steady. Needs lots of stone.',
    energyPerSecond: 5,
    roomCost: 8,
    buildCost: { metal: 100, stone: 120 },
  },
  [GeneratorType.TIDAL]: {
    type: GeneratorType.TIDAL,
    requiredLevel: 6,
    name: 'Tidal Power Station',
    description: 'Harnesses the tides. Fuel-free, more output per room than a dam.',
    energyPerSecond: 6,
    roomCost: 9,
    buildCost: { metal: 120, stone: 90 },
  },
  [GeneratorType.GAS]: {
    type: GeneratorType.GAS,
    requiredLevel: 7,
    name: 'Natural Gas Plant',
    description: 'Highest output so far. Burns 2 natural gas per hour.',
    energyPerSecond: 8,
    roomCost: 10,
    buildCost: { metal: 150, stone: 75 },
    maintenanceCost: { naturalGas: 2 },
  },
};

export const GENERATOR_TYPES = Object.values(GeneratorType);
