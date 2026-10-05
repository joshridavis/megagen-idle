import { GeneratorType } from '../types/generator';
import type { ProducerId } from '../types/resource';

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
  | 'buoy'
  | 'warning'
  | 'pylon';

/** Per terrain (and the open sea): how often a tile gets a detail, and which kinds, picked evenly. */
export const DETAILS: Record<Terrain | 'sea', { chance: number; kinds: Detail[] }> = {
  plain: { chance: 0.2, kinds: ['tuft', 'flower', 'rock', 'bush', 'stump', 'mushroom', 'log'] },
  plateau: { chance: 0.18, kinds: ['rock', 'flower', 'cactus', 'drygrass'] },
  ridge: { chance: 0.18, kinds: ['rock', 'tuft', 'boulder', 'bentgrass'] },
  river: { chance: 0.1, kinds: ['reeds', 'lily'] },
  coast: { chance: 0.12, kinds: ['shell', 'driftwood'] },
  coalfield: { chance: 0.15, kinds: ['rock', 'drygrass'] },
  outcrop: { chance: 0.2, kinds: ['boulder', 'rock'] },
  oilfield: { chance: 0.12, kinds: ['drygrass', 'stump'] },
  lake: { chance: 0.1, kinds: ['lily', 'reeds'] },
  exclusion: { chance: 0.12, kinds: ['warning', 'pylon'] },
  sea: { chance: 0.05, kinds: ['boat', 'buoy'] },
};

export type Terrain = 'plain' | 'plateau' | 'ridge' | 'river' | 'coast' | 'coalfield' | 'outcrop' | 'oilfield' | 'lake' | 'exclusion';
export type Zone = Exclude<Terrain, 'plain'>;

export interface ZoneDef {
  name: string;
  /** Generator types this zone suits. */
  generators: GeneratorType[];
  /** Producers this zone suits (1.18): their output rises by the bonus. */
  producers?: ProducerId[];
  /** Energy bonus (fraction) when the whole machine stands inside the zone. */
  bonus: number;
  /** True if those generators can only be built here (playtest 15). */
  required: boolean;
  /**
   * Machines that also get the bonus here but may stand anywhere (1.38). On a
   * required zone they never take a spot its own machines need: they give way.
   */
  visitors?: (GeneratorType | ProducerId)[];
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
    visitors: ['deuteriumExtractor'],
    description:
      'Tidal Power Stations must be built on the coast; fully on it, they make 10% more. Deuterium Extractors fully on it (sea water) extract 10% more. Other machines may stand here until a station needs the spot.',
  },
  coalfield: {
    name: 'Coal field',
    generators: [GeneratorType.COAL],
    producers: ['coalMine'],
    bonus: 0.2,
    required: false,
    description: 'Coal near the surface: Coal Mines standing fully on it dig 20% more, and Coal Plants beside their fuel make 20% more.',
  },
  outcrop: {
    name: 'Rocky outcrop',
    generators: [],
    producers: ['quarry', 'mine', 'uraniumMine'],
    bonus: 0.2,
    required: false,
    description: 'Bare rock: Quarries, Metal Mines and Uranium Mines standing fully on it dig 20% more.',
  },
  oilfield: {
    name: 'Oil and gas field',
    generators: [GeneratorType.GAS, GeneratorType.OIL],
    producers: ['gasWell', 'oilRig'],
    bonus: 0.2,
    required: false,
    description:
      'Pockets underground: Gas Wells and Oil Rigs standing fully on it pump 20% more, and Natural Gas Plants and Oil Power Plants beside their fuel make 20% more.',
  },
  lake: {
    name: 'Cooling lake',
    generators: [GeneratorType.NUCLEAR],
    bonus: 0.2,
    required: false,
    description: 'Cold, still water: Nuclear Fission Plants standing fully on it are cooled better and make 20% more.',
  },
  exclusion: {
    name: 'Exclusion Zone',
    generators: [GeneratorType.FUSION, GeneratorType.SUPERNOVA],
    bonus: 0.1,
    required: true,
    description:
      'Fenced and shielded land for experiments: Fusion Reactors and Micro-Supernovas must be built here; fully inside, they make 10% more. Other machines may stand here until an experiment needs the spot.',
  },
};

/**
 * The Exclusion Zone (1.23, playtest 18): every land tile from this row down,
 * the land room tiers 9 and 10 open. The river and coast still run through it.
 */
export const EXCLUSION_START_ROW = 20;

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
/**
 * Narrowest piece of a zone left in a row after the river and coast cut a
 * patch: the widest machine that wants a zone (a Wind Turbine) is 3 tiles, so
 * narrower slivers become plain land (playtest 17).
 */
export const MIN_ZONE_RUN = 3;
/** Chance a patch is each zone; the rest is plain. Checked in this order. */
export const PATCH_CHANCES: [Zone, number][] = [
  ['plateau', 0.2],
  ['ridge', 0.2],
  ['coalfield', 0.1],
  ['outcrop', 0.1],
  ['oilfield', 0.08],
];
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
  '4,1': 'outcrop',
  '2,2': 'coalfield',
  '0,2': 'oilfield',
  // 1.38: a bonus place for every machine. These were plain: the oil and gas
  // fields grow to 8 tiles wide (gas and oil plants are 5 wide), and a lake
  // as big as a Nuclear Fission Plant (4 x 3).
  '1,3': 'oilfield',
  '1,6': 'oilfield',
  '0,4': 'lake',
};
