import { createInitialState } from '../data/initialState';
import { STARTING_PRODUCERS } from '../data/producers';
import { STARTING_RESOURCES } from '../data/resources';
import type { Generator } from '../types/generator';
import type { GameState } from '../types/state';
import { recordsFromGenerators } from '../utils/records';
import { TUTORIAL_DONE } from '../data/tutorial';

/** Bump when the saved shape changes, and add a step to `MIGRATIONS`. */
export const SAVE_VERSION = 18;

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
  // 0.33: oil and uranium, Oil Rig and Uranium Mine (filled from defaults below).
  6: (save) => save,
  // 0.88: lifetime energy for the player level; the best estimate for an old save is its current energy.
  7: (save) => ({ ...save, lifetimeEnergy: Math.max(0, Number(save.energy) || 0) }),
  // 0.84: random events seen (empty) and the reduce-motion setting (filled from defaults below).
  8: (save) => ({ ...save, seenEvents: {} }),
  // 0.40: players with an existing save have already learned the basics: no walkthrough.
  9: (save) => ({ ...save, settings: { ...(save.settings as object), tutorial: { step: TUTORIAL_DONE, replay: false } } }),
  // 0.96: generator list sort (filled from defaults below).
  10: (save) => save,
  // 0.85: timed event effects.
  11: (save) => ({ ...save, activeEffects: [] }),
  // 0.86: Grid Contracts (fresh state from defaults below).
  12: (save) => save,
  // 0.92: energy pets (fresh state from defaults below).
  13: (save) => save,
  // 0.65: achievements and their counters (filled from defaults; unlocks are checked on load).
  14: (save) => save,
  // 1.01: cosmetics (filled from default settings below).
  15: (save) => save,
  // 1.05: machines placed on the map (none yet: everything is placed automatically).
  16: (save) => ({ ...save, mapPins: {} }),
  // 0.34: deuterium and the Deuterium Extractor (filled from defaults below).
  17: (save) => save,
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
    lifetimeEnergy: s.lifetimeEnergy,
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
    mapPins: s.mapPins,
    settings: s.settings,
    seenEvents: s.seenEvents,
    activeEffects: s.activeEffects,
    contracts: s.contracts,
    pets: s.pets,
    achievements: s.achievements,
    stats: s.stats,
  };
}
