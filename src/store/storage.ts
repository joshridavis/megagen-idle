import localforage from 'localforage';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

localforage.config({ name: 'megagen-idle', storeName: 'saves' });

/** Minimal async key-value store (localforage in the game, a fake in tests). */
export interface AsyncKV {
  getItem: <T>(key: string) => Promise<T | null>;
  setItem: <T>(key: string, value: T) => Promise<T>;
  removeItem: (key: string) => Promise<void>;
}

/** Minimal sync key-value store (localStorage in the game). */
export interface SyncKV {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

interface Stamped {
  savedAt: number;
  value: string;
}

const BACKUP_SUFFIX = ':backup';
const STAMP_SUFFIX = ':savedAt';

function readBackup(sync: SyncKV | null, name: string): Stamped | null {
  try {
    const raw = sync?.getItem(name + BACKUP_SUFFIX);
    if (!raw) return null;
    const b = JSON.parse(raw) as Stamped;
    return typeof b.value === 'string' && Number.isFinite(b.savedAt) ? b : null;
  } catch {
    return null;
  }
}

/**
 * Save storage with a save-on-close safeguard (0.76). Every save is written
 * synchronously to a `localStorage` backup the moment it happens, so closing
 * the tab cannot lose it; the IndexedDB write (async) stays the main save and
 * records when it completed. On load, whichever copy is newer wins. Any
 * storage error is swallowed so the game still runs without persistence.
 */
export function createSafeStorage(async: AsyncKV, sync: SyncKV | null, now = () => Date.now()): StateStorage {
  return {
    getItem: async (name) => {
      const backup = readBackup(sync, name);
      let main: string | null = null;
      let mainAt = 0;
      try {
        main = (await async.getItem<string>(name)) ?? null;
        mainAt = (await async.getItem<number>(name + STAMP_SUFFIX)) ?? 0;
      } catch {
        main = null;
      }
      if (backup && (main === null || backup.savedAt > mainAt)) return backup.value;
      return main;
    },
    setItem: async (name, value) => {
      const savedAt = now();
      try {
        sync?.setItem(name + BACKUP_SUFFIX, JSON.stringify({ savedAt, value } satisfies Stamped));
      } catch {
        // backup unavailable (quota, private mode)
      }
      try {
        await async.setItem(name, value);
        await async.setItem(name + STAMP_SUFFIX, savedAt);
      } catch {
        // persistence unavailable
      }
    },
    removeItem: async (name) => {
      try {
        sync?.removeItem(name + BACKUP_SUFFIX);
      } catch {
        // ignore
      }
      try {
        await async.removeItem(name);
        await async.removeItem(name + STAMP_SUFFIX);
      } catch {
        // persistence unavailable
      }
    },
  };
}

function browserLocalStorage(): SyncKV | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export const gameStorage = createJSONStorage(() => createSafeStorage(localforage, browserLocalStorage()));
