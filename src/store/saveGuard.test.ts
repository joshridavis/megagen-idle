import { describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../data/initialState';
import { pickSaved, SAVE_VERSION } from './migrations';
import { checkStoredSave, damagedSaveFile } from './saveGuard';
import { createSafeStorage, type AsyncKV, type SyncKV } from './storage';

const good = JSON.stringify({ state: pickSaved(createInitialState(0)), version: SAVE_VERSION });
const corrupt = (patch: object) => JSON.stringify({ state: { ...pickSaved(createInitialState(0)), ...patch }, version: SAVE_VERSION });

function fakeAsync(): AsyncKV & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>();
  return {
    data,
    getItem: async <T,>(k: string) => (data.has(k) ? data.get(k) : null) as T | null,
    setItem: async <T,>(k: string, v: T) => {
      data.set(k, v);
      return v;
    },
    removeItem: async (k: string) => void data.delete(k),
  };
}
function fakeSync(): SyncKV & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe('checkStoredSave (0.46)', () => {
  it('accepts a good save, including an old version that migrates', () => {
    expect(checkStoredSave(good)).toBeNull();
    expect(checkStoredSave(JSON.stringify({ state: { energy: 5, lastSavedTimestamp: 0 }, version: 0 }))).toBeNull();
  });

  it('names what is wrong with a damaged save', () => {
    expect(checkStoredSave('{not json')).toMatch(/not valid JSON/);
    expect(checkStoredSave(JSON.stringify({ version: 3 }))).toMatch(/no game data/);
    expect(checkStoredSave(corrupt({ energy: 'lots' }))).toMatch(/energy/);
    expect(checkStoredSave(corrupt({ activeGenerators: [{ id: 'gen-1', type: 'warp_core', isActive: true }] }))).toMatch(/generator/);
    expect(checkStoredSave(corrupt({ completedResearch: ['no_such_research'] }))).toMatch(/research/);
    expect(checkStoredSave(JSON.stringify({ state: {}, version: SAVE_VERSION + 1 }))).toMatch(/newer version/);
  });

  it('offers a kept save for download in the import-file format when it can', () => {
    const file = JSON.parse(damagedSaveFile({ at: 0, reason: 'x', raw: good }));
    expect(file.game).toBe('megagen-idle');
    expect(file.version).toBe(SAVE_VERSION);
    expect(file.state.energy).toBe(900);
    expect(damagedSaveFile({ at: 0, reason: 'x', raw: '{broken' })).toBe('{broken');
  });
});

describe('guarded save storage (0.46)', () => {
  const guard = () => ({ check: checkStoredSave, onDamaged: vi.fn() });

  it('loads a good save unchanged', async () => {
    const async = fakeAsync();
    const g = guard();
    const s = createSafeStorage(async, fakeSync(), () => 5, g);
    await s.setItem('save', good);
    expect(await s.getItem('save')).toBe(good);
    expect(g.onDamaged).not.toHaveBeenCalled();
  });

  it('sets a damaged save aside, reports it and starts fresh', async () => {
    const async = fakeAsync();
    const g = guard();
    const s = createSafeStorage(async, null, () => 7, g);
    await async.setItem('save', '{broken');
    expect(await s.getItem('save')).toBeNull();
    expect(async.data.get('save:damaged')).toEqual({ at: 7, reason: expect.stringMatching(/JSON/), raw: '{broken' });
    expect(g.onDamaged).toHaveBeenCalledTimes(1);
    // the damaged copy is still there after the new game saves over the main key
    await s.setItem('save', good);
    expect((async.data.get('save:damaged') as { raw: string }).raw).toBe('{broken');
  });

  it('falls back to the older copy when only the newest one is damaged', async () => {
    const async = fakeAsync();
    const sync = fakeSync();
    let t = 100;
    const g = guard();
    const s = createSafeStorage(async, sync, () => t, g);
    await s.setItem('save', good);
    t = 200;
    sync.setItem('save:backup', JSON.stringify({ savedAt: 200, value: corrupt({ energy: -1 }) }));
    expect(await s.getItem('save')).toBe(good);
    expect(g.onDamaged).toHaveBeenCalledTimes(1);
    expect((async.data.get('save:damaged') as { reason: string }).reason).toMatch(/energy/);
  });

  it('keeps the copy in localStorage when IndexedDB cannot take it', async () => {
    const async = fakeAsync();
    await async.setItem('save', '{broken');
    async.setItem = async () => {
      throw new Error('quota');
    };
    const sync = fakeSync();
    const s = createSafeStorage(async, sync, () => 9, guard());
    expect(await s.getItem('save')).toBeNull();
    expect(JSON.parse(sync.data.get('save:damaged')!).raw).toBe('{broken');
  });
});
