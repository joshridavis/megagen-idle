import type { Platform } from './types';

/** The browser build: page visibility for background, a new tab for links. */
export const webPlatform: Platform = {
  name: 'web',
  onBackground: (callback) => {
    if (typeof document === 'undefined') return () => {};
    const handler = () => callback(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  },
  isBackground: () => typeof document !== 'undefined' && document.visibilityState === 'hidden',
  openExternal: (url) => {
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
  },
};
