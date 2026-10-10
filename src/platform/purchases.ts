import type { ProductId } from '../data/purchases';
import { PRODUCTS } from '../data/purchases';

/**
 * Purchases (1.95): the part of the platform layer that talks to a store. Each
 * build plugs in its own: Steam (1.98), Google Play and the App Store (1.97).
 * The web build has none today, so the whole game is open there; a test store
 * stands in during development.
 */
export type StoreName = 'none' | 'test' | 'steam' | 'google-play' | 'app-store';

export interface StoreProduct {
  id: ProductId;
  name: string;
  description: string;
  /** The store's own price text, for example "$4.99"; null when it does not say. */
  price: string | null;
}

export interface PurchaseStore {
  name: StoreName;
  /** What can be bought, with the store's prices. */
  products: () => Promise<StoreProduct[]>;
  /** Starts a purchase. Resolves true once the store confirms it, false if cancelled or failed. */
  buy: (id: ProductId) => Promise<boolean>;
  /** Asks the store again what this player owns (for a new device or a reinstall). */
  restore: () => Promise<ProductId[]>;
  /** What the store says is owned now. */
  owned: () => Promise<ProductId[]>;
}

/** No store: nothing to buy, nothing owned. The game treats the whole game as open. */
export const noStore: PurchaseStore = {
  name: 'none',
  products: async () => [],
  buy: async () => false,
  restore: async () => [],
  owned: async () => [],
};

export const TEST_STORE_SWITCH_KEY = 'megagen-test-store';
const TEST_STORE_OWNED_KEY = 'megagen-test-store-owned';

/** Minimal key-value storage, so tests can pass their own. */
export interface KeyValue {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

/**
 * The test store (development only): purchases succeed at once (or are
 * cancelled when `confirm` says no) and are remembered in this browser only.
 * It never takes money.
 */
export function createTestStore(storage: KeyValue, confirm: (text: string) => boolean = () => true): PurchaseStore {
  const read = (): ProductId[] => {
    try {
      const v = JSON.parse(storage.getItem(TEST_STORE_OWNED_KEY) ?? '[]');
      return Array.isArray(v) ? v.filter((x): x is ProductId => PRODUCTS.some((p) => p.id === x)) : [];
    } catch {
      return [];
    }
  };
  return {
    name: 'test',
    products: async () => PRODUCTS.map((p) => ({ ...p, price: 'Test: free' })),
    buy: async (id) => {
      if (!PRODUCTS.some((p) => p.id === id)) return false;
      if (!confirm(`Test store: buy "${PRODUCTS.find((p) => p.id === id)!.name}"? No money is taken.`)) return false;
      const owned = read();
      if (!owned.includes(id)) storage.setItem(TEST_STORE_OWNED_KEY, JSON.stringify([...owned, id]));
      return true;
    },
    restore: async () => read(),
    owned: async () => read(),
  };
}

/** Clears the test store's purchases (the dev-only Settings switch uses it). */
export function clearTestStore(storage: KeyValue): void {
  storage.removeItem(TEST_STORE_OWNED_KEY);
}

const safeStorage = (): KeyValue | null => {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
};

/** Whether the dev-only test store switch is on. Always false in a production build. */
export function testStoreOn(dev: boolean = import.meta.env.DEV): boolean {
  return dev && safeStorage()?.getItem(TEST_STORE_SWITCH_KEY) === 'on';
}

/** The store for this build: the test store in development when switched on, otherwise none (web). */
export function selectPurchaseStore(dev: boolean = import.meta.env.DEV): PurchaseStore {
  const storage = safeStorage();
  if (storage && testStoreOn(dev)) return createTestStore(storage, (t) => (typeof window === 'undefined' ? true : window.confirm(t)));
  return noStore;
}
