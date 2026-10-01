import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createInitialState } from '../data/initialState';
import { migrateSave, pickSaved, SAVE_VERSION } from './migrations';
import { createEnergySlice } from './slices/energySlice';
import { createGeneratorSlice } from './slices/generatorSlice';
import { createResearchSlice } from './slices/researchSlice';
import { createResourceSlice } from './slices/resourceSlice';
import { createRoomSlice } from './slices/roomSlice';
import { createSettingsSlice } from './slices/settingsSlice';
import { deriveRates } from '../utils/simulation';
import { gameStorage } from './storage';
import type { GameStore } from './types';

export type { GameStore } from './types';

export const SAVE_KEY = 'megagen-idle-save';

export const useStore = create<GameStore>()(
  devtools(
    persist(
      (...a) => {
        const init = createInitialState();
        const [set] = a;
        return {
          ...createEnergySlice(init)(...a),
          ...createResourceSlice(init)(...a),
          ...createGeneratorSlice(init)(...a),
          ...createResearchSlice(init)(...a),
          ...createRoomSlice(init)(...a),
          ...createSettingsSlice(init)(...a),
          resetGame: () => set(createInitialState(), undefined, 'core/reset'),
        };
      },
      {
        name: SAVE_KEY,
        storage: gameStorage,
        version: SAVE_VERSION,
        partialize: (s: GameStore) => pickSaved(s),
        migrate: migrateSave,
        // Derived values are always recomputed from the loaded data.
        merge: (persisted, current) => ({ ...current, ...deriveRates({ ...pickSaved(current), ...(persisted as object) }) }),
      },
    ),
    { name: 'MegaGen Idle', enabled: import.meta.env.DEV },
  ),
);
