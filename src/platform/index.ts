import localforage from 'localforage';
import { createDesktopPlatform, desktopBridge } from './desktop';
import type { Platform } from './types';
import { webPlatform } from './web';

export type { NotifyPermission, Platform, PlatformName } from './types';
export type { PurchaseStore, StoreName, StoreProduct } from './purchases';

/**
 * The platform the game runs on: the desktop app (Electron, 1.96) when its
 * bridge is present, otherwise the web. A mobile (Capacitor) wrapper provides
 * its own in 1.97; see docs/RELEASE_PLAN.md.
 */
export const platform: Platform = pickPlatform();

function pickPlatform(): Platform {
  // the desktop app (1.96) exposes its bridge before the game loads
  const bridge = desktopBridge();
  return bridge ? createDesktopPlatform(bridge, localforage) : webPlatform;
}
