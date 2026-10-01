import { GENERATORS } from '../data/generators';
import { SIM_STEP_SECONDS } from '../data/time';
import { calculateEnergyRate } from './energyGeneration';
import type { ResourceId, GameState } from '../types/state';
import { accrueResources, burnFuel } from './resourceSystem';

export interface TimeReport {
  seconds: number;
  energyGained: number;
  /** Resources that ran out, in the order they ran out. */
  depleted: ResourceId[];
  /** Generators switched off for lack of fuel. */
  deactivated: string[];
}

/**
 * Pure: advances the game by `seconds`. Gaps are split into SIM_STEP_SECONDS
 * steps; each step runs producers, then burns fuel (switching off generators
 * that run dry), then adds energy from whatever is still running.
 */
export function advanceTime(state: GameState, seconds: number): { state: GameState; report: TimeReport } {
  const report: TimeReport = { seconds: 0, energyGained: 0, depleted: [], deactivated: [] };
  if (!(seconds > 0)) return { state, report };
  let s = state;
  let left = seconds;
  while (left > 0) {
    const dt = Math.min(SIM_STEP_SECONDS, left);
    left -= dt;
    const produced = accrueResources(s.resources, s.producers, dt);
    const fuel = burnFuel(produced, s.activeGenerators, dt);
    s = { ...s, resources: fuel.resources, activeGenerators: fuel.generators };
    if (fuel.deactivated.length) {
      s = deriveRates(s);
      report.deactivated.push(...fuel.deactivated);
      for (const id of fuel.depleted) if (!report.depleted.includes(id)) report.depleted.push(id);
    }
    const gained = s.energyPerSecond * dt;
    s = { ...s, energy: s.energy + gained };
    report.energyGained += gained;
    report.seconds += dt;
  }
  if (report.depleted.length) {
    const merged = [...new Set([...state.depletedResources, ...report.depleted])];
    s = { ...s, depletedResources: merged };
  }
  return { state: s, report };
}

/**
 * Recomputes the cached derived values (energy rate, room used) from built
 * generators. The single place these are calculated.
 */
export function deriveRates(state: GameState): GameState {
  const energyPerSecond = calculateEnergyRate(state.activeGenerators);
  const roomUsed = state.activeGenerators.reduce((sum, g) => sum + (GENERATORS[g.type]?.roomCost ?? 0), 0);
  if (energyPerSecond === state.energyPerSecond && roomUsed === state.roomUsed) return state;
  return { ...state, energyPerSecond, roomUsed };
}
