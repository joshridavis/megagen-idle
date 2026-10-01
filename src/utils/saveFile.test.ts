import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { pickSaved, SAVE_VERSION } from '../store/migrations';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { exportSave, parseSaveFile } from './saveFile';
import { deriveRates } from './simulation';

const T = 1_700_000_000_000;
const played = (): GameState =>
  deriveRates({
    ...createInitialState(T),
    energy: 12345.678,
    resources: { metal: 12.5, stone: 99, coal: 3, naturalGas: 0, oil: 0, uranium: 0 },
    producers: { quarry: 2, mine: 3, coalMine: 1, gasWell: 0, oilRig: 0, uraniumMine: 0 },
    activeGenerators: [
      { id: 'gen-2', type: GeneratorType.WIND, isActive: true, level: 1 },
      { id: 'gen-1', type: GeneratorType.SOLAR, isActive: false, level: 1 },
    ],
    completedResearch: ['basic_solar', 'wind_power'],
    researchLevel: 3,
    currentResearch: { id: 'fossil_fuels', startTime: T - 1000, duration: 2700 },
    roomCapacity: 23,
    expansionLevel: 1,
  });

describe('export and import', () => {
  it('export, reset, import restores the exact state (save time set to the import time)', () => {
    const original = played();
    const text = exportSave(original, T);
    const result = parseSaveFile(text, T + 5000);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(pickSaved(result.state)).toEqual({ ...pickSaved(original), lastSavedTimestamp: T + 5000 });
  });

  it('the export file is tagged with the game and save version', () => {
    const f = JSON.parse(exportSave(played(), T));
    expect(f.game).toBe('megagen-idle');
    expect(f.version).toBe(SAVE_VERSION);
    expect(f.exportedAt).toBe(new Date(T).toISOString());
  });

  it('rejects text that is not JSON', () => {
    const r = parseSaveFile('{nope');
    expect(r).toEqual({ ok: false, error: expect.stringContaining('not JSON') });
  });

  it('rejects files from another game', () => {
    expect(parseSaveFile(JSON.stringify({ game: 'other', version: 1, state: {} })).ok).toBe(false);
  });

  it('rejects saves from a newer version', () => {
    const r = parseSaveFile(JSON.stringify({ game: 'megagen-idle', version: SAVE_VERSION + 1, state: pickSaved(played()) }));
    expect(r).toEqual({ ok: false, error: expect.stringContaining('newer version') });
  });

  it('rejects damaged data', () => {
    const bad = { ...pickSaved(played()), energy: -5 };
    expect(parseSaveFile(JSON.stringify({ game: 'megagen-idle', version: SAVE_VERSION, state: bad }))).toEqual({
      ok: false,
      error: expect.stringContaining('energy'),
    });
    const badGen = { ...pickSaved(played()), activeGenerators: [{ id: 'x', type: 'warp-core', isActive: true, level: 1 }] };
    expect(parseSaveFile(JSON.stringify({ game: 'megagen-idle', version: SAVE_VERSION, state: badGen })).ok).toBe(false);
    const badResearch = { ...pickSaved(played()), completedResearch: ['made_up'] };
    expect(parseSaveFile(JSON.stringify({ game: 'megagen-idle', version: SAVE_VERSION, state: badResearch })).ok).toBe(false);
  });

  it('migrates an old-version export (v0 fixture from items 0.00-0.04)', () => {
    const v0 = {
      game: 'megagen-idle',
      version: 0,
      state: {
        energy: 500,
        resources: { coal: 0, stone: 0, metal: 0, naturalGas: 0, oil: 0, uranium: 0 },
        researchLevel: 1,
        activeGenerators: [],
        roomCapacity: 10,
        roomUsed: 0,
        totalProductionPerSecond: 1,
        lastSavedTimestamp: 1,
      },
    };
    const r = parseSaveFile(JSON.stringify(v0), T);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.state.energy).toBe(500);
    expect(r.state.roomCapacity).toBe(13);
    expect(r.state.roomUsed).toBe(3);
    expect(r.state.energyPerSecond).toBe(0);
  });
});
