import { ACCENTS, ACHIEVEMENTS, type AchievementDef, type AchievementMetric } from '../data/achievements';
import { EVENTS_BY_ID } from '../data/events';
import { GENERATORS, GENERATOR_TYPES, UPGRADES } from '../data/generators';
import { PETS } from '../data/pets';
import { PRODUCER_IDS } from '../data/producers';
import type { GameState } from '../types/state';
import { getPlayerLevel } from './playerLevel';

type S = Pick<
  GameState,
  'lifetimeEnergy' | 'activeGenerators' | 'records' | 'completedResearch' | 'expansionLevel' | 'producers' | 'contracts' | 'pets' | 'seenEvents' | 'stats'
>;

/** The current value of an achievement metric. */
export function metricValue(s: S, metric: AchievementMetric): number {
  switch (metric) {
    case 'lifetimeEnergy':
      return s.lifetimeEnergy;
    case 'clicks':
      return s.stats?.clicks ?? 0;
    case 'generators':
      return s.activeGenerators.length;
    case 'typesBuilt':
      return s.records.builtTypes.length;
    case 'typesMaxed':
      return GENERATOR_TYPES.filter((t) => (s.records.bestLevel[t] ?? 0) >= (GENERATORS[t].maxLevel ?? UPGRADES.maxLevel)).length;
    case 'research':
      return s.completedResearch.length;
    case 'expansions':
      return s.expansionLevel;
    case 'producers':
      return PRODUCER_IDS.reduce((n, id) => n + (s.producers[id] ?? 0), 0);
    case 'playerLevel':
      return getPlayerLevel(s.lifetimeEnergy).level;
    case 'contracts':
      return s.contracts?.done ?? 0;
    case 'petsFound':
      return PETS.filter((p) => s.pets?.owned[p.id]).length;
    case 'petsAdult':
      return PETS.filter((p) => (s.pets?.owned[p.id]?.stage ?? 0) >= 3).length;
    case 'sightings':
      return Object.keys(s.seenEvents ?? {}).filter((id) => EVENTS_BY_ID[id]?.animation).length;
    case 'effectEvents':
      return Object.entries(s.seenEvents ?? {})
        .filter(([id]) => EVENTS_BY_ID[id]?.effect && EVENTS_BY_ID[id].when !== 'never')
        .reduce((n, [, v]) => n + v.count, 0);
    case 'returns':
      return s.stats?.returns ?? 0;
  }
}

/** 0..1 progress toward an achievement. */
export const achievementProgress = (s: S, def: AchievementDef) => Math.min(1, metricValue(s, def.metric) / def.target);

/** Achievements reached but not yet unlocked. Pure. */
export function newlyEarned(s: S & Pick<GameState, 'achievements'>): AchievementDef[] {
  return ACHIEVEMENTS.filter((d) => s.achievements?.[d.id] === undefined && metricValue(s, d.metric) >= d.target);
}

/** Records newly earned achievements with their unlock time; returns the same state if none. */
export function unlockAchievements<T extends S & Pick<GameState, 'achievements'>>(s: T, now: number): { state: T; unlocked: AchievementDef[] } {
  const unlocked = newlyEarned(s);
  if (!unlocked.length) return { state: s, unlocked };
  const achievements = { ...s.achievements };
  for (const d of unlocked) achievements[d.id] = now;
  return { state: { ...s, achievements }, unlocked };
}

/** Number of achievements unlocked. */
export const unlockedCount = (s: Pick<GameState, 'achievements'>) => ACHIEVEMENTS.filter((d) => s.achievements?.[d.id] !== undefined).length;

/** A title can be shown once its achievement is unlocked (null means no title). */
export function canUseTitle(s: Pick<GameState, 'achievements'>, id: string | null): boolean {
  if (id === null) return true;
  return !!ACHIEVEMENTS.find((d) => d.id === id && d.title) && s.achievements?.[id] !== undefined;
}

/** An accent colour can be used once enough achievements are unlocked. */
export function canUseAccent(s: Pick<GameState, 'achievements'>, id: string): boolean {
  const accent = ACCENTS.find((x) => x.id === id);
  return !!accent && unlockedCount(s) >= accent.need;
}
