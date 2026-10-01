import { createInitialState } from '../data/initialState';
import type { GameState } from '../types/state';

/** Bump when the saved shape changes, and add a step to `MIGRATIONS`. */
export const SAVE_VERSION = 1;

type AnySave = Record<string, unknown>;

/**
 * MIGRATIONS[n] upgrades a version-n save to version n+1.
 * Version 0 is the unversioned save from items 0.00 to 0.04.
 */
const MIGRATIONS: Record<number, (save: AnySave) => AnySave> = {
  0: (save) => {
    const { totalProductionPerSecond, ...rest } = save;
    return { ...rest, energyPerSecond: totalProductionPerSecond };
  },
};

/** Upgrades a persisted save of any older version to the current shape. */
export function migrateSave(persisted: unknown, fromVersion: number): GameState {
  let save: AnySave = persisted && typeof persisted === 'object' ? { ...(persisted as AnySave) } : {};
  for (let v = fromVersion; v < SAVE_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (step) save = step(save);
  }
  // Fill any fields a migration did not supply with fresh-save defaults.
  const defaults = createInitialState();
  const merged = { ...defaults, ...save } as GameState;
  merged.resources = { ...defaults.resources, ...(save.resources as object | undefined) };
  merged.settings = { ...defaults.settings, ...(save.settings as object | undefined) };
  return merged;
}

/** Keys that are saved: data only, no actions. */
export function pickSaved(s: GameState): GameState {
  return {
    energy: s.energy,
    energyPerSecond: s.energyPerSecond,
    lastSavedTimestamp: s.lastSavedTimestamp,
    resources: s.resources,
    activeGenerators: s.activeGenerators,
    researchLevel: s.researchLevel,
    roomCapacity: s.roomCapacity,
    roomUsed: s.roomUsed,
    expansionLevel: s.expansionLevel,
    settings: s.settings,
  };
}
