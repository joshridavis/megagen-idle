import localforage from 'localforage';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

localforage.config({ name: 'megagen-idle', storeName: 'saves' });

/**
 * IndexedDB-backed storage through localforage. Errors (for example no
 * IndexedDB in a test environment or a private window) are swallowed so the
 * game still runs, just without persistence.
 */
const localforageStorage: StateStorage = {
  getItem: async (name) => {
    try {
      return (await localforage.getItem<string>(name)) ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (name, value) => {
    try {
      await localforage.setItem(name, value);
    } catch {
      // persistence unavailable
    }
  },
  removeItem: async (name) => {
    try {
      await localforage.removeItem(name);
    } catch {
      // persistence unavailable
    }
  },
};

export const gameStorage = createJSONStorage(() => localforageStorage);
