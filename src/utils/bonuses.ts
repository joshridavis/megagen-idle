import { BASE_CLICK_VALUE } from '../data/player';
import { BONUS_CAPS, RESEARCH_BY_ID } from '../data/research';
import { NO_BONUSES, type Bonuses } from '../types/bonus';

/** Sums the effects of completed research. Bonuses of one type add together, then caps apply. */
export function getBonuses(completedResearch: string[]): Bonuses {
  const b: Bonuses = { ...NO_BONUSES };
  for (const id of completedResearch) {
    for (const e of RESEARCH_BY_ID[id]?.effects ?? []) b[e.type] += e.value;
  }
  b.buildDiscount = Math.min(b.buildDiscount, BONUS_CAPS.buildDiscount);
  b.researchCostReduction = Math.min(b.researchCostReduction, BONUS_CAPS.researchCostReduction);
  b.researchSpeed = Math.min(b.researchSpeed, BONUS_CAPS.researchSpeed);
  return b;
}

/** Energy per manual click, with the click power bonus. */
export function getClickValue(completedResearch: string[]): number {
  return BASE_CLICK_VALUE * (1 + getBonuses(completedResearch).clickPower);
}
