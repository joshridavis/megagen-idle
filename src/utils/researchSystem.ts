import { RESEARCH, RESEARCH_BY_ID, STARTING_GENERATORS } from '../data/research';
import type { Bonuses } from '../types/bonus';
import type { GeneratorType } from '../types/generator';
import type { ResearchCost, ResearchDef } from '../types/research';
import type { GameState } from '../types/state';
import { getBonuses } from './bonuses';
import { canAfford, consumeResource } from './resourceSystem';

/** Cost after the research cost reduction bonus (rounded up). */
export function getResearchCost(def: ResearchDef, bonuses: Bonuses): ResearchCost {
  const f = 1 - bonuses.researchCostReduction;
  const resources: ResearchCost['resources'] = {};
  for (const [id, n] of Object.entries(def.cost.resources ?? {})) {
    resources[id as keyof typeof resources] = Math.ceil((n ?? 0) * f);
  }
  return { energy: Math.ceil(def.cost.energy * f), resources };
}

/** Duration in seconds after the research speed bonus. */
export function getResearchDuration(def: ResearchDef, bonuses: Bonuses): number {
  return def.duration / (1 + bonuses.researchSpeed);
}

export type ResearchBlock = 'unknown' | 'done' | 'busy' | 'prerequisites' | 'level' | 'cost';

/** Why research cannot start now, or null if it can. */
export function getResearchBlock(state: GameState, id: string): ResearchBlock | null {
  const def = RESEARCH_BY_ID[id];
  if (!def) return 'unknown';
  if (state.completedResearch.includes(id)) return 'done';
  if (state.currentResearch) return 'busy';
  if (!def.prerequisites.every((p) => state.completedResearch.includes(p))) return 'prerequisites';
  if (state.researchLevel < def.requiredLevel) return 'level';
  const cost = getResearchCost(def, getBonuses(state.completedResearch));
  if (state.energy < cost.energy || !canAfford(state.resources, cost.resources ?? {})) return 'cost';
  return null;
}

export function canStartResearch(state: GameState, id: string): boolean {
  return getResearchBlock(state, id) === null;
}

/** Pays the cost and starts the timer. Returns the state unchanged if blocked. */
export function startResearch(state: GameState, id: string, now: number): GameState {
  if (!canStartResearch(state, id)) return state;
  const def = RESEARCH_BY_ID[id];
  const bonuses = getBonuses(state.completedResearch);
  const cost = getResearchCost(def, bonuses);
  const paid = consumeResource(state.resources, cost.resources ?? {});
  return {
    ...state,
    energy: state.energy - cost.energy,
    resources: paid.resources,
    currentResearch: { id, startTime: now, duration: getResearchDuration(def, bonuses) },
  };
}

/** Epoch ms when the current research finishes, or null. */
export function researchFinishTime(state: GameState): number | null {
  const r = state.currentResearch;
  return r ? r.startTime + r.duration * 1000 : null;
}

/** 0..1 progress of the current research at `now`. */
export function researchProgress(state: GameState, now: number): number {
  const r = state.currentResearch;
  if (!r) return 0;
  if (r.duration <= 0) return 1;
  return Math.min(1, Math.max(0, (now - r.startTime) / (r.duration * 1000)));
}

/**
 * Finishes the current research: records it, raises the research level, and
 * applies unlocks and bonuses (the caller re-derives rates). No-op if idle.
 */
export function completeResearch(state: GameState): GameState {
  const r = state.currentResearch;
  if (!r) return state;
  return {
    ...state,
    currentResearch: null,
    completedResearch: [...state.completedResearch, r.id],
    researchLevel: state.researchLevel + 1,
  };
}

/** The research that unlocks a generator type, if any. */
export function findUnlockingResearch(type: GeneratorType): ResearchDef | undefined {
  return RESEARCH.find((r) => r.unlocks.generators?.includes(type));
}

/** Generators the player may build: the starting ones plus research unlocks. */
export function getUnlockedGeneratorTypes(completedResearch: string[]): GeneratorType[] {
  const set = new Set<GeneratorType>(STARTING_GENERATORS);
  for (const id of completedResearch) for (const g of RESEARCH_BY_ID[id]?.unlocks.generators ?? []) set.add(g);
  return [...set];
}
