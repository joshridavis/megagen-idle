import localforage from 'localforage';
import type { AsyncKV } from './storage';
import type { GameState } from '../types/state';
import { getCompletion } from '../utils/completion';
import { SAVE_VERSION } from './migrations';

/**
 * Save backends (0.67): one interface for every place a save can live, so a
 * cloud service (0.68, see docs/PUBLIC_RELEASE.md) plugs in without touching
 * game logic. A save is the text of an export file (src/utils/saveFile.ts),
 * which already carries its version and migrates on load.
 */

export type SaveSource = 'local' | 'cloud';

/** What the load screen shows for a save, without loading it. */
export interface SaveSummary {
  slot: string;
  source: SaveSource;
  /** Epoch ms when it was written. */
  savedAt: number;
  /** Save format version (SAVE_VERSION when written). */
  version: number;
  energy: number;
  /** 0..1, from getCompletion. */
  completion: number;
}

export type SaveMeta = Omit<SaveSummary, 'slot' | 'source'>;

export interface StoredSave {
  summary: SaveSummary;
  /** Export file text: parse with parseSaveFile. */
  text: string;
}

export interface SaveBackend {
  readonly source: SaveSource;
  /** Whether it can be used now: always for local; a cloud backend needs a signed-in player and a connection. */
  isAvailable(): Promise<boolean>;
  list(): Promise<SaveSummary[]>;
  load(slot: string): Promise<StoredSave | null>;
  save(slot: string, text: string, meta: SaveMeta): Promise<SaveSummary>;
  remove(slot: string): Promise<void>;
}

/** The automatic save slot, written on a timer and on close (0.68). */
export const AUTO_SLOT = 'auto';

/** Summary fields for a game state. */
export function summarize(state: GameState, now = Date.now()): SaveMeta {
  return { savedAt: now, version: SAVE_VERSION, energy: state.energy, completion: getCompletion(state).ratio };
}

const INDEX_KEY = 'index';

/**
 * A backend over any async key-value store: the local one uses IndexedDB
 * (through localforage); tests use a Map. Each slot keeps its text and summary;
 * an index lists the slots.
 */
export function createKVBackend(kv: AsyncKV, source: SaveSource = 'local', prefix = 'slot:'): SaveBackend {
  const key = (slot: string) => `${prefix}${slot}`;
  const readIndex = async () => ((await kv.getItem<string[]>(prefix + INDEX_KEY)) ?? []).filter((s) => typeof s === 'string');
  return {
    source,
    isAvailable: async () => true,
    list: async () => {
      const out: SaveSummary[] = [];
      for (const slot of await readIndex()) {
        const s = await kv.getItem<StoredSave>(key(slot));
        if (s?.summary) out.push(s.summary);
      }
      return out.sort((a, b) => b.savedAt - a.savedAt);
    },
    load: async (slot) => (await kv.getItem<StoredSave>(key(slot))) ?? null,
    save: async (slot, text, meta) => {
      const summary: SaveSummary = { ...meta, slot, source };
      await kv.setItem<StoredSave>(key(slot), { summary, text });
      const index = await readIndex();
      if (!index.includes(slot)) await kv.setItem(prefix + INDEX_KEY, [...index, slot]);
      return summary;
    },
    remove: async (slot) => {
      await kv.removeItem(key(slot));
      await kv.setItem(
        prefix + INDEX_KEY,
        (await readIndex()).filter((s) => s !== slot),
      );
    },
  };
}

/** The local backend: save slots in IndexedDB, next to (not instead of) the live game save. */
export function createLocalBackend(): SaveBackend {
  return createKVBackend(localforage.createInstance({ name: 'megagen-idle', storeName: 'slots' }), 'local');
}

/** Saves this close in time count as the same game state (an autosave and its upload). */
export const SAME_SAVE_MS = 60_000;

export type SaveChoice =
  /** Nothing saved anywhere: a new game. */
  | { kind: 'new' }
  /** Only one exists, or both match: use it without asking. */
  | { kind: 'use'; source: SaveSource }
  /** They differ: ask the player, suggesting the newer one (owner, playtest 10: "newest wins, with a prompt"). */
  | { kind: 'ask'; newer: SaveSource; local: SaveSummary; cloud: SaveSummary };

/**
 * Which save to load when a player signs in, from the local and cloud
 * summaries (0.68 shows the prompt). A save from a newer game version than
 * this one is never picked silently; parseSaveFile rejects it on load.
 */
export function chooseSave(local: SaveSummary | null, cloud: SaveSummary | null, sameMs = SAME_SAVE_MS): SaveChoice {
  if (!local && !cloud) return { kind: 'new' };
  if (!cloud) return { kind: 'use', source: 'local' };
  if (!local) return { kind: 'use', source: 'cloud' };
  if (Math.abs(local.savedAt - cloud.savedAt) <= sameMs && local.version === cloud.version) {
    return { kind: 'use', source: local.savedAt >= cloud.savedAt ? 'local' : 'cloud' };
  }
  return { kind: 'ask', newer: cloud.savedAt > local.savedAt ? 'cloud' : 'local', local, cloud };
}
