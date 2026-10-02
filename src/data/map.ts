import { GeneratorType } from '../types/generator';

/**
 * Site map (1.04, playtest 14; larger with terrain in 1.05, playtest 15).
 * Every unit of room is one tile; a machine covers as many tiles as its room
 * cost. The site is MAP_COLUMNS wide and grows downward, row by row, as room
 * expansions are bought. The land around it is drawn too, fenced off.
 */
export const MAP_COLUMNS = 24;
/** Open sea drawn past the coast, on the right. Decoration only: not part of the site. */
export const SEA_COLUMNS = 2;
/** Rows of fenced land shown below the current site (the next expansion). */
export const LOCKED_PREVIEW_ROWS = 3;
/** The map always shows at least this many rows, so even a small site sits in a landscape. */
export const MIN_MAP_ROWS = 10;
/** Seed for the scattered details (rocks, tufts, flowers): the same map on every visit. */
export const MAP_SEED = 1505;
/** Small details drawn on tiles (1.05, more kinds in 1.15, playtest 16). Cosmetic only. */
export type Detail =
  | 'rock'
  | 'tuft'
  | 'flower'
  | 'bush'
  | 'stump'
  | 'mushroom'
  | 'log'
  | 'cactus'
  | 'drygrass'
  | 'boulder'
  | 'bentgrass'
  | 'reeds'
  | 'lily'
  | 'shell'
  | 'driftwood'
  | 'boat'
  | 'buoy';

/** Per terrain (and the open sea): how often a tile gets a detail, and which kinds, picked evenly. */
export const DETAILS: Record<Terrain | 'sea', { chance: number; kinds: Detail[] }> = {
  plain: { chance: 0.2, kinds: ['tuft', 'flower', 'rock', 'bush', 'stump', 'mushroom', 'log'] },
  plateau: { chance: 0.18, kinds: ['rock', 'flower', 'cactus', 'drygrass'] },
  ridge: { chance: 0.18, kinds: ['rock', 'tuft', 'boulder', 'bentgrass'] },
  river: { chance: 0.1, kinds: ['reeds', 'lily'] },
  coast: { chance: 0.12, kinds: ['shell', 'driftwood'] },
  sea: { chance: 0.05, kinds: ['boat', 'buoy'] },
};

export type Terrain = 'plain' | 'plateau' | 'ridge' | 'river' | 'coast';
export type Zone = Exclude<Terrain, 'plain'>;

export interface ZoneDef {
  name: string;
  /** Generator types this zone suits. */
  generators: GeneratorType[];
  /** Energy bonus (fraction) when the whole machine stands inside the zone. */
  bonus: number;
  /** True if those generators can only be built here (playtest 15). */
  required: boolean;
  description: string;
}

export const ZONES: Record<Zone, ZoneDef> = {
  plateau: {
    name: 'Sunny plateau',
    generators: [GeneratorType.SOLAR],
    bonus: 0.2,
    required: false,
    description: 'Clear skies: Solar Panels standing fully on it make 20% more.',
  },
  ridge: {
    name: 'Windy ridge',
    generators: [GeneratorType.WIND],
    bonus: 0.2,
    required: false,
    description: 'Strong winds: Wind Turbines standing fully on it make 20% more.',
  },
  river: {
    name: 'River',
    generators: [GeneratorType.HYDRO],
    bonus: 0.1,
    required: true,
    description: 'Hydropower Dams must be built across the river; fully on it, they make 10% more. Other machines may stand here until a dam needs the spot.',
  },
  coast: {
    name: 'Coast',
    generators: [GeneratorType.TIDAL],
    bonus: 0.1,
    required: true,
    description: 'Tidal Power Stations must be built on the coast; fully on it, they make 10% more. Other machines may stand here until a station needs the spot.',
  },
};

/** A machine that needs a zone must have at least this share of its tiles on it. */
export const ZONE_REQUIRED_SHARE = 0.5;

/** The coast: the last columns of the site, next to the sea. */
export const COAST_COLUMNS = 3;
/** River width in tiles, and its first column at the top of the map. */
export const RIVER_WIDTH = 4;
export const RIVER_START_COLUMN = 9;
/** The river shifts sideways every RIVER_BEND_ROWS rows, by these steps in turn. */
export const RIVER_BEND_ROWS = 3;
export const RIVER_OFFSETS = [0, 1, 2, 2, 1, 0, -1, -2, -2, -1];
/** Plateau and ridge come in patches of this size (columns x rows). */
export const PATCH_SIZE: [number, number] = [4, 3];
/** Chance a patch is plateau, and ridge; the rest is plain. */
export const PATCH_CHANCES = { plateau: 0.25, ridge: 0.25 };
/**
 * Patches fixed at the top of the map: the starting land is plain, and the
 * first room expansion opens a windy ridge and a sunny plateau next to it.
 */
export const FIXED_PATCHES: Record<string, Terrain> = {
  '0,0': 'plain',
  '1,0': 'plain',
  '2,0': 'plain',
  '3,0': 'ridge',
  '4,0': 'plateau',
  '0,1': 'ridge',
  '1,1': 'plateau',
};
