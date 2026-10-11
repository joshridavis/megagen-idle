/**
 * Editions (2.04, docs/RELEASE_DECISIONS.md "Editions"): one codebase, chosen at build time with
 * VITE_EDITION (or PLAY_EDITION for the site's /play/), read by vite.config.ts into __EDITION__.
 * - demo: the web build, itch.io, galaxy.click and the Steam demo. Only the free part; data for
 *   later content is not in the bundle at all (the *Full.ts data files are left out).
 * - full: the Steam full game. Everything open.
 * - mobile: Android and iOS. Everything in the bundle; the content after the free part is locked
 *   until the full_game entitlement is owned.
 * Without a build setting (tests, the simulator, npm run dev) it is the full game.
 */
export type Edition = 'demo' | 'full' | 'mobile';
export const EDITIONS: Edition[] = ['demo', 'full', 'mobile'];

declare const __EDITION__: string | undefined;

/**
 * A demo build, known at build time so the bundler drops the full-only data. Keep this exact
 * expression: the bundler folds it to a constant and removes the unused branch.
 */
export const DEMO_BUILD = typeof __EDITION__ !== 'undefined' && __EDITION__ === 'demo';

/** The edition this build was made for. */
export const BUILD_EDITION: Edition =
  typeof __EDITION__ !== 'undefined' && (EDITIONS as string[]).includes(__EDITION__) ? (__EDITION__ as Edition) : 'full';

let override: Edition | null = null;

/** The edition the game runs as: the build's, unless a test chose another. */
export function edition(): Edition {
  return override ?? BUILD_EDITION;
}

/** Tests run the rules of another edition (the data stays the build's). Pass null to go back. */
export function setEditionForTests(e: Edition | null): void {
  override = e;
}

/**
 * Puts each group of items after the item whose key is `after`, so full-only data kept in its own
 * file merges back into the same order as before (the research tree and the simulator depend on it).
 */
export function spliceAfter<T>(base: T[], groups: { after: string; items: T[] }[], key: (t: T) => string): T[] {
  const out = [...base];
  for (const g of groups) {
    const at = out.findIndex((t) => key(t) === g.after);
    if (at < 0) throw new Error(`spliceAfter: no item ${g.after}`);
    out.splice(at + 1, 0, ...g.items);
  }
  return out;
}
