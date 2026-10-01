import type { ResearchState } from '../../types/state';
import type { SliceCreator } from '../types';

export interface ResearchActions {}

export const createResearchSlice =
  (initial: ResearchState): SliceCreator<ResearchState & ResearchActions> =>
  () => ({ ...initial });
