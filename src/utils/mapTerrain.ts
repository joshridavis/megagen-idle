import {
  COAST_COLUMNS,
  EXCLUSION_START_ROW,
  MIN_ZONE_RUN,
  DETAILS,
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
  type Detail,
  type Terrain,
  type Zone,
} from '../data/map';
import type { GeneratorType } from '../types/generator';
import type { ProducerId } from '../types/resource';

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

/** The river or the coast at a tile, which cut through any patch; else null. */
function waterAt(x: number, y: number): 'river' | 'coast' | null {
  if (x >= MAP_COLUMNS - COAST_COLUMNS) return 'coast';
  const r = riverColumn(y);
  return x >= r && x < r + RIVER_WIDTH ? 'river' : null;
}

/** The zone (or plain) of the patch a tile belongs to, before the river and coast cut through it. */
function patchAt(x: number, y: number): Terrain {
  const px = Math.floor(x / PATCH_SIZE[0]);
  const py = Math.floor(y / PATCH_SIZE[1]);
  const fixed = FIXED_PATCHES[`${px},${py}`];
  if (fixed) return fixed;
  let roll = tileHash(px, py, 7);
  for (const [zone, chance] of PATCH_CHANCES) {
    if (roll < chance) return zone;
    roll -= chance;
  }
  return 'plain';
}

/** Tiles of a zone in one row, side by side, of the patch that holds (x, y): its land left after the water. */
function zoneRun(x: number, y: number): number {
  const p0 = Math.floor(x / PATCH_SIZE[0]) * PATCH_SIZE[0];
  let run = 0;
  for (let i = p0; i < Math.min(p0 + PATCH_SIZE[0], MAP_COLUMNS); i++) {
    if (waterAt(i, y)) {
      if (i > x) break;
      run = 0;
    } else run++;
  }
  return run;
}

/**
 * Terrain of the tile at column `x`, row `y`. Fixed for every save (1.05).
 * Where the river or coast leaves a zone narrower than MIN_ZONE_RUN tiles in
 * a row, that sliver is plain: no machine could stand fully on it, so its
 * bonus could never be had (playtest 17).
 */
export function terrainAt(x: number, y: number): Terrain {
  const water = waterAt(x, y);
  if (water) return water;
  if (y >= EXCLUSION_START_ROW) return 'exclusion';
  const patch = patchAt(x, y);
  return patch !== 'plain' && zoneRun(x, y) < MIN_ZONE_RUN ? 'plain' : patch;
}

/** A small decoration drawn on a tile (x >= MAP_COLUMNS is the open sea), or null. Purely cosmetic. */
export function detailAt(x: number, y: number): Detail | null {
  const d = DETAILS[x >= MAP_COLUMNS ? 'sea' : terrainAt(x, y)];
  if (tileHash(x, y, 1) >= d.chance) return null;
  return d.kinds[Math.floor(tileHash(x, y, 2) * d.kinds.length)];
}

/** The zone a machine type (generator type or producer id) needs or prefers, if any. */
const zoneOfType = new Map<string, Zone | null>();
export function zoneFor(type: string): Zone | null {
  if (zoneOfType.has(type)) return zoneOfType.get(type)!;
  let zone: Zone | null = null;
  for (const [id, z] of Object.entries(ZONES) as [Zone, (typeof ZONES)[Zone]][]) {
    if (z.generators.includes(type as GeneratorType) || z.producers?.includes(type as ProducerId) || z.visitors?.includes(type as ProducerId)) zone = id;
  }
  zoneOfType.set(type, zone);
  return zone;
}

/** True if a machine type may only be built on its zone (hydro, tidal, the experiments); visitors never are (1.38). */
export function zoneRequiredFor(type: string): boolean {
  const zone = zoneFor(type);
  return !!zone && ZONES[zone].required && !ZONES[zone].visitors?.includes(type as ProducerId);
}
