import { GeneratorType } from '../types/generator';
import type { ResearchDef } from '../types/research';
import { DEMO_BUILD, spliceAfter } from './edition';
import { FULL_RESEARCH_DEFS } from './researchFull';
import { MID_RESEARCH_COST_FACTOR, MID_RESEARCH_LEVEL, MID_RESEARCH_TIME_FACTOR, RESEARCH_TIME_FACTOR, scaleMaterials } from './balance';

/** Generators available before any research (playtest 2: Solar from the start). */
export const STARTING_GENERATORS: GeneratorType[] = [GeneratorType.SOLAR];

/** Named caps so stacked bonuses cannot break the game. Bonuses of one type add together, then cap. */
export const BONUS_CAPS = {
  buildDiscount: 0.75,
  researchCostReduction: 0.75,
  researchSpeed: 4,
  producerDiscount: 0.75,
  fuelEfficiency: 0.75,
  /**
   * At most 2% of a second of production per click (1.93, playtest 28: was half a second, so
   * fast clicking beat idling by far). Idling stays the main income.
   */
  clickRateShare: 0.02,
};

/**
 * Rule (playtest 22, 1.62): the research level is 1 + research completed, so the upper research
 * needs most of the tree done first; the last one needs all but one of the others.
 * Rule (playtest 3): a research takes longer than every research with a lower
 * level requirement, and longer than each of its prerequisites. Durations are
 * in seconds. Checked by src/data/research.test.ts.
 */
const FREE_RESEARCH_DEFS: ResearchDef[] = [
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
    id: 'basic_mining',
    name: 'Basic Mining',
    description: 'Sharper tools and better routes for every producer. Starts the resource upgrades.',
    category: 'materials',
    requiredLevel: 1,
    cost: { energy: 300, resources: { stone: 15 } },
    duration: 12 * 60,
    prerequisites: [],
    // Same reason as Basic Solar: the starting energy must go to the first panel.
    requiresBuilt: [GeneratorType.SOLAR],
    unlocks: {},
    effects: [{ type: 'resourceProduction', value: 0.1 }],
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
    cost: { energy: 5000, resources: { stone: 75 } },
    duration: 60 * 60,
    prerequisites: ['wind_power'],
    unlocks: { generators: [GeneratorType.HYDRO] },
  },
  {
    id: 'gas_extraction',
    name: 'Natural Gas Extraction',
    description: 'Drills your first Gas Well: 1 natural gas every 35 minutes.',
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
  // ---- Permanent boosts (0.30). Numbers are first guesses, tuned by the balance simulator (0.35). ----
  {
    id: 'hand_crank',
    name: 'Hand-Crank Dynamo',
    description: 'A better crank on the generator button. Doubles energy per click.',
    category: 'efficiency',
    requiredLevel: 3,
    cost: { energy: 800 },
    duration: 50 * 60,
    prerequisites: ['basic_solar'],
    unlocks: {},
    effects: [{ type: 'clickPower', value: 1 }],
  },
  {
    id: 'standard_parts',
    name: 'Standard Parts',
    description: 'Interchangeable parts make every build a little cheaper.',
    category: 'materials',
    requiredLevel: 3,
    cost: { energy: 1000, resources: { metal: 20 } },
    duration: 52 * 60,
    prerequisites: ['basic_solar'],
    unlocks: {},
    effects: [{ type: 'buildDiscount', value: 0.05 }],
  },
  {
    id: 'lab_notebooks',
    name: 'Lab Notebooks',
    description: 'Careful notes speed up every research.',
    category: 'efficiency',
    requiredLevel: 3,
    cost: { energy: 1200 },
    duration: 55 * 60,
    prerequisites: ['basic_solar'],
    unlocks: {},
    effects: [{ type: 'researchSpeed', value: 0.1 }],
  },
  {
    id: 'grant_funding',
    name: 'Grant Funding',
    description: 'Outside funding pays part of every research.',
    category: 'efficiency',
    requiredLevel: 4,
    cost: { energy: 3000 },
    duration: 65 * 60,
    prerequisites: ['lab_notebooks'],
    unlocks: {},
    effects: [{ type: 'researchCostReduction', value: 0.1 }],
  },
  {
    id: 'smart_grid',
    name: 'Smart Grid',
    description: 'Less energy lost between generators and storage.',
    category: 'efficiency',
    requiredLevel: 5,
    cost: { energy: 9000, resources: { metal: 60 } },
    duration: 80 * 60,
    prerequisites: ['lab_notebooks'],
    unlocks: {},
    effects: [{ type: 'globalEnergy', value: 0.1 }],
  },
  {
    id: 'bulk_purchasing',
    name: 'Bulk Purchasing',
    description: 'Buying materials in bulk makes building cheaper still.',
    category: 'materials',
    requiredLevel: 5,
    cost: { energy: 7000, resources: { metal: 80, stone: 40 } },
    duration: 85 * 60,
    prerequisites: ['standard_parts'],
    unlocks: {},
    effects: [{ type: 'buildDiscount', value: 0.05 }],
  },
  {
    id: 'automated_labs',
    name: 'Automated Labs',
    description: 'Robots run the routine experiments.',
    category: 'efficiency',
    requiredLevel: 6,
    cost: { energy: 16000, resources: { metal: 120 } },
    duration: 130 * 60,
    prerequisites: ['grant_funding'],
    unlocks: {},
    effects: [{ type: 'researchSpeed', value: 0.15 }],
  },
  {
    id: 'superconductors',
    name: 'Superconductors',
    description: 'Near-lossless cables boost every generator.',
    category: 'efficiency',
    requiredLevel: 9,
    cost: { energy: 30000, resources: { metal: 150 } },
    duration: 3 * 60 * 60,
    prerequisites: ['smart_grid'],
    unlocks: {},
    effects: [{ type: 'globalEnergy', value: 0.15 }],
  },
  // ---- Resource boosts (0.75, playtest 7). First guesses, tuned by the balance simulator (0.35). ----
  {
    id: 'better_picks',
    name: 'Better Pickaxes',
    description: 'Hardened tools for the metal mines.',
    category: 'materials',
    requiredLevel: 3,
    cost: { energy: 1500, resources: { stone: 30 } },
    duration: 53 * 60,
    prerequisites: ['basic_mining'],
    unlocks: {},
    effects: [{ type: 'metalProduction', value: 0.25 }],
  },
  {
    id: 'controlled_blasting',
    name: 'Controlled Blasting',
    description: 'Careful charges split more stone in the quarries.',
    category: 'materials',
    requiredLevel: 3,
    cost: { energy: 1500, resources: { metal: 30 } },
    duration: 54 * 60,
    prerequisites: ['basic_mining'],
    unlocks: {},
    effects: [{ type: 'stoneProduction', value: 0.25 }],
  },
  {
    id: 'conveyor_belts',
    name: 'Conveyor Belts',
    description: 'Every producer moves material faster.',
    category: 'materials',
    requiredLevel: 4,
    cost: { energy: 4000, resources: { metal: 100 } },
    duration: 63 * 60,
    prerequisites: ['better_picks'],
    unlocks: {},
    effects: [{ type: 'resourceProduction', value: 0.15 }],
  },
  {
    id: 'modular_mines',
    name: 'Modular Mines',
    description: 'Prefabricated parts make new producers cheaper.',
    category: 'materials',
    requiredLevel: 4,
    cost: { energy: 3500, resources: { metal: 60, stone: 60 } },
    duration: 64 * 60,
    prerequisites: ['basic_mining'],
    unlocks: {},
    effects: [{ type: 'producerDiscount', value: 0.15 }],
  },
  {
    id: 'efficient_boilers',
    name: 'Efficient Boilers',
    description: 'Fuel-burning generators use less coal and gas.',
    category: 'efficiency',
    requiredLevel: 5,
    cost: { energy: 10000, resources: { metal: 80, coal: 50 } },
    duration: 78 * 60,
    prerequisites: ['fossil_fuels'],
    unlocks: {},
    effects: [{ type: 'fuelEfficiency', value: 0.2 }],
  },
  {
    id: 'deep_drilling',
    name: 'Deep Drilling',
    description: 'Reach richer seams: every producer yields more.',
    category: 'materials',
    requiredLevel: 6,
    cost: { energy: 20000, resources: { metal: 200, stone: 100 } },
    duration: 125 * 60,
    prerequisites: ['conveyor_belts'],
    unlocks: {},
    effects: [{ type: 'resourceProduction', value: 0.2 }],
  },
  // ---- Click power (0.83, playtest 10). Late ones add a share of energy/s so clicks stay useful. ----
  {
    id: 'ergonomic_handle',
    name: 'Ergonomic Handle',
    description: 'A grip that fits the hand. Every click gives more energy.',
    category: 'efficiency',
    requiredLevel: 4,
    cost: { energy: 4000, resources: { metal: 40 } },
    duration: 62 * 60,
    prerequisites: ['hand_crank'],
    unlocks: {},
    effects: [{ type: 'clickPower', value: 1 }],
  },
  {
    id: 'flywheel',
    name: 'Flywheel',
    description: 'A heavy wheel keeps spinning between clicks.',
    category: 'efficiency',
    requiredLevel: 5,
    cost: { energy: 9000, resources: { metal: 90, stone: 40 } },
    duration: 82 * 60,
    prerequisites: ['ergonomic_handle'],
    unlocks: {},
    effects: [{ type: 'clickPower', value: 2 }],
  },
  {
    id: 'geared_crank',
    name: 'Geared Crank',
    description: 'Gears multiply every turn of the crank.',
    category: 'efficiency',
    requiredLevel: 6,
    cost: { energy: 18000, resources: { metal: 150 } },
    duration: 135 * 60,
    prerequisites: ['flywheel'],
    unlocks: {},
    effects: [{ type: 'clickPower', value: 4 }],
  },
  {
    id: 'reinforced_concrete',
    name: 'Reinforced Concrete',
    description: 'Steel-backed foundations make every build cheaper.',
    category: 'materials',
    requiredLevel: 9,
    cost: { energy: 35000, resources: { metal: 200, stone: 200 } },
    duration: 190 * 60,
    prerequisites: ['bulk_purchasing'],
    unlocks: {},
    effects: [{ type: 'buildDiscount', value: 0.05 }],
  },
  {
    id: 'oil_drilling',
    name: 'Oil Drilling',
    description: 'Builds your first Oil Rig: 1 oil every 16 minutes.',
    category: 'materials',
    requiredLevel: 9,
    cost: { energy: 40000, resources: { metal: 200, naturalGas: 10 } },
    duration: 200 * 60,
    prerequisites: ['gas_extraction'],
    unlocks: { producers: { oilRig: 1 } },
  },
];

/** The free research, plus the research past the free part except in the demo (2.04). */
const RESEARCH_DEFS: ResearchDef[] = DEMO_BUILD ? FREE_RESEARCH_DEFS : spliceAfter(FREE_RESEARCH_DEFS, FULL_RESEARCH_DEFS, (r) => r.id);

/**
 * The research list, with durations scaled by RESEARCH_TIME_FACTOR (to whole minutes) and
 * metal and stone costs by MATERIAL_COST_FACTOR (playtest 19.3); middle and late research
 * (MID_RESEARCH_LEVEL and up) costs and takes more (1.87).
 */
export const RESEARCH: ResearchDef[] = RESEARCH_DEFS.map((r) => {
  const mid = r.requiredLevel >= MID_RESEARCH_LEVEL;
  return {
    ...r,
    duration: Math.round((r.duration * RESEARCH_TIME_FACTOR * (mid ? MID_RESEARCH_TIME_FACTOR : 1)) / 60) * 60, // whole minutes
    cost: { ...r.cost, energy: r.cost.energy * (mid ? MID_RESEARCH_COST_FACTOR : 1), resources: r.cost.resources && scaleMaterials(r.cost.resources) },
  };
});

export const RESEARCH_BY_ID: Record<string, ResearchDef> = Object.fromEntries(RESEARCH.map((r) => [r.id, r]));
