import { ROOM_TIERS, ROOM_WARNING_RATIO, type RoomTier } from '../data/rooms';
import type { GameState } from '../types/state';
import { canAfford, consumeResource } from './resourceSystem';

/** The next expansion to buy, or null when all are bought. */
export function getNextRoomTier(expansionLevel: number): RoomTier | null {
  return ROOM_TIERS[expansionLevel] ?? null;
}

export type ExpandBlock = 'maxed' | 'cost';

export function getExpandBlock(state: GameState): ExpandBlock | null {
  const tier = getNextRoomTier(state.expansionLevel);
  if (!tier) return 'maxed';
  if (state.energy < tier.energy || !canAfford(state.resources, tier.resources)) return 'cost';
  return null;
}

export function canExpandRoom(state: GameState): boolean {
  return getExpandBlock(state) === null;
}

/**
 * Buys the next expansion tier (`tier`, if given, must be that next tier).
 * Returns the state unchanged if blocked.
 */
export function expandRoom(state: GameState, tier?: number): GameState {
  const next = getNextRoomTier(state.expansionLevel);
  if (!next || (tier !== undefined && tier !== next.tier) || !canExpandRoom(state)) return state;
  return {
    ...state,
    energy: state.energy - next.energy,
    resources: consumeResource(state.resources, next.resources).resources,
    roomCapacity: state.roomCapacity + next.capacity,
    expansionLevel: state.expansionLevel + 1,
  };
}

/** Share of room in use, 0..1 (can exceed 1 only if data shrinks capacity). */
export function roomUsageRatio(state: Pick<GameState, 'roomUsed' | 'roomCapacity'>): number {
  return state.roomCapacity > 0 ? state.roomUsed / state.roomCapacity : 1;
}

export function isRoomNearlyFull(state: Pick<GameState, 'roomUsed' | 'roomCapacity'>): boolean {
  return roomUsageRatio(state) >= ROOM_WARNING_RATIO;
}
