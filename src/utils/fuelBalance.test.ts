import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCERS } from '../data/producers';
import { RESEARCH, RESEARCH_BY_ID } from '../data/research';
import { GeneratorType, type Generator } from '../types/generator';
import { getBonuses } from './bonuses';
import { NO_MODS } from './effectMods';
import { burnersFedByOne, lateGameBurnPerHour, lateGameOutputPerHour, lateGameProductionBoost } from './fuelBalance';
import { getFuelUseRates, getProductionRates } from './resourceSystem';

const between = (x: number, lo: number, hi: number) => {
  expect(x).toBeGreaterThanOrEqual(lo);
  expect(x).toBeLessThanOrEqual(hi);
};

describe('fuel producers feed a fair number of burners in the late game (1.86)', () => {
  it('counts every late boost: research, zone and pets on the producer side, fuel research on the burner side', () => {
    // +45% research, +10% coast, +10% Robot Dog
    expect(lateGameProductionBoost('deuteriumExtractor')).toBeCloseTo(1.65);
    // +45% research, +20% oil field, +10% Robot Dog, +15% Bubble Toad
    expect(lateGameProductionBoost('gasWell')).toBeCloseTo(1.9);
    expect(lateGameBurnPerHour(GeneratorType.FUSION)).toBeCloseTo(0.55);
  });

  it('one producer yields about the burn of the plants it is meant for', () => {
    between(burnersFedByOne('deuteriumExtractor', GeneratorType.FUSION), 1.5, 2.5);
    between(burnersFedByOne('deuteriumExtractor', GeneratorType.SUPERNOVA), 0.75, 1.25);
    between(burnersFedByOne('oilRig', GeneratorType.OIL), 1.5, 2.5);
    between(burnersFedByOne('gasWell', GeneratorType.GAS), 2.5, 3.5);
    between(burnersFedByOne('uraniumMine', GeneratorType.NUCLEAR), 1.5, 2.5);
  });

  it("the owner's case: 1 extractor and 4 Fusion Reactors, all research, burn more deuterium than is made", () => {
    const all = getBonuses(RESEARCH.map((r) => r.id));
    const reactors: Generator[] = [1, 2, 3, 4].map((i) => ({ id: `f${i}`, type: GeneratorType.FUSION, isActive: true, level: 1 }));
    // on the coast, with an adult Robot Dog: the most a player can get
    const mods = { ...NO_MODS, allProduction: 0.1, resource: { deuterium: 0.1 } };
    const producers = { quarry: 0, mine: 0, coalMine: 0, gasWell: 0, oilRig: 0, uraniumMine: 0, deuteriumExtractor: 1 };
    const made = getProductionRates(producers, all, mods).deuterium * 3600;
    expect(made).toBeCloseTo(lateGameOutputPerHour('deuteriumExtractor'));
    const burned = getFuelUseRates(reactors, all).deuterium * 3600;
    expect(made - burned).toBeLessThan(0);
  });

  it('the research texts state the new rates', () => {
    const every = (id: keyof typeof PRODUCERS) => PRODUCERS[id].intervalSeconds / 60;
    expect(RESEARCH_BY_ID.gas_extraction.description).toContain(`every ${every('gasWell')} minutes`);
    expect(RESEARCH_BY_ID.oil_drilling.description).toContain(`every ${every('oilRig')} minutes`);
    expect(RESEARCH_BY_ID.uranium_mining.description).toContain(`every ${every('uraniumMine')} minutes`);
    expect(RESEARCH_BY_ID.heavy_water.description).toContain(`every ${every('deuteriumExtractor')} minutes`);
    // no comment still claims the old ratios
    expect(readFileSync('src/data/producers.ts', 'utf8')).not.toMatch(/One (well|rig|mine) fuels/);
  });
});
