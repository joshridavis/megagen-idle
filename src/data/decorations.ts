import type { SpriteId } from '../assets';

/**
 * Map decorations (1.13, playtest 15): cosmetic only. Player levels,
 * achievements and contracts are requirements; each copy is then bought with
 * energy when placed (1.53), every copy of a kind costing more than the last.
 * They take no room, give no bonus and never block a machine.
 */
export type DecorationId = 'tree' | 'flag' | 'pond' | 'windsock' | 'lamp' | 'statue';

export type DecorationUnlock = { kind: 'level'; level: number } | { kind: 'achievements'; count: number } | { kind: 'contracts'; count: number };

export interface DecorationDef {
  id: DecorationId;
  name: string;
  sprite: SpriteId;
  unlock: DecorationUnlock;
  /** Energy for the first copy (1.53); each next copy costs DECORATION_PRICE_GROWTH times more. */
  price: number;
}

/**
 * How many of each decoration may stand on the map at once. Kept with 1.53:
 * prices rise per copy bought, and removing one refunds nothing but keeps the
 * count, so the limit only keeps the map tidy.
 */
export const DECORATION_LIMIT = 6;

/** Each copy of a kind costs this much more than the one before (1.53). */
export const DECORATION_PRICE_GROWTH = 1.6;

/** 100% completion (1.53): every kind bought once, and this many decorations bought in all. */
export const DECORATION_COPIES_GOAL = 25;

export const DECORATIONS: DecorationDef[] = [
  { id: 'tree', name: 'Tree', sprite: 'decor_tree', unlock: { kind: 'level', level: 5 }, price: 1_000 },
  { id: 'flag', name: 'Company flag', sprite: 'decor_flag', unlock: { kind: 'achievements', count: 5 }, price: 5_000 },
  { id: 'pond', name: 'Pond', sprite: 'decor_pond', unlock: { kind: 'contracts', count: 10 }, price: 100_000 },
  { id: 'windsock', name: 'Windsock', sprite: 'decor_windsock', unlock: { kind: 'achievements', count: 15 }, price: 250_000 },
  { id: 'lamp', name: 'Lamp post', sprite: 'decor_lamp', unlock: { kind: 'level', level: 20 }, price: 1_000_000 },
  { id: 'statue', name: 'Founder statue', sprite: 'decor_statue', unlock: { kind: 'contracts', count: 50 }, price: 10_000_000 },
];

export const DECORATIONS_BY_ID = Object.fromEntries(DECORATIONS.map((d) => [d.id, d])) as Record<DecorationId, DecorationDef>;
