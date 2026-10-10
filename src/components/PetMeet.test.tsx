import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../data/initialState';
import { PET_CELEBRATION, PET_MEET, PET_WALK, type PetId } from '../data/pets';
import { useStore } from '../store';
import { applyReaction, isFree, startMeeting, startWalkers, stepWalkers, type Walker } from '../utils/petWalk';
import { seededRng } from '../utils/rng';
import PetWalkers from './PetWalkers';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Runs the walkers for `hours` of one-second steps; counts meetings started and solo actions started. */
function run(ids: PetId[], hours: number, seed = 11) {
  const rng = seededRng(seed);
  let w = startWalkers(ids, 0);
  let meetings = 0;
  let solo = 0;
  for (let now = 0; now < hours * 3_600_000; now += PET_WALK.tickMs) {
    const next = stepWalkers(w, ids, now, rng);
    for (const x of next) {
      const before = w.find((o) => o.id === x.id);
      if (x.meet && !before?.meet && x.meet.host) meetings++;
      if (!x.meet && before && x !== before && x.action !== 'walk' && x.action !== 'rest') solo++;
      // the pair always meets its partner, both in the same phase
      if (x.meet) {
        const p = next.find((o) => o.id === x.meet!.with)!;
        expect(p.meet?.with).toBe(x.id);
        expect(p.meet?.phase).toBe(x.meet.phase);
      }
    }
    expect(next.filter((x) => x.meet).length).toBeLessThanOrEqual(2);
    w = next;
  }
  return { meetings, solo };
}

describe('pets meet each other (1.81)', () => {
  it('never with one pet', () => {
    expect(run(['cat'], 3).meetings).toBe(0);
  });

  it('with two or three pets they meet now and then, rarer than solo actions', () => {
    for (const ids of [['cat', 'eel'], ['cat', 'eel', 'hamster']] as PetId[][]) {
      const { meetings, solo } = run(ids, 3);
      // a few per hour: often enough to see, rare enough to stay special
      expect(meetings / 3).toBeGreaterThan(2);
      expect(meetings / 3).toBeLessThan(40);
      expect(meetings).toBeLessThan(solo / 2);
    }
  });

  it('the visitor walks over, they face each other, share an action, then go free', () => {
    const [host, visitor] = startWalkers(['cat', 'eel'], 0); // cat at 1/3, eel at 2/3
    const [h, v] = startMeeting(host, visitor, 0, () => 0.01, 0.05);
    expect(v.action).toBe('walk');
    expect(v.x).toBeCloseTo(1 / 3 + 0.05);
    expect(v.left).toBe(true);
    expect(h.left).toBe(false);
    expect(h.action).toBe('rest');
    expect(h.until).toBe(v.until);
    expect(h.meet).toMatchObject({ with: 'eel', kind: 'greet', phase: 'approach', host: true });
    // arrived: together, facing each other, the same pose
    const t = stepWalkers([h, v], ['cat', 'eel'], v.until, () => 0.5);
    expect(t.map((x) => x.meet?.phase)).toEqual(['together', 'together']);
    expect(t[0].left).toBe(false);
    expect(t[1].left).toBe(true);
    expect(t[0].action).toBe(t[1].action);
    expect(t[0].until).toBe(t[1].until);
    // over: both free again and on their way
    const end = stepWalkers(t, ['cat', 'eel'], t[0].until, () => 0.9);
    expect(end.every((x) => !x.meet)).toBe(true);
  });

  it('each kind has its shared pose: nap side by side, eat one apple, play with one ball', () => {
    for (const [roll, kind] of [[0.01, 'greet'], [0.5, 'play'], [0.7, 'nap'], [0.9, 'share']] as const) {
      const [host, visitor] = startWalkers(['cat', 'eel'], 0);
      const pair = startMeeting(host, visitor, 0, () => roll);
      expect(pair[0].meet!.kind).toBe(kind);
      const t = stepWalkers(pair, ['cat', 'eel'], pair[0].until, () => 0.5);
      expect(t[0].action).toBe(PET_MEET.action[kind]);
    }
  });

  it('a busy pet is not picked: asleep, eating or reacting', () => {
    const [a, b] = startWalkers(['cat', 'eel'], 0).map((w) => ({ ...w, until: 1e9 }));
    expect(isFree(a)).toBe(true);
    for (const busy of [{ ...b, action: 'sleep' as const }, { ...b, action: 'eat' as const }, applyReaction([b], PET_CELEBRATION, 0, 1e9)[0]]) {
      const out = stepWalkers([a, busy], ['cat', 'eel'], 1000, () => 0);
      expect(out.some((w) => w.meet)).toBe(false);
    }
    // both free: a roll under the chance starts one
    expect(stepWalkers([a, b], ['cat', 'eel'], 1000, () => 0).filter((w) => w.meet).length).toBe(2);
  });

  it('a reaction ends a meeting; a pet whose partner leaves goes its own way', () => {
    const [host, visitor] = startWalkers(['cat', 'eel'], 0);
    const pair = startMeeting(host, visitor, 0, () => 0.01);
    expect(applyReaction(pair, PET_CELEBRATION, 100, 4100).every((w) => !w.meet)).toBe(true);
    const alone = stepWalkers(pair, ['cat'], 100, () => 0.9);
    expect(alone).toHaveLength(1);
    expect(alone[0].meet).toBeUndefined();
  });

  it('meeting pets stay on screen at the edges', () => {
    const host: Walker = { ...startWalkers(['cat'], 0)[0], x: 0.95, from: 0.95 };
    const visitor: Walker = { ...startWalkers(['eel'], 0)[0], x: 0.5, from: 0.5 };
    const [, v] = startMeeting(host, visitor, 0, () => 0.01, 0.05);
    expect(v.x).toBeCloseTo(0.9);
    const right = startMeeting({ ...host, x: 0.05, from: 0.05 }, { ...visitor, x: 0.04, from: 0.04 }, 0, () => 0.01, 0.05)[1];
    expect(right.x).toBeCloseTo(0.1);
  });
});

const adult = { stage: 3, growUntil: null, foundAt: 0 };
const withPets = (settings: Partial<ReturnType<typeof createInitialState>['settings']> = {}) => {
  useStore.getState().resetGame();
  useStore.setState({
    pets: { active: 'cat', extra: ['eel'], slots: 2, owned: { cat: adult, eel: adult } },
    settings: { ...createInitialState(0).settings, ...settings },
  });
  useStore.setState({ petReaction: null });
};

describe('meeting on screen (1.81)', () => {
  it('two pets greet with a heart between them', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    withPets();
    render(<PetWalkers />);
    expect(screen.getByTestId('walking-pet-cat').getAttribute('data-meet')).toBe('greet-approach');
    expect(screen.getByTestId('walking-pet-eel').getAttribute('data-action')).toBe('walk');
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(screen.getByTestId('walking-pet-eel').getAttribute('data-meet')).toBe('greet-together');
    expect(screen.getByTestId('pet-bubble-eel').textContent).toBe(PET_MEET.greetBubble);
    expect(screen.queryByTestId('pet-bubble-cat')).toBeNull();
  });

  it('Reduce motion: no meetings', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    withPets({ reduceMotion: true });
    render(<PetWalkers />);
    await act(async () => {
      vi.advanceTimersByTime(60_000);
    });
    expect(screen.getByTestId('walking-pet-cat').getAttribute('data-meet')).toBeNull();
    expect(screen.getByTestId('walking-pet-eel').getAttribute('data-meet')).toBeNull();
  });
});
