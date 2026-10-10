import localforage from 'localforage';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { platform } from '../platform';
import { DAMAGED_SUFFIX, checkStoredSave, reportDamagedSave, type DamagedSave } from './saveGuard';

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

/** Checks a stored save before it loads, and is told when one is set aside (0.46). */
export interface SaveGuard {
  check: (raw: string) => string | null;
  onDamaged: (d: DamagedSave) => void;
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
export function createSafeStorage(async: AsyncKV, sync: SyncKV | null, now = () => Date.now(), guard?: SaveGuard): StateStorage {
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
      const newest = backup && (main === null || backup.savedAt > mainAt) ? backup.value : main;
      if (newest === null || !guard) return newest;
      // Crash recovery (0.46): a save that cannot be loaded is set aside, never
      // overwritten. The other copy is used if it is fine; otherwise a new game starts.
      const reason = guard.check(newest);
      if (reason === null) return newest;
      const damaged: DamagedSave = { at: now(), reason, raw: newest };
      try {
        await async.setItem(name + DAMAGED_SUFFIX, damaged);
      } catch {
        try {
          sync?.setItem(name + DAMAGED_SUFFIX, JSON.stringify(damaged));
        } catch {
          // nowhere to keep it
        }
      }
      guard.onDamaged(damaged);
      const other = newest === main ? (backup?.value ?? null) : main;
      return other !== null && guard.check(other) === null ? other : null;
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

// The desktop app keeps the save in files (1.96); the web uses IndexedDB.
export const gameStorage = createJSONStorage(() =>
  createSafeStorage(platform.saveKV ?? localforage, browserLocalStorage(), undefined, { check: checkStoredSave, onDamaged: reportDamagedSave }),
);

/** The save set aside by crash recovery (0.46), if one is kept on this device. */
export async function getDamagedSave(name: string): Promise<DamagedSave | null> {
  try {
    const kept = await localforage.getItem<DamagedSave>(name + DAMAGED_SUFFIX);
    if (kept && typeof kept.raw === 'string') return kept;
  } catch {
    // fall through to the localStorage copy
  }
  try {
    const raw = browserLocalStorage()?.getItem(name + DAMAGED_SUFFIX);
    const kept = raw ? (JSON.parse(raw) as DamagedSave) : null;
    return kept && typeof kept.raw === 'string' ? kept : null;
  } catch {
    return null;
  }
}

/** Keeps a copy of a save that is about to be replaced or that failed (0.46). */
export async function keepDamagedSave(name: string, d: DamagedSave): Promise<void> {
  try {
    await localforage.setItem(name + DAMAGED_SUFFIX, d);
  } catch {
    try {
      browserLocalStorage()?.setItem(name + DAMAGED_SUFFIX, JSON.stringify(d));
    } catch {
      // nowhere to keep it
    }
  }
}

/** Deletes the kept damaged save once the player has dealt with it. */
export async function forgetDamagedSave(name: string): Promise<void> {
  try {
    await localforage.removeItem(name + DAMAGED_SUFFIX);
  } catch {
    // ignore
  }
  try {
    browserLocalStorage()?.removeItem(name + DAMAGED_SUFFIX);
  } catch {
    // ignore
  }
}
