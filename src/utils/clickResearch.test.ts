import { describe, expect, it } from 'vitest';
import { BONUS_CAPS, RESEARCH_BY_ID } from '../data/research';
import { getBonuses, getClickValue } from './bonuses';
import { getClickBreakdown } from './breakdown';

describe('click-power research (0.83)', () => {
  it('each click research raises the click value in turn', () => {
    const chain = ['hand_crank', 'ergonomic_handle', 'flywheel', 'geared_crank'];
    const values = chain.map((_, i) => getClickValue(chain.slice(0, i + 1)));
    expect(values).toEqual([2, 3, 5, 9]);
  });

  it('the late ones add a share of energy/s to each click', () => {
    const done = ['hand_crank', 'ergonomic_handle', 'flywheel', 'geared_crank', 'kinetic_capture'];
    expect(getClickValue(done, 1000)).toBeCloseTo(9 + 250);
    expect(getClickValue([...done, 'grid_tap'], 1000)).toBeCloseTo(9 + 500);
    expect(getClickValue(done, 0)).toBe(9);
  });

  it('the energy/s share is capped', () => {
    expect(getBonuses(['kinetic_capture', 'grid_tap', 'kinetic_capture']).clickRateShare).toBe(BONUS_CAPS.clickRateShare);
  });

  it('the click breakdown matches the click value and names the share', () => {
    const done = ['hand_crank', 'kinetic_capture'];
    const b = getClickBreakdown(done, 400);
    expect(b.total).toBeCloseTo(getClickValue(done, 400));
    expect(b.modifiers.at(-1)!.source).toBe('25% of your energy/s');
  });

  it('click research chains from Hand-Crank Dynamo', () => {
    expect(RESEARCH_BY_ID.ergonomic_handle.prerequisites).toEqual(['hand_crank']);
    expect(RESEARCH_BY_ID.grid_tap.prerequisites).toEqual(['kinetic_capture']);
  });
});
