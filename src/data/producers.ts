import type { ProducerDef, ProducerId } from '../types/resource';

/** Each producer bought costs this many times more than the previous one. */
export const PRODUCER_COST_GROWTH = 1.2;

export const PRODUCERS: Record<ProducerId, ProducerDef> = {
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
};

export const PRODUCER_IDS = Object.keys(PRODUCERS) as ProducerId[];

/** The player starts with one of each basic producer already running. */
export const STARTING_PRODUCERS: Record<ProducerId, number> = { quarry: 1, mine: 1, coalMine: 1, gasWell: 0 };
