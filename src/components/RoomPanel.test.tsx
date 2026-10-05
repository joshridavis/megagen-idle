import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { ROOM_TIERS } from '../data/rooms';
import { useStore } from '../store';
import { energyForLevel } from '../utils/playerLevel';
import RoomPanel from './RoomPanel';

afterEach(cleanup);

describe('room expansion player level (1.61)', () => {
  it('shows the level the next expansion needs and waits for it', () => {
    const tier2 = ROOM_TIERS[1];
    const rich = { ...createInitialState(0), energy: 1e9, expansionLevel: 1, resources: { metal: 1e6, stone: 1e6, coal: 1e5, naturalGas: 1e4, oil: 0, uranium: 0, deuterium: 0 } };
    useStore.setState({ ...rich, lifetimeEnergy: energyForLevel(tier2.playerLevel - 1) });
    render(<RoomPanel />);
    expect(screen.getByTestId('expansion-level').textContent).toBe(`Requires player level ${tier2.playerLevel} (you have ${tier2.playerLevel - 1})`);
    const button = screen.getByRole('button', { name: `Needs player level ${tier2.playerLevel}` }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    cleanup();
    useStore.setState({ lifetimeEnergy: energyForLevel(tier2.playerLevel) });
    render(<RoomPanel />);
    expect((screen.getByRole('button', { name: `Expand room (+${tier2.capacity})` }) as HTMLButtonElement).disabled).toBe(false);
  });
});
