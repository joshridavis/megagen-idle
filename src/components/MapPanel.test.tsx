import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import { GeneratorType } from '../types/generator';
import { deriveRates } from '../utils/simulation';
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
      deriveRates({ ...createInitialState(0), activeGenerators: [{ id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 1 }] }),
    );
    const before = useStore.getState().energyPerSecond;
    const { container } = render(<MapPanel onSelect={() => {}} />);
    expect(container.querySelectorAll('[data-terrain="river"]').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-terrain="sea"]').length).toBeGreaterThan(0);
    expect(screen.getByTestId('map-legend').textContent).toContain('Sunny plateau');
    fireEvent.click(screen.getByTestId('map-gen-1'));
    expect(screen.getAllByTestId('best-spot').length).toBeGreaterThan(0);
    // tile 4 of the first row is on the plateau
    const tiles = container.querySelectorAll('[data-terrain]');
    fireEvent.mouseEnter(tiles[4]);
    expect(screen.getByTestId('map-info').textContent).toContain('place here (+20%)');
    fireEvent.click(tiles[4]);
    const s = useStore.getState();
    expect(s.mapPins['gen-1']).toBe(4);
    expect(s.energyPerSecond).toBeCloseTo(before + 0.5 * 0.2);
  });
});
