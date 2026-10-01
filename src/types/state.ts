export type ResourceId = 'coal' | 'stone' | 'metal' | 'naturalGas';

export type Resources = Record<ResourceId, number>;

export interface GameState {
  energy: number;
  resources: Resources;
  researchLevel: number;
  activeGenerators: string[];
  roomCapacity: number;
  roomUsed: number;
  /** Energy produced per second by all sources combined. */
  totalProductionPerSecond: number;
  /** Epoch ms of the last time idle gains were applied. */
  lastSavedTimestamp: number;
}
