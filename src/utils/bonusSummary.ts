import { BONUS_CAPS, RESEARCH_BY_ID } from '../data/research';
import type { Bonuses } from '../types/bonus';
import type { BonusType } from '../types/research';
import { getBonuses } from './bonuses';

export interface BonusLine {
  type: BonusType;
  /** Total after the cap. */
  total: number;
  /** Uncapped sum of all sources. */
  raw: number;
  cap?: number;
  sources: { name: string; value: number }[];
}

const ORDER: BonusType[] = [
  'globalEnergy',
  'clickPower',
  'clickRateShare',
  'buildDiscount',
  'researchSpeed',
  'researchCostReduction',
  'resourceProduction',
  'metalProduction',
  'stoneProduction',
  'producerDiscount',
  'fuelEfficiency',
];

/** Active bonuses with their sources, for the Bonuses panel. Only types with at least one source. */
export function getBonusSummary(completedResearch: string[]): BonusLine[] {
  const totals: Bonuses = getBonuses(completedResearch);
  return ORDER.map((type) => {
    const sources = completedResearch.flatMap((id) =>
      (RESEARCH_BY_ID[id]?.effects ?? []).filter((e) => e.type === type).map((e) => ({ name: RESEARCH_BY_ID[id].name, value: e.value })),
    );
    const cap = (BONUS_CAPS as Partial<Record<BonusType, number>>)[type];
    return { type, total: totals[type], raw: sources.reduce((s, x) => s + x.value, 0), cap, sources };
  }).filter((l) => l.sources.length > 0);
}
