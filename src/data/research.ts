import { GeneratorType } from '../types/generator';
import type { ResearchDef } from '../types/research';

/** Generators available before any research (playtest 2: Solar from the start). */
export const STARTING_GENERATORS: GeneratorType[] = [GeneratorType.SOLAR];

/** Named caps so stacked bonuses cannot break the game. Tuned in 0.30/0.35. */
export const BONUS_CAPS = {
  buildDiscount: 0.75,
  researchCostReduction: 0.75,
  researchSpeed: 4,
};

/**
 * Rule (playtest 3): a research takes longer than every research with a lower
 * level requirement, and longer than each of its prerequisites. Durations are
 * in seconds. Checked by src/data/research.test.ts.
 */
export const RESEARCH: ResearchDef[] = [
  {
    id: 'basic_solar',
    name: 'Basic Solar',
    description: 'Better panel wiring. +10% energy from all generators.',
    category: 'energy',
    requiredLevel: 1,
    cost: { energy: 250 },
    duration: 10 * 60,
    prerequisites: [],
    // Needs a panel to improve; also stops the starting energy being spent
    // on research before the first generator, which would leave no income.
    requiresBuilt: [GeneratorType.SOLAR],
    unlocks: {},
    effects: [{ type: 'globalEnergy', value: 0.1 }],
  },
  {
    id: 'wind_power',
    name: 'Wind Power Fundamentals',
    description: 'Unlocks the Wind Turbine.',
    category: 'energy',
    requiredLevel: 2,
    cost: { energy: 1000 },
    duration: 30 * 60,
    prerequisites: ['basic_solar'],
    unlocks: { generators: [GeneratorType.WIND] },
  },
  {
    id: 'fossil_fuels',
    name: 'Fossil Fuels 101',
    description: 'Unlocks the Coal Plant.',
    category: 'energy',
    requiredLevel: 2,
    cost: { energy: 1500, resources: { coal: 10 } },
    duration: 45 * 60,
    prerequisites: [],
    unlocks: { generators: [GeneratorType.COAL] },
  },
  {
    id: 'hydropower',
    name: 'Hydropower',
    description: 'Unlocks the Hydropower Dam (needs research level 5).',
    category: 'energy',
    requiredLevel: 4,
    cost: { energy: 5000, resources: { stone: 50 } },
    duration: 60 * 60,
    prerequisites: ['wind_power'],
    unlocks: { generators: [GeneratorType.HYDRO] },
  },
  {
    id: 'gas_extraction',
    name: 'Natural Gas Extraction',
    description: 'Drills your first Gas Well: 1 natural gas every 10 minutes.',
    category: 'materials',
    requiredLevel: 5,
    cost: { energy: 8000, resources: { coal: 20, metal: 50 } },
    duration: 75 * 60,
    prerequisites: ['fossil_fuels'],
    unlocks: { producers: { gasWell: 1 } },
  },
  {
    id: 'tidal_power',
    name: 'Tidal Power',
    description: 'Unlocks the Tidal Power Station (needs research level 6).',
    category: 'energy',
    requiredLevel: 5,
    cost: { energy: 10000, resources: { metal: 100 } },
    duration: 90 * 60,
    prerequisites: ['hydropower'],
    unlocks: { generators: [GeneratorType.TIDAL] },
  },
  {
    id: 'gas_turbines',
    name: 'Gas Turbines',
    description: 'Unlocks the Natural Gas Plant (needs research level 7).',
    category: 'energy',
    requiredLevel: 6,
    cost: { energy: 15000, resources: { metal: 150 } },
    duration: 2 * 60 * 60,
    prerequisites: ['gas_extraction'],
    unlocks: { generators: [GeneratorType.GAS] },
  },
];

export const RESEARCH_BY_ID: Record<string, ResearchDef> = Object.fromEntries(RESEARCH.map((r) => [r.id, r]));
