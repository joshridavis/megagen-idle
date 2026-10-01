import { GENERATORS } from '../data/generators';
import { BASE_CLICK_VALUE } from '../data/player';
import { RESEARCH_BY_ID } from '../data/research';
import type { BonusType } from '../types/research';
import type { GameState } from '../types/state';

export interface RateModifier {
  /** Where the boost comes from, e.g. a research name. */
  source: string;
  /** Fraction, 0.1 = +10%. */
  percent: number;
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
    .reduce((sum, g) => sum + (GENERATORS[g.type]?.energyPerSecond ?? 0), 0);
  return breakdownFromResearch(base, state.completedResearch, 'globalEnergy');
}

/** Energy per click: base click value, then click power boosts. */
export function getClickBreakdown(completedResearch: string[]): RateBreakdown {
  return breakdownFromResearch(BASE_CLICK_VALUE, completedResearch, 'clickPower');
}
