import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { GeneratorType } from '../types/generator';
import { deriveRates } from '../utils/simulation';
import { useStore } from '.';

const T0 = 1_700_000_000_000;

beforeEach(() => {
  useStore.setState({
    ...deriveRates({
      ...createInitialState(T0),
      energy: 0,
      resources: { metal: 0, stone: 0, coal: 2, naturalGas: 0, oil: 0, uranium: 0 },
      producers: { quarry: 1, mine: 0, coalMine: 0, gasWell: 0, oilRig: 0, uraniumMine: 0 },
      activeGenerators: [{ id: 'gen-1', type: GeneratorType.COAL, isActive: true, level: 1 }],
    }),
    welcomeBack: null,
    celebrations: [],
  });
});

describe('welcome back report (0.28)', () => {
  it('summarises an offline catch-up: time, energy, resources, fuel', () => {
    useStore.getState().applyIdleGains(600, T0 + 600_000, { catchUp: true });
    const r = useStore.getState().welcomeBack!;
    expect(r.awaySeconds).toBe(600);
    expect(r.creditedSeconds).toBe(600);
    expect(r.energyGained).toBeCloseTo(2 * 120); // 2 coal = 2 minutes at 2/s
    expect(r.resourcesGained.stone).toBeCloseTo(60);
    expect(r.resourcesGained.coal).toBeCloseTo(-2);
    expect(r.outOfFuel).toEqual(['gen-1']);
  });

  it('notes when the offline cap applied', () => {
    useStore.getState().applyIdleGains(86_400, T0 + 3 * 86_400_000, { catchUp: true });
    const r = useStore.getState().welcomeBack!;
    expect(r.awaySeconds).toBe(3 * 86_400);
    expect(r.creditedSeconds).toBe(86_400);
  });

  it('no report for live ticks or short absences', () => {
    useStore.getState().applyIdleGains(1, T0 + 1000);
    expect(useStore.getState().welcomeBack).toBeNull();
    useStore.getState().applyIdleGains(30, T0 + 31_000);
    expect(useStore.getState().welcomeBack).toBeNull();
  });
});

describe('switching tabs (0.79 fix)', () => {
  it('throttled background ticks never create a summary on their own', () => {
    let t = T0;
    for (let i = 0; i < 10; i++) {
      t += 61_000;
      useStore.getState().applyIdleGains(61, t);
    }
    expect(useStore.getState().welcomeBack).toBeNull();
  });

  it('one summary covers the whole hidden period, not the last minute', () => {
    useStore.getState().markHidden(T0);
    let t = T0;
    for (let i = 0; i < 10; i++) {
      t += 61_000;
      useStore.getState().applyIdleGains(61, t);
    }
    useStore.getState().markVisible(t);
    const r = useStore.getState().welcomeBack!;
    expect(r.awaySeconds).toBeCloseTo(610);
    expect(r.resourcesGained.stone).toBeCloseTo(61);
    expect(r.outOfFuel).toEqual(['gen-1']);
    expect(useStore.getState().awaySnapshot).toBeNull();
  });

  it('a short hide gives no summary', () => {
    useStore.getState().markHidden(T0);
    useStore.getState().applyIdleGains(20, T0 + 20_000);
    useStore.getState().markVisible(T0 + 20_000);
    expect(useStore.getState().welcomeBack).toBeNull();
  });

  it('becoming visible without having been hidden changes nothing', () => {
    useStore.getState().markVisible(T0 + 5_000_000);
    expect(useStore.getState().welcomeBack).toBeNull();
  });
});
