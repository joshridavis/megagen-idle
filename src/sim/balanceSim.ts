import { GENERATOR_TYPES, GENERATORS } from '../data/generators';
import { createInitialState } from '../data/initialState';
import { PRODUCER_IDS, PRODUCERS } from '../data/producers';
import { RESEARCH } from '../data/research';
import { ROOM_TIERS } from '../data/rooms';
import type { GeneratorType } from '../types/generator';
import type { ProducerId } from '../types/resource';
import type { GameState, ResourceId } from '../types/state';
import { getBonuses, getClickValue } from '../utils/bonuses';
import { getCompletion } from '../utils/completion';
import { buildGenerator, getBuildBlock, getGeneratorStats, scrapGenerator } from '../utils/generatorSystem';
import { buildProducer, getProducerBlock } from '../utils/producerSystem';
import { canStartResearch, getResearchDuration, getUnlockedGeneratorTypes, startResearch } from '../utils/researchSystem';
import { getFuelUseRates, getProductionRates } from '../utils/resourceSystem';
import { canExpandRoom, expandRoom, getNextRoomTier } from '../utils/roomSystem';
import { advanceTime } from '../utils/simulation';

export interface SimOptions {
  /** Simulated hours to run at most. */
  hours: number;
  /** Seconds per decision step. */
  stepSeconds: number;
  /** The player clicks this many times per second during the first `clickMinutes`. */
  clicksPerSecond: number;
  clickMinutes: number;
  /** Stop early once 100% completion is reached. */
  stopAtCompletion: boolean;
}

export const DEFAULT_SIM: SimOptions = { hours: 400, stepSeconds: 60, clicksPerSecond: 2, clickMinutes: 10, stopAtCompletion: true };

export interface Milestone {
  id: string;
  label: string;
  hours: number;
}

export interface SimResult {
  milestones: Milestone[];
  /** Hours of simulated play reached. */
  hours: number;
  completion: number;
  /** Periods with no new milestone longer than the stall threshold: [fromHours, toHours]. */
  gaps: [number, number][];
  samples: { hours: number; energyPerSecond: number; completion: number; room: string }[];
  finalState: GameState;
}

const T0 = 1_700_000_000_000;

/** Energy per second per unit of room, the greedy player's measure of a generator. */
const perRoom = (t: GeneratorType) => GENERATORS[t].energyPerSecond / GENERATORS[t].roomCost;

/** Net per-second balance of one resource with the current setup. */
function netRate(s: GameState, id: ResourceId): number {
  const b = getBonuses(s.completedResearch);
  return getProductionRates(s.producers, b)[id] - getFuelUseRates(s.activeGenerators, b)[id];
}

const PRODUCER_FOR: Record<ResourceId, ProducerId> = { metal: 'mine', stone: 'quarry', coal: 'coalMine', naturalGas: 'gasWell' };

/**
 * Deterministic greedy player:
 * 1. starts the cheapest-to-finish affordable research (unlocks first);
 * 2. builds the unlocked generator with the best energy per room that it can
 *    afford and fuel (scrapping the weakest generator for it when room is short);
 * 3. buys a producer for whatever resource blocks its next build;
 * 4. expands room when it is nearly full.
 */
function act(s: GameState, now: number): GameState {
  const bonuses = () => getBonuses(s.completedResearch);
  // 1. research
  if (!s.currentResearch) {
    const options = RESEARCH.filter((r) => canStartResearch(s, r.id)).sort(
      (a, b) =>
        Number(!(a.unlocks.generators || a.unlocks.producers)) - Number(!(b.unlocks.generators || b.unlocks.producers)) ||
        getResearchDuration(a, bonuses()) - getResearchDuration(b, bonuses()),
    );
    if (options[0]) s = startResearch(s, options[0].id, now);
  }
  // 2. generators, best per room first
  const unlocked = getUnlockedGeneratorTypes(s.completedResearch);
  const candidates = [...unlocked].sort((a, b) => perRoom(b) - perRoom(a));
  let wanted: GeneratorType | null = null;
  for (const t of candidates) {
    const fuel = GENERATORS[t].maintenanceCost;
    if (fuel) {
      const ok = Object.entries(fuel).every(([id, perHour]) => netRate(s, id as ResourceId) >= ((perHour ?? 0) / 3600) * (1 - bonuses().fuelEfficiency));
      if (!ok) {
        // keep a producer for this fuel in mind
        const res = Object.keys(fuel)[0] as ResourceId;
        if (getProducerBlock(s, PRODUCER_FOR[res], bonuses()) === null) s = buildProducer(s, PRODUCER_FOR[res], bonuses());
        continue;
      }
    }
    const block = getBuildBlock(s, t, unlocked, bonuses());
    if (block === null) {
      s = buildGenerator(s, t, unlocked, bonuses());
      return s;
    }
    if (block === 'room') {
      const weakest = [...s.activeGenerators].sort((a, b) => perRoom(a.type) - perRoom(b.type))[0];
      if (weakest && perRoom(t) >= 1.5 * perRoom(weakest.type)) {
        const stats = getGeneratorStats(t, bonuses());
        if (s.energy >= stats.energyCost * 1.1) {
          let tried = s;
          for (const g of [...s.activeGenerators].sort((a, b) => perRoom(a.type) - perRoom(b.type))) {
            if (tried.roomCapacity - tried.roomUsed >= stats.roomCost || perRoom(g.type) * 1.5 > perRoom(t)) break;
            tried = scrapGenerator(tried, g.id);
          }
          const built = buildGenerator(tried, t, unlocked, bonuses());
          if (built !== tried) return built;
        }
      }
    }
    if (!wanted) wanted = t;
  }
  // 3. producers for the resource blocking the wanted build
  if (wanted) {
    const cost = getGeneratorStats(wanted, bonuses()).buildCost;
    const short = (Object.keys(cost) as ResourceId[]).find((id) => s.resources[id] < (cost[id] ?? 0));
    if (short && getProducerBlock(s, PRODUCER_FOR[short], bonuses()) === null) s = buildProducer(s, PRODUCER_FOR[short], bonuses());
  }
  // gas wells once available (completion and fuel)
  if (s.producers.gasWell < 2 && getProducerBlock(s, 'gasWell', bonuses()) === null) s = buildProducer(s, 'gasWell', bonuses());
  // 4. room
  const tier = getNextRoomTier(s.expansionLevel);
  if (tier && s.roomCapacity - s.roomUsed < 10 && canExpandRoom(s)) s = expandRoom(s, undefined, now);
  else if (tier && canExpandRoom(s) && s.energy > tier.energy * 3) s = expandRoom(s, undefined, now);
  return s;
}

/** Runs the deterministic greedy player and records milestones. */
export function runBalanceSim(opts: Partial<SimOptions> = {}, stallHours = 8): SimResult {
  const o = { ...DEFAULT_SIM, ...opts };
  let s = createInitialState(T0);
  let t = T0;
  const milestones: Milestone[] = [];
  const seen = new Set<string>();
  const everBuilt = new Set<string>();
  const samples: SimResult['samples'] = [];
  const hit = (id: string, label: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    milestones.push({ id, label, hours: (t - T0) / 3_600_000 });
  };
  const totalSteps = Math.ceil((o.hours * 3600) / o.stepSeconds);
  for (let step = 0; step < totalSteps; step++) {
    // decisions, several per step
    for (let k = 0; k < 6; k++) {
      const before = s;
      s = act(s, t);
      if (s === before) break;
    }
    for (const g of s.activeGenerators) {
      if (!everBuilt.has(g.type)) {
        everBuilt.add(g.type);
        if (everBuilt.size === 1) hit('firstGenerator', 'First generator built');
        hit(`generator:${g.type}`, `First ${GENERATORS[g.type].name}`);
      }
    }
    for (const id of PRODUCER_IDS) if ((s.producers[id] ?? 0) > 0) hit(`producer:${id}`, `Has a ${PRODUCERS[id].name}`);
    for (let i = 1; i <= s.expansionLevel; i++) hit(`room:${i}`, `Room expansion ${i} of ${ROOM_TIERS.length}`);
    s.completedResearch.forEach((id, i) => {
      if (i === 0) hit('firstResearch', 'First research completed');
      hit(`research:${id}`, `Research: ${RESEARCH.find((r) => r.id === id)?.name ?? id}`);
    });
    const c = getCompletion(s, everBuilt).ratio;
    for (const q of [25, 50, 75, 100]) if (c * 100 >= q) hit(`completion:${q}`, `${q}% completion`);
    if (step % Math.round(3600 / o.stepSeconds) === 0) {
      samples.push({ hours: (t - T0) / 3_600_000, energyPerSecond: s.energyPerSecond, completion: c, room: `${s.roomUsed}/${s.roomCapacity}` });
    }
    if (o.stopAtCompletion && c >= 1) break;
    // time passes; the player clicks early on
    const clicking = (t - T0) / 60_000 < o.clickMinutes;
    if (clicking) s = { ...s, energy: s.energy + o.clicksPerSecond * o.stepSeconds * getClickValue(s.completedResearch) };
    t += o.stepSeconds * 1000;
    s = { ...advanceTime(s, o.stepSeconds, t).state, lastSavedTimestamp: t };
  }
  const hours = (t - T0) / 3_600_000;
  const times = [0, ...milestones.map((m) => m.hours), hours].sort((a, b) => a - b);
  const gaps: [number, number][] = [];
  for (let i = 1; i < times.length; i++) if (times[i] - times[i - 1] > stallHours) gaps.push([times[i - 1], times[i]]);
  return { milestones, hours, completion: getCompletion(s, everBuilt).ratio, gaps, samples, finalState: s };
}

export const ALL_GENERATOR_TYPES = GENERATOR_TYPES;
