import type { Generator, GeneratorType } from './generator';
import type { ProducerId } from './resource';
import type { CurrentResearch } from './research';
import type { ActiveEffect } from '../utils/effectMods';

export type ResourceId = 'coal' | 'stone' | 'metal' | 'naturalGas' | 'oil' | 'uranium';

export type Resources = Record<ResourceId, number>;

export type NumberNotation = 'short' | 'scientific' | 'full';

/** How "Your generators" is shown (0.96); 'custom' is the saved fuel-priority order. */
export type GeneratorSort = 'custom' | 'output-desc' | 'output-asc' | 'level-desc' | 'level-asc' | 'type';

/** Player preferences. No audio settings: audio is out of scope. */
export interface Settings {
  notation: NumberNotation;
  /** Turns off the random-event animations (0.84); events are still recorded. */
  reduceMotion: boolean;
  /** First-run walkthrough (0.40): current step (TUTORIAL_DONE when finished); replay steps with "Next". */
  tutorial: { step: number; replay: boolean };
  generatorSort: GeneratorSort;
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
/** Random events seen so far (0.84): count and first time, kept for collections and achievements. */
export interface EventsState {
  seenEvents: Record<string, { count: number; firstSeen: number }>;
  /** Timed event effects in progress (0.85), each with its end time. */
  activeEffects: ActiveEffect[];
}

/** One Grid Contract (0.86). */
export interface Contract {
  id: string;
  kind: 'energy' | 'resources' | 'produce';
  /** What to hand over (energy and resources contracts). */
  energy?: number;
  resources?: Partial<Record<ResourceId, number>>;
  /** Energy to produce from `startLifetime` on (produce contracts). */
  produce?: number;
  startLifetime?: number;
  /** Size, 1-3: sets the Contract Points reward. */
  tier: number;
  deadline: number;
  /** 'complete' waits for the player to pick a reward. */
  status: 'open' | 'complete';
}

export interface ContractsState {
  contracts: {
    open: Contract[];
    /** When the next offer fills an empty slot (epoch ms). */
    nextOfferAt: number;
    done: number;
    points: number;
    perks: Partial<Record<'slot' | 'deadline' | 'rewards' | 'offers', number>>;
    /** Counter for contract ids. */
    seq: number;
  };
}

export type GameState = EnergyState &
  ResourceState &
  GeneratorState &
  ResearchState &
  RoomState &
  SettingsState &
  EventsState &
  ContractsState;
