import { createInitialState } from '../data/initialState';
import { STARTING_PRODUCERS } from '../data/producers';
import { STARTING_RESOURCES } from '../data/resources';
import type { Generator } from '../types/generator';
import type { GameState } from '../types/state';
import { recordsFromGenerators } from '../utils/records';

/** Bump when the saved shape changes, and add a step to `MIGRATIONS`. */
export const SAVE_VERSION = 6;

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
  // 0.11: resources and producers arrive. Older saves could not have built
  // anything, so they get the starting resources and producers.
  1: (save) => {
    const old = (save.resources ?? {}) as Record<string, number>;
    const resources = Object.fromEntries(
      Object.entries(STARTING_RESOURCES).map(([id, n]) => [id, Math.max(n, old[id] ?? 0)]),
    );
    return { ...save, resources, producers: { ...STARTING_PRODUCERS }, activeGenerators: [], depletedResources: [] };
  },
  // 0.10: research. Generators built before research gating are kept.
  2: (save) => ({ ...save, currentResearch: null, completedResearch: [], researchLevel: 1 }),
  // 0.20: gas well producer (filled from defaults) and the expansion animation timestamp.
  3: (save) => ({ ...save, lastExpansionAt: null }),
  // 0.31: producers take room; base room grew by 3 to cover the starting three.
  4: (save) => ({ ...save, roomCapacity: (Number(save.roomCapacity) || 10) + 3 }),
  // 0.82: permanent completion records, filled from the generators the save has now.
  5: (save) => ({ ...save, records: recordsFromGenerators((save.activeGenerators as Generator[] | undefined) ?? []) }),
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
  merged.producers = { ...defaults.producers, ...(save.producers as object | undefined) };
  return merged;
}

/** Keys that are saved: data only, no actions. */
export function pickSaved(s: GameState): GameState {
  return {
    energy: s.energy,
    energyPerSecond: s.energyPerSecond,
    lastSavedTimestamp: s.lastSavedTimestamp,
    resources: s.resources,
    producers: s.producers,
    depletedResources: s.depletedResources,
    activeGenerators: s.activeGenerators,
    records: s.records,
    researchLevel: s.researchLevel,
    currentResearch: s.currentResearch,
    completedResearch: s.completedResearch,
    roomCapacity: s.roomCapacity,
    roomUsed: s.roomUsed,
    expansionLevel: s.expansionLevel,
    lastExpansionAt: s.lastExpansionAt,
    settings: s.settings,
  };
}
