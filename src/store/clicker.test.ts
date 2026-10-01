import { beforeEach, describe, expect, it } from 'vitest';
import { BASE_CLICK_VALUE } from '../data/player';
import { createInitialState } from '../data/initialState';
import { useStore } from '.';

beforeEach(() => useStore.setState({ ...createInitialState(0), energy: 0 }));

describe('clickEnergy', () => {
  it('adds the configured click value', () => {
    useStore.getState().clickEnergy();
    expect(useStore.getState().energy).toBe(BASE_CLICK_VALUE);
  });

  it('handles rapid clicking without losing clicks', () => {
    for (let i = 0; i < 250; i++) useStore.getState().clickEnergy();
    expect(useStore.getState().energy).toBe(250 * BASE_CLICK_VALUE);
  });
});
