import type { RoomState } from '../../types/state';
import { expandRoom } from '../../utils/roomSystem';
import type { SliceCreator } from '../types';

export interface RoomActions {
  /** Buys the next room expansion. Returns success. */
  expandRoom: () => boolean;
}

export const createRoomSlice =
  (initial: RoomState): SliceCreator<RoomState & RoomActions> =>
  (set, get) => ({
    ...initial,
    expandRoom: () => {
      const before = get();
      const after = expandRoom(before);
      if (after === before) return false;
      set(after, undefined, 'room/expand');
      return true;
    },
  });
