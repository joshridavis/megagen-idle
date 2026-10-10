// Loading screen timings (1.49). index.html reads BOOT_TIMEOUT_MS at build time.

/** After this long without the game starting, the loading screen says it could not load. */
export const BOOT_TIMEOUT_MS = 20_000;

/** A game ready sooner than this (from page start) drops the loading screen at once, with no fade. */
export const BOOT_FADE_MIN_MS = 300;

/** Length of the loading screen's fade out; matches the `transition` in index.html. */
export const BOOT_FADE_MS = 300;
