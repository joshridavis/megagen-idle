import type { Platform } from './types';
import { webPlatform } from './web';

export type { Platform, PlatformName } from './types';

/**
 * The platform the game runs on. A desktop (Electron or Tauri) or mobile
 * (Capacitor) wrapper would provide its own implementation here, chosen at
 * build time; see docs/RELEASE_PLAN.md.
 */
export const platform: Platform = webPlatform;
