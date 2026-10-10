import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_OFFLINE_SECONDS } from '../data/time';
import { useStore } from '../store';
import { createInitialState } from '../data/initialState';
import { GeneratorType, type Generator } from '../types/generator';
import { computeDeltaSeconds, computeIdleGain, tick } from './idleEngine';
import { deriveRates } from './simulation';

// These tests check other mechanics at fixed rates: no player level bonus (0.90).
vi.mock('../data/playerLevel', async (orig) => ({ ...(await orig<object>()), ENERGY_BONUS_PER_LEVEL: 0 }));

const T0 = 1_700_000_000_000;

// Two solar panels (0.5/s each) give exactly 1 energy per second.
const solar = (id: string): Generator => ({ id, type: GeneratorType.SOLAR, isActive: true, level: 1 });

beforeEach(() => {
  // tick() also rolls random events with Math.random: an hour of catch-up could grant
  // bonus energy (seen in CI: 4200 instead of 3600). No event fires in these tests.
  vi.spyOn(Math, 'random').mockReturnValue(0.999999);
  useStore.setState(deriveRates({ ...createInitialState(T0), energy: 0, activeGenerators: [solar('gen-1'), solar('gen-2')] }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('computeDeltaSeconds', () => {
  it('returns elapsed seconds', () => {
    expect(computeDeltaSeconds(T0, T0 + 1500)).toBe(1.5);
  });
  it('clamps negative deltas to 0', () => {
    expect(computeDeltaSeconds(T0, T0 - 60_000)).toBe(0);
  });
  it('caps very large gaps', () => {
    const tenDays = 10 * 24 * 3600 * 1000;
    expect(computeDeltaSeconds(T0, T0 + tenDays, MAX_OFFLINE_SECONDS)).toBe(MAX_OFFLINE_SECONDS);
  });
  it('treats non-finite timestamps as no time passed', () => {
    expect(computeDeltaSeconds(Number.NaN, T0)).toBe(0);
  });
});

describe('computeIdleGain', () => {
  it('multiplies rate by time', () => {
    expect(computeIdleGain(2, 30)).toBe(60);
  });
  it('gives nothing for zero or negative time', () => {
    expect(computeIdleGain(5, 0)).toBe(0);
    expect(computeIdleGain(5, -3)).toBe(0);
  });
});

describe('tick', () => {
  it('adds energy at the generator rate (1/s here)', () => {
    tick(T0 + 1000);
    expect(useStore.getState().energy).toBeCloseTo(1);
    tick(T0 + 2000);
    expect(useStore.getState().energy).toBeCloseTo(2);
    expect(useStore.getState().lastSavedTimestamp).toBe(T0 + 2000);
  });

  it('credits offline time on load', () => {
    tick(T0 + 3600 * 1000);
    expect(useStore.getState().energy).toBeCloseTo(3600);
  });

  it('applies the offline cap to a very large gap', () => {
    tick(T0 + 30 * 24 * 3600 * 1000);
    expect(useStore.getState().energy).toBeCloseTo(MAX_OFFLINE_SECONDS);
  });

  it('gives nothing when the clock goes backwards, and re-anchors the timestamp', () => {
    tick(T0 - 5000);
    expect(useStore.getState().energy).toBe(0);
    expect(useStore.getState().lastSavedTimestamp).toBe(T0 - 5000);
  });
});

describe('offline cap (playtest 1: 24 hours)', () => {
  it('is 24 hours', () => {
    expect(MAX_OFFLINE_SECONDS).toBe(24 * 3600);
  });
  it('credits a 12 hour gap in full', () => {
    tick(T0 + 12 * 3600 * 1000);
    expect(useStore.getState().energy).toBeCloseTo(12 * 3600);
  });
  it('credits exactly 24 hours for a 30 hour gap', () => {
    tick(T0 + 30 * 3600 * 1000);
    expect(useStore.getState().energy).toBeCloseTo(24 * 3600);
  });
});

describe('useIdleEngine (0.18)', () => {
  it('credits time away on start, snapshots when hidden and summarizes on return', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { platform } = await import('../platform');
    const { useIdleEngine } = await import('./idleEngine');
    let report: ((hidden: boolean) => void) | undefined;
    const off = vi.fn();
    vi.spyOn(platform, 'onBackground').mockImplementation((cb) => {
      report = cb;
      return off;
    });
    vi.useFakeTimers({ now: T0 + 10_000 });
    try {
      const { unmount } = renderHook(() => useIdleEngine());
      expect(useStore.getState().energy).toBeCloseTo(10, 5); // 10 s away at 1/s, credited on start
      report!(true);
      expect(useStore.getState().awaySnapshot?.at).toBe(T0 + 10_000);
      vi.setSystemTime(T0 + 130_000); // 2 minutes hidden
      report!(false);
      expect(useStore.getState().welcomeBack?.awaySeconds).toBe(120);
      unmount();
      expect(off).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('waits for the save to load before crediting time', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { useIdleEngine } = await import('./idleEngine');
    let loaded: (() => void) | undefined;
    vi.spyOn(useStore.persist, 'hasHydrated').mockReturnValue(false);
    vi.spyOn(useStore.persist, 'onFinishHydration').mockImplementation((fn) => {
      loaded = () => fn(useStore.getState());
      return () => {};
    });
    vi.useFakeTimers({ now: T0 + 5_000 });
    try {
      const { unmount } = renderHook(() => useIdleEngine());
      expect(useStore.getState().energy).toBe(0);
      loaded!();
      expect(useStore.getState().energy).toBeCloseTo(5, 5);
      unmount();
    } finally {
      vi.useRealTimers();
    }
  });
});
