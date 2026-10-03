import type { ProducerDef, ProducerId } from '../types/resource';
import { scaleMaterials } from './balance';

/** Each producer bought costs this many times more than the previous one. */
export const PRODUCER_COST_GROWTH = 1.2;

const PRODUCER_DEFS: Record<ProducerId, ProducerDef> = {
  quarry: {
    id: 'quarry',
    name: 'Stone Quarry',
    resource: 'stone',
    amount: 1,
    intervalSeconds: 10,
    roomCost: 1,
    baseCost: { energy: 600, resources: { metal: 15 } },
  },
  mine: {
    id: 'mine',
    name: 'Metal Mine',
    resource: 'metal',
    amount: 1,
    intervalSeconds: 15,
    roomCost: 1,
    baseCost: { energy: 900, resources: { stone: 20 } },
  },
  coalMine: {
    id: 'coalMine',
    name: 'Coal Mine',
    resource: 'coal',
    amount: 1,
    intervalSeconds: 20,
    roomCost: 1,
    baseCost: { energy: 1200, resources: { metal: 15, stone: 10 } },
  },
  // The first one is granted by Natural Gas Extraction. One well fuels three gas plants.
  gasWell: {
    id: 'gasWell',
    name: 'Gas Well',
    resource: 'naturalGas',
    amount: 1,
    intervalSeconds: 600,
    roomCost: 2,
    baseCost: { energy: 6000, resources: { metal: 60, stone: 30 } },
    requiresResearch: 'gas_extraction',
  },
  // 0.33. The first one is granted by Oil Drilling. One rig fuels two oil plants.
  oilRig: {
    id: 'oilRig',
    name: 'Oil Rig',
    resource: 'oil',
    amount: 1,
    intervalSeconds: 300,
    roomCost: 2,
    baseCost: { energy: 20000, resources: { metal: 200, stone: 100 } },
    requiresResearch: 'oil_drilling',
  },
  // 0.33. The first one is granted by Uranium Mining. One mine fuels two reactors.
  uraniumMine: {
    id: 'uraniumMine',
    name: 'Uranium Mine',
    resource: 'uranium',
    amount: 1,
    intervalSeconds: 1800,
    roomCost: 2,
    baseCost: { energy: 60000, resources: { metal: 400, stone: 300 } },
    requiresResearch: 'uranium_mining',
  },
  // 0.34. Heavy water from the sea, for fusion. The first one is granted by Heavy Water Extraction.
  deuteriumExtractor: {
    id: 'deuteriumExtractor',
    name: 'Deuterium Extractor',
    resource: 'deuterium',
    amount: 1,
    intervalSeconds: 360,
    roomCost: 3,
    baseCost: { energy: 400000, resources: { metal: 1500, stone: 800 } },
    requiresResearch: 'heavy_water',
  },
};

/** The producers, with metal and stone costs scaled by MATERIAL_COST_FACTOR (playtest 19.3). */
export const PRODUCERS = Object.fromEntries(
  Object.entries(PRODUCER_DEFS).map(([id, def]) => [
    id,
    { ...def, baseCost: { ...def.baseCost, resources: scaleMaterials(def.baseCost.resources) } },
  ]),
) as Record<ProducerId, ProducerDef>;

export const PRODUCER_IDS = Object.keys(PRODUCERS) as ProducerId[];

/** The player starts with one of each basic producer already running. */
export const STARTING_PRODUCERS: Record<ProducerId, number> = { quarry: 1, mine: 1, coalMine: 1, gasWell: 0, oilRig: 0, uraniumMine: 0, deuteriumExtractor: 0 };
