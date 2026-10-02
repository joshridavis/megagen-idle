import { EXPANSION_ANIMATION_MS, ROOM_TIERS, ROOM_WARNING_RATIO, type RoomTier } from '../data/rooms';
import type { GameState } from '../types/state';
import { canAfford, consumeResource } from './resourceSystem';
import { deriveRates } from './simulation';

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
export function expandRoom(state: GameState, tier?: number, now = Date.now()): GameState {
  const next = getNextRoomTier(state.expansionLevel);
  if (!next || (tier !== undefined && tier !== next.tier) || !canExpandRoom(state)) return state;
  // more land can change where machines stand, and so their map bonuses (1.05)
  return deriveRates({
    ...state,
    energy: state.energy - next.energy,
    resources: consumeResource(state.resources, next.resources).resources,
    roomCapacity: state.roomCapacity + next.capacity,
    expansionLevel: state.expansionLevel + 1,
    lastExpansionAt: now,
  });
}

/** Share of room in use, 0..1 (can exceed 1 only if data shrinks capacity). */
export function roomUsageRatio(state: Pick<GameState, 'roomUsed' | 'roomCapacity'>): number {
  return state.roomCapacity > 0 ? state.roomUsed / state.roomCapacity : 1;
}

export function isRoomNearlyFull(state: Pick<GameState, 'roomUsed' | 'roomCapacity'>): boolean {
  return roomUsageRatio(state) >= ROOM_WARNING_RATIO;
}

/** Room added by the most recent expansion (0 if none yet). */
export function lastExpansionSize(expansionLevel: number): number {
  return ROOM_TIERS[expansionLevel - 1]?.capacity ?? 0;
}

/**
 * Room-bar expansion animation (playtest 7 redesign), derived only from the
 * time since `lastExpansionAt` so it cannot desync. For the first half the
 * new room's share of the bar slides in (reveal 0 -> 1) as "under
 * construction"; it holds until the end, then becomes normal free room.
 */
export function expansionBarPhase(
  elapsedMs: number | null,
  durationMs = EXPANSION_ANIMATION_MS,
): { building: boolean; reveal: number } {
  if (elapsedMs === null || elapsedMs < 0 || elapsedMs >= durationMs) return { building: false, reveal: 1 };
  return { building: true, reveal: Math.min(1, elapsedMs / (durationMs / 2)) };
}

/** True while the expansion animation is running. */
export function isExpansionAnimating(lastExpansionAt: number | null, now: number): boolean {
  return lastExpansionAt !== null && now >= lastExpansionAt && now - lastExpansionAt < EXPANSION_ANIMATION_MS;
}
