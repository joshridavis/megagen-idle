import type { Generator, GeneratorType } from './generator';
import type { ProducerId } from './resource';
import type { CurrentResearch } from './research';

export type ResourceId = 'coal' | 'stone' | 'metal' | 'naturalGas' | 'oil' | 'uranium';

export type Resources = Record<ResourceId, number>;

export type NumberNotation = 'short' | 'scientific' | 'full';

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
  /** All energy ever produced (generators, clicks, offline); never lowered by spending. Sets the player level (0.88). */
  lifetimeEnergy: number;
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
  /** Permanent records for completion: scrapping never lowers them (0.82). */
  records: GeneratorRecords;
}

export interface GeneratorRecords {
  /** Generator types ever built. */
  builtTypes: GeneratorType[];
  /** Highest upgrade level ever reached per type. */
  bestLevel: Partial<Record<GeneratorType, number>>;
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
