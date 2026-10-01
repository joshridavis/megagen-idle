import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_OFFLINE_SECONDS } from '../data/time';
import { useStore } from '../store';
import { createInitialState } from '../data/initialState';
import { computeDeltaSeconds, computeIdleGain, tick } from './idleEngine';

const T0 = 1_700_000_000_000;

beforeEach(() => {
  useStore.setState(createInitialState(T0));
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
  it('adds about 1 energy per second at the default rate', () => {
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
