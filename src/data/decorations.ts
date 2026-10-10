import type { SpriteId } from '../assets';

/**
 * Map decorations (1.13, playtest 15): cosmetic only. Player levels,
 * achievements and contracts are requirements; each copy is then bought once
 * with energy (1.53), every copy of a kind costing more than the last, and
 * placed or removed freely afterwards.
 * They take no room, give no bonus and never block a machine.
 */
export type DecorationId =
  | 'tree'
  | 'flag'
  | 'pond'
  | 'windsock'
  | 'lamp'
  | 'statue'
  // 1.54 (owner request, playtest 22)
  | 'flowerbed'
  | 'bench'
  | 'hedge'
  | 'rock_garden'
  | 'picnic'
  | 'fountain'
  | 'weather_station'
  | 'plaque';

export type DecorationUnlock = { kind: 'level'; level: number } | { kind: 'achievements'; count: number } | { kind: 'contracts'; count: number };

export interface DecorationDef {
  id: DecorationId;
  name: string;
  sprite: SpriteId;
  unlock: DecorationUnlock;
  /** Energy for the first copy (1.53); each next copy costs DECORATION_PRICE_GROWTH times more. */
  price: number;
}

/** Copies of each decoration that can be bought, and so stand on the map at once (1.53). */
export const DECORATION_LIMIT = 6;

/** Each copy of a kind costs this much more than the one before (1.53). */
export const DECORATION_PRICE_GROWTH = 1.6;


export const DECORATIONS: DecorationDef[] = [
  { id: 'tree', name: 'Tree', sprite: 'decor_tree', unlock: { kind: 'level', level: 5 }, price: 1_000 },
  { id: 'flag', name: 'Company flag', sprite: 'decor_flag', unlock: { kind: 'achievements', count: 5 }, price: 5_000 },
  { id: 'pond', name: 'Pond', sprite: 'decor_pond', unlock: { kind: 'contracts', count: 10 }, price: 100_000 },
  { id: 'windsock', name: 'Windsock', sprite: 'decor_windsock', unlock: { kind: 'achievements', count: 15 }, price: 250_000 },
  { id: 'lamp', name: 'Lamp post', sprite: 'decor_lamp', unlock: { kind: 'level', level: 20 }, price: 1_000_000 },
  { id: 'statue', name: 'Founder statue', sprite: 'decor_statue', unlock: { kind: 'contracts', count: 50 }, price: 10_000_000 },
  // 1.54 (owner request, playtest 22): eight more, spread from the early to the late game
  { id: 'flowerbed', name: 'Flower bed', sprite: 'decor_flowerbed', unlock: { kind: 'level', level: 8 }, price: 2_000 },
  { id: 'bench', name: 'Bench', sprite: 'decor_bench', unlock: { kind: 'achievements', count: 10 }, price: 10_000 },
  { id: 'hedge', name: 'Hedge', sprite: 'decor_hedge', unlock: { kind: 'level', level: 12 }, price: 30_000 },
  { id: 'rock_garden', name: 'Rock garden', sprite: 'decor_rock_garden', unlock: { kind: 'contracts', count: 25 }, price: 200_000 },
  { id: 'picnic', name: 'Picnic table', sprite: 'decor_picnic', unlock: { kind: 'level', level: 30 }, price: 500_000 },
  { id: 'fountain', name: 'Fountain', sprite: 'decor_fountain', unlock: { kind: 'achievements', count: 25 }, price: 3_000_000 },
  { id: 'weather_station', name: 'Weather station', sprite: 'decor_weather_station', unlock: { kind: 'level', level: 45 }, price: 5_000_000 },
  { id: 'plaque', name: 'Memorial plaque', sprite: 'decor_plaque', unlock: { kind: 'contracts', count: 100 }, price: 20_000_000 },
];

export const DECORATIONS_BY_ID = Object.fromEntries(DECORATIONS.map((d) => [d.id, d])) as Record<DecorationId, DecorationDef>;
