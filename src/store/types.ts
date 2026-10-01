import type { StateCreator } from 'zustand';
import type { GameState } from '../types/state';
import type { EnergyActions } from './slices/energySlice';
import type { ResourceActions } from './slices/resourceSlice';
import type { GeneratorActions } from './slices/generatorSlice';
import type { ResearchActions } from './slices/researchSlice';
import type { RoomActions } from './slices/roomSlice';
import type { SettingsActions } from './slices/settingsSlice';

export interface CoreActions {
  resetGame: () => void;
}

/** Transient UI events: never saved. */
export interface TransientState {
  /** Research completed during live play, waiting to be celebrated (oldest first). */
  celebrations: { id: string; at: number }[];
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
