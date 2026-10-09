import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../data/initialState';
import { EVENTS_BY_ID } from '../data/events';
import { RESEARCH_BY_ID } from '../data/research';
import { PET_CELEBRATION, PET_EVENT_REACTIONS, PET_GENERIC_REACTION, PET_NEGATIVE_REACTION, PET_REACTION_MS, PET_WALK } from '../data/pets';
import { useStore } from '../store';
import { applyReaction, endReactions, nextStep, positionAt, reactionDef, walkMs, type Walker } from '../utils/petWalk';
import { seededRng } from '../utils/rng';
import PetWalkers from './PetWalkers';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const adult = { stage: 3, growUntil: null, foundAt: 0 };
const withPets = (settings: Partial<ReturnType<typeof createInitialState>['settings']> = {}) => {
  useStore.getState().resetGame();
  useStore.setState({
    pets: { active: 'cat', extra: ['eel'], slots: 2, owned: { cat: adult, eel: adult } },
    settings: { ...createInitialState(0).settings, ...settings },
  });
  // owning pets unlocks achievements, which the pets would celebrate (1.80): start calm
  useStore.setState({ petReaction: null });
};

describe('which reaction plays (1.80)', () => {
  it('milestones celebrate; events play their own reaction, 😨 for a bad one, else 👀', () => {
    expect(reactionDef({ kind: 'celebrate' })).toBe(PET_CELEBRATION);
    expect(reactionDef({ kind: 'event', eventId: 'spaceship' }).emoji).toBe('😮');
    expect(reactionDef({ kind: 'event', eventId: 'sunny_spell' }).emoji).toBe('☀️');
    expect(reactionDef({ kind: 'event', eventId: 'overcast' }).pose).toBe('hide');
    expect(reactionDef({ kind: 'event', eventId: 'map_delivery' }).emoji).toBe('💰');
    // an unmapped negative event, and an unmapped good one
    expect(PET_EVENT_REACTIONS.grid_fault).toBeUndefined();
    expect(reactionDef({ kind: 'event', eventId: 'grid_fault' })).toBe(PET_NEGATIVE_REACTION);
    expect(PET_EVENT_REACTIONS.paper_plane).toBeUndefined();
    expect(reactionDef({ kind: 'event', eventId: 'paper_plane' })).toBe(PET_GENERIC_REACTION);
    expect(reactionDef({ kind: 'event', eventId: 'no_such_event' })).toBe(PET_GENERIC_REACTION);
  });

  it('every mapped reaction is for a real event', () => {
    for (const id of Object.keys(PET_EVENT_REACTIONS)) expect(EVENTS_BY_ID[id], id).toBeDefined();
  });
});

describe('walkers react (1.80)', () => {
  const walking: Walker = { id: 'cat', from: 0.2, x: 0.6, left: false, action: 'walk', until: 0, pace: 1 };
  walking.until = walkMs(0.2, 0.6, 1);

  it('a walking pet stops where it is, plays the reaction, then walks on', () => {
    const half = walking.until / 2;
    expect(positionAt(walking, half)).toBeCloseTo(0.4);
    const [w] = applyReaction([walking], PET_CELEBRATION, half, half + PET_REACTION_MS);
    expect(w).toMatchObject({ x: expect.closeTo(0.4), from: expect.closeTo(0.4), action: 'rest', react: PET_CELEBRATION, until: half + PET_REACTION_MS });
    const after = nextStep(w, half + PET_REACTION_MS, seededRng(1));
    expect(after.react).toBeUndefined();
    expect(after.action).toBe('walk');
  });

  it('a sleeping pet wakes for it too', () => {
    const [w] = applyReaction([{ ...walking, action: 'sleep', from: 0.5, x: 0.5, until: 1e9 }], PET_CELEBRATION, 0, PET_REACTION_MS);
    expect(w.action).toBe('rest');
    expect(w.until).toBe(PET_REACTION_MS);
  });

  it('endReactions clears only reactions that are over', () => {
    const list = applyReaction([walking], PET_CELEBRATION, 0, 1000);
    expect(endReactions(list, 999)).toBe(list);
    expect(endReactions(list, 1000)[0].react).toBeUndefined();
  });
});

describe('the store tells the pets what to react to (1.80)', () => {
  it('a level up, a research completion and a pet stage-up each celebrate', () => {
    for (const c of [{ kind: 'level' as const, level: 5, at: 1 }, { id: 'basic_solar', at: 1 }, { kind: 'pet' as const, id: 'cat' as const, stage: 2, at: 1 }]) {
      useStore.getState().resetGame();
      useStore.setState({ celebrations: [c] });
      expect(useStore.getState().petReaction).toMatchObject({ kind: 'celebrate' });
    }
  });

  it('a live research completion from the idle engine celebrates', () => {
    useStore.getState().resetGame();
    const T0 = 1_700_000_000_000;
    const d = RESEARCH_BY_ID.basic_solar.duration;
    useStore.setState({ currentResearch: { id: 'basic_solar', startTime: T0, duration: d }, lastSavedTimestamp: T0 + (d - 1) * 1000 });
    useStore.getState().applyIdleGains(1, T0 + d * 1000);
    expect(useStore.getState().completedResearch).toEqual(['basic_solar']);
    expect(useStore.getState().petReaction).toMatchObject({ kind: 'celebrate' });
  });

  it('an achievement unlocked in live play celebrates; a loaded game does not', () => {
    useStore.getState().resetGame();
    useStore.setState({ lifetimeEnergy: 1e9 });
    expect(useStore.getState().petReaction).toMatchObject({ kind: 'celebrate' });
    useStore.getState().loadSave({ ...createInitialState(0), lifetimeEnergy: 1e12 });
    expect(useStore.getState().petReaction).toBeNull();
  });

  it('a contract completed in live play celebrates; caught up on return it does not', () => {
    for (const live of [true, false]) {
      useStore.getState().resetGame();
      useStore.setState({ researchLevel: 3, energy: 1e9 });
      useStore.getState().tickContracts(1000, seededRng(3), live);
      const c = useStore.getState().contracts;
      useStore.setState({
        lifetimeEnergy: 100,
        contracts: { ...c, open: [{ id: 'p', kind: 'produce', produce: 1, startLifetime: 0, tier: 1, deadline: 1e12, status: 'open' }] },
        petReaction: null,
      });
      useStore.getState().tickContracts(2000, seededRng(3), live);
      expect(useStore.getState().contracts.open[0].status).toBe('complete');
      expect(useStore.getState().petReaction === null).toBe(!live);
    }
  });

  it('a random event plays its reaction while you watch, not when caught up on return', () => {
    useStore.getState().resetGame();
    const now = 5_000_000;
    const hits = useStore.getState().rollRandomEvents(1, { foreground: true }, () => 0, now);
    expect(hits.length).toBeGreaterThan(0);
    expect(useStore.getState().petReaction).toEqual({ kind: 'event', eventId: hits[0], at: now });
    useStore.getState().resetGame();
    useStore.getState().rollRandomEvents(3600, { foreground: false, catchUp: true }, () => 0, now);
    expect(useStore.getState().petReaction).toBeNull();
  });

  it('reactions do not pile up: one plays at a time, a burst plays the first', () => {
    useStore.getState().resetGame();
    useStore.getState().reactPets({ kind: 'event', eventId: 'spaceship' }, 1000);
    useStore.getState().reactPets({ kind: 'celebrate' }, 1500);
    useStore.getState().reactPets({ kind: 'event', eventId: 'ufo' }, 1000 + PET_REACTION_MS - 1);
    expect(useStore.getState().petReaction).toEqual({ kind: 'event', eventId: 'spaceship', at: 1000 });
    useStore.getState().reactPets({ kind: 'celebrate' }, 1000 + PET_REACTION_MS);
    expect(useStore.getState().petReaction).toEqual({ kind: 'celebrate', at: 1000 + PET_REACTION_MS });
  });
});

describe('the walking pets show it (1.80)', () => {
  it('every walking pet stops and celebrates with a 🎉 and confetti, then carries on', async () => {
    vi.useFakeTimers();
    withPets();
    render(<PetWalkers />);
    await act(async () => {
      vi.advanceTimersByTime(PET_WALK.tickMs * 8);
    });
    await act(async () => {
      useStore.getState().reactPets({ kind: 'celebrate' });
    });
    for (const id of ['cat', 'eel']) {
      const pet = screen.getByTestId(`walking-pet-${id}`);
      expect(pet.getAttribute('data-reaction')).toBe('celebrate');
      expect(pet.getAttribute('data-action')).toBe('rest');
      expect(pet.querySelector('img')!.className).toContain('pet-reaction-celebrate');
      expect(screen.getByTestId(`pet-reaction-${id}`).textContent).toBe('🎉');
      expect(screen.getAllByTestId(`pet-confetti-${id}`).length).toBeGreaterThan(0);
    }
    await act(async () => {
      vi.advanceTimersByTime(PET_REACTION_MS + PET_WALK.tickMs);
    });
    expect(screen.getByTestId('walking-pet-cat').getAttribute('data-reaction')).toBeNull();
    expect(screen.queryByTestId('pet-reaction-cat')).toBeNull();
  });

  it('a random event shows its reaction bubble', async () => {
    vi.useFakeTimers();
    withPets();
    render(<PetWalkers />);
    await act(async () => {
      useStore.getState().reactPets({ kind: 'event', eventId: 'grid_fault' });
    });
    expect(screen.getByTestId('pet-reaction-cat').textContent).toBe('😨');
    expect(screen.getByTestId('walking-pet-cat').getAttribute('data-reaction')).toBe('scared');
  });

  it('Reduce motion: the pets stay still and only the bubble shows', async () => {
    vi.useFakeTimers();
    withPets({ reduceMotion: true });
    render(<PetWalkers />);
    const cat = screen.getByTestId('walking-pet-cat');
    const before = cat.getAttribute('style');
    await act(async () => {
      useStore.getState().reactPets({ kind: 'celebrate' });
    });
    expect(screen.getByTestId('pet-reaction-cat').textContent).toBe('🎉');
    expect(cat.getAttribute('style')).toBe(before);
    expect(cat.querySelector('img')!.className).not.toContain('pet-reaction');
    expect(screen.queryByTestId('pet-confetti-cat')).toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(PET_REACTION_MS);
    });
    expect(screen.queryByTestId('pet-reaction-cat')).toBeNull();
  });

  it('with "Pets walk on screen" off nothing shows', async () => {
    withPets({ petsWalk: false });
    render(<PetWalkers />);
    await act(async () => {
      useStore.getState().reactPets({ kind: 'celebrate' });
    });
    expect(screen.queryByTestId('pet-walkers')).toBeNull();
  });
});
