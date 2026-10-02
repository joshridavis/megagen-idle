import { describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { exportSave, parseSaveFile } from '../utils/saveFile';
import { AUTO_SLOT, chooseSave, createKVBackend, SAME_SAVE_MS, summarize, type SaveSummary } from './saveBackend';
import type { AsyncKV } from './storage';
import { SAVE_VERSION } from './migrations';

function memoryKV(): AsyncKV {
  const m = new Map<string, unknown>();
  return {
    getItem: async <T,>(k: string) => (m.has(k) ? (structuredClone(m.get(k)) as T) : null),
    setItem: async <T,>(k: string, v: T) => {
      m.set(k, structuredClone(v));
      return v;
    },
    removeItem: async (k: string) => {
      m.delete(k);
    },
  };
}

describe('save backend (0.67)', () => {
  it('saves, lists newest first, loads and removes slots', async () => {
    const b = createKVBackend(memoryKV());
    const s = { ...createInitialState(0), energy: 1234 };
    await b.save(AUTO_SLOT, exportSave(s, 1000), summarize(s, 1000));
    await b.save('manual', exportSave(s, 2000), summarize(s, 2000));
    const list = await b.list();
    expect(list.map((x) => x.slot)).toEqual(['manual', AUTO_SLOT]);
    expect(list[0]).toMatchObject({ source: 'local', energy: 1234, version: SAVE_VERSION });
    const loaded = await b.load(AUTO_SLOT);
    const parsed = parseSaveFile(loaded!.text, 5000);
    expect(parsed.ok && parsed.state.energy).toBe(1234);
    await b.remove('manual');
    expect((await b.list()).map((x) => x.slot)).toEqual([AUTO_SLOT]);
    expect(await b.load('manual')).toBeNull();
  });

  it('overwriting a slot keeps one entry', async () => {
    const b = createKVBackend(memoryKV(), 'cloud');
    const s = createInitialState(0);
    await b.save(AUTO_SLOT, exportSave(s), summarize(s, 1));
    await b.save(AUTO_SLOT, exportSave(s), summarize(s, 2));
    const list = await b.list();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ savedAt: 2, source: 'cloud' });
  });
});

describe('choosing between the local and the cloud save (0.67)', () => {
  const sum = (source: 'local' | 'cloud', savedAt: number, version = SAVE_VERSION): SaveSummary => ({ slot: AUTO_SLOT, source, savedAt, version, energy: 0, completion: 0 });

  it('a new game when there is none, the only one when there is one', () => {
    expect(chooseSave(null, null)).toEqual({ kind: 'new' });
    expect(chooseSave(sum('local', 1), null)).toEqual({ kind: 'use', source: 'local' });
    expect(chooseSave(null, sum('cloud', 1))).toEqual({ kind: 'use', source: 'cloud' });
  });

  it('saves a moment apart are the same game: no question', () => {
    expect(chooseSave(sum('local', 10_000), sum('cloud', 10_000 + SAME_SAVE_MS))).toEqual({ kind: 'use', source: 'cloud' });
  });

  it('different saves: ask, suggesting the newer', () => {
    const local = sum('local', 10_000_000);
    const cloud = sum('cloud', 1_000);
    expect(chooseSave(local, cloud)).toEqual({ kind: 'ask', newer: 'local', local, cloud });
    expect(chooseSave(sum('local', 1_000), sum('cloud', 9_000_000)).kind === 'ask' && chooseSave(sum('local', 1_000), sum('cloud', 9_000_000))).toMatchObject({ newer: 'cloud' });
  });

  it('a different save version always asks, even close in time', () => {
    expect(chooseSave(sum('local', 1_000), sum('cloud', 1_500, SAVE_VERSION + 1)).kind).toBe('ask');
  });
});
