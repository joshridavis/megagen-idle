import type { Generator } from './generator';
import type { ProducerId } from './resource';

export type ResourceId = 'coal' | 'stone' | 'metal' | 'naturalGas';

export type Resources = Record<ResourceId, number>;

export type NumberNotation = 'short' | 'scientific';

/** Player preferences. No audio settings: audio is out of scope. */
export interface Settings {
  notation: NumberNotation;
}

export interface EnergyState {
  energy: number;
  /** Energy produced per second by all sources combined (derived, cached). */
  energyPerSecond: number;
  /** Epoch ms of the last time idle gains were applied. */
  lastSavedTimestamp: number;
}

export interface ResourceState {
  resources: Resources;
  /** Number of each producer the player owns. */
  producers: Record<ProducerId, number>;
  /** Resources that ran out and switched generators off (shown as a warning until dismissed). */
  depletedResources: ResourceId[];
}

export interface GeneratorState {
  /** Every built generator, active or not. */
  activeGenerators: Generator[];
}

export interface ResearchState {
  researchLevel: number;
}

export interface RoomState {
  roomCapacity: number;
  roomUsed: number;
  expansionLevel: number;
}

export interface SettingsState {
  settings: Settings;
}

/** Everything that is saved. */
export type GameState = EnergyState & ResourceState & GeneratorState & ResearchState & RoomState & SettingsState;
