/**
 * Pure helpers for the desktop app (1.96), kept apart from Electron so they
 * can be unit-tested: which save keys are allowed, where their files go, and
 * which file an app:// address serves.
 */
import { extname, join, normalize, sep } from 'node:path';

/** The private scheme the game is served from, so absolute paths and the save origin stay the same offline. */
export const APP_SCHEME = 'app';
export const APP_HOST = 'megagen';
export const START_URL = `${APP_SCHEME}://${APP_HOST}/play/`;

/** Save keys are short names from the game (for example "megagen-idle-save:savedAt"); nothing else is written. */
export function isSaveKey(key: unknown): key is string {
  return typeof key === 'string' && key.length > 0 && key.length <= 120 && /^[\w.:-]+$/.test(key);
}

/** The file for a save key in the user data folder (":" is not allowed in Windows file names). */
export function saveFileName(key: string): string {
  return `${key.replaceAll(':', '~')}.json`;
}

export function saveFilePath(userData: string, key: string): string {
  return join(userData, 'saves', saveFileName(key));
}

/**
 * The file an app:// address serves from the built game folder, or null for
 * anything outside it. A folder address serves its index.html.
 */
export function resolveAppFile(root: string, url: string): string | null {
  let pathname: string;
  try {
    const u = new URL(url);
    if (u.protocol !== `${APP_SCHEME}:` || u.host !== APP_HOST) return null;
    pathname = decodeURIComponent(u.pathname);
  } catch {
    return null;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = normalize(join(root, pathname));
  const base = normalize(root.endsWith(sep) ? root : root + sep);
  return file.startsWith(base) ? file : null;
}

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

export function contentType(file: string): string {
  return TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream';
}

/** Links that leave the game open in the system browser; only web and mail links. */
export function isExternalLink(url: string): boolean {
  return /^(https?:|mailto:)/i.test(url);
}
