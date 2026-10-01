import type { ResearchState } from '../../types/state';
import { startResearch } from '../../utils/researchSystem';
import type { SliceCreator } from '../types';

export interface ResearchActions {
  /** Pays for and starts a research. Returns success. */
  startResearch: (id: string, now?: number) => boolean;
}

export const createResearchSlice =
  (initial: ResearchState): SliceCreator<ResearchState & ResearchActions> =>
  (set, get) => ({
    ...initial,
    startResearch: (id, now = Date.now()) => {
      const before = get();
      const after = startResearch(before, id, now);
      if (after === before) return false;
      set(after, undefined, 'research/start');
      return true;
    },
  });
