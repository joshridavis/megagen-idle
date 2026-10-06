import { DECORATION_LIMIT, DECORATION_PRICE_GROWTH, DECORATIONS, DECORATIONS_BY_ID, type DecorationId, type DecorationUnlock } from '../data/decorations';
import type { GameState } from '../types/state';
import { getPlayerLevel } from './playerLevel';
import { layoutSite, type SiteMap } from './siteMap';

type UnlockState = Pick<GameState, 'lifetimeEnergy' | 'achievements' | 'contracts'>;
type DecorState = Pick<GameState, 'activeGenerators' | 'producers' | 'completedResearch' | 'roomCapacity' | 'mapPins' | 'mapDecorations' | 'energy' | 'decorationsBought'> &
  UnlockState;

/** Copies of a kind bought so far (1.53). */
export const boughtCount = (s: Partial<Pick<GameState, 'decorationsBought'>>, id: DecorationId): number => s.decorationsBought?.[id] ?? 0;

/** Decorations bought in all (1.53). */
export const totalBought = (s: Partial<Pick<GameState, 'decorationsBought'>>): number => Object.values(s.decorationsBought ?? {}).reduce((a, n) => a + (n ?? 0), 0);

/** Kinds bought at least once (1.53). */
export const kindsBought = (s: Partial<Pick<GameState, 'decorationsBought'>>): number => DECORATIONS.filter((d) => boughtCount(s, d.id) > 0).length;

/** Energy for the next copy of a kind: base × growth^bought (1.53). */
export function decorationPrice(s: Partial<Pick<GameState, 'decorationsBought'>>, id: DecorationId): number {
  return Math.round(DECORATIONS_BY_ID[id].price * DECORATION_PRICE_GROWTH ** boughtCount(s, id));
}

/** How far a player is toward an unlock, and the goal. */
export function unlockProgress(s: UnlockState, u: DecorationUnlock): { have: number; need: number } {
  if (u.kind === 'level') return { have: getPlayerLevel(s.lifetimeEnergy).level, need: u.level };
  if (u.kind === 'achievements') return { have: Object.keys(s.achievements).length, need: u.count };
  return { have: s.contracts.done, need: u.count };
}

export const isDecorationUnlocked = (s: UnlockState, id: DecorationId): boolean => {
  const p = unlockProgress(s, DECORATIONS_BY_ID[id].unlock);
  return p.have >= p.need;
};

export const unlockedDecorations = (s: UnlockState): DecorationId[] => DECORATIONS.filter((d) => isDecorationUnlocked(s, d.id)).map((d) => d.id);

/** "Player level 5", "5 achievements", "10 contracts": what unlocks a decoration. */
export function unlockText(u: DecorationUnlock): string {
  if (u.kind === 'level') return `Player level ${u.level}`;
  return u.kind === 'achievements' ? `${u.count} achievements` : `${u.count} contracts completed`;
}

/** Tiles covered by machines: decorations are hidden there (machines always win). */
export function machineTiles(map: SiteMap): Set<number> {
  return new Set(map.placed.flatMap((p) => p.cells));
}

export const countPlaced = (decor: GameState['mapDecorations'], id: DecorationId): number => Object.values(decor).filter((d) => d === id).length;

/** Why a decoration cannot go on `cell`, or null if it can. */
export function placeBlock(s: DecorState, id: DecorationId, cell: number, map: SiteMap = layoutSite(s)): string | null {
  if (!DECORATIONS_BY_ID[id] || !isDecorationUnlocked(s, id)) return 'Not unlocked yet.';
  if (!Number.isInteger(cell) || cell < 0 || cell >= map.capacity) return 'Decorations go inside your site.';
  if (machineTiles(map).has(cell)) return 'A machine stands there.';
  if (s.mapDecorations[cell]) return 'Something is already there.';
  if (countPlaced(s.mapDecorations, id) >= DECORATION_LIMIT) return `At most ${DECORATION_LIMIT} of each.`;
  if (s.energy < decorationPrice(s, id)) return 'Not enough energy.';
  return null;
}

/**
 * Buys and places a decoration (1.53): pays the next copy's price in energy
 * and counts the copy. Returns the changed fields, or null if not allowed. Pure.
 */
export function placeDecoration(
  s: DecorState,
  id: DecorationId,
  cell: number,
): Pick<GameState, 'mapDecorations' | 'energy' | 'decorationsBought'> | null {
  if (placeBlock(s, id, cell)) return null;
  return {
    mapDecorations: { ...s.mapDecorations, [cell]: id },
    energy: s.energy - decorationPrice(s, id),
    decorationsBought: { ...s.decorationsBought, [id]: boughtCount(s, id) + 1 },
  };
}

/** Removes the decoration on `cell`; returns the new decorations, or null if there is none. Refunds nothing and keeps the bought count (1.53). Pure. */
export function removeDecoration(decor: GameState['mapDecorations'], cell: number): GameState['mapDecorations'] | null {
  if (!decor[cell]) return null;
  const next = { ...decor };
  delete next[cell];
  return next;
}
