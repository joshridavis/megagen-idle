import type { GeneratorState } from '../../types/state';
import type { SliceCreator } from '../types';

export interface GeneratorActions {}

export const createGeneratorSlice =
  (initial: GeneratorState): SliceCreator<GeneratorState & GeneratorActions> =>
  () => ({ ...initial });
