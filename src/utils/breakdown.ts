import { GENERATORS } from '../data/generators';
import { BASE_CLICK_VALUE } from '../data/player';
import { RESEARCH_BY_ID } from '../data/research';
import type { BonusType } from '../types/research';
import type { GameState, ResourceId } from '../types/state';
import { getBonuses } from './bonuses';
import { baseOutput } from './energyGeneration';
import { getFuelUseRates, getProductionRates } from './resourceSystem';

export interface RateModifier {
  /** Where the boost comes from, e.g. a research name. */
  source: string;
  /** Fraction, 0.1 = +10%. Absent for flat changes such as fuel use. */
  percent?: number;
  /** What this boost adds, in the breakdown's unit. */
  amount: number;
}

/** How a rate is built up: base, then each boost. Reusable for resources later. */
export interface RateBreakdown {
  base: number;
  modifiers: RateModifier[];
  total: number;
}

/**
 * Additive percentage boosts of one bonus type from completed research,
 * applied to `base`. Matches how bonuses combine in getBonuses.
 */
export function breakdownFromResearch(base: number, completedResearch: string[], type: BonusType): RateBreakdown {
  const modifiers: RateModifier[] = [];
  for (const id of completedResearch) {
    const def = RESEARCH_BY_ID[id];
    for (const e of def?.effects ?? []) {
      if (e.type === type && e.value !== 0) modifiers.push({ source: def.name, percent: e.value, amount: base * e.value });
    }
  }
  return { base, modifiers, total: base + modifiers.reduce((sum, m) => sum + m.amount, 0) };
}

/** Energy per second: base from running generators, then research boosts. */
export function getEnergyBreakdown(state: Pick<GameState, 'activeGenerators' | 'completedResearch'>): RateBreakdown {
  const base = state.activeGenerators
    .filter((g) => g.isActive)
    .reduce((sum, g) => sum + baseOutput(g), 0);
  return breakdownFromResearch(base, state.completedResearch, 'globalEnergy');
}

/** Energy per click: base click value, click power boosts, then the energy/s share (capped). */
export function getClickBreakdown(completedResearch: string[], energyPerSecond = 0): RateBreakdown {
  const power = breakdownFromResearch(BASE_CLICK_VALUE, completedResearch, 'clickPower');
  const share = getBonuses(completedResearch).clickRateShare;
  if (share <= 0) return power;
  const raw = breakdownFromResearch(1, completedResearch, 'clickRateShare').total - 1;
  const capped = share < raw ? ' (capped)' : '';
  const modifiers = [
    ...power.modifiers,
    { source: `${Math.round(share * 100)}% of your energy/s${capped}`, amount: share * Math.max(0, energyPerSecond) },
  ];
  return { base: power.base, modifiers, total: power.total + modifiers[modifiers.length - 1].amount };
}

/**
 * Net per-second change of one resource: base production from producers,
 * research production boosts, then fuel burned by running generators
 * (after fuel efficiency) as a negative modifier.
 */
export function getResourceBreakdown(
  state: Pick<GameState, 'producers' | 'activeGenerators' | 'completedResearch'>,
  id: ResourceId,
): RateBreakdown {
  const base = getProductionRates(state.producers)[id];
  const boosts = breakdownFromResearch(base, state.completedResearch, 'resourceProduction').modifiers;
  const specific = id === 'metal' ? 'metalProduction' : id === 'stone' ? 'stoneProduction' : null;
  if (specific) boosts.push(...breakdownFromResearch(base, state.completedResearch, specific).modifiers);
  const bonuses = getBonuses(state.completedResearch);
  const burn = getFuelUseRates(state.activeGenerators, bonuses)[id];
  const modifiers: RateModifier[] = [...boosts];
  if (burn > 0) {
    const burners = state.activeGenerators.filter((g) => g.isActive && (GENERATORS[g.type]?.maintenanceCost?.[id] ?? 0) > 0);
    const eff = bonuses.fuelEfficiency > 0 ? ` (−${Math.round(bonuses.fuelEfficiency * 100)}% from research)` : '';
    modifiers.push({ source: `Fuel for ${burners.length} running generator${burners.length === 1 ? '' : 's'}${eff}`, amount: -burn });
  }
  return { base, modifiers, total: base + modifiers.reduce((sum, m) => sum + m.amount, 0) };
}
