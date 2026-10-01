import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createInitialState } from '../data/initialState';
import type { GameState } from '../types/state';
import { gameStorage } from './storage';

export interface GameStore extends GameState {
  /** Adds production for `deltaSeconds` and stamps `now` as the last save time. */
  applyIdleGains: (deltaSeconds: number, now?: number) => void;
  resetGame: () => void;
}

export const SAVE_KEY = 'megagen-idle-save';

export const useStore = create<GameStore>()(
  persist(
    (set) => ({
      ...createInitialState(),
      applyIdleGains: (deltaSeconds, now = Date.now()) =>
        set((s) => ({
          energy: s.energy + s.totalProductionPerSecond * Math.max(0, deltaSeconds),
          lastSavedTimestamp: now,
        })),
      resetGame: () => set(createInitialState()),
    }),
    { name: SAVE_KEY, storage: gameStorage },
  ),
);
