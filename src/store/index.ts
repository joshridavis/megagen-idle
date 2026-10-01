import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createInitialState } from '../data/initialState';
import { BASE_CLICK_VALUE } from '../data/player';
import type { GameState } from '../types/state';
import { gameStorage } from './storage';

export interface GameStore extends GameState {
  /** Adds production for `deltaSeconds` and stamps `now` as the last save time. */
  applyIdleGains: (deltaSeconds: number, now?: number) => void;
  /** Manual click: adds the click value (research can boost it later). */
  clickEnergy: () => void;
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
      clickEnergy: () => set((s) => ({ energy: s.energy + BASE_CLICK_VALUE })),
      resetGame: () => set(createInitialState()),
    }),
    { name: SAVE_KEY, storage: gameStorage },
  ),
);
