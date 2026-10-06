import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { GROW_HOURS } from '../data/pets';
import { useStore } from '../store';
import { growProgress } from '../utils/pets';
import PetsPanel from './PetsPanel';
import ResearchCelebration from './ResearchCelebration';

afterEach(cleanup);

const T0 = 1_700_000_000_000;
const HOUR = 3_600_000;

/** A hamster growing from baby to young, one hour in. */
const growingHamster = (reduceMotion = false) => {
  useStore.getState().resetGame();
  useStore.setState({
    lastSavedTimestamp: T0,
    pets: { active: 'hamster', owned: { hamster: { stage: 1, growUntil: T0 + (GROW_HOURS[0] - 1) * HOUR, foundAt: 0 } } },
    settings: { ...createInitialState(0).settings, reduceMotion },
    celebrations: [],
  });
};

describe('growProgress (1.58)', () => {
  it('runs from 0 when fed to 1 when grown, clamped', () => {
    const until = T0 + GROW_HOURS[1] * HOUR;
    expect(growProgress(2, until, T0)).toBe(0);
    expect(growProgress(2, until, T0 + (GROW_HOURS[1] / 2) * HOUR)).toBeCloseTo(0.5);
    expect(growProgress(2, until, until + HOUR)).toBe(1);
    expect(growProgress(2, until, T0 - HOUR)).toBe(0);
  });
});

describe('a growing pet on its card (1.58)', () => {
  it('pulses with sparkles and shows a progress bar with the time left', () => {
    growingHamster();
    render(<PetsPanel />);
    const pic = screen.getByTestId('pet-picture-hamster');
    expect(pic.getAttribute('data-growing')).toBe('true');
    expect(pic.querySelector('img')!.className).toContain('pet-growing');
    expect(pic.querySelectorAll('.pet-sparkle').length).toBeGreaterThan(0);
    const box = screen.getByTestId('pet-growing-hamster');
    const bar = box.querySelector('[role="progressbar"]')!;
    expect(bar.getAttribute('aria-valuenow')).toBe(String(Math.round(100 / GROW_HOURS[0])));
    expect(box.textContent).toContain('Growing to young: 1h');
  });

  it('stays still with Reduce motion on, but keeps the progress bar', () => {
    growingHamster(true);
    render(<PetsPanel />);
    const pic = screen.getByTestId('pet-picture-hamster');
    expect(pic.getAttribute('data-growing')).toBe('false');
    expect(pic.querySelector('img')!.className).not.toContain('pet-growing');
    expect(pic.querySelectorAll('.pet-sparkle').length).toBe(0);
    expect(screen.getByTestId('pet-growing-hamster').querySelector('[role="progressbar"]')).not.toBeNull();
  });

  it('a pet that is not growing does not pulse', () => {
    growingHamster();
    useStore.setState({ pets: { active: 'hamster', owned: { hamster: { stage: 2, growUntil: null, foundAt: 0 } } } });
    render(<PetsPanel />);
    expect(screen.getByTestId('pet-picture-hamster').getAttribute('data-growing')).toBe('false');
    expect(screen.queryByTestId('pet-growing-hamster')).toBeNull();
  });
});

describe('stage-up celebration (1.58)', () => {
  const due = T0 + GROW_HOURS[0] * HOUR;

  it('a live tick that grows a pet queues a celebration and logs it', () => {
    growingHamster();
    useStore.getState().tickPets(due, true);
    const s = useStore.getState();
    expect(s.pets.owned.hamster!.stage).toBe(2);
    expect(s.celebrations).toEqual([{ kind: 'pet', id: 'hamster', stage: 2, at: due }]);
    expect(s.eventLog[0].text).toContain('Wheel Hamster grew up: now young');
  });

  it('catching up on time away logs it without a celebration', () => {
    growingHamster();
    useStore.getState().tickPets(due, false);
    const s = useStore.getState();
    expect(s.pets.owned.hamster!.stage).toBe(2);
    expect(s.celebrations).toEqual([]);
    expect(s.eventLog[0].text).toContain('grew up');
  });

  it('shows the old sprite growing into the new one, on any tab', () => {
    growingHamster();
    useStore.getState().tickPets(due, true);
    render(<ResearchCelebration />);
    const card = screen.getByTestId('pet-celebration');
    expect(card.textContent).toContain('Wheel Hamster');
    expect(card.textContent).toContain('Now young');
    expect(card.getAttribute('data-animated')).toBe('true');
    expect(screen.getByTestId('pet-celebration-old').getAttribute('src')).toBeTruthy();
    expect(card.querySelector('.pet-grow-flash')).not.toBeNull();
    expect(card.querySelector('.pet-grow-new')).not.toBeNull();
  });

  it('with Reduce motion on, shows only the message and the new sprite', () => {
    growingHamster(true);
    useStore.getState().tickPets(due, true);
    render(<ResearchCelebration />);
    const card = screen.getByTestId('pet-celebration');
    expect(card.getAttribute('data-animated')).toBe('false');
    expect(screen.queryByTestId('pet-celebration-old')).toBeNull();
    expect(card.querySelector('.pet-grow-flash')).toBeNull();
    expect(card.querySelector('.pet-grow-new')).toBeNull();
    expect(card.textContent).toContain('grew up');
  });
});
