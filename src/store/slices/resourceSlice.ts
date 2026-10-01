import type { ResourceState } from '../../types/state';
import type { SliceCreator } from '../types';

export interface ResourceActions {
  /** Hides the "resource ran out" warning. */
  dismissDepletedWarning: () => void;
}

export const createResourceSlice =
  (initial: ResourceState): SliceCreator<ResourceState & ResourceActions> =>
  (set) => ({
    ...initial,
    dismissDepletedWarning: () => set({ depletedResources: [] }, undefined, 'resource/dismissWarning'),
  });
