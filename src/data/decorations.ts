import type { SpriteId } from '../assets';

/**
 * Map decorations (1.13, playtest 15): cosmetic only. Unlocked by player
 * levels, achievements and contracts; the player places them on free tiles of
 * the site. They take no room, give no bonus and never block a machine.
 */
export type DecorationId = 'tree' | 'flag' | 'pond' | 'windsock' | 'lamp' | 'statue';

export type DecorationUnlock = { kind: 'level'; level: number } | { kind: 'achievements'; count: number } | { kind: 'contracts'; count: number };

export interface DecorationDef {
  id: DecorationId;
  name: string;
  sprite: SpriteId;
  unlock: DecorationUnlock;
}

/** How many of each decoration may stand on the map at once. */
export const DECORATION_LIMIT = 6;

export const DECORATIONS: DecorationDef[] = [
  { id: 'tree', name: 'Tree', sprite: 'decor_tree', unlock: { kind: 'level', level: 5 } },
  { id: 'flag', name: 'Company flag', sprite: 'decor_flag', unlock: { kind: 'achievements', count: 5 } },
  { id: 'pond', name: 'Pond', sprite: 'decor_pond', unlock: { kind: 'contracts', count: 10 } },
  { id: 'windsock', name: 'Windsock', sprite: 'decor_windsock', unlock: { kind: 'achievements', count: 15 } },
  { id: 'lamp', name: 'Lamp post', sprite: 'decor_lamp', unlock: { kind: 'level', level: 20 } },
  { id: 'statue', name: 'Founder statue', sprite: 'decor_statue', unlock: { kind: 'contracts', count: 50 } },
];

export const DECORATIONS_BY_ID = Object.fromEntries(DECORATIONS.map((d) => [d.id, d])) as Record<DecorationId, DecorationDef>;
