import { RESEARCH } from '../data/research';
import { FREE_MAX_RESEARCH_LEVEL, type ProductId } from '../data/purchases';
import type { ResearchDef } from '../types/research';
import type { Entitlements, GameState } from '../types/state';

type S = Pick<GameState, 'entitlements' | 'storeActive'>;

/** Whether the whole game is open: the Full Game is owned, or there is no store (the web build today). */
export function hasFullGame(s: S): boolean {
  return !s.storeActive || !!s.entitlements?.fullGame;
}

/** Whether a research lies past the free part and is closed until the Full Game is bought (1.95). */
export function needsFullGame(s: S & Pick<GameState, 'completedResearch'>, def: Pick<ResearchDef, 'id' | 'requiredLevel'>): boolean {
  if (hasFullGame(s)) return false;
  if (s.completedResearch.includes(def.id)) return false; // nothing done ever stops counting
  return def.requiredLevel > FREE_MAX_RESEARCH_LEVEL;
}

/** Entitlements from what a store says is owned. */
export function entitlementsFrom(owned: ProductId[]): Entitlements {
  return { fullGame: owned.includes('full_game'), supporter: owned.includes('supporter_pack') };
}

/** Whether the Supporter Pack's cosmetics may be used. */
export function isSupporter(s: Pick<GameState, 'entitlements'>): boolean {
  return !!s.entitlements?.supporter;
}

/**
 * Whether the player has reached the end of the free part: some research is
 * closed only because it needs the Full Game (its earlier research is done).
 */
export function atFreeBoundary(s: S & Pick<GameState, 'completedResearch'>): boolean {
  if (hasFullGame(s)) return false;
  return RESEARCH.some((d) => needsFullGame(s, d) && d.prerequisites.every((p) => s.completedResearch.includes(p)));
}
