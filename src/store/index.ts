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
import { createLogSlice } from './slices/logSlice';
import { createEventSlice } from './slices/eventSlice';
import { deriveEvents } from '../utils/eventLog';
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
          ...createLogSlice()(...a),
          ...createEventSlice(init)(...a),
          welcomeBack: null,
          resetGame: () =>
            set(
              (s) => ({ ...createInitialState(), celebrations: [], welcomeBack: null, awaySnapshot: null, eventLog: [], toasts: [], activeSighting: null, eventEpoch: s.eventEpoch + 1 }),
              undefined,
              'core/reset',
            ),
          loadSave: (state) =>
            set((s) => ({ ...pickSaved(state), celebrations: [], welcomeBack: null, toasts: [], activeSighting: null, eventEpoch: s.eventEpoch + 1 }), undefined, 'core/loadSave'),
          dismissWelcomeBack: () => set({ welcomeBack: null }, undefined, 'core/dismissWelcomeBack'),
        };
      },
      {
        name: SAVE_KEY,
        storage: gameStorage,
        version: SAVE_VERSION,
        partialize: (s: GameStore) => pickSaved(s),
        migrate: migrateSave,
        // Derived values are always recomputed from the loaded data.
        merge: (persisted, current) => ({
          ...current,
          ...deriveRates({ ...pickSaved(current), ...(persisted as object) }),
          eventEpoch: current.eventEpoch + 1,
        }),
      },
    ),
    { name: 'MegaGen Idle', enabled: import.meta.env.DEV },
  ),
);

// Development only: lets browser checks seed state (never in production builds).
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as unknown as { __megagenStore?: typeof useStore }).__megagenStore = useStore;
}

// Event log (0.38): every change is compared with the previous state, so
// research, unlocks, fuel and room events come from the systems themselves.
// A replaced game (load, reset, rehydration) is not an event.
useStore.subscribe((next, prev) => {
  if (next.eventEpoch !== prev.eventEpoch) return;
  const entries = deriveEvents(prev, next);
  if (entries.length) next.logEvents(entries);
});
