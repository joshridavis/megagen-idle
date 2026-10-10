/**
 * Every external link of the website and the game, in one place (2.05,
 * docs/RELEASE_DECISIONS.md, "IDs and services"). An empty link hides its
 * button or embed. Fill a link in here when its page exists; nothing else
 * changes. Merged from src/data/stores.ts (1.94).
 *
 * Node-safe: vite.config.ts reads it to build the site pages.
 */

/** The site root, with the trailing slash. */
export const SITE_URL = 'https://megagenidle.com/';
export const SITE_DOMAIN = 'megagenidle.com';
/** The free part in the browser. */
export const PLAY_URL = `${SITE_URL}play/`;
export const PRIVACY_URL = `${SITE_URL}privacy/`;

export const SUPPORT_EMAIL = 'support@megagenidle.com';
export const PRESS_EMAIL = 'press@megagenidle.com';

export const STEAM_URL = '';
export const STEAM_DEMO_URL = '';
export const GOOGLE_PLAY_URL = '';
export const APP_STORE_URL = '';
export const DISCORD_URL = '';
export const YOUTUBE_URL = 'https://www.youtube.com/@MegaGenIdle';
export const TIKTOK_URL = 'https://www.tiktok.com/@megagenidle';
export const X_URL = 'https://x.com/MegaGenIdle';
export const BLUESKY_URL = 'https://bsky.app/profile/megagenidle.bsky.social';
export const REDDIT_URL = '';
/** The YouTube video id of the trailer (the part after "v="). */
export const TRAILER_YOUTUBE_ID = '';
export const KOFI_URL = 'https://ko-fi.com/megagenidle';

export const LAUNCH_DATE = '2027-03-11';
export const LAUNCH_DATE_TEXT = 'March 11, 2027';

export interface StorePage {
  id: 'steam' | 'google-play' | 'app-store';
  name: string;
  url: string;
}

/** The three stores, in launch order. A store with no `url` yet shows no button. */
export const STORES: StorePage[] = [
  { id: 'steam', name: 'Steam', url: STEAM_URL },
  { id: 'google-play', name: 'Google Play', url: GOOGLE_PLAY_URL },
  { id: 'app-store', name: 'App Store', url: APP_STORE_URL },
];

export interface SocialLink {
  id: 'discord' | 'youtube' | 'tiktok' | 'x' | 'bluesky' | 'reddit';
  name: string;
  url: string;
}

/** Social icons in the site footer; empty ones are left out. */
export const SOCIALS: SocialLink[] = [
  { id: 'discord', name: 'Discord', url: DISCORD_URL },
  { id: 'youtube', name: 'YouTube', url: YOUTUBE_URL },
  { id: 'tiktok', name: 'TikTok', url: TIKTOK_URL },
  { id: 'x', name: 'X', url: X_URL },
  { id: 'bluesky', name: 'Bluesky', url: BLUESKY_URL },
  { id: 'reddit', name: 'Reddit', url: REDDIT_URL },
];
