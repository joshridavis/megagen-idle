import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { BONUS_CAPS } from '../data/research';
import { GeneratorType } from '../types/generator';
import { getBonuses } from './bonuses';
import { getResourceBreakdown } from './breakdown';
import { getProducerCost } from './producerSystem';
import { burnFuel, getFuelUseRates, getProductionRates } from './resourceSystem';
import { advanceTime } from './simulation';

const P = { quarry: 1, mine: 1, coalMine: 1, gasWell: 0, oilRig: 0, uraniumMine: 0, deuteriumExtractor: 0 };
const coal = { id: 'g1', type: GeneratorType.COAL, isActive: true, level: 1 };

describe('resource boost research (0.75)', () => {
  it('metal and stone boosts apply only to their resource', () => {
    const r = getProductionRates(P, getBonuses(['better_picks', 'controlled_blasting']));
    expect(r.metal).toBeCloseTo((1 / 15) * 1.25);
    expect(r.stone).toBeCloseTo(0.1 * 1.25);
    expect(r.coal).toBeCloseTo(0.05);
  });

  it('all-resource boosts stack with each other and with resource-specific ones', () => {
    const b = getBonuses(['better_picks', 'conveyor_belts', 'deep_drilling']);
    expect(b.resourceProduction).toBeCloseTo(0.35);
    const r = getProductionRates(P, b);
    expect(r.metal).toBeCloseTo((1 / 15) * (1 + 0.35 + 0.25));
    expect(r.coal).toBeCloseTo(0.05 * 1.35);
  });

  it('producer discount makes producers cheaper and shares the build-discount cap', () => {
    const base = getProducerCost('mine', 1);
    expect(getProducerCost('mine', 1, getBonuses(['modular_mines'])).energy).toBe(Math.ceil(900 * 1.2 * 0.85));
    expect(getProducerCost('mine', 1, getBonuses(['modular_mines'])).energy).toBeLessThan(base.energy);
    const many = getBonuses(Array.from({ length: 30 }, () => 'modular_mines'));
    expect(many.producerDiscount).toBe(BONUS_CAPS.producerDiscount);
    expect(getProducerCost('mine', 0, many).energy).toBe(Math.ceil(900 * (1 - BONUS_CAPS.buildDiscount)));
  });

  it('fuel efficiency lowers fuel burned', () => {
    const b = getBonuses(['efficient_boilers']);
    expect(getFuelUseRates([coal], b).coal * 60).toBeCloseTo(0.8);
    expect(burnFuel({ metal: 0, stone: 0, coal: 10, naturalGas: 0, oil: 0, uranium: 0, deuterium: 0 }, [coal], 60, b).resources.coal).toBeCloseTo(9.2);
  });

  it('boosts apply in the simulation (offline too)', () => {
    const s = { ...createInitialState(0), completedResearch: ['controlled_blasting'] };
    const { state } = advanceTime(s, 100);
    expect(state.resources.stone - s.resources.stone).toBeCloseTo(100 * 0.1 * 1.25);
  });

  it('resource tooltips list the boosts and fuel savings', () => {
    const b = getResourceBreakdown(
      { producers: P, activeGenerators: [coal], completedResearch: ['better_picks', 'conveyor_belts', 'efficient_boilers'] },
      'metal',
    );
    expect(b.modifiers.map((m) => m.source)).toEqual(['Conveyor Belts', 'Better Pickaxes']);
    expect(b.total).toBeCloseTo((1 / 15) * 1.4);
    const c = getResourceBreakdown({ producers: P, activeGenerators: [coal], completedResearch: ['efficient_boilers'] }, 'coal');
    expect(c.modifiers[0].source).toContain('−20% from research');
    expect(c.total).toBeCloseTo(0.05 - 0.8 / 60);
  });
});
