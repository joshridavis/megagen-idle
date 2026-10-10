import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../data/initialState';
import { EVENTS_BY_ID } from '../data/events';
import { PET_WALK } from '../data/pets';
import { useStore } from '../store';
import PetsPanel from './PetsPanel';
import PetWalkers, { petShadowPose } from './PetWalkers';
import Sightings from './Sightings';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const adult = { stage: 3, growUntil: null, foundAt: 0 };
const withPets = (settings: Partial<ReturnType<typeof createInitialState>['settings']> = {}) => {
  useStore.getState().resetGame();
  useStore.setState({
    pets: { active: 'cat', extra: [], slots: 1, owned: { cat: adult } },
    settings: { ...createInitialState(0).settings, ...settings },
    petReaction: null,
  });
};

const show = async (id: string) => {
  useStore.getState().resetGame();
  render(<Sightings />);
  await act(async () => {
    useStore.setState({ activeSighting: { id, at: 0 } });
  });
  return screen.getByTestId(`sighting-${id}`);
};

describe('flying sightings cast a shadow (2.00)', () => {
  const FLYING = ['spaceship', 'ufo', 'balloon', 'hot_air_balloon', 'paper_plane', 'comet', 'drone', 'whale'];

  it.each(FLYING)('%s has an air shadow that moves with the sprite', async (id) => {
    expect(EVENTS_BY_ID[id]).toBeDefined();
    const el = await show(id);
    const mover = el.querySelector('[data-shadow="air"]') as HTMLElement;
    expect(mover).not.toBeNull();
    expect(mover.className).toContain('air-shadow');
    // the shadow is on the moving element itself, so it follows it
    expect(mover.className).toMatch(/sighting-/);
    expect(mover.querySelector('img')).not.toBeNull();
  });

  it('every falling meteor has one too', async () => {
    const el = await show('meteor_shower');
    const meteors = el.querySelectorAll('.sighting-fall');
    expect(meteors.length).toBeGreaterThan(0);
    for (const m of meteors) expect(m.className).toContain('air-shadow');
  });

  it('the gulls keep the shadow drawn into their sprite', async () => {
    const el = await show('birds');
    expect(el.querySelector('[data-shadow="sprite"]')).not.toBeNull();
  });

  it('the walking cat has a ground shadow, like the pets', async () => {
    const el = await show('cat');
    const walker = el.querySelector('[data-shadow="ground"]') as HTMLElement;
    expect(walker.className).not.toContain('air-shadow');
    expect(walker.querySelector('.ground-shadow')).not.toBeNull();
  });
});

describe('pets cast a ground shadow (2.00)', () => {
  it('the shadow shrinks while the pet is in the air and stays still otherwise', () => {
    expect(petShadowPose('pet-act-jump')).toBe('pet-shadow-jump');
    expect(petShadowPose('pet-react')).toBe('pet-shadow-hop');
    expect(petShadowPose('pet-reaction-celebrate')).toBe('pet-shadow-celebrate');
    expect(petShadowPose('pet-walking')).toBe('');
    expect(petShadowPose('pet-act-sleep')).toBe('');
    expect(petShadowPose('')).toBe('');
  });

  it('a walking pet has a shadow on the ground, outside the part that jumps and turns', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    withPets();
    render(<PetWalkers />);
    await act(async () => {
      vi.advanceTimersByTime(PET_WALK.tickMs * 6);
    });
    const cat = screen.getByTestId('walking-pet-cat');
    const shadow = cat.querySelector('[data-testid="pet-shadow"]') as HTMLElement;
    expect(shadow.className).toContain('ground-shadow');
    // a direct child of the pet: the jump moves the img, the turn flips its own span; neither moves the shadow
    expect(shadow.parentElement).toBe(cat);
    expect(shadow.contains(cat.querySelector('img'))).toBe(false);
    // when clicked the pet hops and its shadow shrinks under it
    await act(async () => {
      fireEvent.click(cat);
    });
    expect(cat.querySelector('img')!.className).toContain('pet-react');
    expect(shadow.className).toContain('pet-shadow-hop');
  });

  it('the shadow shows with Reduce motion too', () => {
    withPets({ reduceMotion: true });
    render(<PetWalkers />);
    expect(screen.getByTestId('walking-pet-cat').querySelector('.ground-shadow')).not.toBeNull();
  });

  it('the pet in the Pets tab has one under it', async () => {
    withPets();
    render(<PetsPanel />);
    const pic = screen.getByTestId('pet-picture-cat');
    const shadow = pic.querySelector('[data-testid="pet-shadow"]') as HTMLElement;
    expect(shadow.className).toContain('ground-shadow');
    await act(async () => {
      fireEvent.click(pic);
    });
    expect(shadow.className).toContain('pet-shadow-hop');
  });
});
