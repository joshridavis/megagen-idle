import { sprites } from '../assets';
import type { NotifyPermission, Platform } from './types';

const hasNotifications = () => typeof window !== 'undefined' && 'Notification' in window;

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
  // browser notifications (1.07); a closed tab cannot notify on the web
  notifyPermission: () => (hasNotifications() ? (Notification.permission as NotifyPermission) : 'unsupported'),
  requestNotifyPermission: async () => {
    if (!hasNotifications()) return false;
    try {
      return (await Notification.requestPermission()) === 'granted';
    } catch {
      return false;
    }
  },
  notify: (title, body) => {
    if (!hasNotifications() || Notification.permission !== 'granted') return;
    try {
      const n = new Notification(title, { body, tag: 'megagen-idle', icon: sprites.energy_icon });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch {
      // some browsers (Android Chrome) only allow notifications from a service worker
    }
  },
};
