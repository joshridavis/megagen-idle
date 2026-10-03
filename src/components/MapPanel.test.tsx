import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import { GeneratorType } from '../types/generator';
import { deriveRates } from '../utils/simulation';
import ActiveGenerators from './ActiveGenerators';
import MapPanel from './MapPanel';

afterEach(cleanup);

describe('Map tab (1.04)', () => {
  it('shows every machine, its details on hover, and jumps to it on click', () => {
    useStore.getState().resetGame();
    useStore.setState(
      deriveRates({ ...createInitialState(0), activeGenerators: [{ id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 2 }] }),
    );
    const onSelect = vi.fn();
    render(<MapPanel onSelect={onSelect} />);
    expect(screen.getByText(/Your site \(5\/13 tiles\)/)).toBeTruthy();
    const solar = screen.getByTestId('map-gen-1');
    fireEvent.mouseEnter(solar);
    expect(screen.getByTestId('map-info').textContent).toContain('Solar Panel #1 · Lv 2');
    fireEvent.click(solar);
    expect(screen.getByTestId('map-info').textContent).toContain('Moving Solar Panel #1');
    fireEvent.click(screen.getByRole('button', { name: 'Find in list' }));
    expect(onSelect).toHaveBeenCalledWith('gen-1');
    expect(screen.getAllByTestId(/^map-(quarry|mine|coalMine)-/)).toHaveLength(3);
  });

  it('draws terrain and moves a solar panel onto the plateau for its bonus (1.05)', () => {
    useStore.getState().resetGame();
    useStore.setState(
      deriveRates({
        ...createInitialState(0),
        roomCapacity: 23,
        activeGenerators: [{ id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 }],
        mapPins: { 'gen-1': 0 },
      }),
    );
    const before = useStore.getState().energyPerSecond;
    const { container } = render(<MapPanel onSelect={() => {}} />);
    expect(container.querySelectorAll('[data-terrain="river"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-terrain="sea"]').length).toBeGreaterThan(0);
    expect(screen.getByTestId('map-legend').textContent).toContain('Sunny plateau');
    fireEvent.click(screen.getByTestId('map-gen-1'));
    expect(screen.getAllByTestId('best-spot').length).toBeGreaterThan(0);
    // tile 16 of the first row is on the plateau
    const tiles = container.querySelectorAll('[data-terrain]');
    fireEvent.mouseEnter(tiles[16]);
    expect(screen.getByTestId('map-info').textContent).toContain('place here (+20%)');
    fireEvent.click(tiles[16]);
    const s = useStore.getState();
    expect(s.mapPins['gen-1']).toBe(16);
    expect(s.energyPerSecond).toBeCloseTo(before + 0.5 * 0.2);
    // 1.14: the star explains itself
    fireEvent.mouseEnter(screen.getByTestId('star-gen-1'));
    expect(screen.getByRole('tooltip').textContent).toBe('Sunny plateau: +20% output, because the whole Solar Panel stands on it.');
  });

  it('shows the 📍 tooltip in Your generators (1.14)', () => {
    useStore.getState().resetGame();
    const base = createInitialState(0);
    useStore.setState(
      deriveRates({ ...base, roomCapacity: 23, activeGenerators: [{ id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 }], mapPins: { 'gen-1': 16 } }),
    );
    render(<ActiveGenerators />);
    const pin = screen.getByTestId('pin-gen-1');
    expect(pin.textContent).toContain('📍 +20%');
    const pinTip = () => screen.queryAllByRole('tooltip', { hidden: true }).find((t) => t.textContent?.includes('Move machines in the Map tab.'));
    expect(pinTip()).toBeUndefined();
    fireEvent.focus(pin);
    // drawn on top of the page (1.19), not inside the scrolling list
    const tip = pinTip()!;
    expect(tip.textContent).toContain('Sunny plateau: +20% output');
    expect(pin.contains(tip)).toBe(false);
    expect(tip.parentElement).toBe(document.body);
    fireEvent.blur(pin);
    expect(pinTip()).toBeUndefined();
  });

  it('drags a machine to a new spot; a bad drop moves nothing (1.16)', () => {
    useStore.getState().resetGame();
    useStore.setState(
      deriveRates({
        ...createInitialState(0),
        roomCapacity: 23,
        activeGenerators: [{ id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 }],
        mapPins: { 'gen-1': 0 },
      }),
    );
    render(<MapPanel onSelect={() => {}} />);
    // 26 columns (24 + sea) by 10 rows, 20 px per tile
    const grid = screen.getByTestId('site-map');
    grid.getBoundingClientRect = () => ({ left: 0, top: 0, width: 520, height: 200, right: 520, bottom: 200, x: 0, y: 0, toJSON: () => ({}) });
    const solar = screen.getByTestId('map-gen-1');
    const at = (x: number, y: number) => ({ clientX: x * 20 + 10, clientY: y * 20 + 10, button: 0, pointerId: 1 });
    fireEvent.pointerDown(solar, at(0, 0));
    fireEvent.pointerMove(solar, at(8, 0));
    fireEvent.pointerMove(solar, at(16, 0));
    expect(screen.getByTestId('map-info').textContent).toContain('place here (+20%)');
    fireEvent.pointerUp(solar, at(16, 0));
    fireEvent.click(solar);
    expect(useStore.getState().mapPins['gen-1']).toBe(16);
    expect(screen.getByTestId('map-info').textContent).toContain('Moved Solar Panel #1');
    // dropped half outside the site (tile 23 is still fenced): refused, it stays put
    fireEvent.pointerDown(solar, at(16, 0));
    fireEvent.pointerMove(solar, at(22, 0));
    fireEvent.pointerUp(solar, at(22, 0));
    expect(useStore.getState().mapPins['gen-1']).toBe(16);
    expect(screen.getByTestId('map-info').textContent).toContain('It does not fit there');
  });
});

describe('map events and the Exclusion Zone (playtest 19)', () => {
  it('draws map events with pixel sprites, not emoji', () => {
    useStore.getState().resetGame();
    useStore.setState(deriveRates(createInitialState(0)));
    const now = Date.now();
    for (const [id, sprite] of [
      ['map_flock', 'map_bird'],
      ['map_delivery', 'map_truck'],
      ['map_fire', 'map_fire'],
    ] as const) {
      useStore.setState({ mapEvent: { id, at: now, cells: [0, 1], ...(id === 'map_fire' ? { claimUntil: now + 30_000 } : {}) } });
      render(<MapPanel onSelect={() => {}} />);
      const ev = screen.getByTestId('map-event');
      expect(ev.getAttribute('data-sprite')).toBe(sprite);
      expect(ev.querySelector('img')).toBeTruthy();
      expect(ev.textContent).not.toMatch(/\p{Extended_Pictographic}/u);
      cleanup();
    }
  });

  it('tells a small site where the Exclusion Zone is', () => {
    useStore.getState().resetGame();
    useStore.setState(deriveRates(createInitialState(0)));
    render(<MapPanel onSelect={() => {}} />);
    expect(screen.getByTestId('exclusion-hint').textContent).toContain('room expansions 9 and 10');
    cleanup();
    useStore.setState(deriveRates({ ...createInitialState(0), roomCapacity: 700 }));
    render(<MapPanel onSelect={() => {}} />);
    expect(screen.queryByTestId('exclusion-hint')).toBeNull();
  });
});
