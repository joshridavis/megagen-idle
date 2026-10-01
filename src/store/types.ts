import type { StateCreator } from 'zustand';
import type { GameState, Resources } from '../types/state';
import type { AwaySnapshot } from '../utils/awayReport';
import type { EnergyActions } from './slices/energySlice';
import type { ResourceActions } from './slices/resourceSlice';
import type { GeneratorActions } from './slices/generatorSlice';
import type { ResearchActions } from './slices/researchSlice';
import type { RoomActions } from './slices/roomSlice';
import type { SettingsActions } from './slices/settingsSlice';

export interface CoreActions {
  resetGame: () => void;
  /** Replaces the whole game with an already validated save. */
  loadSave: (state: GameState) => void;
  dismissWelcomeBack: () => void;
}

/** What happened while the player was away (shown once on return). */
export interface WelcomeBackReport {
  /** Real time away. */
  awaySeconds: number;
  /** Time actually credited (capped by MAX_OFFLINE_SECONDS). */
  creditedSeconds: number;
  energyGained: number;
  /** Net change of each resource. */
  resourcesGained: Resources;
  completedResearch: string[];
  /** IDs of generators switched off for lack of fuel. */
  outOfFuel: string[];
}

/** Transient UI events: never saved. */
export interface TransientState {
  /** Research completed during live play, waiting to be celebrated (oldest first). */
  celebrations: { id: string; at: number }[];
  welcomeBack: WelcomeBackReport | null;
  /** Set while the tab is hidden (0.79). */
  awaySnapshot: AwaySnapshot | null;
}

export type GameStore = GameState &
  TransientState &
  EnergyActions &
  ResourceActions &
  GeneratorActions &
  ResearchActions &
  RoomActions &
  SettingsActions &
  CoreActions;

/** Slice creator typed for the combined store with devtools + persist. */
export type SliceCreator<T> = StateCreator<
  GameStore,
  [['zustand/devtools', never], ['zustand/persist', unknown]],
  [],
  T
>;
