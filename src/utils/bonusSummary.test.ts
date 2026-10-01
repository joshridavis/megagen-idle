import { describe, expect, it } from 'vitest';
import { BONUS_CAPS, RESEARCH } from '../data/research';
import { createInitialState } from '../data/initialState';
import { GeneratorType } from '../types/generator';
import { getBonuses, getClickValue } from './bonuses';
import { getBonusSummary } from './bonusSummary';
import { getGeneratorStats } from './generatorSystem';
import { getProducerCost } from './producerSystem';
import { getResearchCost, getResearchDuration } from './researchSystem';
import { RESEARCH_BY_ID } from '../data/research';
import { calculateEnergyRate } from './energyGeneration';

describe('permanent-boost research (0.30)', () => {
  it('there are 8 boost entries in the efficiency and materials categories', () => {
    const boosts = RESEARCH.filter((r) => (r.effects ?? []).length > 0 && r.id !== 'basic_solar');
    expect(boosts).toHaveLength(8);
    for (const r of boosts) {
      expect(['efficiency', 'materials']).toContain(r.category);
      expect(r.prerequisites.length).toBeGreaterThan(0);
    }
  });

  it('bonuses of one type add together', () => {
    expect(getBonuses(['standard_parts', 'bulk_purchasing']).buildDiscount).toBeCloseTo(0.1);
    expect(getBonuses(['basic_solar', 'smart_grid', 'superconductors']).globalEnergy).toBeCloseTo(0.35);
    expect(getBonuses(['lab_notebooks', 'automated_labs']).researchSpeed).toBeCloseTo(0.25);
  });

  it('the discount cap holds even if data stacks past it', () => {
    // simulate many discount sources by repeating ids
    const many = Array.from({ length: 20 }, () => 'standard_parts');
    expect(getBonuses(many).buildDiscount).toBe(BONUS_CAPS.buildDiscount);
    const summary = getBonusSummary(many).find((l) => l.type === 'buildDiscount')!;
    expect(summary.raw).toBeCloseTo(1);
    expect(summary.total).toBe(BONUS_CAPS.buildDiscount);
  });

  it('bonuses visibly change costs and rates', () => {
    const b = getBonuses(['standard_parts', 'bulk_purchasing', 'grant_funding', 'lab_notebooks', 'smart_grid', 'hand_crank']);
    expect(getGeneratorStats(GeneratorType.WIND, b).energyCost).toBeLessThan(getGeneratorStats(GeneratorType.WIND).energyCost);
    expect(getProducerCost('mine', 1, b).energy).toBeLessThan(getProducerCost('mine', 1).energy);
    const fossil = RESEARCH_BY_ID.fossil_fuels;
    expect(getResearchCost(fossil, b).energy).toBe(Math.ceil(fossil.cost.energy * 0.9));
    expect(getResearchDuration(fossil, b)).toBeCloseTo(fossil.duration / 1.1);
    expect(getClickValue(['hand_crank'])).toBe(2);
    const gens = [{ id: 'g', type: GeneratorType.SOLAR, isActive: true, level: 1 }];
    expect(calculateEnergyRate(gens, b)).toBeCloseTo(0.5 * 1.1);
  });

  it('the summary lists sources per bonus', () => {
    const lines = getBonusSummary(['basic_solar', 'smart_grid']);
    expect(lines).toEqual([
      { type: 'globalEnergy', total: expect.closeTo(0.2), raw: expect.closeTo(0.2), cap: undefined, sources: [
        { name: 'Basic Solar', value: 0.1 },
        { name: 'Smart Grid', value: 0.1 },
      ] },
    ]);
    expect(getBonusSummary(createInitialState(0).completedResearch)).toEqual([]);
  });
});
