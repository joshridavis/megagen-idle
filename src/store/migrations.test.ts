import { describe, expect, it } from 'vitest';
import { DEFAULT_NOTIFY } from '../data/notifyRules';
import { STARTING_RESOURCES } from '../data/resources';
import type { GameState } from '../types/state';
import { createInitialState } from '../data/initialState';
import { STARTING_ENERGY } from '../data/player';
import { migrateSave, pickSaved, SAVE_VERSION } from './migrations';
import { TUTORIAL_DONE } from '../data/tutorial';
import { getAvailableRoom, getTotalEnergyRate } from './selectors';
import { useStore } from '.';

/** A save as written by items 0.00 to 0.04 (unversioned, version 0). */
const v0Fixture = {
  energy: 1234.5,
  resources: { coal: 1, stone: 2, metal: 3, naturalGas: 0, oil: 0, uranium: 0, deuterium: 0 },
  researchLevel: 1,
  activeGenerators: [],
  roomCapacity: 10,
  roomUsed: 0,
  totalProductionPerSecond: 1,
  lastSavedTimestamp: 1_700_000_000_000,
};

describe('save migrations', () => {
  it('upgrades a version 0 save to the current version', () => {
    const s = migrateSave(v0Fixture, 0);
    expect(s.energy).toBe(1234.5);
    expect(s.energyPerSecond).toBe(1);
    expect('totalProductionPerSecond' in s).toBe(false);
    // pre-0.11 saves get at least the starting resources and producers
    expect(s.resources).toEqual({ coal: 1, stone: STARTING_RESOURCES.stone, metal: STARTING_RESOURCES.metal, naturalGas: 0, oil: 0, uranium: 0, deuterium: 0 });
    expect(s.producers).toEqual({ quarry: 1, mine: 1, coalMine: 1, gasWell: 0, oilRig: 0, uraniumMine: 0, deuteriumExtractor: 0 });
    expect(s.lastSavedTimestamp).toBe(1_700_000_000_000);
    // fields added later get fresh-save defaults
    expect(s.expansionLevel).toBe(0);
    expect(s.settings).toEqual({ notation: 'short', reduceMotion: false, tutorial: { step: TUTORIAL_DONE, replay: false }, generatorSort: 'custom', cosmetics: { title: null, accent: 'slate' }, notifications: DEFAULT_NOTIFY, petsWalk: true });
  });

  it('tolerates garbage without throwing', () => {
    const s = migrateSave(null, 0);
    expect(s.energy).toBe(STARTING_ENERGY);
  });

  it('current version is at least 1', () => {
    expect(SAVE_VERSION).toBeGreaterThanOrEqual(1);
  });

  it('saves data only, never actions', () => {
    const saved = pickSaved(useStore.getState());
    expect(Object.values(saved).some((v) => typeof v === 'function')).toBe(false);
    expect(Object.keys(saved).sort()).toEqual(Object.keys(createInitialState()).sort());
  });
});

describe('selectors', () => {
  it('available room is capacity minus used, never negative', () => {
    const s = { ...createInitialState(0), roomCapacity: 10, roomUsed: 4 };
    expect(getAvailableRoom(s)).toBe(6);
    expect(getAvailableRoom({ ...s, roomUsed: 14 })).toBe(0);
  });
  it('total energy rate reads the energy slice', () => {
    expect(getTotalEnergyRate({ ...createInitialState(0), energyPerSecond: 3 })).toBe(3);
  });
});

describe('generator order is saved', () => {
  it('pickSaved keeps the list order', () => {
    const order = [
      { id: 'gen-2', type: 'wind', isActive: true, level: 1 },
      { id: 'gen-1', type: 'solar', isActive: true, level: 1 },
    ] as GameState['activeGenerators'];
    const saved = pickSaved({ ...createInitialState(0), activeGenerators: order });
    expect(migrateSave(JSON.parse(JSON.stringify(saved)), SAVE_VERSION).activeGenerators.map((g) => g.id)).toEqual(['gen-2', 'gen-1']);
  });
});
