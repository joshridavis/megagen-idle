import type { Generator } from './generator';
import type { ProducerId } from './resource';
import type { CurrentResearch } from './research';

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
  /** Rises by one each time a research completes. */
  researchLevel: number;
  currentResearch: CurrentResearch | null;
  /** IDs of finished research, in completion order. */
  completedResearch: string[];
}

export interface RoomState {
  roomCapacity: number;
  roomUsed: number;
  expansionLevel: number;
  /** Epoch ms of the last expansion; drives the construction animation. */
  lastExpansionAt: number | null;
}

export interface SettingsState {
  settings: Settings;
}

/** Everything that is saved. */
export type GameState = EnergyState & ResourceState & GeneratorState & ResearchState & RoomState & SettingsState;
