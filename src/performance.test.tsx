import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { useStore } from './store';
import { createInitialState } from './data/initialState';
import { PERF_GENERATORS, PERF_STEP_BUDGET_MS, PERF_TICK_BUDGET_MS } from './data/performance';
import { RESEARCH } from './data/research';
import { GeneratorType } from './types/generator';
import { advanceTime, deriveRates } from './utils/simulation';
import { tick } from './utils/idleEngine';
import * as terrain from './utils/mapTerrain';

// The map's tiles call terrainAt once each when they render.
vi.mock('./utils/mapTerrain', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./utils/mapTerrain')>();
  return { ...actual, terrainAt: vi.fn(actual.terrainAt) };
});

afterEach(cleanup);

/** A large late-game base (0.42): 200 generators at mixed levels, every research done. */
function bigBase(now: number) {
  const s = createInitialState(now);
  const types = Object.values(GeneratorType);
  return deriveRates({
    ...s,
    energy: 1e15,
    lifetimeEnergy: 1e18,
    resources: { metal: 1e9, stone: 1e9, coal: 1e9, naturalGas: 1e9, oil: 1e9, uranium: 1e9, deuterium: 1e9 },
    producers: { quarry: 20, mine: 20, coalMine: 20, gasWell: 20, oilRig: 20, uraniumMine: 20, deuteriumExtractor: 20 },
    completedResearch: RESEARCH.map((r) => r.id),
    researchLevel: 40,
    roomCapacity: 5000,
    activeGenerators: Array.from({ length: PERF_GENERATORS }, (_, i) => ({ id: `gen-${i + 1}`, type: types[i % types.length], isActive: true, level: 1 + (i % 10) })),
  });
}

const openTab = (name: RegExp) => act(() => screen.getByRole('tab', { name }).click());

/** Average wall-clock ms of `n` live one-second ticks. */
function timeTicks(n: number, start: number) {
  const t0 = performance.now();
  for (let i = 1; i <= n; i++) act(() => void tick(start + i * 1000));
  return (performance.now() - t0) / n;
}

describe('performance with a large base (0.42)', () => {
  it('the one-second game step stays within its budget', () => {
    const now = Date.now();
    const s = bigBase(now);
    advanceTime(s, 1, now + 1000); // warm up
    const t0 = performance.now();
    for (let i = 0; i < 100; i++) advanceTime(s, 1, now + 1000);
    expect((performance.now() - t0) / 100).toBeLessThan(PERF_STEP_BUDGET_MS);
  });

  it('a tick does not redraw the map tiles, and ticks stay within budget on the busiest tabs', () => {
    const now = Date.now();
    useStore.setState(bigBase(now));
    render(<App />);
    openTab(/map/i);
    const terrainAt = vi.mocked(terrain.terrainAt);
    terrainAt.mockClear();
    const mapMs = timeTicks(5, now);
    // before 0.42 every tick rendered every tile again (thousands of calls)
    expect(terrainAt.mock.calls.length).toBeLessThan(50);
    expect(mapMs).toBeLessThan(PERF_TICK_BUDGET_MS);
    openTab(/generators/i);
    expect(timeTicks(5, now + 10_000)).toBeLessThan(PERF_TICK_BUDGET_MS);
  }, 60_000);
});
