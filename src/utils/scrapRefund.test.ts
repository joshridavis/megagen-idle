import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { SCRAP_REFUND_SHARE } from '../data/generators';
import { GeneratorType, type Generator } from '../types/generator';
import { generatorScrapRefund, generatorSpent, getGeneratorStats, getUpgradeCost, scrapGenerator } from './generatorSystem';
import { getProducerCost, producerScrapRefund, scrapProducer } from './producerSystem';
import { deriveRates } from './simulation';

const coal = (level: number): Generator => ({ id: 'gen-1', type: GeneratorType.COAL, isActive: true, level });

describe('scrap refunds (1.24, playtest 18)', () => {
  it('a new generator gives back 10% of its build cost', () => {
    const stats = getGeneratorStats(GeneratorType.COAL);
    const r = generatorScrapRefund(coal(1));
    expect(r.energy).toBe(Math.floor(stats.energyCost * SCRAP_REFUND_SHARE));
    expect(r.resources.metal).toBe(Math.floor((stats.buildCost.metal ?? 0) * SCRAP_REFUND_SHARE));
  });

  it('an upgraded generator gives back 10% of the build cost plus every upgrade', () => {
    const spent = generatorSpent(coal(4));
    const stats = getGeneratorStats(GeneratorType.COAL);
    const ups = [1, 2, 3].map((l) => getUpgradeCost(GeneratorType.COAL, l));
    expect(spent.energy).toBe(stats.energyCost + ups.reduce((s, u) => s + u.energy, 0));
    expect(spent.resources.metal).toBe((stats.buildCost.metal ?? 0) + ups.reduce((s, u) => s + (u.resources.metal ?? 0), 0));
    expect(generatorScrapRefund(coal(4)).energy).toBe(Math.floor(spent.energy * 0.1));
  });

  it('scrapping adds the refund to energy and resources', () => {
    const s = deriveRates({ ...createInitialState(0), energy: 0, activeGenerators: [coal(3)], roomCapacity: 50 });
    const r = generatorScrapRefund(coal(3));
    const after = scrapGenerator(s, 'gen-1');
    expect(after.activeGenerators).toEqual([]);
    expect(after.energy).toBe(r.energy);
    expect(after.resources.metal).toBe(s.resources.metal + (r.resources.metal ?? 0));
  });

  it('producers give back 10% of what the scrapped ones cost; free granted ones give nothing', () => {
    const s = deriveRates({ ...createInitialState(0), energy: 0, producers: { ...createInitialState(0).producers, mine: 4 }, roomCapacity: 50 });
    const expected = Math.floor((getProducerCost('mine', 3).energy + getProducerCost('mine', 2).energy) * 0.1);
    expect(producerScrapRefund(s, 'mine', 2).energy).toBe(expected);
    expect(scrapProducer(s, 'mine', 2).energy).toBe(expected);
    // a Gas Well granted by research was free
    const g = { ...createInitialState(0), completedResearch: ['gas_extraction'], producers: { ...createInitialState(0).producers, gasWell: 1 } };
    expect(producerScrapRefund(g, 'gasWell', 1)).toEqual({ energy: 0, resources: {} });
  });
});
