import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../data/initialState';
import { PET_REACT_MS } from '../data/pets';
import { useStore } from '../store';
import PetsPanel from './PetsPanel';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const withHamster = (reduceMotion = false) => {
  useStore.getState().resetGame();
  useStore.setState({
    pets: { active: 'hamster', owned: { hamster: { stage: 1, growUntil: null, foundAt: 0 } } },
    settings: { ...createInitialState(0).settings, reduceMotion },
  });
};

describe('pets react when clicked (0.99)', () => {
  it('plays a short animation, then stops', async () => {
    vi.useFakeTimers();
    withHamster();
    render(<PetsPanel />);
    const pic = screen.getByTestId('pet-picture-hamster');
    await act(async () => {
      fireEvent.click(pic);
    });
    expect(pic.getAttribute('data-playing')).toBe('true');
    expect(pic.querySelector('img')!.className).toContain('pet-react');
    await act(async () => {
      vi.advanceTimersByTime(PET_REACT_MS);
    });
    expect(pic.getAttribute('data-playing')).toBe('false');
  });

  it('stays still with Reduce motion on', async () => {
    withHamster(true);
    render(<PetsPanel />);
    const pic = screen.getByTestId('pet-picture-hamster');
    await act(async () => {
      fireEvent.click(pic);
    });
    expect(pic.getAttribute('data-playing')).toBe('false');
  });
});

describe('pet cards: one grows at a time, and the next stage bonus (1.57)', () => {
  it('shows what the pet grows to, and Feed is off while another pet grows', () => {
    useStore.getState().resetGame();
    const now = Date.now();
    useStore.setState({
      energy: 1e9,
      pets: {
        active: 'hamster',
        owned: { hamster: { stage: 1, growUntil: now + 3 * 3_600_000, foundAt: 0 }, cat: { stage: 2, growUntil: null, foundAt: 0 } },
      },
    });
    render(<PetsPanel />);
    expect(screen.getByTestId('pet-bonus-hamster').textContent).toBe('+50% energy per click');
    expect(screen.getByTestId('pet-next-hamster').textContent).toBe('Grows to: +100% energy per click as Young');
    expect(screen.getByTestId('pet-bonus-cat').textContent).toBe('+1.5% energy from all generators');
    expect(screen.getByTestId('pet-next-cat').textContent).toBe('Grows to: +3% energy from all generators as Adult');
    const feed = screen.getByRole('button', { name: /Feed/ }) as HTMLButtonElement;
    expect(feed.disabled).toBe(true);
    expect(screen.getByTestId('pet-feed-note-cat').textContent).toMatch(/^Another pet is growing \(.+ left\)$/);
  });
});
