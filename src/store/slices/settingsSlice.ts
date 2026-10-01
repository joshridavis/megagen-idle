import type { NumberNotation, SettingsState } from '../../types/state';
import type { SliceCreator } from '../types';

export interface SettingsActions {
  setNotation: (notation: NumberNotation) => void;
}

export const createSettingsSlice =
  (initial: SettingsState): SliceCreator<SettingsState & SettingsActions> =>
  (set) => ({
    ...initial,
    setNotation: (notation) => set((s) => ({ settings: { ...s.settings, notation } }), undefined, 'settings/notation'),
  });
