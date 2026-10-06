import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { createInitialState } from '../data/initialState';
import { PET_REACT_MS, PET_WALK } from '../data/pets';
import { useStore } from '../store';
import { seededRng } from '../utils/rng';
import { nextStep, startWalkers, stepWalkers, walkMs } from '../utils/petWalk';
import PetWalkers from './PetWalkers';
import SettingsPanel from './SettingsPanel';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const adult = { stage: 3, growUntil: null, foundAt: 0 };
const withPets = (settings: Partial<ReturnType<typeof createInitialState>['settings']> = {}) => {
  useStore.getState().resetGame();
  useStore.setState({
    pets: { active: 'cat', extra: ['eel'], slots: 2, owned: { cat: adult, eel: adult, hamster: adult } },
    settings: { ...createInitialState(0).settings, ...settings },
  });
};

describe('walker logic (1.60)', () => {
  it('spreads pets out, then walks or acts, staying on screen', () => {
    const rng = seededRng(7);
    let w = startWalkers(['cat', 'eel'], 0);
    expect(w.map((x) => x.x)).toEqual([1 / 3, 2 / 3]);
    let now = 0;
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      w = stepWalkers(w, ['cat', 'eel'], now, rng);
      for (const x of w) {
        expect(x.x).toBeGreaterThanOrEqual(0.05);
        expect(x.x).toBeLessThanOrEqual(0.95);
        seen.add(x.action);
      }
      now += PET_WALK.tickMs;
    }
    expect(seen).toEqual(new Set(['walk', 'eat', 'play', 'sleep', 'sit', 'jump']));
  });

  it('a walk faces the way it goes and lasts as long as the distance needs', () => {
    const w = nextStep({ id: 'cat', from: 0.8, x: 0.8, left: false, action: 'sit', until: 0 }, 1000, () => 0.1);
    expect(w.action).toBe('walk');
    expect(w.x).toBeLessThan(0.8);
    expect(w.left).toBe(true);
    expect(w.until).toBe(1000 + walkMs(0.8, w.x));
  });

  it('keeps step with the active pets, and leaves walkers alone until their step ends', () => {
    const w = startWalkers(['cat'], 0).map((x) => ({ ...x, until: 5000 }));
    expect(stepWalkers(w, ['cat'], 1000, Math.random)).toBe(w);
    const joined = stepWalkers(w, ['cat', 'eel'], 1000, Math.random);
    expect(joined.map((x) => x.id)).toEqual(['cat', 'eel']);
    expect(stepWalkers(joined, ['eel'], 1000, Math.random).map((x) => x.id)).toEqual(['eel']);
  });
});

describe('pets walk on screen (1.60)', () => {
  it('shows the active pets (not the resting ones) on every tab', () => {
    withPets();
    render(<App />);
    for (const tab of [/Generators/, /Settings/]) {
      fireEvent.click(screen.getByRole('tab', { name: tab }));
      const layer = screen.getByTestId('pet-walkers');
      expect(layer.className).toContain('pointer-events-none');
      expect(screen.getByTestId('walking-pet-cat')).toBeTruthy();
      expect(screen.getByTestId('walking-pet-eel')).toBeTruthy();
      expect(screen.queryByTestId('walking-pet-hamster')).toBeNull();
    }
  });

  it('the setting hides them, from the Settings tab', () => {
    withPets();
    render(
      <>
        <SettingsPanel />
        <PetWalkers />
      </>,
    );
    const box = screen.getByTestId('setting-pets-walk') as HTMLInputElement;
    expect(box.checked).toBe(true);
    fireEvent.click(box);
    expect(useStore.getState().settings.petsWalk).toBe(false);
    expect(screen.queryByTestId('pet-walkers')).toBeNull();
  });

  it('nothing shows before the first pet is found', () => {
    useStore.getState().resetGame();
    render(<PetWalkers />);
    expect(screen.queryByTestId('pet-walkers')).toBeNull();
  });

  it('walks on a timer, and a click plays the pet reaction', async () => {
    vi.useFakeTimers();
    withPets();
    render(<PetWalkers />);
    await act(async () => {
      vi.advanceTimersByTime(PET_WALK.tickMs * 3);
    });
    const cat = screen.getByTestId('walking-pet-cat');
    expect(cat.getAttribute('data-action')).not.toBe('still');
    expect(cat.className).toContain('pointer-events-auto');
    await act(async () => {
      fireEvent.click(cat);
    });
    expect(cat.getAttribute('data-playing')).toBe('true');
    expect(cat.querySelector('img')!.className).toContain('pet-react');
    await act(async () => {
      vi.advanceTimersByTime(PET_REACT_MS);
    });
    expect(cat.getAttribute('data-playing')).toBe('false');
  });

  it('Reduce motion: the pets stand still', async () => {
    vi.useFakeTimers();
    withPets({ reduceMotion: true });
    render(<PetWalkers />);
    const cat = screen.getByTestId('walking-pet-cat');
    const before = cat.getAttribute('style');
    await act(async () => {
      vi.advanceTimersByTime(PET_WALK.tickMs * 10);
    });
    expect(cat.getAttribute('data-action')).toBe('still');
    expect(cat.getAttribute('style')).toBe(before);
    expect(cat.querySelector('img')!.className).not.toMatch(/pet-(walking|act-)/);
  });

  it('food lies on the ground in front of an eating pet, not above it (owner, playtest 25)', async () => {
    vi.useFakeTimers();
    // 0.1: walk left to 0.14, then stop and eat (the first action)
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    withPets();
    render(<PetWalkers />);
    await act(async () => {
      vi.advanceTimersByTime(PET_WALK.tickMs * 7);
    });
    const cat = screen.getByTestId('walking-pet-cat');
    expect(cat.getAttribute('data-action')).toBe('eat');
    const food = screen.getByTestId('pet-prop-cat');
    expect(food.textContent).toBe('🍎');
    expect(food.className).toContain('bottom-0');
    expect(food.className).toContain('pet-food');
    // facing left after walking left, so the food is on its left
    expect(food.className).toContain('right-full');
    expect(screen.queryByTestId('pet-bubble-cat')).toBeNull();
    vi.restoreAllMocks();
  });
});
