import { edition } from '../data/edition';
import type { ProductId } from '../data/purchases';
import { useStore } from '../store';
import { hasFullGame as fullGameOpen, isSupporter } from '../utils/purchases';

/**
 * The entitlement layer (2.04, playbook R-01): what this player may use, per edition, on top of
 * the 1.95 PurchaseStore (`platform.purchases`, connected by the store's initPurchases).
 * - demo (web, itch.io, galaxy.click, the Steam demo): neither, and nothing to buy here.
 * - full (Steam): the Full Game always; the Supporter Pack from the store (the DLC check, 1.98).
 * - mobile (Android, iOS): both from the store (RevenueCat, 1.97; no store yet, so nothing owned).
 * Products: full_game and supporter_pack.
 */

/** Whether the whole game is open. */
export function hasFullGame(): boolean {
  return fullGameOpen(useStore.getState());
}

/** Whether the Supporter Pack's cosmetics may be used. */
export function hasSupporter(): boolean {
  return edition() !== 'demo' && isSupporter(useStore.getState());
}

/** Buys a product through this build's store. Resolves true once the store confirms it; always false in the demo. */
export async function purchase(id: ProductId): Promise<boolean> {
  if (edition() === 'demo') return false;
  return useStore.getState().buyProduct(id);
}

/** Asks the store again what this player owns, and returns it. Nothing in the demo. */
export async function restore(): Promise<ProductId[]> {
  if (edition() === 'demo') return [];
  await useStore.getState().restorePurchases();
  const e = useStore.getState().entitlements;
  return [...(e.fullGame ? (['full_game'] as const) : []), ...(e.supporter ? (['supporter_pack'] as const) : [])];
}
