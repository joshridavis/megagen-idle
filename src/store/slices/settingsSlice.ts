import type { NumberNotation, SettingsState } from '../../types/state';
import type { SliceCreator } from '../types';

export interface SettingsActions {
  setNotation: (notation: NumberNotation) => void;
  setReduceMotion: (on: boolean) => void;
}

export const createSettingsSlice =
  (initial: SettingsState): SliceCreator<SettingsState & SettingsActions> =>
  (set) => ({
    ...initial,
    setNotation: (notation) => set((s) => ({ settings: { ...s.settings, notation } }), undefined, 'settings/notation'),
    setReduceMotion: (reduceMotion) => set((s) => ({ settings: { ...s.settings, reduceMotion } }), undefined, 'settings/reduceMotion'),
  });
