import { DECORATION_LIMIT, DECORATIONS } from './decorations';
import { GENERATOR_TYPES } from './generators';
import { PETS } from './pets';
import { RESEARCH } from './research';
import { ROOM_TIERS } from './rooms';

/**
 * Achievements (0.65, owner request playtest 5; next per playtest 13).
 * Each one watches a metric (src/utils/achievements.ts) and unlocks when it
 * reaches `target`. `bonus` ones depend on luck or play style (sightings,
 * events, clicks, coming back) and do not count toward 100% completion.
 * No gameplay rewards for now (owner to decide).
 */
export type AchievementMetric =
  | 'lifetimeEnergy'
  | 'clicks'
  | 'generators'
  | 'typesBuilt'
  | 'typesMaxed'
  | 'research'
  | 'expansions'
  | 'producers'
  | 'playerLevel'
  | 'contracts'
  | 'petsFound'
  | 'petsAdult'
  | 'sightings'
  | 'effectEvents'
  | 'returns'
  | 'decorations'
  | 'decorKinds'
  | 'petClicks';

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: 'Energy' | 'Building' | 'Research' | 'Progress' | 'Contracts' | 'Pets' | 'Decorations' | 'Discovery';
  metric: AchievementMetric;
  target: number;
  bonus?: boolean;
  /** Unlocks this achievement's name as a title to show in the top bar (1.01). */
  title?: boolean;
  /** How hard the title is to earn (1.66). Every title has one. */
  tier?: TitleTierId;
}

/**
 * Title tiers by difficulty (1.66, cosmetic only), from lowest to highest.
 * `color` is an AAP-64 color that reads on the top bar (contrast at least
 * 4.5:1 on its slate background, checked by a test).
 */
export const TITLE_TIERS = [
  { id: 'common', name: 'Common', color: '#8b93af' },
  { id: 'uncommon', name: 'Uncommon', color: '#9cdb43' },
  { id: 'rare', name: 'Rare', color: '#249fde' },
  { id: 'epic', name: 'Epic', color: '#e86a73' },
  { id: 'legendary', name: 'Legendary', color: '#ffd541' },
] as const;
export type TitleTierId = (typeof TITLE_TIERS)[number]['id'];

/**
 * Achievements whose name becomes a title to show (1.01), with their tier
 * (1.66). Tiers follow when `npm run simulate` reaches each title: Common
 * within ~10 h, Uncommon ~10-50 h, Rare ~50-120 h, Epic ~120-200 h,
 * Legendary near 100% completion. Titles the simulator does not track
 * (clicks, sightings) are tiered by how rare they are.
 */
const TITLES: Record<string, TitleTierId> = {
  energy_100k: 'common', // 3.8 h
  level_10: 'common', // 7.3 h
  energy_10m: 'uncommon', // 21.8 h
  level_25: 'uncommon', // 25.1 h
  contracts_50: 'uncommon', // 47.9 h
  level_50: 'rare', // 61.7 h
  level_75: 'rare', // 100 h
  energy_1b: 'rare', // 103 h
  clicks_10k: 'rare', // play style: 10,000 clicks
  sight_5: 'rare', // luck: 5 different sightings
  contracts_200: 'epic', // 128 h
  energy_2b: 'epic', // 132 h
  adult_all: 'epic', // 176 h
  pet_1k: 'uncommon', // play style: pet your pets 1,000 times (1.51)
  decor_30: 'epic', // play style: every decoration copy bought (84 since 1.54), prices rising each copy (1.78)
  types_all: 'legendary', // 228 h
  research_all: 'legendary', // 243 h
  maxed_all: 'legendary', // 265 h (100%)
};

const a = (
  id: string,
  name: string,
  description: string,
  category: AchievementDef['category'],
  metric: AchievementMetric,
  target: number,
  bonus = false,
): AchievementDef => ({ id, name, description, category, metric, target, ...(bonus ? { bonus } : {}), ...(TITLES[id] ? { title: true, tier: TITLES[id] } : {}) });

export const ACHIEVEMENTS: AchievementDef[] = [
  a('energy_1k', 'First Spark', 'Produce 1,000 energy in total.', 'Energy', 'lifetimeEnergy', 1e3),
  a('energy_100k', 'Live Wire', 'Produce 100,000 energy in total.', 'Energy', 'lifetimeEnergy', 1e5),
  a('energy_10m', 'Power Station', 'Produce 10 million energy in total.', 'Energy', 'lifetimeEnergy', 1e7),
  a('energy_1b', 'Grid Operator', 'Produce 1 billion energy in total.', 'Energy', 'lifetimeEnergy', 1e9),
  a('energy_2b', 'Mega Generator', 'Produce 2 billion energy in total.', 'Energy', 'lifetimeEnergy', 2e9),
  a('clicks_100', 'Hand Crank', 'Click "Generate energy" 100 times.', 'Energy', 'clicks', 100, true),
  a('clicks_1k', 'Sore Wrist', 'Click "Generate energy" 1,000 times.', 'Energy', 'clicks', 1000, true),
  a('clicks_10k', 'Human Dynamo', 'Click "Generate energy" 10,000 times.', 'Energy', 'clicks', 10_000, true),
  a('gens_1', 'Plugged In', 'Build your first generator.', 'Building', 'generators', 1),
  a('gens_10', 'Small Plant', 'Own 10 generators at once.', 'Building', 'generators', 10),
  a('gens_25', 'Power Park', 'Own 25 generators at once.', 'Building', 'generators', 25),
  a('gens_50', 'Energy Empire', 'Own 50 generators at once.', 'Building', 'generators', 50),
  a('types_3', 'Mixed Supply', 'Build 3 different generator types.', 'Building', 'typesBuilt', 3),
  a('types_6', 'Diverse Grid', 'Build 6 different generator types.', 'Building', 'typesBuilt', 6),
  a('types_all', 'Every Kind', 'Build every generator type.', 'Building', 'typesBuilt', GENERATOR_TYPES.length),
  a('maxed_1', 'Fine Tuned', 'Upgrade a generator type to max level.', 'Building', 'typesMaxed', 1),
  a('maxed_all', 'Perfect Machines', 'Upgrade every generator type to max level.', 'Building', 'typesMaxed', GENERATOR_TYPES.length),
  a('producers_10', 'Supply Chain', 'Own 10 producers.', 'Building', 'producers', 10),
  a('producers_25', 'Industry', 'Own 25 producers.', 'Building', 'producers', 25),
  a('producers_40', 'Heavy Industry', 'Own 40 producers.', 'Building', 'producers', 40),
  a('research_1', 'Curious Mind', 'Complete your first research.', 'Research', 'research', 1),
  a('research_10', 'Lab Regular', 'Complete 10 research.', 'Research', 'research', 10),
  a('research_25', 'Scientist', 'Complete 25 research.', 'Research', 'research', 25),
  a('research_all', 'Know-it-all', 'Complete every research.', 'Research', 'research', RESEARCH.length),
  a('room_1', 'More Space', 'Buy your first room expansion.', 'Progress', 'expansions', 1),
  a('room_4', 'Growing Site', 'Buy 4 room expansions.', 'Progress', 'expansions', 4),
  a('room_all', 'Sprawling Complex', 'Buy every room expansion.', 'Progress', 'expansions', ROOM_TIERS.length),
  a('level_10', 'Apprentice', 'Reach player level 10.', 'Progress', 'playerLevel', 10),
  a('level_25', 'Engineer', 'Reach player level 25.', 'Progress', 'playerLevel', 25),
  a('level_50', 'Chief Engineer', 'Reach player level 50.', 'Progress', 'playerLevel', 50),
  a('level_75', 'Energy Baron', 'Reach player level 75.', 'Progress', 'playerLevel', 75),
  a('contracts_1', 'Open for Business', 'Complete your first contract.', 'Contracts', 'contracts', 1),
  a('contracts_10', 'Reliable Supplier', 'Complete 10 contracts.', 'Contracts', 'contracts', 10),
  a('contracts_50', 'Trusted Partner', 'Complete 50 contracts.', 'Contracts', 'contracts', 50),
  a('contracts_200', 'Grid Backbone', 'Complete 200 contracts.', 'Contracts', 'contracts', 200),
  a('pets_1', 'New Friend', 'Find your first pet.', 'Pets', 'petsFound', 1),
  a('pets_all', 'Full House', 'Find every pet.', 'Pets', 'petsFound', PETS.length),
  a('adult_1', 'All Grown Up', 'Raise a pet to adult.', 'Pets', 'petsAdult', 1),
  a('adult_all', 'Proud Keeper', 'Raise every pet to adult.', 'Pets', 'petsAdult', PETS.length),
  // 1.51 (owner request, playtest 21): petting your pets; play style, so bonus (outside 100%)
  a('pet_10', 'Gentle Hand', 'Pet your pets 10 times.', 'Pets', 'petClicks', 10, true),
  a('pet_100', 'Best Friend', 'Pet your pets 100 times.', 'Pets', 'petClicks', 100, true),
  a('pet_1k', 'Pet Whisperer', 'Pet your pets 1,000 times.', 'Pets', 'petClicks', 1000, true),
  a('decor_1', 'Green Thumb', 'Buy your first decoration.', 'Decorations', 'decorations', 1),
  a('decor_10', 'Site Beautifier', 'Buy 10 decorations.', 'Decorations', 'decorations', 10),
  a('decor_kinds', 'Collector', 'Buy every kind of decoration.', 'Decorations', 'decorKinds', DECORATIONS.length),
  // Every copy of every kind (1.78; was 30). The id stays decor_30 so saves that earned it keep it.
  // It counts toward 100% now that it needs every copy (1.85; was a bonus).
  a('decor_30', 'Landscape Architect', `Own all ${DECORATIONS.length * DECORATION_LIMIT} decorations.`, 'Decorations', 'decorations', DECORATIONS.length * DECORATION_LIMIT),
  a('sight_1', 'What Was That?', 'Spot your first sighting.', 'Discovery', 'sightings', 1, true),
  a('sight_5', 'Sky Watcher', 'Spot 5 different sightings.', 'Discovery', 'sightings', 5, true),
  a('events_10', 'Weathered', 'Experience 10 events that change the game.', 'Discovery', 'effectEvents', 10, true),
  a('returns_1', 'Welcome Back', 'Come back after time away.', 'Discovery', 'returns', 1, true),
  a('returns_25', 'Regular', 'Come back after time away 25 times.', 'Discovery', 'returns', 25, true),
];

/**
 * Accent colors for the top bar (1.01), unlocked by the number of achievements.
 * One per title tier, in tier order and in the tier's own color (1.89), so an
 * accent and a title of the same tier look exactly alike. `color` colors the
 * energy number and the top bar ring.
 */
const tierColor = (id: TitleTierId) => TITLE_TIERS.find((t) => t.id === id)!.color;
export const ACCENTS = [
  { id: 'slate', name: 'Slate', tier: 'common', need: 0, color: tierColor('common') },
  { id: 'lime', name: 'Lime', tier: 'uncommon', need: 5, color: tierColor('uncommon') },
  { id: 'sky', name: 'Sky', tier: 'rare', need: 15, color: tierColor('rare') },
  { id: 'rose', name: 'Rose', tier: 'epic', need: 25, color: tierColor('epic') },
  { id: 'gold', name: 'Gold', tier: 'legendary', need: 36, color: tierColor('legendary') },
] as const satisfies readonly { id: string; name: string; tier: TitleTierId; need: number; color: string }[];
export type AccentId = (typeof ACCENTS)[number]['id'];
/** The accent of a new save: the Common one (1.89). */
export const DEFAULT_ACCENT: AccentId = 'slate';
/** Accent ids from before 1.89 that map to a new id of the same color (violet has none). */
export const OLD_ACCENT_IDS: Record<string, AccentId> = { amber: 'gold', emerald: 'lime', sky: 'sky', rose: 'rose' };

export const ACHIEVEMENTS_BY_ID = Object.fromEntries(ACHIEVEMENTS.map((x) => [x.id, x]));

/** The tier of a title, or null for an id that is not a title (1.66). */
export function titleTier(id: string | null | undefined): (typeof TITLE_TIERS)[number] | null {
  const tier = id ? ACHIEVEMENTS_BY_ID[id]?.tier : undefined;
  return TITLE_TIERS.find((t) => t.id === tier) ?? null;
}
