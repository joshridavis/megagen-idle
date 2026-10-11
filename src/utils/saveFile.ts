import { edition } from '../data/edition';
import { GENERATOR_TYPES } from '../data/generators';
import { PRODUCER_IDS } from '../data/producers';
import { RESEARCH_BY_ID } from '../data/research';
import { RESOURCE_IDS } from '../data/resources';
import { migrateSave, pickSaved, SAVE_VERSION } from '../store/migrations';
import type { GameState } from '../types/state';
import { deriveRates } from './simulation';

export const SAVE_FILE_GAME = 'megagen-idle';

export interface SaveFile {
  game: typeof SAVE_FILE_GAME;
  version: number;
  exportedAt: string;
  state: GameState;
}

/** Serializes the saved part of the state into an export file (pretty JSON). */
export function exportSave(state: GameState, now = Date.now()): string {
  const file: SaveFile = { game: SAVE_FILE_GAME, version: SAVE_VERSION, exportedAt: new Date(now).toISOString(), state: pickSaved(state) };
  return JSON.stringify(file, null, 2);
}

export type ImportResult = { ok: true; state: GameState } | { ok: false; error: string };

const isNum = (v: unknown) => typeof v === 'number' && Number.isFinite(v);

/** Checks a migrated state has the right shape and sane values. Returns an error message or null. */
export function validateState(s: GameState): string | null {
  if (!isNum(s.energy) || s.energy < 0) return 'energy is missing or invalid';
  if (!isNum(s.lastSavedTimestamp)) return 'save time is invalid';
  if (!s.resources || RESOURCE_IDS.some((id) => !isNum(s.resources[id]) || s.resources[id] < 0)) return 'resources are invalid';
  if (!s.producers || PRODUCER_IDS.some((id) => !isNum(s.producers[id]) || s.producers[id] < 0)) return 'producers are invalid';
  if (!Array.isArray(s.activeGenerators)) return 'generators are invalid';
  const ids = new Set<string>();
  for (const g of s.activeGenerators) {
    if (!g || typeof g.id !== 'string' || !GENERATOR_TYPES.includes(g.type) || typeof g.isActive !== 'boolean') return 'a generator is invalid';
    if (ids.has(g.id)) return 'duplicate generator IDs';
    ids.add(g.id);
  }
  if (!Array.isArray(s.completedResearch) || s.completedResearch.some((id) => !RESEARCH_BY_ID[id])) return 'research list is invalid';
  if (s.currentResearch && (!RESEARCH_BY_ID[s.currentResearch.id] || !isNum(s.currentResearch.startTime) || !isNum(s.currentResearch.duration)))
    return 'current research is invalid';
  if (!isNum(s.researchLevel) || s.researchLevel < 1) return 'research level is invalid';
  if (!isNum(s.roomCapacity) || !isNum(s.expansionLevel) || s.expansionLevel < 0) return 'room data is invalid';
  return null;
}

/**
 * Parses and validates an export file. Never touches the current save: the
 * caller applies `state` only when `ok` is true. Older versions are migrated;
 * newer versions are rejected. `now` becomes the save time, so no offline
 * gains are credited for the time between export and import.
 */
export function parseSaveFile(text: string, now = Date.now()): ImportResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'This file is not a valid save (it is not JSON).' };
  }
  const f = data as Partial<SaveFile>;
  if (!f || typeof f !== 'object' || f.game !== SAVE_FILE_GAME) return { ok: false, error: 'This file is not a MegaGen Idle save.' };
  if (!Number.isInteger(f.version) || (f.version as number) < 0) return { ok: false, error: 'This save has no valid version number.' };
  if ((f.version as number) > SAVE_VERSION)
    return { ok: false, error: `This save comes from a newer version of the game (save v${f.version}, this game reads up to v${SAVE_VERSION}).` };
  if (!f.state || typeof f.state !== 'object') return { ok: false, error: 'This save has no game data.' };
  let state: GameState;
  try {
    state = migrateSave(f.state, f.version as number);
  } catch {
    return { ok: false, error: 'This save could not be upgraded to the current version.' };
  }
  const problem = validateState(state);
  // the demo has no research past the free part (2.04): a save from the Full Game names some
  if (problem?.startsWith('research') || problem?.startsWith('current research')) {
    if (edition() === 'demo') return { ok: false, error: 'This save has progress from the Full Game, which this free version cannot open.' };
  }
  if (problem) return { ok: false, error: `This save is damaged: ${problem}.` };
  return { ok: true, state: deriveRates({ ...state, lastSavedTimestamp: now }) };
}
