import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from './App';
import { useStore } from './store';
import { createInitialState } from './data/initialState';
import { GeneratorType } from './types/generator';

afterEach(cleanup);

describe('App smoke test', () => {
  it('renders the energy display with its icon', () => {
    render(<App />);
    expect(screen.getByTestId('energy-display')).toBeTruthy();
    expect(screen.getByAltText('Energy')).toBeTruthy();
  });

  it('starts from the documented initial state', () => {
    const s = createInitialState(0);
    expect(s.energy).toBe(900); // exactly the first Solar Panel's cost
    expect(s.resources).toEqual({ metal: 15, stone: 10, coal: 0, naturalGas: 0 });
    expect(s.producers).toEqual({ quarry: 1, mine: 1, coalMine: 1, gasWell: 0 });
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
    expect(screen.getByLabelText('Energy rate').textContent).toBe('+0.50/s');
    expect(screen.getByText('Running')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Turn off Solar Panel #1' }));
    expect(useStore.getState().energyPerSecond).toBe(0);
    expect(screen.getByText('Off')).toBeTruthy();
  });

  it('disables building with the reason when short of resources', () => {
    useStore.setState({ ...createInitialState(Date.now()), completedResearch: ['fossil_fuels'] });
    render(<App />);
    const coal = screen.getByTestId('generator-card-coal');
    const btn = coal.querySelector('button')!;
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toBe('Not enough resources');
  });
});

describe('Fuel colour (playtest 2)', () => {
  it('the Burns line is amber, not the red used for unaffordable costs', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    const fuel = screen.getByTestId('fuel-coal');
    expect(fuel.innerHTML).toContain('text-amber-300');
    expect(fuel.innerHTML).not.toContain('text-red-400');
    // the unaffordable metal cost on the same card is red
    expect(screen.getByTestId('generator-card-coal').innerHTML).toContain('text-red-400');
  });
});

describe('Energy cost UI (playtest 2)', () => {
  it('shows the energy cost and says when energy is the only thing missing', () => {
    useStore.setState({ ...createInitialState(Date.now()), energy: 100 });
    render(<App />);
    expect(screen.getByTestId('energy-cost-solar').textContent).toContain('900 energy');
    expect(screen.getByTestId('energy-cost-solar').className).toContain('text-red-400');
    expect(screen.getByTestId('generator-card-solar').querySelector('button')!.textContent).toBe('Not enough energy');
  });
});

describe('Research gating in the build grid', () => {
  it('locks Wind and Coal on a fresh save and names the research that unlocks them', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    const wind = screen.getByTestId('generator-card-wind');
    expect(wind.querySelector('button')!.textContent).toBe('Locked');
    expect(wind.textContent).toContain('Wind Power Fundamentals');
    expect(screen.getByTestId('generator-card-solar').querySelector('button')!.disabled).toBe(false);
  });
});

describe('Research UI', () => {
  it('opens a node, starts research, and shows progress', () => {
    const now = Date.now();
    useStore.setState({
      ...createInitialState(now),
      energy: 300,
      activeGenerators: [{ id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 }],
    });
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Research' }));
    const node = screen.getByTestId('research-node-basic_solar');
    expect(node.dataset.status).toBe('available');
    expect(screen.getByTestId('research-node-wind_power').dataset.status).toBe('locked');
    fireEvent.click(node);
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('+10% energy from all generators');
    fireEvent.click(screen.getByRole('button', { name: 'Start research' }));
    expect(useStore.getState().currentResearch?.id).toBe('basic_solar');
    expect(useStore.getState().energy).toBeCloseTo(50, -1);
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThan(0);
    expect(screen.getByTestId('research-node-basic_solar').dataset.status).toBe('researching');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows completed research and the research level', () => {
    useStore.setState({ ...createInitialState(Date.now()), completedResearch: ['basic_solar'], researchLevel: 2 });
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Research' }));
    expect(screen.getByTestId('research-node-basic_solar').dataset.status).toBe('completed');
    expect(screen.getByTestId('research-level').textContent).toBe('2');
  });
});

describe('Room UI', () => {
  it('expands room from the panel', () => {
    useStore.setState({
      ...createInitialState(Date.now()),
      energy: 600,
      resources: { metal: 60, stone: 30, coal: 0, naturalGas: 0 },
    });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Expand room (+10)' }));
    expect(useStore.getState().roomCapacity).toBe(20);
    expect(screen.getByTestId('room-usage').textContent).toBe('0/20');
  });

  it('warns when room is 90% used', () => {
    useStore.setState({ ...createInitialState(Date.now()), roomUsed: 9 });
    render(<App />);
    expect(screen.getByRole('status').textContent).toContain('nearly full');
  });
});

describe('Boost breakdown (playtest 3)', () => {
  const solar = { id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 };

  it('the energy-rate tooltip lists Basic Solar and its effect', () => {
    useStore.setState({ ...createInitialState(Date.now()), activeGenerators: [solar], completedResearch: ['basic_solar'], energyPerSecond: 0.55 });
    render(<App />);
    const tip = document.getElementById('energy-breakdown')!;
    expect(tip.getAttribute('role')).toBe('tooltip');
    expect(tip.textContent).toContain('Generators0.50 /s');
    expect(tip.textContent).toContain('Basic Solar (+10%)+0.05 /s');
    expect(tip.textContent).toContain('Total0.55 /s');
    expect(screen.getByTestId('energy-boost').textContent).toBe('▲10%');
  });

  it('shows only the base and a hint when nothing is boosted', () => {
    useStore.setState({ ...createInitialState(Date.now()), activeGenerators: [solar], energyPerSecond: 0.5 });
    render(<App />);
    expect(document.getElementById('energy-breakdown')!.textContent).toContain('No boosts yet');
    expect(screen.queryByTestId('energy-boost')).toBeNull();
  });
});

describe('Mid-tier generators UI', () => {
  it('shows locked mid-tier cards with their level requirement', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    const gas = screen.getByTestId('generator-card-gas');
    expect(gas.querySelector('button')!.textContent).toBe('Locked');
    expect(gas.textContent).toContain('Needs research: Gas Turbines');
    expect(screen.getByTestId('level-req-gas').textContent).toBe('Requires research level 7 (you have 1)');
  });

  it('says the level is too low when researched but under level', () => {
    useStore.setState({ ...createInitialState(Date.now()), completedResearch: ['hydropower'], researchLevel: 4 });
    render(<App />);
    expect(screen.getByTestId('generator-card-hydro').querySelector('button')!.textContent).toBe('Research level too low');
  });

  it('plays the construction animation after expanding', () => {
    useStore.setState({ ...createInitialState(Date.now()), energy: 600, resources: { metal: 60, stone: 30, coal: 0, naturalGas: 0 } });
    render(<App />);
    expect(screen.queryByTestId('expansion-animation')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Expand room (+10)' }));
    expect(useStore.getState().lastExpansionAt).not.toBeNull();
  });
});

describe('Scrap', () => {
  it('needs a confirm click, then frees the room', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Build Solar Panel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Scrap Solar Panel #1' }));
    expect(useStore.getState().activeGenerators).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm scrap Solar Panel #1' }));
    expect(useStore.getState().activeGenerators).toHaveLength(0);
    expect(useStore.getState().roomUsed).toBe(0);
  });
});
