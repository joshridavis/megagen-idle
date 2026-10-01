import { describe, expect, it } from 'vitest';
import { createSafeStorage, type AsyncKV, type SyncKV } from './storage';

function fakeAsync(fail = false): AsyncKV & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>();
  return {
    data,
    getItem: async <T,>(k: string) => {
      if (fail) throw new Error('no idb');
      return (data.has(k) ? data.get(k) : null) as T | null;
    },
    setItem: async <T,>(k: string, v: T) => {
      if (fail) throw new Error('no idb');
      data.set(k, v);
      return v;
    },
    removeItem: async (k: string) => {
      data.delete(k);
    },
  };
}

function fakeSync(): SyncKV & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return { data, getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) };
}

describe('save-on-close safeguard (0.76)', () => {
  it('writes the backup synchronously, before the async save finishes', () => {
    const sync = fakeSync();
    const s = createSafeStorage(fakeAsync(), sync, () => 100);
    void s.setItem('save', 'STATE');
    // no await: the backup is already there
    expect(JSON.parse(sync.data.get('save:backup')!)).toEqual({ savedAt: 100, value: 'STATE' });
  });

  it('loads the backup when the async save never finished (tab closed)', async () => {
    const async = fakeAsync();
    const sync = fakeSync();
    let t = 100;
    const s = createSafeStorage(async, sync, () => t);
    await s.setItem('save', 'OLD');
    t = 200;
    // simulate the tab closing mid-write: only the backup gets the new value
    sync.setItem('save:backup', JSON.stringify({ savedAt: 200, value: 'NEW' }));
    expect(await s.getItem('save')).toBe('NEW');
  });

  it('prefers the main save when it is as new or newer', async () => {
    const async = fakeAsync();
    const sync = fakeSync();
    const s = createSafeStorage(async, sync, () => 300);
    await s.setItem('save', 'MAIN');
    sync.setItem('save:backup', JSON.stringify({ savedAt: 250, value: 'STALE' }));
    expect(await s.getItem('save')).toBe('MAIN');
  });

  it('ignores a corrupt backup and survives a missing IndexedDB', async () => {
    const sync = fakeSync();
    sync.setItem('save:backup', '{not json');
    const s = createSafeStorage(fakeAsync(), sync, () => 1);
    expect(await s.getItem('save')).toBeNull();
    const noIdb = createSafeStorage(fakeAsync(true), fakeSync(), () => 5);
    await noIdb.setItem('save', 'ONLY-BACKUP');
    expect(await noIdb.getItem('save')).toBe('ONLY-BACKUP');
  });

  it('works without localStorage, and remove clears both copies', async () => {
    const async = fakeAsync();
    const s = createSafeStorage(async, null, () => 1);
    await s.setItem('save', 'X');
    expect(await s.getItem('save')).toBe('X');
    const sync = fakeSync();
    const both = createSafeStorage(async, sync, () => 2);
    await both.setItem('save', 'Y');
    await both.removeItem('save');
    expect(sync.data.size).toBe(0);
    expect(await both.getItem('save')).toBeNull();
  });
});
