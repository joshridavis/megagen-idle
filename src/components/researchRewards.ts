import { GENERATORS } from '../data/generators';
import { PRODUCERS } from '../data/producers';
import type { ProducerId } from '../types/resource';
import type { BonusType, ResearchDef } from '../types/research';

const BONUS_TEXT: Record<BonusType, string> = {
  buildDiscount: 'cheaper building',
  researchCostReduction: 'cheaper research',
  researchSpeed: 'faster research',
  globalEnergy: 'energy from all generators',
  clickPower: 'energy per click',
  clickRateShare: 'of your energy/s added to each click',
  resourceProduction: 'output from all producers',
  metalProduction: 'metal from mines',
  stoneProduction: 'stone from quarries',
  producerDiscount: 'cheaper producers',
  fuelEfficiency: 'less fuel burned',
};

export interface Reward {
  icon: string;
  text: string;
  /** Short form for node hints. */
  short: string;
}

/** Everything a research gives, each with an icon: unlocks, producers, boosts. */
export function getResearchRewards(def: ResearchDef): Reward[] {
  return [
    ...(def.unlocks.generators ?? []).map((g) => ({
      icon: '⚡',
      text: `Unlocks the ${GENERATORS[g].name}`,
      short: GENERATORS[g].name,
    })),
    ...Object.entries(def.unlocks.producers ?? {}).map(([id, n]) => ({
      icon: '⛏️',
      text: `${n} free ${PRODUCERS[id as ProducerId].name}${(n ?? 0) > 1 ? 's' : ''}, and lets you build more`,
      short: PRODUCERS[id as ProducerId].name,
    })),
    ...(def.effects ?? []).map((e) => ({
      icon: '📈',
      text: `+${Math.round(e.value * 100)}% ${BONUS_TEXT[e.type]}`,
      short: `+${Math.round(e.value * 100)}% ${BONUS_TEXT[e.type]}`,
    })),
  ];
}
