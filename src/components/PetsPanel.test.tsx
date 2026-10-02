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
