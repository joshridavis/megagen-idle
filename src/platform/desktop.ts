import type { AsyncKV } from '../store/storage';
import { noStore } from './purchases';
import type { Platform } from './types';
import { webPlatform } from './web';

/**
 * What the desktop app's preload script exposes as `window.megagenDesktop`
 * (electron/preload.ts, 1.96). Tests pass a fake.
 */
export interface DesktopBridge {
  readSave: (key: string) => Promise<string | null>;
  writeSave: (key: string, text: string) => Promise<boolean>;
  removeSave: (key: string) => Promise<boolean>;
  openExternal: (url: string) => void;
  isMinimized: () => boolean;
  onWindowState: (callback: (minimized: boolean) => void) => () => void;
}

/** The bridge, when the game runs inside the desktop app. */
export function desktopBridge(): DesktopBridge | null {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { megagenDesktop?: DesktopBridge }).megagenDesktop ?? null;
}

/**
 * Saves in files in the user data folder (through the bridge) instead of
 * browser storage. The first time a key has no file, the browser's copy (from
 * before the desktop save existed) is copied over once, so nothing is lost.
 */
export function createDesktopKV(bridge: DesktopBridge, browser: AsyncKV | null): AsyncKV {
  const imported = new Set<string>();
  return {
    getItem: async <T,>(key: string): Promise<T | null> => {
      const text = await bridge.readSave(key);
      if (text !== null) {
        try {
          return JSON.parse(text) as T;
        } catch {
          return null;
        }
      }
      if (!browser || imported.has(key)) return null;
      imported.add(key);
      try {
        const old = await browser.getItem<T>(key);
        if (old === null || old === undefined) return null;
        await bridge.writeSave(key, JSON.stringify(old));
        return old;
      } catch {
        return null;
      }
    },
    setItem: async <T,>(key: string, value: T): Promise<T> => {
      imported.add(key);
      await bridge.writeSave(key, JSON.stringify(value));
      return value;
    },
    removeItem: async (key: string) => {
      imported.add(key);
      await bridge.removeSave(key);
    },
  };
}

/**
 * The desktop app (Electron, for Steam): in the background while the window is
 * minimized, so offline gains and the welcome-back summary work as on the web;
 * links open in the system browser; saves live in files. Notifications are the
 * same as the web's. Purchases come from Steam in 1.98.
 */
export function createDesktopPlatform(bridge: DesktopBridge, browser: AsyncKV | null = null): Platform {
  let minimized = bridge.isMinimized();
  return {
    ...webPlatform,
    name: 'desktop',
    onBackground: (callback) =>
      bridge.onWindowState((m) => {
        if (m === minimized) return;
        minimized = m;
        callback(m);
      }),
    isBackground: () => minimized,
    openExternal: (url) => bridge.openExternal(url),
    purchases: noStore,
    saveKV: createDesktopKV(bridge, browser),
  };
}
