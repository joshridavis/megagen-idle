import { GeneratorType, type GeneratorDef } from '../types/generator';
import { scaleMaterials } from './balance';
import { DEMO_BUILD } from './edition';
import { FULL_GENERATOR_DEFS, type FullGeneratorType } from './generatorsFull';

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
const FREE_GENERATOR_DEFS: Omit<Record<GeneratorType, GeneratorDef>, FullGeneratorType> = {
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

/** The Full Game's machines in the demo (2.04): the name only, never buildable (no research unlocks them). */
const stub = (type: FullGeneratorType, name: string): GeneratorDef => ({
  type,
  name,
  description: 'Part of the Full Game.',
  energyPerSecond: 0,
  roomCost: 0,
  requiredLevel: Infinity,
  buildCost: {},
  fullGame: true,
});
const FULL_GAME_STUBS: Pick<Record<GeneratorType, GeneratorDef>, FullGeneratorType> = {
  [GeneratorType.OIL]: stub(GeneratorType.OIL, 'Oil Power Plant'),
  [GeneratorType.NUCLEAR]: stub(GeneratorType.NUCLEAR, 'Nuclear Fission Plant'),
  [GeneratorType.FUSION]: stub(GeneratorType.FUSION, 'Fusion Reactor'),
  [GeneratorType.SUPERNOVA]: stub(GeneratorType.SUPERNOVA, 'Micro-Supernova'),
};

const GENERATOR_DEFS: Record<GeneratorType, GeneratorDef> = { ...FREE_GENERATOR_DEFS, ...(DEMO_BUILD ? FULL_GAME_STUBS : FULL_GENERATOR_DEFS) };

/** The generators, with metal and stone costs scaled by MATERIAL_COST_FACTOR (playtest 19.3). */
export const GENERATORS = Object.fromEntries(
  Object.entries(GENERATOR_DEFS).map(([type, def]) => [type, { ...def, buildCost: scaleMaterials(def.buildCost) }]),
) as Record<GeneratorType, GeneratorDef>;

export const GENERATOR_TYPES = Object.values(GeneratorType);
