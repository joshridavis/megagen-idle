import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';
import { useStore } from './store';
import { createInitialState } from './data/initialState';

afterEach(cleanup);

describe('App smoke test', () => {
  it('renders the energy display with its icon', () => {
    render(<App />);
    expect(screen.getByTestId('energy-display')).toBeTruthy();
    expect(screen.getByAltText('Energy')).toBeTruthy();
  });

  it('starts from the documented initial state', () => {
    const s = createInitialState(0);
    expect(s.energy).toBe(0);
    expect(s.resources).toEqual({ metal: 15, stone: 10, coal: 0, naturalGas: 0 });
    expect(s.producers).toEqual({ quarry: 1, mine: 1, coalMine: 1 });
    expect(s.researchLevel).toBe(1);
    expect(s.activeGenerators).toEqual([]);
    expect(s.roomCapacity).toBe(10);
    expect(s.roomUsed).toBe(0);
    expect(useStore.getState().roomCapacity).toBe(10);
  });
});

describe('Clicker UI', () => {
  it('adds energy when the button is clicked', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    const before = useStore.getState().energy;
    fireEvent.click(screen.getByRole('button', { name: /generate energy/i }));
    fireEvent.click(screen.getByRole('button', { name: /generate energy/i }));
    expect(useStore.getState().energy).toBeCloseTo(before + 2, 1);
  });
});

describe('Resource UI', () => {
  it('shows inventory with amounts and rates', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    expect(screen.getByLabelText('Metal amount').textContent).toBe('15');
    expect(screen.getByTestId('resource-stone').textContent).toContain('+0.10/s');
  });

  it('shows and dismisses the fuel warning', () => {
    useStore.setState({ ...createInitialState(Date.now()), depletedResources: ['coal'] });
    render(<App />);
    expect(screen.getByRole('alert').textContent).toContain('Coal ran out');
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('Generator UI loop', () => {
  it('builds a generator, shows it running, and toggles it off', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Build Solar Panel' }));
    const s = useStore.getState();
    expect(s.activeGenerators).toHaveLength(1);
    expect(s.resources.metal).toBeCloseTo(5, 0);
    expect(screen.getByLabelText('Energy rate').textContent).toBe('+0.5/s');
    expect(screen.getByText('Running')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Turn off Solar Panel #1' }));
    expect(useStore.getState().energyPerSecond).toBe(0);
    expect(screen.getByText('Off')).toBeTruthy();
  });

  it('disables building with the reason when short of resources', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    const coal = screen.getByTestId('generator-card-coal');
    const btn = coal.querySelector('button')!;
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toBe('Not enough resources');
  });
});
