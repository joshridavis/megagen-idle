import { GeneratorType, type GeneratorDef } from '../types/generator';
import { scaleMaterials } from './balance';

/**
 * Every generator also costs energy: its base output over this many seconds.
 * Playtest 2 set 10 minutes; playtest 3 found that too easy, so 30 minutes.
 */
export const GENERATOR_ENERGY_COST_SECONDS = 1800;

/**
 * Generator upgrades (0.32): each level adds `outputPerLevel` of the base
 * output (level 1 = base). Upgrading from level L costs the build energy
 * x costGrowth^L and the build resources x resourceGrowth^L (resources grow
 * slower so upgrades are mainly an energy sink). From `steepFromLevel` on the
 * energy cost also grows by `steepGrowth` per level (1.87: harder late game).
 * Upgrades never take more room.
 * Tuned with the balance simulator (BALANCE_REPORT.md).
 */
export const UPGRADES = { maxLevel: 10, outputPerLevel: 0.25, costGrowth: 1.6, resourceGrowth: 1.3, steepFromLevel: 5, steepGrowth: 1.4 };
/** Share of everything spent on a machine (build and upgrades) given back when it is scrapped (1.24, playtest 18). */
export const SCRAP_REFUND_SHARE = 0.1;

/** Generators, cheapest first. Costs in resources; maintenance in resources per hour. */
const GENERATOR_DEFS: Record<GeneratorType, GeneratorDef> = {
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

/** The generators, with metal and stone costs scaled by MATERIAL_COST_FACTOR (playtest 19.3). */
export const GENERATORS = Object.fromEntries(
  Object.entries(GENERATOR_DEFS).map(([type, def]) => [type, { ...def, buildCost: scaleMaterials(def.buildCost) }]),
) as Record<GeneratorType, GeneratorDef>;

export const GENERATOR_TYPES = Object.values(GeneratorType);
