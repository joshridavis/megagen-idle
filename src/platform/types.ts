/**
 * Platform layer (0.87): the few things that differ between the web build,
 * a desktop wrapper (Steam) and a mobile app. Game logic never talks to the
 * browser or a wrapper directly for these; it goes through `platform`.
 * Only the web implementation exists today.
 */
export type PlatformName = 'web' | 'desktop' | 'mobile';

export interface Platform {
  name: PlatformName;
  /** Calls back when the game goes to the background (true) or comes back (false). Returns an unsubscribe function. */
  onBackground: (callback: (hidden: boolean) => void) => () => void;
  /** Whether the game is in the background right now. */
  isBackground: () => boolean;
  /** Opens a link outside the game (browser tab, system browser in a wrapper). */
  openExternal: (url: string) => void;
  /** Whether notifications may be shown (1.07): 'unsupported' where there are none. */
  notifyPermission: () => NotifyPermission;
  /** Asks the player for permission to notify. Call only from a click. Resolves true if granted. */
  requestNotifyPermission: () => Promise<boolean>;
  /** Shows a notification outside the game. Does nothing without permission. */
  notify: (title: string, body: string) => void;
}

export type NotifyPermission = 'granted' | 'denied' | 'default' | 'unsupported';
