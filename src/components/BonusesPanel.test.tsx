import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import BonusesPanel from './BonusesPanel';

afterEach(cleanup);
beforeEach(() => {
  localStorage.clear();
  useStore.setState({ ...createInitialState(0), completedResearch: ['basic_solar', 'hand_crank'] });
});

describe('Active bonuses panel (1.21)', () => {
  it('opens and closes, shows a short summary when closed, and remembers the choice', () => {
    render(<BonusesPanel />);
    const panel = screen.getByTestId('bonuses-panel') as HTMLDetailsElement;
    expect(panel.open).toBe(true);
    expect(screen.queryByTestId('bonuses-short')).toBeNull();
    panel.open = false;
    fireEvent(panel, new Event('toggle'));
    expect(screen.getByTestId('bonuses-short').textContent).toContain('⚡ +10%');
    expect(localStorage.getItem('megagen-idle-bonuses-open')).toBe('0');
    cleanup();
    render(<BonusesPanel />);
    expect((screen.getByTestId('bonuses-panel') as HTMLDetailsElement).open).toBe(false);
  });
});
