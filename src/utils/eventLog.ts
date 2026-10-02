import { GENERATORS } from '../data/generators';
import { EVENT_LOG_CAP, ROOM_WARNING_FREE, TOAST_CAP } from '../data/notifications';
import { PRODUCERS } from '../data/producers';
import { RESOURCE_NAMES } from '../data/resources';
import { RESEARCH, RESEARCH_BY_ID } from '../data/research';
import type { ProducerId } from '../types/resource';
import type { GameState, ResourceId } from '../types/state';

export type LogKind = 'research' | 'unlock' | 'fuel' | 'room' | 'event' | 'achievement';

export interface LogEntry {
  id: string;
  at: number;
  kind: LogKind;
  text: string;
  /** Also shown as a toast. */
  toast: boolean;
}

export type LogInput = Omit<LogEntry, 'id' | 'at'>;

let seq = 0;
/** Stamps inputs with a time and a unique id. */
export function stamp(inputs: LogInput[], now: number): LogEntry[] {
  return inputs.map((e) => ({ ...e, at: now, id: `${now}-${seq++}` }));
}

/** Newest first, capped. */
export function appendLog(log: LogEntry[], entries: LogEntry[], cap = EVENT_LOG_CAP): LogEntry[] {
  return [...[...entries].reverse(), ...log].slice(0, cap);
}

/** Toasts to show, newest last, capped so they cannot flood the screen. */
export function appendToasts(toasts: LogEntry[], entries: LogEntry[], cap = TOAST_CAP): LogEntry[] {
  return [...toasts, ...entries.filter((e) => e.toast)].slice(-cap);
}

type Snapshot = Pick<GameState, 'completedResearch' | 'activeGenerators' | 'roomCapacity' | 'roomUsed' | 'resources'>;

const startable = (completed: string[]) =>
  new Set(RESEARCH.filter((r) => !completed.includes(r.id) && r.prerequisites.every((p) => completed.includes(p))).map((r) => r.id));

/**
 * What happened between two states, as log entries (0.38). Pure: the store
 * calls it after every change, so events come from the systems, not the UI.
 */
export function deriveEvents(prev: Snapshot, next: Snapshot): LogInput[] {
  const out: LogInput[] = [];
  // research completed, and what it unlocks
  const finished = next.completedResearch.filter((id) => !prev.completedResearch.includes(id));
  for (const id of finished) {
    const def = RESEARCH_BY_ID[id];
    if (!def) continue;
    out.push({ kind: 'research', text: `Research complete: ${def.name}`, toast: false });
    for (const g of def.unlocks.generators ?? []) {
      out.push({ kind: 'unlock', text: `New generator available: ${GENERATORS[g].name}`, toast: true });
    }
    for (const p of Object.keys(def.unlocks.producers ?? {}) as ProducerId[]) {
      out.push({ kind: 'unlock', text: `New producer: ${PRODUCERS[p].name}`, toast: true });
    }
  }
  if (finished.length) {
    const before = startable(prev.completedResearch);
    const now = [...startable(next.completedResearch)].filter((id) => !before.has(id));
    if (now.length) {
      out.push({ kind: 'unlock', text: `New research available: ${now.map((id) => RESEARCH_BY_ID[id].name).join(', ')}`, toast: false });
    }
  }
  // generators switched off for lack of fuel, one entry per fuel
  const wasOn = new Set(prev.activeGenerators.filter((g) => g.isActive).map((g) => g.id));
  const ranOut = next.activeGenerators.filter((g) => g.outOfFuel && !g.isActive && wasOn.has(g.id));
  const byFuel = new Map<ResourceId, number>();
  for (const g of ranOut) {
    const fuel = Object.keys(GENERATORS[g.type].maintenanceCost ?? {})[0] as ResourceId | undefined;
    if (fuel) byFuel.set(fuel, (byFuel.get(fuel) ?? 0) + 1);
  }
  for (const [fuel, n] of byFuel) {
    out.push({
      kind: 'fuel',
      text: `Out of ${RESOURCE_NAMES[fuel].toLowerCase()}: ${n} generator${n === 1 ? '' : 's'} switched off`,
      toast: true,
    });
  }
  // room nearly full (only when crossing the threshold)
  const freeBefore = prev.roomCapacity - prev.roomUsed;
  const freeAfter = next.roomCapacity - next.roomUsed;
  if (freeBefore > ROOM_WARNING_FREE && freeAfter <= ROOM_WARNING_FREE) {
    out.push({
      kind: 'room',
      text: freeAfter <= 0 ? 'Room is full: expand it to build more' : `Room nearly full: ${freeAfter} free`,
      toast: true,
    });
  }
  return out;
}
