import {
  BASE_CONTRACT_SLOTS,
  CONTRACT_KINDS,
  CONTRACT_RESOURCES,
  CONTRACTS_UNLOCK_LEVEL,
  OFFER_INTERVAL_MINUTES,
  PERKS,
  REWARDS,
  type ContractKind,
  type PerkId,
} from '../data/contracts';
import { EVENTS_BY_ID } from '../data/events';
import type { Contract, GameState, ResourceId } from '../types/state';
import { getBonuses } from './bonuses';
import { canAfford, consumeResource, getProductionRates } from './resourceSystem';
import type { Rng } from './rng';

type S = GameState;
const HOUR = 3_600_000;

export const contractsUnlocked = (s: Pick<S, 'researchLevel'>) => s.researchLevel >= CONTRACTS_UNLOCK_LEVEL;
export const perkLevel = (s: Pick<S, 'contracts'>, id: PerkId) => s.contracts.perks[id] ?? 0;
export const contractSlots = (s: Pick<S, 'contracts'>) => BASE_CONTRACT_SLOTS + perkLevel(s, 'slot');
export const offerIntervalMs = (s: Pick<S, 'contracts'>) => (perkLevel(s, 'offers') ? 20 : OFFER_INTERVAL_MINUTES) * 60_000;
const deadlineFactor = (s: Pick<S, 'contracts'>) => (perkLevel(s, 'deadline') ? 1.5 : 1);
const rewardFactor = (s: Pick<S, 'contracts'>) => (perkLevel(s, 'rewards') ? 1.25 : 1);

/** Resources the player is producing now, the ones a delivery may ask for. */
function producedResources(s: S): { id: ResourceId; rate: number }[] {
  const rates = getProductionRates(s.producers, getBonuses(s.completedResearch));
  return CONTRACT_RESOURCES.filter((id) => rates[id] > 0).map((id) => ({ id, rate: rates[id] }));
}

/** A new contract sized to the player's current output. Pure, given the random source. */
export function generateContract(s: S, now: number, rng: Rng): Contract {
  const produced = producedResources(s);
  const kinds: ContractKind[] = produced.length >= 2 ? ['energy', 'resources', 'produce'] : ['energy', 'produce'];
  const kind = kinds[Math.floor(rng() * kinds.length) % kinds.length];
  const k = CONTRACT_KINDS[kind];
  const roll = rng();
  const minutes = k.minMinutes + roll * (k.maxMinutes - k.minMinutes);
  const tier = roll < 1 / 3 ? 1 : roll < 2 / 3 ? 2 : 3;
  const base: Omit<Contract, 'kind'> = {
    id: `c-${s.contracts.seq + 1}`,
    tier,
    deadline: now + k.deadlineHours * HOUR * deadlineFactor(s),
    status: 'open',
  };
  const eps = Math.max(s.energyPerSecond, 0.5);
  if (kind === 'energy') return { ...base, kind, energy: Math.round(Math.max(k.min, eps * minutes * 60)) };
  if (kind === 'produce') {
    return { ...base, kind, produce: Math.round(Math.max(k.min, eps * minutes * 60)), startLifetime: s.lifetimeEnergy };
  }
  // two different produced resources
  const first = Math.floor(rng() * produced.length) % produced.length;
  const second = (first + 1 + (Math.floor(rng() * (produced.length - 1)) % (produced.length - 1))) % produced.length;
  const resources: Partial<Record<ResourceId, number>> = {};
  for (const p of [produced[first], produced[second]]) resources[p.id] = Math.round(Math.max(k.min, p.rate * minutes * 60));
  return { ...base, kind, resources };
}

/** 0..1 progress of a contract. */
export function contractProgress(s: Pick<S, 'energy' | 'resources' | 'lifetimeEnergy'>, c: Contract): number {
  if (c.status === 'complete') return 1;
  if (c.kind === 'produce') return Math.min(1, (s.lifetimeEnergy - (c.startLifetime ?? 0)) / (c.produce ?? 1));
  const parts: number[] = [];
  if (c.energy) parts.push(Math.min(1, s.energy / c.energy));
  for (const [id, n] of Object.entries(c.resources ?? {})) parts.push(Math.min(1, s.resources[id as ResourceId] / (n ?? 1)));
  return parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0;
}

export function canDeliver(s: S, c: Contract): boolean {
  return c.status === 'open' && c.kind !== 'produce' && s.energy >= (c.energy ?? 0) && canAfford(s.resources, c.resources ?? {});
}

/** Hands over a delivery contract's energy and resources; it then waits for a reward choice. */
export function deliverContract(s: S, id: string): S {
  const c = s.contracts.open.find((x) => x.id === id);
  if (!c || !canDeliver(s, c)) return s;
  const paid = consumeResource(s.resources, c.resources ?? {});
  return {
    ...s,
    energy: s.energy - (c.energy ?? 0),
    resources: paid.resources,
    contracts: { ...s.contracts, open: s.contracts.open.map((x) => (x.id === id ? { ...x, status: 'complete' } : x)) },
  };
}

export type RewardChoice = 'bundle' | 'boost' | 'points';

/** What each reward choice gives for a finished contract. */
export function contractRewards(s: S, c: Contract) {
  const rates = getProductionRates(s.producers, getBonuses(s.completedResearch));
  const f = rewardFactor(s);
  const bundle: Partial<Record<ResourceId, number>> = {};
  for (const id of ['metal', 'stone', 'coal'] as ResourceId[]) {
    bundle[id] = Math.round(Math.max(REWARDS.bundleMin, rates[id] * REWARDS.bundleMinutes * 60) * f);
  }
  const boost = EVENTS_BY_ID[REWARDS.boostEventId].effect;
  const boostMinutes = (boost?.kind === 'timed' ? boost.minutes : 30) * f;
  return { bundle, boostMinutes, points: REWARDS.pointsByTier[c.tier - 1] ?? 1 };
}

/** Takes the chosen reward for a finished contract and closes it. */
export function claimContract(s: S, id: string, choice: RewardChoice, now: number): S {
  const c = s.contracts.open.find((x) => x.id === id);
  if (!c || c.status !== 'complete') return s;
  const r = contractRewards(s, c);
  const contracts = { ...s.contracts, open: s.contracts.open.filter((x) => x.id !== id), done: s.contracts.done + 1 };
  if (choice === 'points') return { ...s, contracts: { ...contracts, points: contracts.points + r.points } };
  if (choice === 'bundle') {
    const resources = { ...s.resources };
    for (const [rid, n] of Object.entries(r.bundle)) resources[rid as ResourceId] += n ?? 0;
    return { ...s, resources, contracts };
  }
  const until = now + r.boostMinutes * 60_000;
  const rest = (s.activeEffects ?? []).filter((a) => a.id !== REWARDS.boostEventId);
  return { ...s, activeEffects: [...rest, { id: REWARDS.boostEventId, until }], contracts };
}

/** Cost of the next level of a perk, or null when maxed. */
export function perkCost(s: Pick<S, 'contracts'>, id: PerkId): number | null {
  return PERKS[id].costs[perkLevel(s, id)] ?? null;
}

export function buyPerk(s: S, id: PerkId): S {
  const cost = perkCost(s, id);
  if (cost === null || s.contracts.points < cost) return s;
  return {
    ...s,
    contracts: { ...s.contracts, points: s.contracts.points - cost, perks: { ...s.contracts.perks, [id]: perkLevel(s, id) + 1 } },
  };
}

export interface ContractUpdate {
  state: S;
  expired: Contract[];
  completed: Contract[];
  offered: Contract[];
}

/**
 * Advances contracts to `now` (timestamp-based, offline too): finished
 * produce contracts complete, open ones past their deadline expire, and empty
 * slots fill with new offers on the offer timer.
 */
export function updateContracts(s: S, now: number, rng: Rng): ContractUpdate {
  const out: ContractUpdate = { state: s, expired: [], completed: [], offered: [] };
  if (!contractsUnlocked(s)) return out;
  let { open, nextOfferAt, seq } = s.contracts;
  let changed = false;
  open = open.map((c) => {
    if (c.status === 'open' && c.kind === 'produce' && contractProgress(s, c) >= 1) {
      out.completed.push(c);
      changed = true;
      return { ...c, status: 'complete' as const };
    }
    return c;
  });
  const keep = open.filter((c) => c.status === 'complete' || c.deadline > now);
  if (keep.length !== open.length) {
    out.expired.push(...open.filter((c) => !keep.includes(c)));
    open = keep;
    changed = true;
  }
  // on unlock every slot fills at once; later offers come on the timer
  const first = nextOfferAt === 0;
  if (first) nextOfferAt = now;
  let state = s;
  while (open.length < contractSlots(s) && (first || now >= nextOfferAt)) {
    const c = generateContract({ ...state, contracts: { ...state.contracts, seq } }, now, rng);
    seq += 1;
    open = [...open, c];
    out.offered.push(c);
    // a long absence fills one slot per interval missed (up to the slots)
    nextOfferAt = first ? now + offerIntervalMs(s) : nextOfferAt + offerIntervalMs(s);
    changed = true;
  }
  if (open.length >= contractSlots(s) && nextOfferAt < now) {
    nextOfferAt = now + offerIntervalMs(s); // full: the timer waits
    changed = true;
  }
  if (!changed) return out;
  state = { ...s, contracts: { ...s.contracts, open, nextOfferAt, seq } };
  return { ...out, state };
}
