import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import pkg from '../package.json';
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
    expect(s.roomCapacity).toBe(13); // 10 for generators + 3 for the starting producers
    expect(s.roomUsed).toBe(3);
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
    expect(useStore.getState().roomCapacity).toBe(23);
    expect(screen.getByTestId('room-usage').textContent).toBe('3/23');
  });

  it('warns when room is 90% used', () => {
    useStore.setState({ ...createInitialState(Date.now()), roomUsed: 12 });
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

  it('builds the new meter segments in after expanding', () => {
    useStore.setState({ ...createInitialState(Date.now()), energy: 600, resources: { metal: 60, stone: 30, coal: 0, naturalGas: 0 } });
    render(<App />);
    const meter = () => screen.getByRole('meter', { name: 'Room used' });
    expect(meter().querySelectorAll('[data-phase="building"]').length).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Expand room (+10)' }));
    expect(meter().querySelectorAll('img').length).toBe(23);
    // right after expanding: the first new segment is scaffolding, the old 13 are untouched
    expect(meter().querySelectorAll('img')[13].getAttribute('data-phase')).toBe('building');
    expect(meter().querySelectorAll('img')[12].getAttribute('data-phase')).toBe('done');
  });
});

describe('Scrap', () => {
  it('tells the player there is no refund, and Cancel keeps the generator', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Build Solar Panel' }));
    const scrapBtn = screen.getByRole('button', { name: 'Scrap Solar Panel #1' });
    expect(document.getElementById(scrapBtn.getAttribute('aria-describedby')!)!.textContent).toContain('No refund');
    fireEvent.click(scrapBtn);
    expect(screen.getByRole('alert').textContent).toContain('No refund');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel scrap Solar Panel #1' }));
    expect(screen.queryByRole('alert')).toBeNull();
    expect(useStore.getState().activeGenerators).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Scrap Solar Panel #1' })).toBeTruthy();
  });

  it('needs a confirm click, then frees the room', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Build Solar Panel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Scrap Solar Panel #1' }));
    expect(useStore.getState().activeGenerators).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm scrap Solar Panel #1' }));
    expect(useStore.getState().activeGenerators).toHaveLength(0);
    expect(useStore.getState().roomUsed).toBe(3); // only the starting producers
  });
});

describe('Version footer (playtest 4)', () => {
  it('shows the package.json version', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    expect(screen.getByTestId('version').textContent).toContain(`v${pkg.version}`);
  });
});

describe('Research level label (playtest 4)', () => {
  it('says what the level is now and when it rises', () => {
    const now = Date.now();
    useStore.setState({
      ...createInitialState(now),
      energy: 5000,
      researchLevel: 2,
      completedResearch: ['basic_solar'],
      activeGenerators: [{ id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 }],
    });
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Research' }));
    fireEvent.click(screen.getByTestId('research-node-wind_power'));
    fireEvent.click(screen.getByRole('button', { name: 'Start research' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useStore.getState().researchLevel).toBe(2);
    expect(screen.getByTestId('research-level-label').textContent).toBe('Your research level: 2');
    expect(screen.getByTestId('research-level-next').textContent).toBe('Rises to 3 when Wind Power Fundamentals finishes');
    expect(screen.getByTestId('research-node-hydropower').textContent).toContain('Needs level 4');
  });
});

describe('Producers (0.31)', () => {
  it('buys a quarry from the Producers tab: count, room and stone rate go up', () => {
    useStore.setState({ ...createInitialState(Date.now()), energy: 1000, resources: { metal: 20, stone: 10, coal: 0, naturalGas: 0 } });
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Producers' }));
    expect(screen.getByTestId('producer-owned-quarry').textContent).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: 'Build Stone Quarry' }));
    expect(screen.getByTestId('producer-owned-quarry').textContent).toBe('2');
    expect(useStore.getState().roomUsed).toBe(4);
    expect(screen.getByTestId('resource-stone').textContent).toContain('+0.20/s');
    expect(screen.getByTestId('producer-card-gasWell').textContent).toContain('Needs research: Natural Gas Extraction');
  });

  it('resource rates have a breakdown tooltip', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    const tip = document.getElementById('resource-breakdown-metal')!;
    expect(tip.getAttribute('role')).toBe('tooltip');
    expect(tip.textContent).toContain('Producers (1)');
    expect(tip.textContent).toContain('Total');
  });
});

describe('Producer rates', () => {
  it('shows slow producers per hour', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Producers' }));
    expect(screen.getByTestId('producer-card-gasWell').textContent).toContain('+6 natural gas/h each');
    expect(screen.getByTestId('producer-card-quarry').textContent).toContain('+0.100 stone/s each');
  });
});

describe('Scrap producers (playtest 5/6)', () => {
  const setup = (mines: number) => {
    useStore.setState({
      ...createInitialState(Date.now()),
      producers: { quarry: 1, mine: mines, coalMine: 1, gasWell: 0 },
      roomCapacity: 20,
      roomUsed: 2 + mines,
    });
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Producers' }));
    fireEvent.click(screen.getByRole('button', { name: 'Scrap Metal Mines' }));
  };

  it('Cancel changes nothing', () => {
    setup(3);
    expect(screen.getByRole('alert').textContent).toContain('No refund');
    fireEvent.click(screen.getByRole('button', { name: 'Cancel scrap Metal Mines' }));
    expect(useStore.getState().producers.mine).toBe(3);
  });

  it('asks how many and scraps that many', () => {
    setup(4);
    fireEvent.click(screen.getByRole('button', { name: 'One more' }));
    fireEvent.click(screen.getByRole('button', { name: 'One more' }));
    expect(screen.getByTestId('scrap-summary').textContent).toContain('removes 3 Metal Mines');
    expect(screen.getByTestId('scrap-summary').textContent).toContain('frees 3 room');
    fireEvent.click(screen.getByRole('button', { name: 'Confirm scrap Metal Mines' }));
    expect(useStore.getState().producers.mine).toBe(1);
  });

  it('All scraps every one, and the field never exceeds the owned count', () => {
    setup(2);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Number of Metal Mines to scrap' }), { target: { value: '50' } });
    expect((screen.getByRole('spinbutton', { name: 'Number of Metal Mines to scrap' }) as HTMLInputElement).value).toBe('2');
    fireEvent.click(screen.getByRole('button', { name: 'All (2)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm scrap Metal Mines' }));
    expect(useStore.getState().producers.mine).toBe(0);
    expect(screen.queryByRole('button', { name: 'Scrap Metal Mines' })).toBeNull();
  });
});

describe('Research rewards stand out (playtest 5)', () => {
  const open = (id: string) => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Research' }));
    fireEvent.click(screen.getByTestId(`research-node-${id}`));
    return screen.getByTestId('research-rewards').textContent!;
  };
  it('lists a generator unlock', () => {
    expect(open('wind_power')).toContain('Unlocks the Wind Turbine');
  });
  it('lists a percentage boost and the level gain', () => {
    const t = open('basic_solar');
    expect(t).toContain('You get:');
    expect(t).toContain('+10% energy from all generators');
    expect(t).toContain('Research level +1');
  });
  it('lists a producer grant', () => {
    expect(open('gas_extraction')).toContain('1 free Gas Well');
  });
  it('nodes show a reward hint', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Research' }));
    expect(screen.getByTestId('research-node-hydropower').textContent).toContain('🎁 Hydropower Dam');
  });
});

describe('Research celebration overlay (playtest 5)', () => {
  it('shows on any tab, then hides by itself', () => {
    vi.useFakeTimers();
    try {
      useStore.setState({ ...createInitialState(Date.now()), celebrations: [{ id: 'wind_power', at: Date.now() }] });
      render(<App />);
      // on the Generators tab, not Research
      const c = screen.getByTestId('research-celebration');
      expect(c.textContent).toContain('Research complete!');
      expect(c.textContent).toContain('Wind Power Fundamentals');
      expect(c.textContent).toContain('Unlocks the Wind Turbine');
      act(() => {
        vi.advanceTimersByTime(4000);
      });
      expect(screen.queryByTestId('research-celebration')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('click dismisses it', () => {
    useStore.setState({ ...createInitialState(Date.now()), celebrations: [{ id: 'basic_solar', at: Date.now() }] });
    render(<App />);
    fireEvent.click(screen.getByTestId('research-celebration'));
    expect(screen.queryByTestId('research-celebration')).toBeNull();
  });
});

describe('Tab icons (playtest 5)', () => {
  it('every tab shows its icon and keeps its text label', () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    for (const id of ['generators', 'producers', 'research']) {
      expect(screen.getByTestId(`tab-icon-${id}`).getAttribute('alt')).toBe('');
    }
    expect(screen.getByRole('tab', { name: 'Research' })).toBeTruthy();
  });
});

describe('Generator ordering UI (playtest 6)', () => {
  it('moves a generator up and down with the arrow buttons; names stay stable', () => {
    useStore.setState({
      ...createInitialState(Date.now()),
      activeGenerators: [
        { id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 },
        { id: 'gen-2', type: GeneratorType.SOLAR, isActive: true, level: 1 },
      ],
    });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Move Solar Panel #2 up' }));
    expect(useStore.getState().activeGenerators.map((g) => g.id)).toEqual(['gen-2', 'gen-1']);
    expect(screen.getByRole('button', { name: 'Move Solar Panel #2 down' })).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Move Solar Panel #2 up' }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('Welcome back and settings (0.28)', () => {
  it('shows the welcome-back summary and closes it', () => {
    useStore.setState({
      ...createInitialState(Date.now()),
      welcomeBack: {
        awaySeconds: 3 * 86400,
        creditedSeconds: 86400,
        energyGained: 4321,
        resourcesGained: { metal: 10, stone: 20, coal: -2, naturalGas: 0 },
        completedResearch: ['basic_solar'],
        outOfFuel: [],
      },
    });
    render(<App />);
    const d = screen.getByTestId('welcome-back');
    expect(d.textContent).toContain('3d 0h');
    expect(d.textContent).toContain('Only the first 1d 0h count');
    expect(d.textContent).toContain('+4,321');
    expect(d.textContent).toContain('Research complete: Basic Solar');
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.queryByTestId('welcome-back')).toBeNull();
  });

  it('rejects a bad import file without touching the current game', async () => {
    useStore.setState({ ...createInitialState(Date.now()), energy: 777 });
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    const file = new File(['not json'], 'save.json', { type: 'application/json' });
    fireEvent.change(screen.getByLabelText('Import save file'), { target: { files: [file] } });
    expect(await screen.findByRole('status')).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('not changed');
    expect(useStore.getState().energy).toBe(777);
  });

  it('imports a valid file after confirmation', async () => {
    const { exportSave } = await import('./utils/saveFile');
    const text = exportSave({ ...createInitialState(1), energy: 4242 });
    useStore.setState({ ...createInitialState(Date.now()), energy: 1 });
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: 'Settings' }));
    fireEvent.change(screen.getByLabelText('Import save file'), { target: { files: [new File([text], 's.json')] } });
    fireEvent.click(await screen.findByRole('button', { name: 'Load this save' }));
    expect(useStore.getState().energy).toBe(4242);
  });
});
