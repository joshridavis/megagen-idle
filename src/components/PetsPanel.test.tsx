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

describe('pet slots in the Pets tab (1.59)', () => {
  it('buys a slot with energy once the player level is reached, then shows each active slot', async () => {
    const { energyForLevel } = await import('../utils/playerLevel');
    const { PET_SLOT_UPGRADES } = await import('../data/pets');
    const adult = { stage: 3, growUntil: null, foundAt: 0 };
    useStore.getState().resetGame();
    useStore.setState({
      energy: PET_SLOT_UPGRADES[0].energy,
      lifetimeEnergy: energyForLevel(PET_SLOT_UPGRADES[0].playerLevel - 1),
      pets: { active: 'cat', owned: { cat: adult, eel: adult } },
    });
    render(<PetsPanel />);
    const buy = screen.getByTestId('pet-slot-buy') as HTMLButtonElement;
    expect(buy.disabled).toBe(true);
    expect(buy.textContent).toContain(`Needs player level ${PET_SLOT_UPGRADES[0].playerLevel}`);
    // full with one slot: Make active takes the cat's place
    expect(screen.getByTestId('pet-activate-eel').textContent).toContain('in place of Static Cat');
    cleanup();
    useStore.setState({ lifetimeEnergy: energyForLevel(PET_SLOT_UPGRADES[0].playerLevel) });
    render(<PetsPanel />);
    expect((screen.getByTestId('pet-slot-buy') as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByTestId('pet-slot-buy'));
    expect(useStore.getState().energy).toBe(0);
    expect(screen.getByTestId('pet-slots').textContent).toContain('Active pet slots: 2/3');
    fireEvent.click(screen.getByTestId('pet-activate-eel'));
    expect(useStore.getState().pets.extra).toEqual(['eel']);
    expect(screen.getByTestId('pet-eel').textContent).toContain('Active (slot 2)');
    fireEvent.click(screen.getByTestId('pet-rest-eel'));
    expect(useStore.getState().pets.extra).toEqual([]);
  });
});
