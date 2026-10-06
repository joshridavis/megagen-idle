import { GENERATOR_TYPES, GENERATORS, UPGRADES } from '../data/generators';
import { createInitialState } from '../data/initialState';
import { PRODUCER_IDS, PRODUCERS } from '../data/producers';
import { RESEARCH } from '../data/research';
import { ROOM_TIERS } from '../data/rooms';
import type { Bonuses } from '../types/bonus';
import { GeneratorType } from '../types/generator';
import type { ProducerId } from '../types/resource';
import type { GameState, ResourceId } from '../types/state';
import { getBonuses, getClickValue } from '../utils/bonuses';
import { NO_MODS } from '../utils/effectMods';
import { hasSpotFor, layoutSite, terrainOfCell, withPlacementMods } from '../utils/siteMap';
import { zoneFor } from '../utils/mapTerrain';
import { getCompletion } from '../utils/completion';
import {
  buildGenerator,
  generatorScrapRefund,
  getBuildBlock,
  getGeneratorStats,
  getUpgradeBlock,
  getUpgradeCost,
  scrapGenerator,
  scrapGenerators,
  upgradeGain,
  upgradeGenerator,
} from '../utils/generatorSystem';
import { buildProducer, getProducerBlock } from '../utils/producerSystem';
import { canStartResearch, getResearchDuration, getUnlockedGeneratorTypes, startResearch } from '../utils/researchSystem';
import { addResources, canAfford, getFuelUseRates, getProductionRates } from '../utils/resourceSystem';
import { canExpandRoom, expandRoom, getNextRoomTier } from '../utils/roomSystem';
import { advanceTime } from '../utils/simulation';
import { buyPerk, canDeliver, claimContract, deliverContract, perkCost, updateContracts } from '../utils/contracts';
import { CONTRACT_MILESTONES, PERK_IDS } from '../data/contracts';
import { seededRng } from '../utils/rng';
import { PETS } from '../data/pets';
import { EVENTS_BY_ID } from '../data/events';
import { activePets, addPet, buyPetSlot, canFeed, feedCost, feedPet, nextPetSlot, petClickBonus, petSlotBlock, petSlots, updatePets } from '../utils/pets';
import type { PetId } from '../data/pets';
import { eventRatePerHour } from '../utils/randomEvents';
import { deriveRates } from '../utils/simulation';
import { unlockAchievements } from '../utils/achievements';
import { ACHIEVEMENTS } from '../data/achievements';
import { DECORATION_COPIES_GOAL, DECORATIONS } from '../data/decorations';
import { boughtCount, decorationPrice, isDecorationUnlocked, machineTiles, placeBlock, placeDecoration, totalBought } from '../utils/decorations';

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
  /** Seed for contract offers (the run stays deterministic). */
  seed: number;
}

export const DEFAULT_SIM: SimOptions = { hours: 400, stepSeconds: 60, clicksPerSecond: 2, clickMinutes: 10, stopAtCompletion: true, seed: 1 };

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
  samples: { hours: number; energyPerSecond: number; completion: number; room: string; lifetimeEnergy: number }[];
  finalState: GameState;
}

const T0 = 1_700_000_000_000;

/** Energy per second per unit of room, the greedy player's measure of a generator. */
const perRoom = (t: GeneratorType) => GENERATORS[t].energyPerSecond / GENERATORS[t].roomCost;

/**
 * When a zone-bound generator finds no free spot, scraps the weakest plants
 * standing in that zone (at most 6, each clearly weaker per room) until it
 * would fit. Returns the state after scrapping, or null if that does not help
 * or the build is not affordable anyway.
 */
function makeZoneSpot(s: GameState, t: GeneratorType, b: Bonuses): GameState | null {
  const stats = getGeneratorStats(t, b);
  if (s.energy < stats.energyCost * 1.1 || !canAfford(s.resources, stats.buildCost)) return null;
  const zone = zoneFor(t);
  if (!zone) return null;
  const onZone = new Set(
    layoutSite(s)
      .placed.filter((p) => p.kind === 'generator' && p.cells.some((c) => terrainOfCell(c) === zone))
      .map((p) => p.id),
  );
  // only machines that belong in the zone block it: the others make way by themselves
  const victims = s.activeGenerators
    .filter((g) => onZone.has(g.id) && zoneFor(g.type) === zone && perRoom(g.type) * 1.5 <= perRoom(t) && !isBeingRaised(s, g))
    .sort((x, y) => perRoom(x.type) - perRoom(y.type))
    .slice(0, 6);
  // a search that found no spot fails again until the site changes (speed: it
  // ran every step while a zone was full)
  const site = [s.activeGenerators, s.producers, s.roomCapacity, s.mapPins];
  if (zoneMiss && zoneMiss.type === t && zoneMiss.site.every((x, i) => x === site[i])) return null;
  const ids: string[] = [];
  for (const g of victims) {
    ids.push(g.id);
    const tried = scrapGenerators(s, ids);
    if (hasSpotFor(tried, t)) return tried;
  }
  zoneMiss = { type: t, site };
  return null;
}
let zoneMiss: { type: GeneratorType; site: unknown[] } | null = null;
let roomMiss: { type: GeneratorType; site: unknown[] } | null = null;

/** The highest-level generator of a type that is not maxed yet: the one the completionist raises. */
function isBeingRaised(s: GameState, g: GameState['activeGenerators'][number]): boolean {
  if ((s.records.bestLevel[g.type] ?? 0) >= maxLevelOf(g.type)) return false;
  const top = s.activeGenerators.filter((x) => x.type === g.type).sort((a, b) => b.level - a.level)[0];
  return top?.id === g.id;
}

/** The simulated player keeps fuel production this far above what burns: 50% and at least 6 per hour. */
const FUEL_SURPLUS = 1.5;
const MIN_FUEL_SURPLUS_PER_S = 6 / 3600;

/** Builds a producer for the first fuel that is burned faster than made, scrapping a weak generator for room if needed. */
function fixFuelShortage(s: GameState): GameState {
  const b = getBonuses(s.completedResearch);
  // demand counts plants switched off for lack of fuel: they want to run
  const wanting = s.activeGenerators.map((g) => (g.outOfFuel ? { ...g, isActive: true } : g));
  const demand = getFuelUseRates(wanting, b);
  const supply = getProductionRates(s.producers, b, withPlacementMods(NO_MODS, s));
  for (const id of Object.keys(PRODUCER_FOR) as ResourceId[]) {
    // keep a surplus: builds, upgrades and research also cost fuel
    if (demand[id] === 0 || supply[id] >= Math.max(demand[id] * FUEL_SURPLUS, demand[id] + MIN_FUEL_SURPLUS_PER_S)) continue;
    const pid = PRODUCER_FOR[id];
    const block = getProducerBlock(s, pid, b);
    if (block === null) return buildProducer(s, pid, b);
    if (block !== 'room') continue;
    // the weakest plant makes room (one that burns this fuel helps twice: less demand, more room)
    const weakest = [...s.activeGenerators].filter((g) => !isBeingRaised(s, g)).sort((x, y) => perRoom(x.type) - perRoom(y.type))[0];
    if (!weakest) continue;
    const freed = scrapGenerator(s, weakest.id);
    const built = buildProducer(freed, pid, b);
    if (built !== freed) return built;
  }
  return s;
}

/** Net per-second balance of one resource with the current setup. */
function netRate(s: GameState, id: ResourceId): number {
  const b = getBonuses(s.completedResearch);
  return getProductionRates(s.producers, b, withPlacementMods(NO_MODS, s))[id] - getFuelUseRates(s.activeGenerators, b)[id];
}

const PRODUCER_FOR: Record<ResourceId, ProducerId> = { metal: 'mine', stone: 'quarry', coal: 'coalMine', naturalGas: 'gasWell', oil: 'oilRig', uranium: 'uraniumMine', deuterium: 'deuteriumExtractor' };

/**
 * Deterministic greedy player:
 * 1. starts the cheapest-to-finish affordable research (unlocks first);
 * 2. builds the unlocked generator with the best energy per room that it can
 *    afford and fuel (scrapping the weakest generator for it when room is short);
 * 3. buys a producer for whatever resource blocks its next build;
 * 4. upgrades the generator with the best gain per energy when energy is plentiful;
 * 5. expands room when it is nearly full.
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
  const unlocked = getUnlockedGeneratorTypes(s.completedResearch);
  // 1a. fuel short (0.34): a fuel burned faster than it is made gets another
  // producer; when the site is full, the weakest generator that does not burn
  // it makes room, as a player would
  s = fixFuelShortage(s);
  // 1b. end game: own enough generators at once for the count achievements,
  // before the build loop below would trade the small ones back for big plants
  if (!getNextRoomTier(s.expansionLevel) && RESEARCH.every((r) => s.completedResearch.includes(r.id))) {
    const counted = chaseGeneratorCount(s, unlocked, bonuses());
    if (counted !== s) return counted;
  }
  // 2. generators, best per room first
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
    if (block === 'site') {
      // its zone is full (1.05): make room there by scrapping weaker plants in the zone (1.23)
      const made = makeZoneSpot(s, t, bonuses());
      if (made) {
        const built = buildGenerator(made, t, unlocked, bonuses());
        if (built !== made) return built;
      }
      continue;
    }
    if (block === 'room') {
      const weakest = [...s.activeGenerators].sort((a, b) => perRoom(a.type) - perRoom(b.type))[0];
      if (weakest && perRoom(t) >= 1.5 * perRoom(weakest.type)) {
        const stats = getGeneratorStats(t, bonuses());
        if (s.energy >= stats.energyCost * 1.1) {
          let free = s.roomCapacity - s.roomUsed;
          const scrap: string[] = [];
          for (const g of [...s.activeGenerators].sort((a, b) => perRoom(a.type) - perRoom(b.type))) {
            if (free >= stats.roomCost || perRoom(g.type) * 1.5 > perRoom(t)) break;
            // keep the one generator being raised to max level for completion (only that one)
            if (isBeingRaised(s, g) && RESEARCH.every((r) => s.completedResearch.includes(r.id))) continue;
            scrap.push(g.id);
            free += GENERATORS[g.type].roomCost;
          }
          // nothing to gain if it still would not fit, or could not be paid for
          // even with the scrap refunds; an attempt that found no spot fails
          // again until the site changes (speed: layouts are slow on a big
          // site, and this ran every step)
          const site = [s.activeGenerators, s.producers, s.roomCapacity, s.mapPins];
          const missed = roomMiss && roomMiss.type === t && roomMiss.site.every((x, i) => x === site[i]);
          let refundEnergy = 0;
          let refunded = s.resources;
          for (const g of s.activeGenerators) {
            if (!scrap.includes(g.id)) continue;
            const r = generatorScrapRefund(g, bonuses());
            refundEnergy += r.energy;
            refunded = addResources(refunded, r.resources);
          }
          const payable = s.energy + refundEnergy >= stats.energyCost && canAfford(refunded, stats.buildCost);
          if (free >= stats.roomCost && payable && !missed) {
            const tried = scrapGenerators(s, scrap);
            const built = buildGenerator(tried, t, unlocked, bonuses());
            if (built !== tried) return built;
            // room is free now, but its zone may still be full (1.23)
            if (getBuildBlock(tried, t, unlocked, bonuses()) === 'site') {
              const made = makeZoneSpot(tried, t, bonuses());
              const built2 = made && buildGenerator(made, t, unlocked, bonuses());
              if (made && built2 && built2 !== made) return built2;
              // remember only a missing spot, not a lack of energy or resources
              if (!made && tried.energy >= stats.energyCost * 1.1 && canAfford(tried.resources, stats.buildCost)) roomMiss = { type: t, site };
            }
          }
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
  // Saving for room: when room is nearly full and another tier exists, buy
  // producers for what the tier lacks and keep energy for it.
  const nextTier = getNextRoomTier(s.expansionLevel);
  const savingForRoom = !!nextTier && s.roomCapacity - s.roomUsed < 10;
  if (savingForRoom && nextTier) {
    const short = (Object.keys(nextTier.resources) as ResourceId[]).find((id) => s.resources[id] < (nextTier.resources[id] ?? 0));
    if (short && getProducerBlock(s, PRODUCER_FOR[short], bonuses()) === null) s = buildProducer(s, PRODUCER_FOR[short], bonuses());
  }
  // 4a. completionist (0.82): with research and room done, first bring every
  // generator type to max level, building one of each type it lacks.
  const chasing = !nextTier && RESEARCH.every((r) => s.completedResearch.includes(r.id)) && GENERATOR_TYPES.some((t) => (s.records.bestLevel[t] ?? 0) < maxLevelOf(t));
  if (chasing) {
    const chased = chaseMaxLevels(s, unlocked, bonuses());
    if (chased !== s) return chased;
  }
  // 4. upgrades: best energy gain per energy spent, only with a comfortable surplus
  // (and never with energy set aside for the next room tier)
  const reserve = savingForRoom && nextTier ? nextTier.energy : 0;
  const upgradable = s.activeGenerators
    .filter((g) => getUpgradeBlock(s, g.id, bonuses()) === null)
    .map((g) => ({ g, cost: getUpgradeCost(g.type, g.level, bonuses()).energy, gain: upgradeGain(g.type, g.level) }))
    .sort((a, b) => b.gain / b.cost - a.gain / a.cost)[0];
  const keepsTierResources =
    !savingForRoom ||
    !nextTier ||
    !upgradable ||
    Object.entries(getUpgradeCost(upgradable.g.type, upgradable.g.level, bonuses()).resources).every(
      ([id, n]) => s.resources[id as ResourceId] - (n ?? 0) >= (nextTier.resources[id as ResourceId] ?? 0),
    );
  // while raising a type to max level, save for that one instead of spreading upgrades (0.34)
  if (!chasing && upgradable && keepsTierResources && s.energy - reserve > upgradable.cost * 2) s = upgradeGenerator(s, upgradable.g.id, bonuses());
  // 4b. Grid Contracts (0.86): claim points until every perk is bought, then
  // materials; deliver when it does not eat into savings for the next room tier.
  for (const c of s.contracts.open) {
    if (c.status === 'complete') s = claimContract(s, c.id, PERK_IDS.some((id) => perkCost(s, id) !== null) ? 'points' : 'bundle', now);
  }
  for (const id of PERK_IDS) s = buyPerk(s, id);
  for (const c of s.contracts.open) {
    if (!canDeliver(s, c)) continue;
    const afterEnergy = s.energy - (c.energy ?? 0);
    const keepsTier =
      !savingForRoom ||
      !nextTier ||
      (afterEnergy >= nextTier.energy &&
        Object.entries(c.resources ?? {}).every(([rid, n]) => s.resources[rid as ResourceId] - (n ?? 0) >= (nextTier.resources[rid as ResourceId] ?? 0)));
    if (keepsTier) s = deliverContract(s, c.id);
  }
  // 4c. pets (0.92): feed any pet that can grow when it keeps room-tier savings;
  // keep the adult with the biggest energy-type bonus active
  for (const def of PETS) {
    const cost = feedCost(s, def.id);
    if (cost === null || !canFeed(s, def.id)) continue;
    const left = def.food === 'energy' ? s.energy - cost : s.resources[def.food] - cost;
    const reserveFood = savingForRoom && nextTier ? (def.food === 'energy' ? nextTier.energy : (nextTier.resources[def.food] ?? 0)) : 0;
    if (left >= reserveFood) s = feedPet(s, def.id, now);
  }
  // active pets (1.59): buy the 2nd and 3rd slot with plenty of energy to
  // spare, and keep the pets with the widest bonuses in them
  const slot = nextPetSlot(s);
  if (slot && !petSlotBlock(s) && s.energy - reserve >= slot.energy * PET_SLOT_COMFORT) s = buyPetSlot(s);
  const want = SIM_PETS.filter((id) => s.pets.owned[id]).slice(0, petSlots(s));
  if (want.length && want.join() !== activePets(s).join()) s = { ...s, pets: { ...s.pets, active: want[0], extra: want.slice(1) } };
  // 4d. decorations (1.53), for completion: the cheapest one still needed,
  // when it costs little next to the energy on hand
  s = buyDecoration(s, reserve);
  // 5. room
  const tier = getNextRoomTier(s.expansionLevel);
  if (tier && s.roomCapacity - s.roomUsed < 10 && canExpandRoom(s)) s = expandRoom(s, undefined, now);
  else if (tier && canExpandRoom(s) && s.energy > tier.energy * 3) s = expandRoom(s, undefined, now);
  return s;
}

/** The simulated player buys a pet slot only with this many times its price in hand (above room savings). */
const PET_SLOT_COMFORT = 1.5;
/** Pets the simulated player keeps active, best first: all energy, all production, uranium. */
const SIM_PETS: PetId[] = ['cat', 'robodog', 'jellyfish'];

/** The simulated player buys a decoration only with this many times its price in hand (above room savings). */
const DECOR_COMFORT = 4;
let decorMiss: unknown[] | null = null;

/**
 * Buys and places the cheapest decoration completion still needs (every kind
 * once, then copies up to the goal) on a free tile. A site with no free tile
 * is not searched again until it changes (speed).
 */
function buyDecoration(s: GameState, reserve: number): GameState {
  const total = totalBought(s);
  const options = DECORATIONS.filter((d) => isDecorationUnlocked(s, d.id) && (boughtCount(s, d.id) === 0 || total < DECORATION_COPIES_GOAL)).sort(
    (a, b) => decorationPrice(s, a.id) - decorationPrice(s, b.id),
  );
  const d = options[0];
  if (!d || s.energy - reserve < decorationPrice(s, d.id) * DECOR_COMFORT) return s;
  const site = [s.activeGenerators, s.producers, s.roomCapacity, s.mapPins, s.mapDecorations];
  if (decorMiss && decorMiss.every((x, i) => x === site[i])) return s;
  const map = layoutSite(s);
  const taken = machineTiles(map);
  for (let c = 0; c < map.capacity; c++) {
    if (taken.has(c) || s.mapDecorations[c]) continue;
    for (const o of options) {
      if (s.energy - reserve < decorationPrice(s, o.id) * DECOR_COMFORT) break;
      if (placeBlock(s, o.id, c, map)) continue;
      const next = placeDecoration(s, o.id, c);
      if (next) return { ...s, ...next };
    }
    break;
  }
  decorMiss = site;
  return s;
}

const maxLevelOf = (t: GeneratorType) => GENERATORS[t].maxLevel ?? UPGRADES.maxLevel;

function chaseMaxLevels(s: GameState, unlocked: ReturnType<typeof getUnlockedGeneratorTypes>, b: Bonuses): GameState {
  const t = GENERATOR_TYPES.find((type) => (s.records.bestLevel[type] ?? 0) < maxLevelOf(type));
  if (!t) return s;
  const own = s.activeGenerators.filter((g) => g.type === t).sort((x, y) => y.level - x.level)[0];
  if (own) return getUpgradeBlock(s, own.id, b) === null ? upgradeGenerator(s, own.id, b) : s;
  if (s.energy < getGeneratorStats(t, b).energyCost) return s;
  // free room by scrapping the weakest generators whose type is already maxed
  // or has spare copies
  const need = getGeneratorStats(t, b).roomCost;
  let free = s.roomCapacity - s.roomUsed;
  const left: Record<string, number> = {};
  for (const g of s.activeGenerators) left[g.type] = (left[g.type] ?? 0) + 1;
  const scrap: string[] = [];
  for (const g of [...s.activeGenerators].sort((x, y) => perRoom(x.type) - perRoom(y.type))) {
    if (free >= need) break;
    if ((s.records.bestLevel[g.type] ?? 0) >= maxLevelOf(g.type) || left[g.type] > 1) {
      scrap.push(g.id);
      left[g.type]--;
      free += GENERATORS[g.type].roomCost;
    }
  }
  if (free < need) return s;
  const tried = scrapGenerators(s, scrap);
  const built = buildGenerator(tried, t, unlocked, b);
  return built === tried ? s : built;
}

/**
 * Once every type is maxed, owns enough generators at once for the largest
 * "own N generators" achievement: Solar Panels, scrapping the weakest
 * non-solar plant for room when needed (the normal loop rebuilds big plants
 * afterwards). The map made reaching it by chance unreliable (1.17).
 */
function chaseGeneratorCount(s: GameState, unlocked: ReturnType<typeof getUnlockedGeneratorTypes>, b: Bonuses): GameState {
  if (GENERATOR_TYPES.some((t) => (s.records.bestLevel[t] ?? 0) < maxLevelOf(t))) return s;
  const goal = ACHIEVEMENTS.filter((x) => x.metric === 'generators' && s.achievements[x.id] === undefined).sort((x, y) => x.target - y.target)[0];
  if (!goal || s.activeGenerators.length >= goal.target) return s;
  const solar = getGeneratorStats(GeneratorType.SOLAR, b);
  if (s.energy < solar.energyCost * 2) return s;
  let tried = s;
  if (tried.roomCapacity - tried.roomUsed < solar.roomCost) {
    const weakest = [...s.activeGenerators].filter((g) => g.type !== GeneratorType.SOLAR).sort((x, y) => perRoom(x.type) - perRoom(y.type))[0];
    if (weakest) tried = scrapGenerator(tried, weakest.id);
  }
  const built = buildGenerator(tried, GeneratorType.SOLAR, unlocked, b);
  return built === tried ? s : built;
}

/** Runs the deterministic greedy player and records milestones. */
export function runBalanceSim(opts: Partial<SimOptions> = {}, stallHours = 8): SimResult {
  const o = { ...DEFAULT_SIM, ...opts };
  let s = createInitialState(T0);
  let t = T0;
  const rng = seededRng(o.seed);
  const milestones: Milestone[] = [];
  const seen = new Set<string>();
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
    for (const t of s.records.builtTypes) {
      hit('firstGenerator', 'First generator built');
      hit(`generator:${t}`, `First ${GENERATORS[t].name}`);
    }
    for (const t of GENERATOR_TYPES) {
      const best = s.records.bestLevel[t] ?? 0;
      // every new best level is a visible step (Lv n/10 in the generator list)
      for (let lv = 2; lv < Math.min(best + 1, maxLevelOf(t)); lv++) hit(`level${lv}:${t}`, `${GENERATORS[t].name} at level ${lv}`);
      if (best >= maxLevelOf(t)) hit(`maxed:${t}`, `${GENERATORS[t].name} at max level`);
    }
    // contracts: every 5 done is progress (stall detection); milestones and perks are listed
    for (let n = 5; n <= s.contracts.done; n += 5) hit(`contracts5:${n}`, `${n} contracts`);
    for (const n of CONTRACT_MILESTONES) if (s.contracts.done >= n) hit(`contracts:${n}`, `${n} contracts completed`);
    if (PERK_IDS.every((id) => perkCost(s, id) === null)) hit('perks:all', 'Every contract perk bought');
    for (const a of ACHIEVEMENTS) if (s.achievements[a.id] !== undefined) hit(`ach:${a.id}`, `Achievement: ${a.name}`);
    for (const def of PETS) {
      const pet = s.pets.owned[def.id];
      if (pet) hit(`pet:${def.id}`, `Pet found: ${def.name}`);
      if (pet && pet.stage >= 2) hit(`petYoung:${def.id}`, `${def.name} young`);
      if (pet && pet.stage >= 3) hit(`petAdult:${def.id}`, `${def.name} fully grown`);
    }
    for (let n = 2; n <= petSlots(s); n++) hit(`petSlot:${n}`, `Active pet slot ${n}`);
    for (const id of PRODUCER_IDS) if ((s.producers[id] ?? 0) > 0) hit(`producer:${id}`, `Has ${/^[AEIOU]/.test(PRODUCERS[id].name) ? 'an' : 'a'} ${PRODUCERS[id].name}`);
    for (let i = 1; i <= s.expansionLevel; i++) hit(`room:${i}`, `Room expansion ${i} of ${ROOM_TIERS.length}`);
    s.completedResearch.forEach((id, i) => {
      if (i === 0) hit('firstResearch', 'First research completed');
      hit(`research:${id}`, `Research: ${RESEARCH.find((r) => r.id === id)?.name ?? id}`);
    });
    const c = getCompletion(s).ratio;
    for (const q of [25, 50, 75, 100]) if (c * 100 >= q) hit(`completion:${q}`, `${q}% completion`);
    if (step % Math.round(3600 / o.stepSeconds) === 0) {
      samples.push({ hours: (t - T0) / 3_600_000, energyPerSecond: s.energyPerSecond, completion: c, room: `${s.roomUsed}/${s.roomCapacity}`, lifetimeEnergy: s.lifetimeEnergy });
    }
    if (o.stopAtCompletion && c >= 1) break;
    // time passes; the player clicks early on
    const clicking = (t - T0) / 60_000 < o.clickMinutes;
    if (clicking) {
      const gained = o.clicksPerSecond * o.stepSeconds * getClickValue(s.completedResearch, s.energyPerSecond, petClickBonus(s));
      s = { ...s, energy: s.energy + gained, lifetimeEnergy: s.lifetimeEnergy + gained };
    }
    t += o.stepSeconds * 1000;
    s = { ...advanceTime(s, o.stepSeconds, t).state, lastSavedTimestamp: t };
    s = updateContracts(s, t, rng).state;
    // pets: condition finds and growth; event pets join at their expected time (no random events in the simulator)
    const petsBefore = s.pets;
    s = updatePets(s, t).state;
    for (const def of PETS) {
      if (def.find.kind !== 'event' || s.pets.owned[def.id]) continue;
      const ev = EVENTS_BY_ID[def.find.eventId];
      if ((t - T0) / 3_600_000 >= 1 / eventRatePerHour(ev)) s = addPet(s, def.id, t);
    }
    if (s.pets !== petsBefore) s = deriveRates(s);
    s = unlockAchievements(s, t).state;
  }
  const hours = (t - T0) / 3_600_000;
  const times = [0, ...milestones.map((m) => m.hours), hours].sort((a, b) => a - b);
  const gaps: [number, number][] = [];
  for (let i = 1; i < times.length; i++) if (times[i] - times[i - 1] > stallHours) gaps.push([times[i - 1], times[i]]);
  return { milestones, hours, completion: getCompletion(s).ratio, gaps, samples, finalState: s };
}

export const ALL_GENERATOR_TYPES = GENERATOR_TYPES;
