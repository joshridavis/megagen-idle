import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { GeneratorType, type Generator } from '../types/generator';
import { getClickBreakdown, getEnergyBreakdown, getResourceBreakdown } from './breakdown';
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

describe('getResourceBreakdown', () => {
  it('shows producer output, fuel burned, and the net rate', () => {
    const b = getResourceBreakdown(
      { producers: { quarry: 1, mine: 1, coalMine: 2, gasWell: 0, oilRig: 0, uraniumMine: 0 }, activeGenerators: [gen('a', GeneratorType.COAL), gen('b', GeneratorType.COAL, false)], completedResearch: [] },
      'coal',
    );
    expect(b.base).toBeCloseTo(0.1);
    expect(b.modifiers).toEqual([{ source: 'Fuel for 1 running generator', amount: expect.closeTo(-1 / 60) }]);
    expect(b.total).toBeCloseTo(0.1 - 1 / 60);
  });

  it('has no modifiers when nothing burns the resource', () => {
    expect(getResourceBreakdown({ producers: { quarry: 3, mine: 0, coalMine: 0, gasWell: 0, oilRig: 0, uraniumMine: 0 }, activeGenerators: [], completedResearch: [] }, 'stone')).toEqual({
      base: expect.closeTo(0.3),
      modifiers: [],
      total: expect.closeTo(0.3),
    });
  });
});

describe('active pet in breakdowns (playtest 15)', () => {
  const pets = (id: string, stage: 1 | 2 | 3) => ({ owned: { [id]: { stage, growUntil: null } }, active: id }) as never;

  it('adds the click pet to the click breakdown, matching what a click gives', () => {
    const b = getClickBreakdown(['hand_crank'], 0, pets('hamster', 2));
    const row = b.modifiers.find((m) => m.source === 'Wheel Hamster (pet)');
    expect(row?.amount).toBeCloseTo(1);
    expect(b.total).toBeCloseTo(getClickValue(['hand_crank'], 0, 1));
  });

  it('adds a generator pet to energy/s and keeps the total equal to the real rate', () => {
    const gens = [gen('a', GeneratorType.SOLAR), gen('b', GeneratorType.SOLAR)];
    const b = getEnergyBreakdown({ activeGenerators: gens, completedResearch: [], pets: pets('firefly', 3) });
    expect(b.modifiers.find((m) => m.source === 'Firefly Swarm (pet)')?.percent).toBe(0.2);
    expect(b.total).toBeCloseTo(b.base * 1.2);
  });

  it('leaves breakdowns unchanged with no active pet', () => {
    expect(getClickBreakdown([], 0, { owned: {}, active: null }).modifiers).toEqual([]);
  });
});
