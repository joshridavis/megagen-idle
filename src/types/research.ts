import type { Bonuses } from './bonus';
import type { GeneratorType } from './generator';
import type { ProducerId, ResourceAmounts } from './resource';

export type ResearchCategory = 'energy' | 'materials' | 'efficiency' | 'advanced';

export type BonusType = keyof Bonuses;

/** A permanent bonus: `value` is a fraction (0.1 = +10%). */
export interface ResearchEffect {
  type: BonusType;
  value: number;
}

export interface ResearchCost {
  energy: number;
  resources?: ResourceAmounts;
}

export interface ResearchDef {
  id: string;
  name: string;
  description: string;
  category: ResearchCategory;
  /** Research level needed to start it. */
  requiredLevel: number;
  cost: ResearchCost;
  /** Seconds, before research speed bonuses. */
  duration: number;
  prerequisites: string[];
  /** Generator types the player must own at least one of each (built, on or off). */
  requiresBuilt?: GeneratorType[];
  /** Generators it unlocks, and producers it grants (added to the player's count). */
  unlocks: { generators?: GeneratorType[]; producers?: Partial<Record<ProducerId, number>> };
  effects?: ResearchEffect[];
}

/** Research in progress. Timestamp-based so it finishes while the game is closed. */
export interface CurrentResearch {
  id: string;
  /** Epoch ms. */
  startTime: number;
  /** Seconds, after bonuses. */
  duration: number;
}
