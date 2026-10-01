import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { GeneratorType, type Generator } from '../types/generator';
import { getClickBreakdown, getEnergyBreakdown } from './breakdown';
import { calculateEnergyRate } from './energyGeneration';
import { getBonuses } from './bonuses';
import { getClickValue } from './bonuses';

const gen = (id: string, type: GeneratorType, isActive = true): Generator => ({ id, type, isActive, level: 1 });

describe('getEnergyBreakdown', () => {
  it('shows only the base when nothing is boosted', () => {
    const b = getEnergyBreakdown({ activeGenerators: [gen('a', GeneratorType.SOLAR)], completedResearch: [] });
    expect(b).toEqual({ base: 0.5, modifiers: [], total: 0.5 });
  });

  it('lists Basic Solar with its effect once completed', () => {
    const gens = [gen('a', GeneratorType.SOLAR), gen('b', GeneratorType.COAL), gen('c', GeneratorType.WIND, false)];
    const b = getEnergyBreakdown({ activeGenerators: gens, completedResearch: ['basic_solar'] });
    expect(b.base).toBeCloseTo(2.5);
    expect(b.modifiers).toEqual([{ source: 'Basic Solar', percent: 0.1, amount: expect.closeTo(0.25) }]);
    expect(b.total).toBeCloseTo(2.75);
  });

  it('total always matches the rate the game uses', () => {
    const s = { ...createInitialState(0), activeGenerators: [gen('a', GeneratorType.SOLAR), gen('b', GeneratorType.WIND)], completedResearch: ['basic_solar', 'wind_power'] };
    expect(getEnergyBreakdown(s).total).toBeCloseTo(calculateEnergyRate(s.activeGenerators, getBonuses(s.completedResearch)));
  });

  it('ignores research without an energy effect', () => {
    expect(getEnergyBreakdown({ activeGenerators: [], completedResearch: ['wind_power'] }).modifiers).toEqual([]);
  });
});

describe('getClickBreakdown', () => {
  it('matches the click value', () => {
    expect(getClickBreakdown([]).total).toBe(getClickValue([]));
  });
});
