import { edition } from '../../data/edition';
import type { ProductId } from '../../data/purchases';
import { platform } from '../../platform';
import type { PurchaseStore, StoreName, StoreProduct } from '../../platform/purchases';
import type { PurchasesState } from '../../types/state';
import { entitlementsFrom } from '../../utils/purchases';
import type { SliceCreator } from '../types';

export interface PurchaseTransient {
  /** Which store this build talks to (not saved). */
  storeName: StoreName;
  /** What the store offers, with its prices (not saved). */
  storeProducts: StoreProduct[];
  /** A purchase or restore is waiting on the store. */
  purchaseBusy: boolean;
  /** The last purchase or restore message for the Full Game panel, or null. */
  purchaseMessage: string | null;
  /** The "Get the Full Game" panel is open (2.04; not saved). */
  fullGameOpen: boolean;
  /** The panel already opened by itself this session (not saved): it does so at most once. */
  fullGameAutoShown: boolean;
}

/** Why the "Get the Full Game" panel opens: the player reached the boundary, tapped a locked item, or the top bar button. */
export type FullGameReason = 'boundary' | 'locked' | 'button';

export interface PurchaseActions {
  /**
   * Connects to this build's store on start (1.95): loads its products and
   * re-checks what is owned, so a save copied from elsewhere cannot unlock
   * anything. With no store (the web build) the whole game stays open.
   */
  initPurchases: (store?: PurchaseStore) => Promise<void>;
  buyProduct: (id: ProductId) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  /**
   * Opens the "Get the Full Game" panel (2.04). At the boundary or on a locked item it opens by
   * itself at most once per session; the top bar button always opens it.
   */
  offerFullGame: (reason: FullGameReason) => void;
  closeFullGame: () => void;
}

let current: PurchaseStore = platform.purchases;

export const createPurchaseSlice =
  (initial: PurchasesState): SliceCreator<PurchasesState & PurchaseTransient & PurchaseActions> =>
  (set, get) => ({
    entitlements: initial.entitlements,
    storeActive: false,
    storeName: 'none',
    storeProducts: [],
    purchaseBusy: false,
    purchaseMessage: null,
    fullGameOpen: false,
    fullGameAutoShown: false,
    offerFullGame: (reason) => {
      if (get().fullGameOpen) return;
      if (reason !== 'button' && get().fullGameAutoShown) return;
      set({ fullGameOpen: true, fullGameAutoShown: get().fullGameAutoShown || reason !== 'button', purchaseMessage: null }, undefined, `purchases/offer-${reason}`);
    },
    closeFullGame: () => set({ fullGameOpen: false }, undefined, 'purchases/close-offer'),
    initPurchases: async (store = platform.purchases) => {
      current = store;
      // the demo sells nothing (it links to the stores); the mobile edition always asks its store,
      // so a copied or edited save unlocks nothing there (2.04)
      const active = edition() !== 'demo' && (store.name !== 'none' || edition() === 'mobile');
      set({ storeActive: active, storeName: store.name }, undefined, 'purchases/init');
      if (!active) return;
      try {
        const [products, owned] = await Promise.all([store.products(), store.restore()]);
        set({ storeProducts: products, entitlements: entitlementsFrom(owned) }, undefined, 'purchases/restore');
      } catch {
        // offline or the store is down: keep what the save remembers until the next start
      }
    },
    buyProduct: async (id) => {
      if (get().purchaseBusy || !get().storeActive) return false;
      set({ purchaseBusy: true, purchaseMessage: null }, undefined, 'purchases/buy');
      try {
        const ok = await current.buy(id);
        const owned = ok ? await current.owned() : null;
        set(
          (s) => ({
            purchaseBusy: false,
            entitlements: owned ? entitlementsFrom(owned) : s.entitlements,
            purchaseMessage: ok ? 'Thank you! Your purchase is unlocked.' : 'The purchase was cancelled. Nothing was charged.',
          }),
          undefined,
          'purchases/bought',
        );
        return ok;
      } catch {
        set({ purchaseBusy: false, purchaseMessage: 'The store could not be reached. Try again later.' }, undefined, 'purchases/failed');
        return false;
      }
    },
    restorePurchases: async () => {
      if (get().purchaseBusy || !get().storeActive) return;
      set({ purchaseBusy: true, purchaseMessage: null }, undefined, 'purchases/restore');
      try {
        const owned = await current.restore();
        set(
          { purchaseBusy: false, entitlements: entitlementsFrom(owned), purchaseMessage: owned.length ? 'Your purchases are restored.' : 'The store has no purchases for this account.' },
          undefined,
          'purchases/restored',
        );
      } catch {
        set({ purchaseBusy: false, purchaseMessage: 'The store could not be reached. Try again later.' }, undefined, 'purchases/failed');
      }
    },
  });
