import { PRODUCER_COST_GROWTH, PRODUCERS } from '../data/producers';
import { BONUS_CAPS } from '../data/research';
import { NO_BONUSES, type Bonuses } from '../types/bonus';
import type { ProducerId, ResourceAmounts } from '../types/resource';
import type { GameState } from '../types/state';
import { addResources, canAfford, consumeResource } from './resourceSystem';
import { getBonuses } from './bonuses';
import { refundOf } from './generatorSystem';
import { getGrantedProducers } from './researchSystem';
import { deriveRates } from './simulation';

export interface ProducerCost {
  energy: number;
  resources: ResourceAmounts;
}

/**
 * Cost of buying one more producer when `owned` are already owned:
 * base x growth^owned, build discount applied, rounded up.
 */
export function getProducerCost(id: ProducerId, owned: number, bonuses: Bonuses = NO_BONUSES): ProducerCost {
  const def = PRODUCERS[id];
  const discount = Math.min(BONUS_CAPS.buildDiscount, bonuses.buildDiscount + bonuses.producerDiscount);
  const f = PRODUCER_COST_GROWTH ** Math.max(0, owned) * (1 - discount);
  const resources: ResourceAmounts = {};
  for (const [r, n] of Object.entries(def.baseCost.resources)) resources[r as keyof ResourceAmounts] = Math.ceil((n ?? 0) * f);
  return { energy: Math.ceil(def.baseCost.energy * f), resources };
}

export type ProducerBlock = 'locked' | 'room' | 'resources' | 'energy';

export function getProducerBlock(state: GameState, id: ProducerId, bonuses: Bonuses = NO_BONUSES): ProducerBlock | null {
  const def = PRODUCERS[id];
  if (def.fullGame) return 'locked';
  if (def.requiresResearch && !state.completedResearch.includes(def.requiresResearch)) return 'locked';
  if (state.roomUsed + def.roomCost > state.roomCapacity) return 'room';
  const cost = getProducerCost(id, state.producers[id] ?? 0, bonuses);
  if (!canAfford(state.resources, cost.resources)) return 'resources';
  if (state.energy < cost.energy) return 'energy';
  return null;
}

/** Buys one producer. Returns the state unchanged if blocked. */
export function buildProducer(state: GameState, id: ProducerId, bonuses: Bonuses = NO_BONUSES): GameState {
  if (getProducerBlock(state, id, bonuses) !== null) return state;
  const cost = getProducerCost(id, state.producers[id] ?? 0, bonuses);
  return deriveRates({
    ...state,
    energy: state.energy - cost.energy,
    resources: consumeResource(state.resources, cost.resources).resources,
    producers: { ...state.producers, [id]: (state.producers[id] ?? 0) + 1 },
  });
}

/**
 * What scrapping the last `count` producers of a type gives back (1.24):
 * SCRAP_REFUND_SHARE of what each cost. Producers granted by research were
 * free and give nothing.
 */
export function producerScrapRefund(state: GameState, id: ProducerId, count = 1, bonuses: Bonuses = getBonuses(state.completedResearch)): ProducerCost {
  const owned = state.producers[id] ?? 0;
  const free = getGrantedProducers(state.completedResearch)[id] ?? 0;
  const spent: ProducerCost = { energy: 0, resources: {} };
  for (let k = owned - 1; k >= Math.max(free, owned - count); k--) {
    const c = getProducerCost(id, k, bonuses);
    spent.energy += c.energy;
    for (const [r, n] of Object.entries(c.resources)) spent.resources[r as keyof ResourceAmounts] = (spent.resources[r as keyof ResourceAmounts] ?? 0) + (n ?? 0);
  }
  return refundOf(spent);
}

/** Removes `count` producers of a type (clamped to 0..owned), freeing their room, with a small refund (1.24). */
export function scrapProducer(state: GameState, id: ProducerId, count = 1): GameState {
  const owned = state.producers[id] ?? 0;
  const n = Math.max(0, Math.min(owned, Math.floor(count)));
  if (n === 0) return state;
  const refund = producerScrapRefund(state, id, n);
  return deriveRates({
    ...state,
    energy: state.energy + refund.energy,
    resources: addResources(state.resources, refund.resources),
    producers: { ...state.producers, [id]: owned - n },
  });
}
