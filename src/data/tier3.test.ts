import { describe, expect, it } from 'vitest';
import { GeneratorType, type Generator } from '../types/generator';
import type { Resources } from '../types/state';
import { getBonuses } from '../utils/bonuses';
import { burnersFedByOne } from '../utils/fuelBalance';
import { burnFuel, getFuelUseRates } from '../utils/resourceSystem';
import { canStartResearch, completeResearch, getUnlockedGeneratorTypes, startResearch } from '../utils/researchSystem';
import { GENERATORS } from './generators';
import { createInitialState } from './initialState';
import { RESEARCH_BY_ID } from './research';

const res = (r: Partial<Resources> = {}): Resources => ({ coal: 0, stone: 0, metal: 0, naturalGas: 0, oil: 0, uranium: 0, deuterium: 0, ...r });
const plant = (type: GeneratorType, id = 'g1'): Generator => ({ id, type, isActive: true, level: 1 });
const perRoom = (t: GeneratorType) => GENERATORS[t].energyPerSecond / GENERATORS[t].roomCost;

describe('tier 3 generators (0.33)', () => {
  it('each tier gives 2 to 3 times the energy per room of the one before', () => {
    const oil = perRoom(GeneratorType.OIL) / perRoom(GeneratorType.GAS);
    const nuclear = perRoom(GeneratorType.NUCLEAR) / perRoom(GeneratorType.OIL);
    for (const ratio of [oil, nuclear]) {
      expect(ratio).toBeGreaterThanOrEqual(2);
      expect(ratio).toBeLessThanOrEqual(3);
    }
  });

  it('oil plants burn oil and nuclear plants burn uranium, at the listed rates', () => {
    expect(getFuelUseRates([plant(GeneratorType.OIL)]).oil * 3600).toBeCloseTo(6);
    expect(getFuelUseRates([plant(GeneratorType.NUCLEAR)]).uranium * 3600).toBeCloseTo(1);
    const r = burnFuel(res({ oil: 10, uranium: 10, deuterium: 0 }), [plant(GeneratorType.OIL), plant(GeneratorType.NUCLEAR, 'g2')], 3600);
    expect(r.resources.oil).toBeCloseTo(4);
    expect(r.resources.uranium).toBeCloseTo(9);
    expect(r.deactivated).toEqual([]);
  });

  it('switch off when their fuel runs out', () => {
    const r = burnFuel(res({ oil: 0.001, uranium: 0, deuterium: 0 }), [plant(GeneratorType.OIL), plant(GeneratorType.NUCLEAR, 'g2')], 60);
    expect(r.generators.every((g) => !g.isActive && g.outOfFuel)).toBe(true);
    expect(r.depleted.sort()).toEqual(['oil', 'uranium']);
  });

  it('late game, one rig fuels about two oil plants and one mine about two reactors (1.86)', () => {
    expect(burnersFedByOne('oilRig', GeneratorType.OIL)).toBeGreaterThanOrEqual(1.5);
    expect(burnersFedByOne('oilRig', GeneratorType.OIL)).toBeLessThanOrEqual(2.5);
    expect(burnersFedByOne('uraniumMine', GeneratorType.NUCLEAR)).toBeGreaterThanOrEqual(1.5);
    expect(burnersFedByOne('uraniumMine', GeneratorType.NUCLEAR)).toBeLessThanOrEqual(2.5);
  });

  it('research gates: the plants unlock only after their research, the producers are granted by it', () => {
    const rich = { ...createInitialState(0), energy: 1e12, researchLevel: 20, resources: res({ metal: 1e9, stone: 1e9, coal: 1e9, naturalGas: 1e9, uranium: 1e9, deuterium: 0 }) };
    expect(getUnlockedGeneratorTypes(rich.completedResearch)).not.toContain(GeneratorType.OIL);
    expect(canStartResearch(rich, 'oil_refining')).toBe(false); // needs Oil Drilling
    let s = { ...rich, completedResearch: ['basic_solar', 'fossil_fuels', 'gas_extraction'] };
    s = completeResearch(startResearch(s, 'oil_drilling', 0));
    expect(s.producers.oilRig).toBe(1);
    s = completeResearch(startResearch(s, 'oil_refining', 0));
    expect(getUnlockedGeneratorTypes(s.completedResearch)).toContain(GeneratorType.OIL);
    expect(RESEARCH_BY_ID.nuclear_fission.prerequisites).toEqual(['uranium_mining', 'superconductors']);
    expect(getUnlockedGeneratorTypes(['nuclear_fission'])).toContain(GeneratorType.NUCLEAR);
    expect(getBonuses(['reactor_safety']).globalEnergy).toBeCloseTo(0.1);
  });
});
