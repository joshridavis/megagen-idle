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
];

export const RESEARCH_BY_ID: Record<string, ResearchDef> = Object.fromEntries(RESEARCH.map((r) => [r.id, r]));
