import { GENERATORS } from '../data/generators';
import { PRODUCER_IDS, PRODUCERS } from '../data/producers';
import { SIM_STEP_SECONDS } from '../data/time';
import { getBonuses, getEnergyBonuses } from './bonuses';
import { getPlayerLevel } from './playerLevel';
import { expireEffects, getEffectMods } from './effectMods';
import { withPetMods } from './pets';
import { getPlacementBonuses, settledPins } from './siteMap';
import { calculateEnergyRate } from './energyGeneration';
import { completeResearch, getGrantedProducers, researchFinishTime } from './researchSystem';
import type { ResourceId, GameState } from '../types/state';
import { accrueResources, burnFuel } from './resourceSystem';

export interface TimeReport {
  seconds: number;
  energyGained: number;
  /** Resources that ran out, in the order they ran out. */
  depleted: ResourceId[];
  /** Generators switched off for lack of fuel. */
  deactivated: string[];
  /** Research finished during this time. */
  completedResearch: string[];
}

/**
 * Pure: advances the game by `seconds`, ending at epoch ms `endTime`. Gaps are
 * split into SIM_STEP_SECONDS steps; each step runs producers, then burns
 * fuel (switching off generators that run dry), then adds energy from
 * whatever is still running, then finishes research whose time has come.
 * Research is timestamp-based, so it completes even beyond the offline cap.
 */
export function advanceTime(
  state: GameState,
  seconds: number,
  endTime = state.lastSavedTimestamp + Math.max(0, seconds) * 1000,
): { state: GameState; report: TimeReport } {
  const report: TimeReport = { seconds: 0, energyGained: 0, depleted: [], deactivated: [], completedResearch: [] };
  let s = state;
  if (!(seconds > 0)) {
    s = finishResearch(s, endTime, report);
    return { state: s, report };
  }
  let left = seconds;
  while (left > 0) {
    const dt = Math.min(SIM_STEP_SECONDS, left);
    left -= dt;
    // timed event effects that ended before this step stop counting (0.85)
    const stepStart = endTime - (left + dt) * 1000;
    const effects = expireEffects(s.activeEffects, stepStart);
    if (effects !== s.activeEffects) s = deriveRates({ ...s, activeEffects: effects });
    const bonuses = getBonuses(s.completedResearch);
    const produced = accrueResources(s.resources, s.producers, dt, bonuses, withPetMods(getEffectMods(s.activeEffects), s));
    const fuel = burnFuel(produced, s.activeGenerators, dt, bonuses);
    s = { ...s, resources: fuel.resources, activeGenerators: fuel.generators };
    if (fuel.deactivated.length) {
      s = deriveRates(s);
      report.deactivated.push(...fuel.deactivated);
      for (const id of fuel.depleted) if (!report.depleted.includes(id)) report.depleted.push(id);
    }
    const gained = s.energyPerSecond * dt;
    const levelBefore = getPlayerLevel(s.lifetimeEnergy ?? 0).level;
    s = { ...s, energy: s.energy + gained, lifetimeEnergy: (s.lifetimeEnergy ?? 0) + gained };
    if (getPlayerLevel(s.lifetimeEnergy).level !== levelBefore) s = deriveRates(s); // level bonus changed
    report.energyGained += gained;
    report.seconds += dt;
    s = finishResearch(s, endTime - left * 1000, report);
  }
  if (report.depleted.length) {
    const merged = [...new Set([...state.depletedResources, ...report.depleted])];
    s = { ...s, depletedResources: merged };
  }
  return { state: s, report };
}

function finishResearch(s: GameState, now: number, report: TimeReport): GameState {
  const finish = researchFinishTime(s);
  if (finish === null || now < finish) return s;
  report.completedResearch.push(s.currentResearch!.id);
  return deriveRates(completeResearch(s));
}

/**
 * Recomputes the cached derived values (energy rate, room used) from built
 * generators and research bonuses. The single place these are calculated.
 */
export function deriveRates(input: GameState): GameState {
  // new machines are pinned where they land, so nothing on the map moves by itself (1.17)
  const mapPins = settledPins(input);
  const state = mapPins === input.mapPins ? input : { ...input, mapPins };
  const mods = { ...withPetMods(getEffectMods(state.activeEffects), state), placement: getPlacementBonuses(state) };
  const energyPerSecond = calculateEnergyRate(state.activeGenerators, getEnergyBonuses(state), mods);
  const granted = getGrantedProducers(state.completedResearch);
  const roomUsed =
    state.activeGenerators.reduce((sum, g) => sum + (GENERATORS[g.type]?.roomCost ?? 0), 0) +
    PRODUCER_IDS.reduce(
      (sum, id) => sum + Math.max(0, (state.producers[id] ?? 0) - (granted[id] ?? 0)) * PRODUCERS[id].roomCost,
      0,
    );
  if (energyPerSecond === state.energyPerSecond && roomUsed === state.roomUsed) return state;
  return { ...state, energyPerSecond, roomUsed };
}
