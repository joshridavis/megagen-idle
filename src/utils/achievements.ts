import { ACCENTS, ACHIEVEMENTS, OLD_ACCENT_IDS, TITLE_TIERS, type AccentId, type AchievementDef, type AchievementMetric } from '../data/achievements';
import { EVENTS_BY_ID } from '../data/events';
import { GENERATORS, GENERATOR_TYPES, UPGRADES } from '../data/generators';
import { PETS } from '../data/pets';
import { PRODUCER_IDS } from '../data/producers';
import { SUPPORTER_ACCENT, SUPPORTER_TITLE } from '../data/purchases';
import type { GameState } from '../types/state';
import { kindsBought, totalBought } from './decorations';
import { getPlayerLevel } from './playerLevel';

type S = Pick<
  GameState,
  'lifetimeEnergy' | 'activeGenerators' | 'records' | 'completedResearch' | 'expansionLevel' | 'producers' | 'contracts' | 'pets' | 'seenEvents' | 'stats'
> &
  Partial<Pick<GameState, 'decorationsBought'>>;

/** The current value of an achievement metric. */
export function metricValue(s: S, metric: AchievementMetric): number {
  switch (metric) {
    case 'lifetimeEnergy':
      return s.lifetimeEnergy;
    case 'clicks':
      return s.stats?.clicks ?? 0;
    case 'petClicks':
      return s.stats?.petClicks ?? 0;
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
    case 'decorations':
      return totalBought(s);
    case 'decorKinds':
      return kindsBought(s);
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

type Cos = Pick<GameState, 'achievements'> & Partial<Pick<GameState, 'entitlements'>>;
/** An accent id, including the Supporter Pack's (1.95). */
export type AnyAccentId = AccentId | typeof SUPPORTER_ACCENT.id;

/** A title can be shown once its achievement is unlocked (null means no title); the Supporter title with the Supporter Pack (1.95). */
export function canUseTitle(s: Cos, id: string | null): boolean {
  if (id === null) return true;
  if (id === SUPPORTER_TITLE.id) return !!s.entitlements?.supporter;
  return !!ACHIEVEMENTS.find((d) => d.id === id && d.title) && s.achievements?.[id] !== undefined;
}

/** An accent color can be used once enough achievements are unlocked; the Supporter accent with the Supporter Pack (1.95). */
export function canUseAccent(s: Cos, id: string): boolean {
  if (id === SUPPORTER_ACCENT.id) return !!s.entitlements?.supporter;
  const accent = ACCENTS.find((x) => x.id === id);
  return !!accent && unlockedCount(s) >= accent.need;
}

/**
 * A valid accent for a save (1.89): an old id maps to the new one of the same
 * color; an id that no longer exists, or is not unlocked, falls back to the
 * highest accent the save has unlocked.
 */
export function resolveAccent(s: Cos, id: string | undefined): AnyAccentId {
  const mapped = id === undefined ? undefined : (OLD_ACCENT_IDS[id] ?? id);
  if (mapped !== undefined && canUseAccent(s, mapped)) return mapped as AnyAccentId;
  const open = ACCENTS.filter((x) => canUseAccent(s, x.id));
  return open[open.length - 1].id;
}

/** Name and color of an accent id, the Supporter one included (unknown ids show as the first accent). */
export function accentInfo(id: string | undefined): { id: string; name: string; color: string } {
  if (id === SUPPORTER_ACCENT.id) return SUPPORTER_ACCENT;
  return ACCENTS.find((x) => x.id === id) ?? ACCENTS[0];
}

/** Name, color and tier name of a title id, the Supporter one included; null for no title or an unknown id. */
export function titleInfo(id: string | null | undefined): { name: string; color: string; tierId: string; tierName: string } | null {
  if (!id) return null;
  if (id === SUPPORTER_TITLE.id) return { name: SUPPORTER_TITLE.name, color: SUPPORTER_TITLE.color, tierId: 'supporter', tierName: 'Supporter' };
  const a = ACHIEVEMENTS.find((d) => d.id === id && d.title);
  const tier = TITLE_TIERS.find((t) => t.id === a?.tier);
  return a && tier ? { name: a.name, color: tier.color, tierId: tier.id, tierName: tier.name } : null;
}
