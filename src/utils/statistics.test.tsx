import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import StatisticsPanel from '../components/StatisticsPanel';
import { createInitialState } from '../data/initialState';
import { RESOURCE_IDS } from '../data/resources';
import { useStore } from '../store';
import { migrateSave } from '../store/migrations';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { getResourceBreakdown } from './breakdown';
import { advanceTime, deriveRates } from './simulation';
import { getStatistics } from './statistics';

afterEach(cleanup);

const T = 1_700_000_000_000;
/** A mixed base: solar, wind, coal (one off), oil and nuclear, research boosts, plenty of fuel. */
function base(): GameState {
  const gen = (n: number, type: GeneratorType, level = 1, isActive = true) => ({ id: `gen-${n}`, type, level, isActive });
  return deriveRates({
    ...createInitialState(T),
    roomCapacity: 400,
    activeGenerators: [
      gen(1, GeneratorType.SOLAR, 3),
      gen(2, GeneratorType.SOLAR),
      gen(3, GeneratorType.WIND, 2),
      gen(4, GeneratorType.COAL),
      gen(5, GeneratorType.COAL, 1, false),
      gen(6, GeneratorType.OIL),
      gen(7, GeneratorType.NUCLEAR),
    ],
    completedResearch: ['basic_solar', 'basic_mining'],
    producers: { ...createInitialState(T).producers, quarry: 3, mine: 4, coalMine: 2, oilRig: 1 },
    resources: { metal: 1e6, stone: 1e6, coal: 1e6, naturalGas: 1e6, oil: 1e6, uranium: 1e6, deuterium: 1e6 },
  });
}

describe('getStatistics (0.39)', () => {
  it('per-generator and per-type outputs add up to the energy rate, with shares summing to 100%', () => {
    const s = base();
    const st = getStatistics(s);
    expect(st.energyPerSecond).toBe(s.energyPerSecond);
    const sumGen = st.byGenerator.reduce((n, g) => n + g.perSecond, 0);
    const sumType = st.byType.reduce((n, t) => n + t.perSecond, 0);
    expect(sumGen).toBeCloseTo(s.energyPerSecond, 9);
    expect(sumType).toBeCloseTo(s.energyPerSecond, 9);
    expect(st.byType.reduce((n, t) => n + t.share, 0)).toBeCloseTo(1, 9);
    // sorted highest first; switched-off machines give nothing
    expect(st.byType[0].perSecond).toBeGreaterThanOrEqual(st.byType[1].perSecond);
    expect(st.byGenerator.find((g) => g.id === 'gen-5')!.perSecond).toBe(0);
    const coal = st.byType.find((t) => t.type === GeneratorType.COAL)!;
    expect(coal).toMatchObject({ count: 2, running: 1 });
    // only owned types are listed
    expect(st.byType.map((t) => t.type).sort()).toEqual(['coal', 'nuclear', 'oil', 'solar', 'wind']);
  });

  it('resource rates match the resource bar and burn the fuel the running generators use', () => {
    const s = base();
    const st = getStatistics(s);
    for (const r of st.resources) {
      expect(r.net).toBeCloseTo(getResourceBreakdown(s, r.id).total, 9);
      expect(r.net).toBeCloseTo(r.produced - r.burned, 12);
    }
    expect(st.resources.find((r) => r.id === 'coal')!.burned).toBeGreaterThan(0);
    expect(st.resources.find((r) => r.id === 'uranium')!.burned).toBeGreaterThan(0);
  });

  it('matches what the simulation produces over a minute, within rounding', () => {
    const s = base();
    const st = getStatistics(s);
    const after = advanceTime(s, 60).state;
    expect(after.energy - s.energy).toBeCloseTo(st.energyPerSecond * 60, 6);
    for (const id of RESOURCE_IDS) {
      const flow = st.resources.find((r) => r.id === id)!;
      expect(after.resources[id] - s.resources[id]).toBeCloseTo(flow.net * 60, 4);
    }
  });

  it('an empty game has no shares and no division by zero', () => {
    const st = getStatistics(createInitialState(T));
    expect(st.byGenerator).toEqual([]);
    expect(st.byType).toEqual([]);
    expect(st.startedAt).toBe(T);
    expect(st.lastOffline).toBeNull();
  });
});

describe('lifetime counters (0.39)', () => {
  it('counts click energy, live play time and the last offline gain', () => {
    useStore.getState().resetGame();
    const s0 = base();
    useStore.setState({ ...s0, lastSavedTimestamp: T, stats: { ...s0.stats, playSeconds: 0, clickEnergy: 0 } });
    useStore.getState().clickEnergy();
    useStore.getState().clickEnergy();
    expect(useStore.getState().stats.clickEnergy).toBeGreaterThan(0);
    expect(useStore.getState().stats.clicks).toBe(2);
    // live ticks count as play time
    useStore.getState().applyIdleGains(1, T + 1000);
    useStore.getState().applyIdleGains(1, T + 2000);
    expect(useStore.getState().stats.playSeconds).toBeCloseTo(2);
    // a return after two hours away is an offline gain, not play time
    const before = useStore.getState().energy;
    useStore.getState().applyIdleGains(7200, T + 2000 + 7_200_000, { catchUp: true });
    const st = useStore.getState().stats;
    expect(st.playSeconds).toBeCloseTo(2);
    expect(st.lastOffline).toEqual({ at: T + 2000 + 7_200_000, seconds: 7200, energy: useStore.getState().energy - before });
    expect(st.returns).toBe(1);
  });

  it('older saves get the new counters; their start time is unknown', () => {
    const m = migrateSave({ energy: 5, lastSavedTimestamp: 0, stats: { clicks: 9, returns: 2 } }, 18);
    expect(m.stats).toEqual({ clicks: 9, returns: 2, playSeconds: 0, clickEnergy: 0, startedAt: null, lastOffline: null });
  });
});

describe('Statistics panel (0.39)', () => {
  it('shows totals, energy by type with percentages, resources and the top generators', () => {
    useStore.getState().resetGame();
    useStore.setState(base());
    render(<StatisticsPanel />);
    expect(screen.getByTestId('stats-totals').textContent).toContain('Lifetime energy');
    const types = screen.getByTestId('stats-by-type').textContent!;
    expect(types).toContain('Nuclear Fission Plant');
    expect(types).toMatch(/\d+\.\d%/);
    expect(types).toContain('(1 running)');
    expect(screen.getByTestId('stats-resources').textContent).toContain('Uranium');
    expect(screen.getByTestId('stats-by-generator').querySelectorAll('li')).toHaveLength(7);
  });

  it('lists the top 10 generators, and all of them on request', () => {
    useStore.getState().resetGame();
    const many = Array.from({ length: 14 }, (_, i) => ({ id: `gen-${i + 1}`, type: GeneratorType.SOLAR, level: 1, isActive: true }));
    useStore.setState(deriveRates({ ...createInitialState(T), roomCapacity: 400, activeGenerators: many }));
    render(<StatisticsPanel />);
    expect(screen.getByTestId('stats-by-generator').querySelectorAll('li')).toHaveLength(10);
    fireEvent.click(screen.getByRole('button', { name: 'Show all 14' }));
    expect(screen.getByTestId('stats-by-generator').querySelectorAll('li')).toHaveLength(14);
  });
});
