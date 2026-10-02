import { describe, expect, it } from 'vitest';
import { GENERATORS } from './generators';
import { PRODUCERS } from './producers';
import { RESEARCH_BY_ID } from './research';
import { ROOM_TIERS } from './rooms';
import { GeneratorType } from '../types/generator';
import { migrateSave } from '../store/migrations';
import { getUnlockedGeneratorTypes } from '../utils/researchSystem';

describe('fictional generators (0.34)', () => {
  it('each gives about 2.5x the energy per room of the tier before', () => {
    const perRoom = (t: GeneratorType) => GENERATORS[t].energyPerSecond / GENERATORS[t].roomCost;
    expect(perRoom(GeneratorType.FUSION) / perRoom(GeneratorType.NUCLEAR)).toBeCloseTo(2.5, 1);
    expect(perRoom(GeneratorType.SUPERNOVA) / perRoom(GeneratorType.FUSION)).toBeCloseTo(2.5, 1);
  });

  it('come late in the tree, after Reactor Safety, and burn deuterium', () => {
    expect(RESEARCH_BY_ID.heavy_water.prerequisites).toContain('reactor_safety');
    expect(getUnlockedGeneratorTypes(['fusion_ignition'])).toContain(GeneratorType.FUSION);
    expect(getUnlockedGeneratorTypes(['fast_time_dimension'])).toContain(GeneratorType.SUPERNOVA);
    expect(GENERATORS[GeneratorType.FUSION].requiredLevel).toBeGreaterThan(GENERATORS[GeneratorType.NUCLEAR].requiredLevel);
    expect(GENERATORS[GeneratorType.FUSION].maintenanceCost).toEqual({ deuterium: 1 });
    expect(PRODUCERS.deuteriumExtractor.resource).toBe('deuterium');
    expect(RESEARCH_BY_ID.heavy_water.unlocks.producers).toEqual({ deuteriumExtractor: 1 });
  });

  it('two more room tiers make space for them', () => {
    expect(ROOM_TIERS).toHaveLength(10);
    expect(ROOM_TIERS[9].capacity).toBeGreaterThan(GENERATORS[GeneratorType.SUPERNOVA].roomCost * 5);
  });

  it('old saves get deuterium and the extractor at 0', () => {
    const s = migrateSave({ energy: 1, resources: { metal: 5 }, producers: { quarry: 2 } }, 17);
    expect(s.resources.deuterium).toBe(0);
    expect(s.producers.deuteriumExtractor).toBe(0);
  });
});
