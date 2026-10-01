import type { ProducerDef, ProducerId } from '../types/resource';

export const PRODUCERS: Record<ProducerId, ProducerDef> = {
  quarry: { id: 'quarry', name: 'Stone Quarry', resource: 'stone', amount: 1, intervalSeconds: 10 },
  mine: { id: 'mine', name: 'Metal Mine', resource: 'metal', amount: 1, intervalSeconds: 15 },
  coalMine: { id: 'coalMine', name: 'Coal Mine', resource: 'coal', amount: 1, intervalSeconds: 20 },
  // Granted by the Natural Gas Extraction research. One well fuels three gas plants.
  gasWell: { id: 'gasWell', name: 'Gas Well', resource: 'naturalGas', amount: 1, intervalSeconds: 600 },
};

export const PRODUCER_IDS = Object.keys(PRODUCERS) as ProducerId[];

/** The player starts with one of each already running. */
export const STARTING_PRODUCERS: Record<ProducerId, number> = { quarry: 1, mine: 1, coalMine: 1, gasWell: 0 };
