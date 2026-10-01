import type { ResourceState } from '../../types/state';
import type { SliceCreator } from '../types';

export interface ResourceActions {}

export const createResourceSlice =
  (initial: ResourceState): SliceCreator<ResourceState & ResourceActions> =>
  () => ({ ...initial });
