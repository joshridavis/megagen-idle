import type { ResearchState } from '../../types/state';
import { startResearch } from '../../utils/researchSystem';
import type { SliceCreator, TransientState } from '../types';

export interface ResearchActions {
  /** Pays for and starts a research. Returns success. */
  startResearch: (id: string, now?: number) => boolean;
  /** Removes the oldest pending celebration. */
  dismissCelebration: () => void;
}

export const createResearchSlice =
  (initial: ResearchState): SliceCreator<ResearchState & Pick<TransientState, 'celebrations'> & ResearchActions> =>
  (set, get) => ({
    ...initial,
    celebrations: [],
    dismissCelebration: () => set((s) => ({ celebrations: s.celebrations.slice(1) }), undefined, 'research/dismissCelebration'),
    startResearch: (id, now = Date.now()) => {
      const before = get();
      const after = startResearch(before, id, now);
      if (after === before) return false;
      set(after, undefined, 'research/start');
      return true;
    },
  });
