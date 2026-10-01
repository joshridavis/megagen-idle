import { EXPANSION_ANIMATION_MS, ROOM_TIERS, ROOM_WARNING_RATIO, type RoomTier } from '../data/rooms';
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
export function expandRoom(state: GameState, tier?: number, now = Date.now()): GameState {
  const next = getNextRoomTier(state.expansionLevel);
  if (!next || (tier !== undefined && tier !== next.tier) || !canExpandRoom(state)) return state;
  return {
    ...state,
    energy: state.energy - next.energy,
    resources: consumeResource(state.resources, next.resources).resources,
    roomCapacity: state.roomCapacity + next.capacity,
    expansionLevel: state.expansionLevel + 1,
    lastExpansionAt: now,
  };
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

export type SegmentPhase = 'hidden' | 'building' | 'done';

/**
 * Phase of one capacity-meter segment during the expansion animation, derived
 * only from the elapsed time since `lastExpansionAt` so it cannot desync.
 * New segments (index >= firstNew) appear one after another as scaffolding
 * over the first 60% of the animation, then all settle when it ends.
 */
export function expansionSegmentPhase(
  index: number,
  firstNew: number,
  totalSegments: number,
  elapsedMs: number | null,
  durationMs = EXPANSION_ANIMATION_MS,
): SegmentPhase {
  if (elapsedMs === null || elapsedMs < 0 || elapsedMs >= durationMs || index < firstNew) return 'done';
  const n = Math.max(1, totalSegments - firstNew);
  const appearAt = ((index - firstNew) * (durationMs * 0.6)) / n;
  return elapsedMs < appearAt ? 'hidden' : 'building';
}

/** True while the expansion animation is running. */
export function isExpansionAnimating(lastExpansionAt: number | null, now: number): boolean {
  return lastExpansionAt !== null && now >= lastExpansionAt && now - lastExpansionAt < EXPANSION_ANIMATION_MS;
}
