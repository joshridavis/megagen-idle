import {
  COAST_COLUMNS,
  DETAIL_CHANCE,
  FIXED_PATCHES,
  MAP_COLUMNS,
  MAP_SEED,
  PATCH_CHANCES,
  PATCH_SIZE,
  RIVER_BEND_ROWS,
  RIVER_OFFSETS,
  RIVER_START_COLUMN,
  RIVER_WIDTH,
  ZONES,
  type Terrain,
  type Zone,
} from '../data/map';
import type { GeneratorType } from '../types/generator';

/** A stable pseudo-random number in [0, 1) for a tile, from the map seed. */
export function tileHash(x: number, y: number, salt = 0): number {
  let h = (x * 374761393 + y * 668265263 + (MAP_SEED + salt) * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** First column of the river in row `y`: it winds sideways every few rows. */
export function riverColumn(y: number): number {
  return RIVER_START_COLUMN + RIVER_OFFSETS[Math.floor(y / RIVER_BEND_ROWS) % RIVER_OFFSETS.length];
}

/** Terrain of the tile at column `x`, row `y`. Fixed for every save (1.05). */
export function terrainAt(x: number, y: number): Terrain {
  if (x >= MAP_COLUMNS - COAST_COLUMNS) return 'coast';
  const r = riverColumn(y);
  if (x >= r && x < r + RIVER_WIDTH) return 'river';
  const px = Math.floor(x / PATCH_SIZE[0]);
  const py = Math.floor(y / PATCH_SIZE[1]);
  const fixed = FIXED_PATCHES[`${px},${py}`];
  if (fixed) return fixed;
  const roll = tileHash(px, py, 7);
  if (roll < PATCH_CHANCES.plateau) return 'plateau';
  if (roll < PATCH_CHANCES.plateau + PATCH_CHANCES.ridge) return 'ridge';
  return 'plain';
}

export type Detail = 'rock' | 'tuft' | 'flower' | null;

/** A small decoration drawn on a land tile, or null. Purely cosmetic. */
export function detailAt(x: number, y: number): Detail {
  const t = terrainAt(x, y);
  if (t === 'river' || t === 'coast' || tileHash(x, y, 1) >= DETAIL_CHANCE) return null;
  const pick = tileHash(x, y, 2);
  if (t === 'ridge') return pick < 0.6 ? 'rock' : 'tuft';
  if (t === 'plateau') return pick < 0.5 ? 'rock' : 'flower';
  return pick < 0.5 ? 'tuft' : pick < 0.8 ? 'flower' : 'rock';
}

/** The zone a generator type needs or prefers, if any. */
const zoneOfType = new Map<string, Zone | null>();
export function zoneFor(type: string): Zone | null {
  if (zoneOfType.has(type)) return zoneOfType.get(type)!;
  let zone: Zone | null = null;
  for (const [id, z] of Object.entries(ZONES) as [Zone, (typeof ZONES)[Zone]][]) {
    if (z.generators.includes(type as GeneratorType)) zone = id;
  }
  zoneOfType.set(type, zone);
  return zone;
}
