import { getClickValue } from '../../utils/bonuses';
import type { EnergyState } from '../../types/state';
import { advanceTime } from '../../utils/simulation';
import { pickSaved } from '../migrations';
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
        (s) => ({ ...pickSaved(advanceTime(s, deltaSeconds, now).state), lastSavedTimestamp: now }),
        undefined,
        'energy/applyIdleGains',
      ),
    clickEnergy: () => set((s) => ({ energy: s.energy + getClickValue(s.completedResearch) }), undefined, 'energy/click'),
  });
