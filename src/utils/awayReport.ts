import { RESOURCE_IDS } from '../data/resources';
import type { GameState, Resources } from '../types/state';

/** State captured when the tab was hidden (0.79). */
export interface AwaySnapshot {
  at: number;
  energy: number;
  resources: Resources;
  completedResearch: string[];
  /** Generators already switched off for lack of fuel when hidden. */
  outOfFuel: string[];
}

export function takeAwaySnapshot(s: GameState, now: number): AwaySnapshot {
  return {
    at: now,
    energy: s.energy,
    resources: { ...s.resources },
    completedResearch: [...s.completedResearch],
    outOfFuel: s.activeGenerators.filter((g) => g.outOfFuel && !g.isActive).map((g) => g.id),
  };
}

/** Summary of everything that changed while the tab was hidden. */
export function buildAwayReport(snap: AwaySnapshot, s: GameState, now: number) {
  const awaySeconds = Math.max(0, (now - snap.at) / 1000);
  return {
    awaySeconds,
    creditedSeconds: awaySeconds,
    energyGained: s.energy - snap.energy,
    resourcesGained: Object.fromEntries(RESOURCE_IDS.map((id) => [id, s.resources[id] - snap.resources[id]])) as Resources,
    completedResearch: s.completedResearch.filter((id) => !snap.completedResearch.includes(id)),
    outOfFuel: s.activeGenerators.filter((g) => g.outOfFuel && !g.isActive && !snap.outOfFuel.includes(g.id)).map((g) => g.id),
  };
}
