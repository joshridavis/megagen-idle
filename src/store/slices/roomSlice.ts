import type { RoomState } from '../../types/state';
import type { SliceCreator } from '../types';

export interface RoomActions {}

export const createRoomSlice =
  (initial: RoomState): SliceCreator<RoomState & RoomActions> =>
  () => ({ ...initial });
