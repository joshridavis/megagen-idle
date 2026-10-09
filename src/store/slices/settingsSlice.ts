import type { GeneratorSort, NumberNotation, SettingsState } from '../../types/state';
import type { SliceCreator } from '../types';
import { DEFAULT_NOTIFY, type NotifySettings } from '../../data/notifyRules';
import { canUseAccent, canUseTitle } from '../../utils/achievements';
import { DEFAULT_ACCENT } from '../../data/achievements';

export interface SettingsActions {
  setNotation: (notation: NumberNotation) => void;
  setReduceMotion: (on: boolean) => void;
  /** Shows or hides the pets walking on screen (1.60). */
  setPetsWalk: (on: boolean) => void;
  /** Opens or closes the Cosmetics section of the Achievements tab (1.69). */
  setCosmeticsOpen: (open: boolean) => void;
  setMapAnimations: (on: boolean) => void;
  setGeneratorSort: (sort: GeneratorSort) => void;
  /** Cosmetic choices; locked ones are refused (1.01). */
  setCosmetics: (choice: { title?: string | null; accent?: string }) => void;
  /** Moves the walkthrough to a step (TUTORIAL_DONE ends it). */
  setTutorialStep: (step: number) => void;
  /** Shows the walkthrough again from the start, advancing with "Next". */
  replayTutorial: () => void;
  /** Notification choices (1.07): the master switch and per-type switches. */
  setNotifications: (patch: { enabled?: boolean; types?: Partial<NotifySettings['types']> }) => void;
}

export const createSettingsSlice =
  (initial: SettingsState): SliceCreator<SettingsState & SettingsActions> =>
  (set) => ({
    ...initial,
    setNotation: (notation) => set((s) => ({ settings: { ...s.settings, notation } }), undefined, 'settings/notation'),
    setTutorialStep: (step) =>
      set((s) => ({ settings: { ...s.settings, tutorial: { ...s.settings.tutorial, step } } }), undefined, 'settings/tutorialStep'),
    replayTutorial: () => set((s) => ({ settings: { ...s.settings, tutorial: { step: 0, replay: true } } }), undefined, 'settings/replayTutorial'),
    setCosmetics: (choice) =>
      set(
        (s) => {
          const ok = (c: typeof choice) => (c.title === undefined || canUseTitle(s, c.title)) && (c.accent === undefined || canUseAccent(s, c.accent));
          if (!ok(choice)) return {};
          return { settings: { ...s.settings, cosmetics: { ...(s.settings.cosmetics ?? { title: null, accent: DEFAULT_ACCENT }), ...choice } } };
        },
        undefined,
        'settings/cosmetics',
      ),
    setGeneratorSort: (generatorSort) => set((s) => ({ settings: { ...s.settings, generatorSort } }), undefined, 'settings/generatorSort'),
    setNotifications: (patch) =>
      set(
        (s) => {
          const cur = s.settings.notifications ?? DEFAULT_NOTIFY;
          return { settings: { ...s.settings, notifications: { enabled: patch.enabled ?? cur.enabled, types: { ...cur.types, ...patch.types } } } };
        },
        undefined,
        'settings/notifications',
      ),
    setCosmeticsOpen: (cosmeticsOpen) => set((s) => ({ settings: { ...s.settings, cosmeticsOpen } }), undefined, 'settings/cosmeticsOpen'),
    setMapAnimations: (mapAnimations) => set((s) => ({ settings: { ...s.settings, mapAnimations } }), undefined, 'settings/mapAnimations'),
    setPetsWalk: (petsWalk) => set((s) => ({ settings: { ...s.settings, petsWalk } }), undefined, 'settings/petsWalk'),
    setReduceMotion: (reduceMotion) => set((s) => ({ settings: { ...s.settings, reduceMotion } }), undefined, 'settings/reduceMotion'),
  });
