import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import { pickSaved } from '../store/migrations';

afterEach(cleanup);

const openTab = async () => {
  render(<App />);
  fireEvent.click(await screen.findByRole('tab', { name: /Achievements/ }));
};

describe('collapsible Cosmetics section (1.69)', () => {
  it('starts open for a new player', async () => {
    useStore.setState(createInitialState(Date.now()));
    await openTab();
    const toggle = screen.getByTestId('cosmetics-toggle');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-controls')).toBe('cosmetics-body');
    expect(screen.getByTestId('title-select')).toBeTruthy();
    expect(screen.getByTestId('title-tiers')).toBeTruthy();
    expect(screen.queryByTestId('cosmetics-summary')).toBeNull();
  });

  it('closes to a summary line and opens again', async () => {
    useStore.setState({ ...createInitialState(Date.now()), achievements: { energy_100k: 1 } });
    useStore.getState().setCosmetics({ title: 'energy_100k' });
    await openTab();
    const toggle = screen.getByTestId('cosmetics-toggle');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByTestId('title-select')).toBeNull();
    expect(screen.queryByTestId('title-tiers')).toBeNull();
    const summary = screen.getByTestId('cosmetics-summary');
    expect(summary.textContent).toContain('Title: Live Wire');
    expect(summary.textContent).toContain('Accent: Amber');
    // The achievements list below is unchanged.
    expect(screen.getByTestId('achievement-energy_100k')).toBeTruthy();
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByTestId('title-select')).toBeTruthy();
  });

  it('remembers the choice in the save', async () => {
    useStore.setState(createInitialState(Date.now()));
    await openTab();
    fireEvent.click(screen.getByTestId('cosmetics-toggle'));
    const saved = pickSaved(useStore.getState());
    expect(saved.settings.cosmeticsOpen).toBe(false);
    cleanup();
    useStore.setState({ ...createInitialState(Date.now()), settings: saved.settings });
    await openTab();
    expect(screen.getByTestId('cosmetics-toggle').getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByTestId('cosmetics-summary')).toBeTruthy();
  });
});
