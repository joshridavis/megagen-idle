import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { createInitialState } from '../data/initialState';
import { PET_REACT_MS, PET_STAGE_HEIGHT, PET_WALK } from '../data/pets';
import { useStore } from '../store';
import { seededRng } from '../utils/rng';
import { nextStep, pickPace, startWalkers, stepWalkers, walkMs, type Walker } from '../utils/petWalk';
import PetWalkers, { BUBBLE_WIDTH_PX, bubblePlace, mirrorBubble } from './PetWalkers';
import SettingsPanel from './SettingsPanel';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const adult = { stage: 3, growUntil: null, foundAt: 0 };
const withPets = (settings: Partial<ReturnType<typeof createInitialState>['settings']> = {}) => {
  useStore.getState().resetGame();
  useStore.setState({
    pets: { active: 'cat', extra: ['eel'], slots: 2, owned: { cat: adult, eel: adult, hamster: adult } },
    settings: { ...createInitialState(0).settings, ...settings },
  });
  // owning pets unlocks achievements, which the pets would celebrate (1.80): start calm
  useStore.setState({ petReaction: null });
};

describe('walker logic (1.60)', () => {
  it('spreads pets out, then walks or acts, staying on screen', () => {
    const rng = seededRng(7);
    let w = startWalkers(['cat', 'eel'], 0);
    expect(w.map((x) => x.x)).toEqual([1 / 3, 2 / 3]);
    let now = 0;
    const seen = new Set<string>();
    for (let i = 0; i < 3000; i++) {
      w = stepWalkers(w, ['cat', 'eel'], now, rng);
      for (const x of w) {
        expect(x.x).toBeGreaterThanOrEqual(0.05);
        expect(x.x).toBeLessThanOrEqual(0.95);
        seen.add(x.action);
      }
      now += PET_WALK.tickMs;
    }
    expect(seen).toEqual(new Set(['walk', 'eat', 'play', 'rest', 'sleep', 'sit', 'jump']));
  });

  it('a walk faces the way it goes and lasts as long as the distance needs', () => {
    const w = nextStep({ id: 'cat', from: 0.8, x: 0.8, left: false, action: 'rest', until: 0 }, 1000, () => 0.1);
    expect(w.action).toBe('walk');
    expect(w.x).toBeLessThan(0.8);
    expect(w.left).toBe(true);
    // a roll of 0.1 picks the slow stroll (1.79)
    expect(w.pace).toBe(0.5);
    expect(w.until).toBe(1000 + walkMs(0.8, w.x, 0.5));
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
    // a fixed roll: no meeting (1.81) keeps a pet waiting
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    withPets();
    render(<PetWalkers />);
    await act(async () => {
      vi.advanceTimersByTime(PET_WALK.tickMs * 6);
    });
    const cat = screen.getByTestId('walking-pet-cat');
    expect(cat.getAttribute('data-action')).not.toBe('still');
    expect(cat.getAttribute('data-action')).not.toBe('rest');
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
    // 0.1: rest 5 s, stroll left to 0.14 (about 33 s at half speed, 1.79), then stop and eat (the first action)
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    withPets();
    render(<PetWalkers />);
    await act(async () => {
      vi.advanceTimersByTime(PET_WALK.tickMs * 40);
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

  it('naps last long, pets rest without a bubble, and they stop often (owner, playtest 25)', () => {
    const walking = { id: 'cat' as const, from: 0.5, x: 0.5, left: false, action: 'walk' as const, until: 0 };
    // sleep is the last action in the weights: a roll near 1 picks it; the last roll sets the length
    const rolls = [0.1, 0.99, 0];
    const nap = nextStep(walking, 0, () => rolls.shift()!);
    expect(nap.action).toBe('sleep');
    expect(nap.until).toBeGreaterThanOrEqual(45_000);
    // pets stop after most walks
    const rng = seededRng(3);
    let stops = 0;
    for (let i = 0; i < 1000; i++) if (nextStep(walking, 0, rng).action !== 'walk') stops++;
    expect(stops).toBeGreaterThan(650);
    // after an action a pet may rest before walking on; after resting it walks
    expect(nextStep({ ...walking, action: 'eat' }, 0, () => 0.1).action).toBe('rest');
    expect(nextStep({ ...walking, action: 'rest' }, 0, () => 0.1).action).toBe('walk');
  });

  it('a resting pet stands still with no bubble or food', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // no chance meeting (1.81) on the first step
    withPets();
    render(<PetWalkers />);
    // the pets start out resting
    const cat = screen.getByTestId('walking-pet-cat');
    expect(cat.getAttribute('data-action')).toBe('rest');
    expect(screen.queryByTestId('pet-bubble-cat')).toBeNull();
    expect(screen.queryByTestId('pet-prop-cat')).toBeNull();
    expect(cat.querySelector('img')!.className).not.toMatch(/pet-(walking|act-(eat|play|sleep|jump))/);
  });

  it('bubbles sit beside the head on the side the pet faces, never cut off at the edges (1.76, 1.82)', async () => {
    // baby: drawn 55% tall, curled up to 80% of that while asleep
    expect(bubblePlace({ action: 'sleep', left: false, x: 0.5 }, 1)).toEqual({ side: 'right', style: { bottom: 'calc(44% - 6px)', left: '75%' } });
    expect(bubblePlace({ action: 'sleep', left: true, x: 0.5 }, 1)).toEqual({ side: 'left', style: { bottom: 'calc(44% - 6px)', right: '75%' } });
    expect(bubblePlace({ action: 'sit', left: false, x: 0.5 }, 3).style.bottom).toBe('calc(100% - 6px)');
    expect(bubblePlace({ action: 'jump', left: true, x: 0.5 }, 2).style.bottom).toBe('calc(78% - 6px)');
    for (const action of ['sit', 'jump', 'sleep'] as const) {
      for (const stage of [1, 2, 3]) {
        expect(bubblePlace({ action, left: false, x: 0.5 }, stage, 375)).toMatchObject({ side: 'right', style: { left: '75%' } });
        expect(bubblePlace({ action, left: true, x: 0.5 }, stage, 375)).toMatchObject({ side: 'left', style: { right: '75%' } });
      }
    }
    // near the edges on a 375 px phone the bubble flips inward and stays fully on screen
    const size = PET_WALK.size;
    for (const layer of [375, 1280]) {
      for (const x of [0, 0.05, 0.5, 0.95, 1]) {
        for (const left of [false, true]) {
          const { side } = bubblePlace({ action: 'sit', left, x }, 3, layer);
          const petLeft = x * (layer - size);
          const near = side === 'right' ? petLeft + size * 0.75 : petLeft + size * 0.25;
          const [a, b] = side === 'right' ? [near, near + BUBBLE_WIDTH_PX] : [near - BUBBLE_WIDTH_PX, near];
          expect(a).toBeGreaterThanOrEqual(0);
          expect(b).toBeLessThanOrEqual(layer);
        }
      }
    }
    expect(bubblePlace({ action: 'sit', left: false, x: 1 }, 3, 375).side).toBe('left');
    expect(bubblePlace({ action: 'sit', left: true, x: 0 }, 3, 375).side).toBe('right');
    // the 💭 glyph's own trail points to its lower left: mirrored on the pet's left so it points at the head,
    // never mirrored on the right; ❗ and 💤 are never mirrored (owner report, playtest 27)
    expect(mirrorBubble('sit', 'left')).toBe(true);
    expect(mirrorBubble('sit', 'right')).toBe(false);
    for (const action of ['jump', 'sleep'] as const) for (const side of ['left', 'right'] as const) expect(mirrorBubble(action, side)).toBe(false);
    // the same heights as the sprite script draws
    const { readFileSync } = await import('node:fs');
    const script = readFileSync('scripts/generate-generic-assets.mjs', 'utf8');
    expect(script).toContain(`const PET_STAGE_SCALE = { 1: ${PET_STAGE_HEIGHT[0]}, 2: ${PET_STAGE_HEIGHT[1]}, 3: ${PET_STAGE_HEIGHT[2]} };`);
    // the bob animation does not repeat the centering shift
    const css = readFileSync('src/index.css', 'utf8');
    expect(css).toMatch(/@keyframes pet-bubble \{ 0%, 100% \{ transform: translateY\(0\); \}/);
    // the dot trail is drawn only for a thought (💭), never beside ❗ or 💤
    expect(css).toContain('.pet-bubble[data-trail]::before {');
    expect(css).not.toMatch(/\.pet-bubble(\[data-side='(left|right)'\])?::before/);
  });
});

describe('walking pets at different speeds (1.79)', () => {
  const rest = (id: Walker['id'] = 'cat'): Walker => ({ id, from: 0.5, x: 0.5, left: false, action: 'rest', until: 0 });
  /** Many walks with a seeded rng: every pace seen, and the distance over the walking time. */
  const walks = (id: Walker['id'], n = 4000) => {
    const rng = seededRng(11);
    let w = rest(id);
    const paces = new Set<number>();
    let dist = 0;
    let ms = 0;
    for (let i = 0; i < n; i++) {
      w = nextStep({ ...w, action: 'rest' }, 0, rng);
      paces.add(w.pace!);
      dist += Math.abs(w.x - w.from);
      ms += w.until;
    }
    return { paces, speed: dist / (ms / 1000) };
  };

  it('walks come in several speeds', () => {
    expect([...walks('cat').paces].sort()).toEqual([0.5, 1, 2]);
  });

  it("a walk's duration matches its distance and pace", () => {
    const rng = seededRng(5);
    for (let i = 0; i < 50; i++) {
      const w = nextStep(rest(), 1000, rng);
      expect(w.until - 1000).toBeCloseTo(walkMs(w.from, w.x, w.pace), 6);
      if (Math.abs(w.x - w.from) / (PET_WALK.speed * w.pace!) > 0.5) expect(w.until - 1000).toBeCloseTo((Math.abs(w.x - w.from) / (PET_WALK.speed * w.pace!)) * 1000, 6);
    }
  });

  it('the long-run average speed stays within 20% of the old single speed', () => {
    const { speed } = walks('cat');
    expect(Math.abs(speed / PET_WALK.speed - 1)).toBeLessThan(0.2);
  });

  it('some pets have their own pace: the tortoise is slow, the robot dog quick', () => {
    expect(walks('tortoise').speed).toBeLessThan(walks('cat').speed);
    expect(walks('robodog').speed).toBeGreaterThan(walks('cat').speed);
    expect(pickPace('tortoise', () => 0.6)).toBeCloseTo(0.6);
    expect(pickPace('cat', () => 0.99)).toBe(2);
  });

  it('the walking bob follows the pace', async () => {
    vi.useFakeTimers();
    // 0.99: after the first rest, a quick trot
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    withPets();
    render(<PetWalkers />);
    await act(async () => {
      vi.advanceTimersByTime(PET_WALK.tickMs * 6);
    });
    const img = screen.getByTestId('walking-pet-cat').querySelector('img')!;
    expect(screen.getByTestId('walking-pet-cat').getAttribute('data-action')).toBe('walk');
    expect(img.getAttribute('data-pace')).toBe('2');
    expect(img.style.animationDuration).toBe('0.25s');
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
});
