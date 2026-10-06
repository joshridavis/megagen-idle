import type { RoomState } from '../../types/state';
import { expandRoom } from '../../utils/roomSystem';
import { deriveRates } from '../../utils/simulation';
import { moveOnMap } from '../../utils/siteMap';
import type { DecorationId } from '../../data/decorations';
import { placeDecoration, removeDecoration } from '../../utils/decorations';
import type { SliceCreator } from '../types';

export interface RoomActions {
  /** Buys the next room expansion. Returns success. */
  expandRoom: () => boolean;
  /** Moves a machine on the site map so its top-left tile is `anchor` (1.05). Returns success. */
  moveOnMap: (key: string, anchor: number) => boolean;
  /** Puts a cosmetic decoration on a free site tile (1.13). Returns success. */
  placeDecoration: (id: DecorationId, cell: number) => boolean;
  /** Takes away the decoration on a tile (1.13). Returns success. */
  removeDecoration: (cell: number) => boolean;
}

export const createRoomSlice =
  (initial: RoomState): SliceCreator<RoomState & RoomActions> =>
  (set, get) => ({
    ...initial,
    expandRoom: () => {
      const before = get();
      const after = expandRoom(before, undefined, Date.now());
      if (after === before) return false;
      set(after, undefined, 'room/expand');
      return true;
    },
    moveOnMap: (key, anchor) => {
      const before = get();
      const pins = moveOnMap(before, key, anchor);
      if (!pins) return false;
      set(deriveRates({ ...before, mapPins: pins }), undefined, 'room/moveOnMap');
      return true;
    },
    placeDecoration: (id, cell) => {
      const next = placeDecoration(get(), id, cell);
      if (!next) return false;
      set(next, undefined, 'room/placeDecoration');
      return true;
    },
    removeDecoration: (cell) => {
      const next = removeDecoration(get().mapDecorations, cell);
      if (!next) return false;
      set({ mapDecorations: next }, undefined, 'room/removeDecoration');
      return true;
    },
  });
