import type { GeneratorType } from '../../types/generator';
import type { GeneratorState } from '../../types/state';
import { getBonuses } from '../../utils/bonuses';
import { buildGenerator, moveGenerator, scrapGenerator, toggleGenerator, upgradeGenerator } from '../../utils/generatorSystem';
import { getUnlockedGenerators } from '../selectors';
import type { SliceCreator } from '../types';

export interface GeneratorActions {
  /** Builds one generator if unlocked, affordable and there is room. Returns success. */
  buildGenerator: (type: GeneratorType) => boolean;
  toggleGenerator: (id: string) => void;
  /** Removes a generator to free its room (no refund). */
  scrapGenerator: (id: string) => void;
  /** Moves a generator in the list (also its fuel priority). */
  moveGenerator: (id: string, toIndex: number) => void;
  /** Raises a generator one level (no extra room). Returns success. */
  upgradeGenerator: (id: string) => boolean;
}

export const createGeneratorSlice =
  (initial: GeneratorState): SliceCreator<GeneratorState & GeneratorActions> =>
  (set, get) => ({
    ...initial,
    buildGenerator: (type) => {
      const before = get();
      const after = buildGenerator(before, type, getUnlockedGenerators(before), getBonuses(before.completedResearch));
      if (after === before) return false;
      set(after, undefined, 'generator/build');
      return true;
    },
    toggleGenerator: (id) => set((s) => toggleGenerator(s, id), undefined, 'generator/toggle'),
    scrapGenerator: (id) => set((s) => scrapGenerator(s, id), undefined, 'generator/scrap'),
    moveGenerator: (id, toIndex) => set((s) => moveGenerator(s, id, toIndex), undefined, 'generator/move'),
    upgradeGenerator: (id) => {
      const before = get();
      const after = upgradeGenerator(before, id, getBonuses(before.completedResearch));
      if (after === before) return false;
      set(after, undefined, 'generator/upgrade');
      return true;
    },
  });
