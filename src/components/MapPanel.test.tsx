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
    expect(onSelect).toHaveBeenCalledWith('gen-1');
    expect(screen.getAllByTestId(/^map-(quarry|mine|coalMine)-/)).toHaveLength(3);
  });
});
