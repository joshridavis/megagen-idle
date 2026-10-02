import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { GeneratorType, type Generator } from '../types/generator';
import type { Resources } from '../types/state';
import {
  accrueResources,
  burnFuel,
  canAfford,
  consumeResource,
  gatherResource,
  getFuelUseRates,
  getProductionRates,
} from './resourceSystem';
import { advanceTime } from './simulation';

const res = (r: Partial<Resources> = {}): Resources => ({ coal: 0, stone: 0, metal: 0, naturalGas: 0, oil: 0, uranium: 0, deuterium: 0, ...r });
const coalPlant = (id = 'g1', isActive = true): Generator => ({ id, type: GeneratorType.COAL, isActive, level: 1 });

describe('affordability and consumption', () => {
  it('canAfford checks every resource in the cost', () => {
    expect(canAfford(res({ metal: 20, stone: 10 }), { metal: 20, stone: 10 })).toBe(true);
    expect(canAfford(res({ metal: 20, stone: 9 }), { metal: 20, stone: 10 })).toBe(false);
    expect(canAfford(res(), {})).toBe(true);
  });

  it('consumeResource deducts on success', () => {
    const r = consumeResource(res({ metal: 15 }), { metal: 10 });
    expect(r.success).toBe(true);
    expect(r.resources.metal).toBe(5);
  });

  it('consumeResource leaves resources untouched on failure', () => {
    const before = res({ metal: 5, stone: 50 });
    const r = consumeResource(before, { metal: 10, stone: 5 });
    expect(r.success).toBe(false);
    expect(r.resources).toEqual(before);
  });

  it('gatherResource adds and ignores negative amounts', () => {
    expect(gatherResource(res(), 'stone', 3).stone).toBe(3);
    expect(gatherResource(res({ stone: 3 }), 'stone', -5).stone).toBe(3);
  });
});

describe('passive production', () => {
  it('starting producers give the documented rates', () => {
    const r = getProductionRates({ quarry: 1, mine: 1, coalMine: 1, gasWell: 0, oilRig: 0, uraniumMine: 0, deuteriumExtractor: 0 });
    expect(r.stone).toBeCloseTo(1 / 10);
    expect(r.metal).toBeCloseTo(1 / 15);
    expect(r.coal).toBeCloseTo(1 / 20);
  });

  it('rates scale with producer count', () => {
    expect(getProductionRates({ quarry: 3, mine: 0, coalMine: 0, gasWell: 0, oilRig: 0, uraniumMine: 0, deuteriumExtractor: 0 }).stone).toBeCloseTo(0.3);
  });

  it('accrues over time', () => {
    const r = accrueResources(res(), { quarry: 1, mine: 1, coalMine: 1, gasWell: 0, oilRig: 0, uraniumMine: 0, deuteriumExtractor: 0 }, 60);
    expect(r).toEqual(res({ stone: 6, metal: 4, coal: 3 }));
  });

  it('accrues offline through the simulation', () => {
    const s = createInitialState(0);
    const { state } = advanceTime(s, 3600);
    expect(state.resources.stone).toBeCloseTo(10 + 360);
    expect(state.resources.metal).toBeCloseTo(15 + 240);
    expect(state.resources.coal).toBeCloseTo(180);
  });
});

describe('fuel consumption and depletion', () => {
  it('a coal plant burns 1 coal per minute', () => {
    expect(getFuelUseRates([coalPlant()]).coal * 60).toBeCloseTo(1);
    const r = burnFuel(res({ coal: 5 }), [coalPlant()], 60);
    expect(r.resources.coal).toBeCloseTo(4);
    expect(r.deactivated).toEqual([]);
  });

  it('inactive generators burn nothing', () => {
    const r = burnFuel(res({ coal: 5 }), [coalPlant('g1', false)], 600);
    expect(r.resources.coal).toBe(5);
  });

  it('switches a generator off and records the depleted resource when fuel runs out', () => {
    const r = burnFuel(res({ coal: 0.5 }), [coalPlant()], 60);
    expect(r.generators[0]).toMatchObject({ isActive: false, outOfFuel: true });
    expect(r.depleted).toEqual(['coal']);
    expect(r.deactivated).toEqual(['g1']);
    expect(r.resources.coal).toBe(0.5);
  });

  it('runs the plant until coal is gone offline, then sets the warning', () => {
    const s = {
      ...createInitialState(0),
      producers: { quarry: 0, mine: 0, coalMine: 0, gasWell: 0, oilRig: 0, uraniumMine: 0, deuteriumExtractor: 0 },
      resources: res({ coal: 10 }),
      activeGenerators: [coalPlant()],
    };
    const { state, report } = advanceTime(s, 3600);
    expect(state.activeGenerators[0].isActive).toBe(false);
    expect(state.resources.coal).toBeCloseTo(0);
    expect(state.depletedResources).toEqual(['coal']);
    expect(report.deactivated).toEqual(['g1']);
  });

  it('keeps running when a coal mine supplies enough', () => {
    const s = {
      ...createInitialState(0),
      resources: res({ coal: 0 }),
      activeGenerators: [coalPlant()],
    };
    // one coal mine makes 3 coal/min; the plant needs 1
    const { state } = advanceTime(s, 3600);
    expect(state.activeGenerators[0].isActive).toBe(true);
    expect(state.depletedResources).toEqual([]);
  });
});
