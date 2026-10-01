import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { PRODUCER_COST_GROWTH } from '../data/producers';
import { NO_BONUSES } from '../types/bonus';
import type { GameState } from '../types/state';
import { buildProducer, getProducerBlock, getProducerCost, scrapProducer } from './producerSystem';
import { getProductionRates } from './resourceSystem';
import { advanceTime, deriveRates } from './simulation';

const rich = (over: Partial<GameState> = {}): GameState => ({
  ...createInitialState(0),
  energy: 1e7,
  resources: { metal: 1e5, stone: 1e5, coal: 1e5, naturalGas: 0 },
  ...over,
});

describe('producer costs', () => {
  it('grow 20% per owned producer (playtest 5)', () => {
    expect(PRODUCER_COST_GROWTH).toBe(1.2);
    expect(getProducerCost('quarry', 1)).toEqual({ energy: 720, resources: { metal: 18 } });
  });
  it('grow by the growth factor per owned producer', () => {
    expect(getProducerCost('quarry', 0)).toEqual({ energy: 600, resources: { metal: 15 } });
    const third = getProducerCost('quarry', 2);
    expect(third.energy).toBe(Math.ceil(600 * PRODUCER_COST_GROWTH ** 2));
    expect(third.resources.metal).toBe(Math.ceil(15 * PRODUCER_COST_GROWTH ** 2));
  });
  it('the build discount applies', () => {
    expect(getProducerCost('mine', 0, { ...NO_BONUSES, buildDiscount: 0.5 })).toEqual({ energy: 450, resources: { stone: 10 } });
  });
});

describe('buying producers', () => {
  it('deducts costs and room and raises the count', () => {
    const s = buildProducer(rich(), 'quarry');
    const cost = getProducerCost('quarry', 1);
    expect(s.producers.quarry).toBe(2);
    expect(s.roomUsed).toBe(4);
    expect(s.energy).toBe(1e7 - cost.energy);
    expect(s.resources.metal).toBe(1e5 - cost.resources.metal!);
  });

  it('is blocked without room', () => {
    const s = rich({ roomUsed: 13 });
    expect(getProducerBlock(s, 'quarry')).toBe('room');
    expect(buildProducer(s, 'quarry')).toBe(s);
  });

  it('is blocked without resources or energy', () => {
    expect(getProducerBlock(rich({ resources: { metal: 0, stone: 0, coal: 0, naturalGas: 0 } }), 'quarry')).toBe('resources');
    expect(getProducerBlock(rich({ energy: 0 }), 'quarry')).toBe('energy');
  });

  it('gas wells need Natural Gas Extraction', () => {
    expect(getProducerBlock(rich(), 'gasWell')).toBe('locked');
    expect(getProducerBlock(rich({ completedResearch: ['gas_extraction'] }), 'gasWell')).toBeNull();
  });
});

describe('rates and room scale with count', () => {
  it('production is linear in the number owned', () => {
    expect(getProductionRates({ quarry: 4, mine: 0, coalMine: 0, gasWell: 0 }).stone).toBeCloseTo(0.4);
  });

  it('producers count toward room used', () => {
    const s = deriveRates({ ...createInitialState(0), producers: { quarry: 2, mine: 2, coalMine: 1, gasWell: 1 } });
    expect(s.roomUsed).toBe(2 + 2 + 1 + 2);
  });

  it('a bought quarry doubles stone income over time', () => {
    const s = buildProducer(rich(), 'quarry');
    const before = s.resources.stone;
    expect(advanceTime(s, 100).state.resources.stone - before).toBeCloseTo(20);
  });

  it('a fresh save stays playable: first Solar Panel still fits and is affordable', () => {
    const s = createInitialState(0);
    expect(s.roomCapacity - s.roomUsed).toBe(10);
  });
});

describe('scrapping producers (playtest 5)', () => {
  it('lowers the count and frees room, with no refund', () => {
    const s0 = rich();
    const s = scrapProducer(s0, 'quarry');
    expect(s.producers.quarry).toBe(0);
    expect(s.roomUsed).toBe(2);
    expect(s.resources).toEqual(s0.resources);
    expect(s.energy).toBe(s0.energy);
  });
  it('never goes below zero', () => {
    const s = rich();
    expect(scrapProducer(s, 'gasWell')).toBe(s);
  });
  it('the next one costs what the new count implies', () => {
    const s = scrapProducer(buildProducer(rich(), 'mine'), 'mine');
    expect(s.producers.mine).toBe(1);
    expect(getProducerCost('mine', s.producers.mine)).toEqual(getProducerCost('mine', 1));
  });
});

describe('scrapping several producers (playtest 6)', () => {
  it('scraps N and frees N x room', () => {
    const s = scrapProducer(rich({ producers: { quarry: 5, mine: 1, coalMine: 1, gasWell: 0 }, roomUsed: 7 }), 'quarry', 3);
    expect(s.producers.quarry).toBe(2);
    expect(s.roomUsed).toBe(4);
  });
  it('clamps to what is owned, and ignores zero or negative counts', () => {
    const base = rich({ producers: { quarry: 2, mine: 1, coalMine: 1, gasWell: 0 } });
    expect(scrapProducer(base, 'quarry', 99).producers.quarry).toBe(0);
    expect(scrapProducer(base, 'quarry', 0)).toBe(base);
    expect(scrapProducer(base, 'quarry', -3)).toBe(base);
  });
});
