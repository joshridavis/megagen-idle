import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { RESEARCH_BY_ID } from '../data/research';
import { pickSaved } from './migrations';
import { useStore } from '.';

const T0 = 1_700_000_000_000;
const d = RESEARCH_BY_ID.basic_solar.duration;

beforeEach(() => {
  useStore.setState({
    ...createInitialState(T0),
    currentResearch: { id: 'basic_solar', startTime: T0, duration: d },
    lastSavedTimestamp: T0 + (d - 1) * 1000,
    celebrations: [],
  });
});

describe('research celebration events (playtest 5)', () => {
  it('a live tick that completes research queues a celebration', () => {
    useStore.getState().applyIdleGains(1, T0 + d * 1000);
    expect(useStore.getState().completedResearch).toEqual(['basic_solar']);
    expect(useStore.getState().celebrations).toEqual([{ id: 'basic_solar', at: T0 + d * 1000 }]);
  });

  it('catching up on time away does not celebrate', () => {
    useStore.getState().applyIdleGains(3600, T0 + d * 1000 + 3600_000);
    expect(useStore.getState().completedResearch).toEqual(['basic_solar']);
    expect(useStore.getState().celebrations).toEqual([]);
  });

  it('is never saved', () => {
    useStore.getState().applyIdleGains(1, T0 + d * 1000);
    expect('celebrations' in pickSaved(useStore.getState())).toBe(false);
  });

  it('dismiss removes the oldest', () => {
    useStore.setState({ celebrations: [{ id: 'a', at: 1 }, { id: 'b', at: 2 }] });
    useStore.getState().dismissCelebration();
    expect(useStore.getState().celebrations).toEqual([{ id: 'b', at: 2 }]);
  });
});
