import { BASE_CLICK_VALUE } from '../data/player';
import { BONUS_CAPS, RESEARCH_BY_ID } from '../data/research';
import { NO_BONUSES, type Bonuses } from '../types/bonus';
import { playerLevelEnergyBonus } from './playerLevel';

/** Sums the effects of completed research. Bonuses of one type add together, then caps apply. */
export function getBonuses(completedResearch: string[]): Bonuses {
  const b: Bonuses = { ...NO_BONUSES };
  for (const id of completedResearch) {
    for (const e of RESEARCH_BY_ID[id]?.effects ?? []) b[e.type] += e.value;
  }
  b.buildDiscount = Math.min(b.buildDiscount, BONUS_CAPS.buildDiscount);
  b.researchCostReduction = Math.min(b.researchCostReduction, BONUS_CAPS.researchCostReduction);
  b.researchSpeed = Math.min(b.researchSpeed, BONUS_CAPS.researchSpeed);
  b.producerDiscount = Math.min(b.producerDiscount, BONUS_CAPS.producerDiscount);
  b.fuelEfficiency = Math.min(b.fuelEfficiency, BONUS_CAPS.fuelEfficiency);
  b.clickRateShare = Math.min(b.clickRateShare, BONUS_CAPS.clickRateShare);
  return b;
}

/**
 * Energy per manual click: the base value with click power boosts, plus a
 * share of the current energy/s from late click research (0.83).
 */
export function getClickValue(completedResearch: string[], energyPerSecond = 0, petBonus = 0): number {
  const b = getBonuses(completedResearch);
  return BASE_CLICK_VALUE * (1 + b.clickPower + petBonus) + b.clickRateShare * Math.max(0, energyPerSecond);
}

/**
 * Bonuses for energy output: research plus the player level bonus (0.90).
 * Use wherever generator output is calculated or shown.
 */
export function getEnergyBonuses(s: { completedResearch: string[]; lifetimeEnergy?: number }): Bonuses {
  const b = getBonuses(s.completedResearch);
  return { ...b, globalEnergy: b.globalEnergy + playerLevelEnergyBonus(s.lifetimeEnergy ?? 0) };
}
