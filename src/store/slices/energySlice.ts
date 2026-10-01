import { BASE_CLICK_VALUE } from '../../data/player';
import type { EnergyState } from '../../types/state';
import type { SliceCreator } from '../types';

export interface EnergyActions {
  /** Adds production for `deltaSeconds` and stamps `now` as the last save time. */
  applyIdleGains: (deltaSeconds: number, now?: number) => void;
  /** Manual click: adds the click value (research can boost it later). */
  clickEnergy: () => void;
}

export const createEnergySlice =
  (initial: EnergyState): SliceCreator<EnergyState & EnergyActions> =>
  (set) => ({
    ...initial,
    applyIdleGains: (deltaSeconds, now = Date.now()) =>
      set(
        (s) => ({
          energy: s.energy + s.energyPerSecond * Math.max(0, deltaSeconds),
          lastSavedTimestamp: now,
        }),
        undefined,
        'energy/applyIdleGains',
      ),
    clickEnergy: () => set((s) => ({ energy: s.energy + BASE_CLICK_VALUE }), undefined, 'energy/click'),
  });
