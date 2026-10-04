import { validateState } from '../utils/saveFile';
import { deriveRates } from '../utils/simulation';
import { migrateSave, SAVE_VERSION } from './migrations';

/** A stored save that could not be loaded, kept so it is never lost (0.46). */
export interface DamagedSave {
  /** When it was set aside (ms). */
  at: number;
  /** Why it could not be loaded, in plain words. */
  reason: string;
  /** The stored text, exactly as it was. */
  raw: string;
}

/** The damaged copy is kept under the save's own key plus this suffix. */
export const DAMAGED_SUFFIX = ':damaged';

/**
 * Checks a stored save (the persist JSON: `{ state, version }`) before the
 * game loads it. Returns why it cannot be loaded, or null when it is fine:
 * it parses, is not from a newer game, migrates, passes the same checks as
 * an imported save, and its rates can be computed.
 */
export function checkStoredSave(raw: string): string | null {
  let data: { state?: unknown; version?: unknown };
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    return 'it is not readable (not valid JSON)';
  }
  if (!data || typeof data !== 'object' || !data.state || typeof data.state !== 'object') return 'it has no game data';
  const version = typeof data.version === 'number' && Number.isInteger(data.version) ? data.version : 0;
  if (version > SAVE_VERSION) return `it comes from a newer version of the game (save v${version}, this game reads up to v${SAVE_VERSION})`;
  try {
    const state = migrateSave(data.state, version);
    const problem = validateState(state);
    if (problem) return problem;
    deriveRates(state);
  } catch {
    return 'it could not be upgraded to the current version';
  }
  return null;
}

let lastDamaged: DamagedSave | null = null;

/** Called by the save storage when it set a save aside. */
export function reportDamagedSave(d: DamagedSave): void {
  lastDamaged = d;
}

/** The save set aside during this load, if any; reading it clears it, so it is reported once. */
export function takeDamagedReport(): DamagedSave | null {
  const d = lastDamaged;
  lastDamaged = null;
  return d;
}

/**
 * The text to download for a kept save: in the export-file format when it can
 * be read (so Settings → Import can try it, or someone can repair it), else
 * exactly as it was stored.
 */
export function damagedSaveFile(d: DamagedSave): string {
  try {
    const data = JSON.parse(d.raw) as { state?: unknown; version?: unknown };
    if (data && typeof data === 'object' && data.state && typeof data.state === 'object')
      return JSON.stringify({ game: 'megagen-idle', version: data.version ?? 0, exportedAt: new Date(d.at).toISOString(), state: data.state }, null, 2);
  } catch {
    // not JSON: hand it over unchanged
  }
  return d.raw;
}
