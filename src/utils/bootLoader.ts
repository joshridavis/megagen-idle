import { BOOT_FADE_MIN_MS, BOOT_FADE_MS } from '../data/boot';

declare global {
  interface Window {
    /** Set once the game has drawn its first screen; the loading screen's failure timer checks it (1.49). */
    __megagenStarted?: boolean;
  }
}

/** Whether the loading screen fades out: not on fast loads (no flash) and not with reduced motion. */
export const bootShouldFade = (elapsedMs: number, reduceMotion: boolean): boolean =>
  !reduceMotion && elapsedMs >= BOOT_FADE_MIN_MS;

/**
 * Removes the loading screen drawn by index.html (1.49), fading it out unless
 * the game was ready almost at once or motion is reduced.
 */
export function hideBootLoader(elapsedMs: number, reduceMotion: boolean, doc: Document = document): void {
  const win = doc.defaultView;
  if (win) win.__megagenStarted = true;
  const loader = doc.getElementById('boot-loader');
  if (!loader) return;
  if (!bootShouldFade(elapsedMs, reduceMotion)) {
    loader.remove();
    return;
  }
  loader.classList.add('boot-hide');
  // transitionend does not fire in a background tab, so a timer removes it too
  setTimeout(() => loader.remove(), BOOT_FADE_MS + 50);
}
