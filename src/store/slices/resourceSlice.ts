import type { ProducerId } from '../../types/resource';
import type { ResourceState } from '../../types/state';
import { getBonuses } from '../../utils/bonuses';
import { buildProducer, scrapProducer } from '../../utils/producerSystem';
import type { SliceCreator } from '../types';

export interface ResourceActions {
  /** Buys one more producer. Returns success. */
  buildProducer: (id: ProducerId) => boolean;
  /** Removes one producer to free its room (no refund). */
  scrapProducer: (id: ProducerId) => void;
  /** Hides the "resource ran out" warning. */
  dismissDepletedWarning: () => void;
}

export const createResourceSlice =
  (initial: ResourceState): SliceCreator<ResourceState & ResourceActions> =>
  (set, get) => ({
    ...initial,
    buildProducer: (id) => {
      const before = get();
      const after = buildProducer(before, id, getBonuses(before.completedResearch));
      if (after === before) return false;
      set(after, undefined, 'resource/buildProducer');
      return true;
    },
    scrapProducer: (id) => set((s) => scrapProducer(s, id), undefined, 'resource/scrapProducer'),
    dismissDepletedWarning: () => set({ depletedResources: [] }, undefined, 'resource/dismissWarning'),
  });
