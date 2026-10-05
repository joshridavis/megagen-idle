import { describe, expect, it } from 'vitest';
import { BASE_CONTRACT_SLOTS, CONTRACT_MILESTONES, OFFER_INTERVAL_MINUTES, PERK_PLAYER_LEVELS, PERKS } from '../data/contracts';
import { createInitialState } from '../data/initialState';
import { migrateSave } from '../store/migrations';
import { useStore } from '../store';
import type { Contract, GameState } from '../types/state';
import { getCompletion } from './completion';
import {
  perkPlayerLevel,
  buyPerk,
  offerIntervalMs,
  canDeliver,
  claimContract,
  contractProgress,
  contractRewards,
  contractSlots,
  deliverContract,
  generateContract,
  updateContracts,
} from './contracts';
import { energyForLevel } from './playerLevel';
import { seededRng } from './rng';

const H = 3_600_000;
const unlocked = (over: Partial<GameState> = {}): GameState => ({ ...createInitialState(0), researchLevel: 3, energyPerSecond: 10, ...over });
const contract = (over: Partial<Contract>): Contract => ({ id: 'c-1', kind: 'energy', tier: 2, deadline: 2 * H, status: 'open', ...over });
const withOpen = (s: GameState, open: Contract[]): GameState => ({ ...s, contracts: { ...s.contracts, open } });

describe('Grid Contracts (0.86)', () => {
  it('stay locked until the research level is reached', () => {
    const s = { ...createInitialState(0), researchLevel: 2 };
    expect(updateContracts(s, 0, seededRng(1)).state).toBe(s);
  });

  it('fill the slots at once, then one offer per interval, also over offline time', () => {
    let s = updateContracts(unlocked(), 0, seededRng(1)).state;
    expect(s.contracts.open).toHaveLength(BASE_CONTRACT_SLOTS);
    s = withOpen(s, []);
    expect(updateContracts(s, 1, seededRng(2)).state.contracts.open).toHaveLength(0); // next offer on the timer
    const later = updateContracts(s, OFFER_INTERVAL_MINUTES * 60_000, seededRng(3)).state;
    expect(later.contracts.open).toHaveLength(1);
    // a long absence fills every empty slot on return, never more than the slots
    const back = updateContracts(withOpen(s, []), 30 * H, seededRng(4)).state;
    expect(back.contracts.open).toHaveLength(BASE_CONTRACT_SLOTS);
  });

  it('scale with the player and are deterministic for a seed', () => {
    const small = generateContract(unlocked({ energyPerSecond: 1 }), 0, seededRng(5));
    const big = generateContract(unlocked({ energyPerSecond: 1000 }), 0, seededRng(5));
    expect(big.kind).toBe(small.kind);
    const size = (c: Contract) => c.energy ?? c.produce ?? Object.values(c.resources ?? {})[0] ?? 0;
    expect(size(big)).toBeGreaterThan(size(small));
    expect(generateContract(unlocked(), 0, seededRng(9))).toEqual(generateContract(unlocked(), 0, seededRng(9)));
  });

  it('a delivery contract is handed over only when affordable, then waits for a reward', () => {
    const c = contract({ energy: 500 });
    const poor = withOpen(unlocked({ energy: 100 }), [c]);
    expect(canDeliver(poor, c)).toBe(false);
    expect(deliverContract(poor, c.id)).toBe(poor);
    const rich = withOpen(unlocked({ energy: 800 }), [c]);
    expect(contractProgress(poor, c)).toBeCloseTo(0.2);
    const done = deliverContract(rich, c.id);
    expect(done.energy).toBe(300);
    expect(done.contracts.open[0].status).toBe('complete');
  });

  it('a produce contract completes by itself from lifetime energy', () => {
    const c = contract({ kind: 'produce', produce: 1000, startLifetime: 50 });
    const s = withOpen(unlocked({ lifetimeEnergy: 1100 }), [c]);
    const r = updateContracts({ ...s, contracts: { ...s.contracts, nextOfferAt: 10 * H } }, 1, seededRng(1));
    expect(r.completed).toHaveLength(1);
    expect(r.state.contracts.open[0].status).toBe('complete');
  });

  it('expire after the deadline without any penalty', () => {
    const s = withOpen(unlocked({ energy: 77 }), [contract({ deadline: 100 })]);
    const r = updateContracts({ ...s, contracts: { ...s.contracts, nextOfferAt: 10 * H } }, 200, seededRng(1));
    expect(r.expired).toHaveLength(1);
    expect(r.state.contracts.open).toHaveLength(0);
    expect(r.state.energy).toBe(77);
  });

  it('give the chosen reward: materials, a boost or points', () => {
    const c = contract({ status: 'complete', tier: 3 });
    const s = withOpen(unlocked(), [c]);
    const r = contractRewards(s, c);
    const bundle = claimContract(s, c.id, 'bundle', 0);
    expect(bundle.resources.metal).toBe(s.resources.metal + (r.bundle.metal ?? 0));
    expect(bundle.contracts.done).toBe(1);
    expect(bundle.contracts.open).toHaveLength(0);
    const boost = claimContract(s, c.id, 'boost', 0);
    expect(boost.activeEffects).toEqual([{ id: 'contract_boost', until: 30 * 60_000 }]);
    expect(claimContract(s, c.id, 'points', 0).contracts.points).toBe(3);
  });

  it('each perk level needs a player level (1.61)', () => {
    const at = (level: number) => {
      const s = unlocked({ lifetimeEnergy: energyForLevel(level) });
      return { ...s, contracts: { ...s.contracts, points: 1000 } };
    };
    expect(perkPlayerLevel(at(1), 'slot')).toBe(PERK_PLAYER_LEVELS[0]);
    expect(buyPerk(at(PERK_PLAYER_LEVELS[0] - 1), 'slot').contracts.perks.slot).toBeUndefined();
    const one = buyPerk(at(PERK_PLAYER_LEVELS[0]), 'slot');
    expect(one.contracts.perks.slot).toBe(1);
    // the 2nd level needs the next player level
    expect(perkPlayerLevel(one, 'slot')).toBe(PERK_PLAYER_LEVELS[1]);
    expect(buyPerk(one, 'slot').contracts.perks.slot).toBe(1);
    expect(buyPerk({ ...one, lifetimeEnergy: energyForLevel(PERK_PLAYER_LEVELS[1]) }, 'slot').contracts.perks.slot).toBe(2);
    // a perk with 4 levels has a 4th player level
    expect(PERK_PLAYER_LEVELS.length).toBeGreaterThanOrEqual(Math.max(...Object.values(PERKS).map((p) => p.costs.length)));
  });

  it('perks cost points, take effect and are permanent', () => {
    let s = unlocked({ lifetimeEnergy: energyForLevel(99) });
    s = { ...s, contracts: { ...s.contracts, points: 1000 } };
    expect(buyPerk({ ...s, contracts: { ...s.contracts, points: 1 } }, 'slot').contracts.perks.slot).toBeUndefined();
    s = buyPerk(s, 'slot');
    expect(contractSlots(s)).toBe(BASE_CONTRACT_SLOTS + 1);
    expect(s.contracts.points).toBe(1000 - PERKS.slot.costs[0]);
    for (let i = 0; i < 5; i++) s = buyPerk(s, 'slot'); // stops at the last level
    expect(s.contracts.perks.slot).toBe(PERKS.slot.costs.length);
    s = buyPerk(s, 'rewards');
    const c = contract({ status: 'complete' });
    expect(contractRewards(s, c).boostMinutes).toBeCloseTo(30 * 1.15);
    s = buyPerk(s, 'rewards');
    expect(contractRewards(s, c).boostMinutes).toBeCloseTo(30 * 1.3);
    s = buyPerk(buyPerk(s, 'offers'), 'offers');
    expect(offerIntervalMs(s)).toBe(20 * 60_000);
  });

  it('count toward completion and are saved', () => {
    const s = unlocked();
    const part = (st: GameState, label: string) => getCompletion(st).parts.find((p) => p.label === label)!;
    expect(part(s, 'Contracts completed').total).toBe(CONTRACT_MILESTONES.length);
    expect(part({ ...s, contracts: { ...s.contracts, done: 50 } }, 'Contracts completed').done).toBe(2);
    expect(part({ ...s, contracts: { ...s.contracts, perks: { slot: 2, deadline: 1 } } }, 'Contract perks').done).toBe(3);
    const v12 = { ...createInitialState(0) } as Record<string, unknown>;
    delete v12.contracts;
    expect(migrateSave(v12, 12).contracts).toEqual(createInitialState(0).contracts);
  });

  it('the store ticks, delivers and claims', () => {
    useStore.getState().resetGame();
    useStore.setState({ researchLevel: 3, energy: 1e9, resources: { metal: 1e9, stone: 1e9, coal: 1e9, naturalGas: 1e9, oil: 1e9, uranium: 0, deuterium: 0 } });
    useStore.getState().tickContracts(1000, seededRng(3));
    const open = useStore.getState().contracts.open;
    expect(open.length).toBe(BASE_CONTRACT_SLOTS);
    const delivery = open.find((c) => c.kind !== 'produce');
    if (delivery) {
      expect(useStore.getState().deliverContract(delivery.id)).toBe(true);
      useStore.getState().claimContract(delivery.id, 'points', 2000);
      expect(useStore.getState().contracts.done).toBe(1);
    }
  });
});
