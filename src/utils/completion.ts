import { GENERATOR_TYPES } from '../data/generators';
import { PRODUCER_IDS } from '../data/producers';
import { RESEARCH } from '../data/research';
import { ROOM_TIERS } from '../data/rooms';
import type { GameState } from '../types/state';

export interface CompletionPart {
  label: string;
  done: number;
  total: number;
}

/**
 * How close a save is to 100% completion ("perfection", owner playtests 5-6):
 * research completed, generator types built, room tiers bought, producer
 * types owned. Achievements join in 0.65. Overall = done / total over all parts.
 */
export function getCompletion(
  state: Pick<GameState, 'completedResearch' | 'activeGenerators' | 'expansionLevel' | 'producers'>,
  everBuilt: ReadonlySet<string> = new Set(state.activeGenerators.map((g) => g.type)),
): { parts: CompletionPart[]; done: number; total: number; ratio: number } {
  const parts: CompletionPart[] = [
    { label: 'Research', done: state.completedResearch.filter((id) => RESEARCH.some((r) => r.id === id)).length, total: RESEARCH.length },
    { label: 'Generator types built', done: GENERATOR_TYPES.filter((t) => everBuilt.has(t)).length, total: GENERATOR_TYPES.length },
    { label: 'Room expansions', done: Math.min(state.expansionLevel, ROOM_TIERS.length), total: ROOM_TIERS.length },
    { label: 'Producer types owned', done: PRODUCER_IDS.filter((p) => (state.producers[p] ?? 0) > 0).length, total: PRODUCER_IDS.length },
  ];
  const done = parts.reduce((s, p) => s + p.done, 0);
  const total = parts.reduce((s, p) => s + p.total, 0);
  return { parts, done, total, ratio: total ? done / total : 1 };
}
