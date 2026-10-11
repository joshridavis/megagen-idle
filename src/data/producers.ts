import type { ProducerDef, ProducerId } from '../types/resource';
import { scaleMaterials } from './balance';
import { DEMO_BUILD } from './edition';
import { FULL_PRODUCER_DEFS, type FullProducerId } from './producersFull';

/** Each producer bought costs this many times more than the previous one. */
export const PRODUCER_COST_GROWTH = 1.2;

const FREE_PRODUCER_DEFS: Omit<Record<ProducerId, ProducerDef>, FullProducerId> = {
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
  // The first one is granted by Natural Gas Extraction. With every late-game boost on both sides (research,
  // zone, pets; see src/utils/fuelBalance.ts) one well fuels about three gas plants (1.86: was ten).
  gasWell: {
    id: 'gasWell',
    name: 'Gas Well',
    resource: 'naturalGas',
    amount: 1,
    intervalSeconds: 2100,
    roomCost: 2,
    baseCost: { energy: 6000, resources: { metal: 60, stone: 30 } },
    requiresResearch: 'gas_extraction',
  },
  // 0.33. The first one is granted by Oil Drilling. Late game, one rig fuels about two oil plants (1.86: was six).
  oilRig: {
    id: 'oilRig',
    name: 'Oil Rig',
    resource: 'oil',
    amount: 1,
    intervalSeconds: 960,
    roomCost: 2,
    baseCost: { energy: 20000, resources: { metal: 200, stone: 100 } },
    requiresResearch: 'oil_drilling',
  },
};

/** The Full Game's producers in the demo (2.04): the name and resource only, never buyable. */
const stub = (id: FullProducerId, name: string, resource: ProducerDef['resource']): ProducerDef => ({
  id,
  name,
  resource,
  amount: 0,
  intervalSeconds: 1,
  roomCost: 0,
  baseCost: { energy: 0, resources: {} },
  fullGame: true,
});
const FULL_GAME_STUBS: Record<FullProducerId, ProducerDef> = {
  uraniumMine: stub('uraniumMine', 'Uranium Mine', 'uranium'),
  deuteriumExtractor: stub('deuteriumExtractor', 'Deuterium Extractor', 'deuterium'),
};

const PRODUCER_DEFS: Record<ProducerId, ProducerDef> = { ...FREE_PRODUCER_DEFS, ...(DEMO_BUILD ? FULL_GAME_STUBS : FULL_PRODUCER_DEFS) };

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
