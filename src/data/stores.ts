/**
 * The public website (1.94): launch date and store pages. A store's `url` stays
 * empty until the owner has the page; the landing page then shows "Coming soon"
 * for it instead of a link.
 */
export interface StorePage {
  id: 'steam' | 'google-play' | 'app-store';
  name: string;
  url: string;
}

export const LAUNCH_DATE = '2027-03-11';
export const LAUNCH_DATE_TEXT = 'March 11, 2027';

export const STORES: StorePage[] = [
  { id: 'steam', name: 'Steam', url: '' },
  { id: 'google-play', name: 'Google Play', url: '' },
  { id: 'app-store', name: 'App Store', url: '' },
];

/** The custom domain (public/CNAME holds the same name). */
export const SITE_DOMAIN = 'megagenidle.com';
