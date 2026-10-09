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
    expect(getClickValue(done, 1000)).toBeCloseTo(9 + 10);
    expect(getClickValue([...done, 'grid_tap'], 1000)).toBeCloseTo(9 + 20);
    expect(getClickValue(done, 0)).toBe(9);
  });

  it('the energy/s share is capped', () => {
    expect(getBonuses(['kinetic_capture', 'grid_tap', 'kinetic_capture']).clickRateShare).toBe(BONUS_CAPS.clickRateShare);
  });

  it('the click breakdown matches the click value and names the share', () => {
    const done = ['hand_crank', 'kinetic_capture'];
    const b = getClickBreakdown(done, 400);
    expect(b.total).toBeCloseTo(getClickValue(done, 400));
    expect(b.modifiers.at(-1)!.source).toBe('1% of your energy/s');
  });

  it('1% of energy/s per research (1.93, playtest 28): the owner\'s case', () => {
    const all = ['hand_crank', 'ergonomic_handle', 'flywheel', 'geared_crank', 'kinetic_capture', 'grid_tap'];
    expect(getClickValue(all.slice(0, 5), 5670)).toBeCloseTo(9 + 56.7);
    expect(getClickValue(all, 5670)).toBeCloseTo(9 + 113.4);
    expect(BONUS_CAPS.clickRateShare).toBe(0.02);
    // ten clicks a second add at most a fifth of what the plants make
    expect((getClickValue(all, 5670) - 9) * 10).toBeLessThanOrEqual(5670 * 0.2);
    expect(RESEARCH_BY_ID.kinetic_capture.description).toContain('1%');
    expect(RESEARCH_BY_ID.grid_tap.description).toContain('1%');
  });

  it('click research chains from Hand-Crank Dynamo', () => {
    expect(RESEARCH_BY_ID.ergonomic_handle.prerequisites).toEqual(['hand_crank']);
    expect(RESEARCH_BY_ID.grid_tap.prerequisites).toEqual(['kinetic_capture']);
  });
});
