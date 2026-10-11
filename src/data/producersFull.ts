import type { ProducerDef } from '../types/resource';

export type FullProducerId = 'uraniumMine' | 'deuteriumExtractor';

/**
 * The producers past the free part (2.04): each needs a research past FREE_MAX_RESEARCH_LEVEL. Kept
 * apart so the demo bundle leaves them out (src/data/producers.ts puts name-only stand-ins there).
 */
export const FULL_PRODUCER_DEFS: Record<FullProducerId, ProducerDef> = {
  // 0.33. The first one is granted by Uranium Mining. Late game, one mine fuels about two reactors (1.86: was seven).
  uraniumMine: {
    id: 'uraniumMine',
    name: 'Uranium Mine',
    resource: 'uranium',
    amount: 1,
    intervalSeconds: 6000,
    roomCost: 2,
    baseCost: { energy: 60000, resources: { metal: 400, stone: 300 } },
    requiresResearch: 'uranium_mining',
  },
  // 0.34. Heavy water from the sea, for fusion. The first one is granted by Heavy Water Extraction.
  // Late game, one extractor fuels about two Fusion Reactors or one Micro-Supernova (1.86: was thirty reactors).
  deuteriumExtractor: {
    id: 'deuteriumExtractor',
    name: 'Deuterium Extractor',
    resource: 'deuterium',
    amount: 1,
    intervalSeconds: 5400,
    roomCost: 3,
    baseCost: { energy: 400000, resources: { metal: 1500, stone: 800 } },
    requiresResearch: 'heavy_water',
  },
};
