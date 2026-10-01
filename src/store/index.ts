import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { initialGameState } from '../data/initialState';
import type { GameState } from '../types/state';
import { gameStorage } from './storage';

export interface GameStore extends GameState {
  resetGame: () => void;
}

export const SAVE_KEY = 'megagen-idle-save';

export const useStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialGameState,
      resetGame: () => set({ ...initialGameState }),
    }),
    { name: SAVE_KEY, storage: gameStorage },
  ),
);
