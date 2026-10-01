export type ResourceId = 'coal' | 'stone' | 'metal' | 'naturalGas';

export type Resources = Record<ResourceId, number>;

export interface GameState {
  energy: number;
  resources: Resources;
  researchLevel: number;
  activeGenerators: string[];
  roomCapacity: number;
  roomUsed: number;
}
