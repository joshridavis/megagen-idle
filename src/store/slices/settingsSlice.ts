import type { GeneratorSort, NumberNotation, SettingsState } from '../../types/state';
import type { SliceCreator } from '../types';

export interface SettingsActions {
  setNotation: (notation: NumberNotation) => void;
  setReduceMotion: (on: boolean) => void;
  setGeneratorSort: (sort: GeneratorSort) => void;
  /** Moves the walkthrough to a step (TUTORIAL_DONE ends it). */
  setTutorialStep: (step: number) => void;
  /** Shows the walkthrough again from the start, advancing with "Next". */
  replayTutorial: () => void;
}

export const createSettingsSlice =
  (initial: SettingsState): SliceCreator<SettingsState & SettingsActions> =>
  (set) => ({
    ...initial,
    setNotation: (notation) => set((s) => ({ settings: { ...s.settings, notation } }), undefined, 'settings/notation'),
    setTutorialStep: (step) =>
      set((s) => ({ settings: { ...s.settings, tutorial: { ...s.settings.tutorial, step } } }), undefined, 'settings/tutorialStep'),
    replayTutorial: () => set((s) => ({ settings: { ...s.settings, tutorial: { step: 0, replay: true } } }), undefined, 'settings/replayTutorial'),
    setGeneratorSort: (generatorSort) => set((s) => ({ settings: { ...s.settings, generatorSort } }), undefined, 'settings/generatorSort'),
    setReduceMotion: (reduceMotion) => set((s) => ({ settings: { ...s.settings, reduceMotion } }), undefined, 'settings/reduceMotion'),
  });
