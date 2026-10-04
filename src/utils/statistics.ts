import { GENERATOR_TYPES, GENERATORS } from '../data/generators';
import { RESOURCE_IDS } from '../data/resources';
import type { GeneratorType } from '../types/generator';
import type { GameState, ResourceId } from '../types/state';
import { getBonuses, getEnergyBonuses } from './bonuses';
import { getEffectMods } from './effectMods';
import { getGeneratorOutput } from './energyGeneration';
import { withPetMods } from './pets';
import { getFuelUseRates, getProductionRates } from './resourceSystem';
import { withPlacementMods } from './siteMap';

export interface GeneratorShare {
  id: string;
  type: GeneratorType;
  perSecond: number;
  /** Fraction of all generator output, 0 to 1. */
  share: number;
}

export interface TypeShare {
  type: GeneratorType;
  name: string;
  count: number;
  running: number;
  perSecond: number;
  share: number;
}

export interface ResourceFlow {
  id: ResourceId;
  produced: number;
  burned: number;
  net: number;
}

export interface Statistics {
  lifetimeEnergy: number;
  energyPerSecond: number;
  /** Each generator's output, highest first (switched-off ones give 0). */
  byGenerator: GeneratorShare[];
  /** Output per generator type, highest first; only types you own. */
  byType: TypeShare[];
  /** Per second: made by producers, burned as fuel, and the difference. */
  resources: ResourceFlow[];
  clicks: number;
  clickEnergy: number;
  playSeconds: number;
  returns: number;
  startedAt: number | null;
  lastOffline: GameState['stats']['lastOffline'];
}

/**
 * Statistics panel (0.39): where energy and resources come from. Pure and
 * derived from the state with the same rules the game runs on, so the
 * per-generator outputs add up to the energy rate.
 */
export function getStatistics(s: GameState): Statistics {
  const mods = withPlacementMods(withPetMods(getEffectMods(s.activeEffects), s), s);
  const energyBonuses = getEnergyBonuses(s);
  const outputs = s.activeGenerators.map((g) => ({ id: g.id, type: g.type, isActive: g.isActive, perSecond: getGeneratorOutput(g, energyBonuses, mods) }));
  const total = outputs.reduce((sum, g) => sum + g.perSecond, 0);
  const share = (n: number) => (total > 0 ? n / total : 0);
  const byGenerator = outputs
    .map(({ id, type, perSecond }) => ({ id, type, perSecond, share: share(perSecond) }))
    .sort((a, b) => b.perSecond - a.perSecond);
  const byType = GENERATOR_TYPES.flatMap((type) => {
    const mine = outputs.filter((g) => g.type === type);
    if (!mine.length) return [];
    const perSecond = mine.reduce((sum, g) => sum + g.perSecond, 0);
    return [{ type, name: GENERATORS[type].name, count: mine.length, running: mine.filter((g) => g.isActive).length, perSecond, share: share(perSecond) }];
  }).sort((a, b) => b.perSecond - a.perSecond);

  const bonuses = getBonuses(s.completedResearch);
  const produced = getProductionRates(s.producers, bonuses, mods);
  const burned = getFuelUseRates(s.activeGenerators, bonuses);
  const resources = RESOURCE_IDS.map((id) => ({ id, produced: produced[id], burned: burned[id], net: produced[id] - burned[id] }));

  return {
    lifetimeEnergy: s.lifetimeEnergy,
    energyPerSecond: s.energyPerSecond,
    byGenerator,
    byType,
    resources,
    clicks: s.stats?.clicks ?? 0,
    clickEnergy: s.stats?.clickEnergy ?? 0,
    playSeconds: s.stats?.playSeconds ?? 0,
    returns: s.stats?.returns ?? 0,
    startedAt: s.stats?.startedAt ?? null,
    lastOffline: s.stats?.lastOffline ?? null,
  };
}
