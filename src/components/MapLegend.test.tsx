import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { ZONES, type Zone } from '../data/map';
import { useStore } from '../store';
import { deriveRates } from '../utils/simulation';
import MapLegend, { LEGEND_ZONES } from './MapLegend';
import MapPanel from './MapPanel';

afterEach(cleanup);
beforeEach(() => localStorage.clear());

const noop = () => {};

describe('map legend (1.39)', () => {
  it('has one row per zone on the site, with its bonus and machine icons', () => {
    render(<MapLegend onSite={new Set<Zone>(['plateau', 'coast', 'oilfield'])} highlight={null} onHighlight={noop} />);
    expect(screen.getAllByTestId(/^legend-(?!tip|toggle|highlight)/)).toHaveLength(3);
    const oil = screen.getByTestId('legend-oilfield');
    expect(oil.textContent).toContain('Oil and gas field');
    expect(oil.textContent).toContain('+20%');
    const icons = [...oil.querySelectorAll('img[data-machine]')].map((i) => i.getAttribute('data-machine'));
    expect(icons).toEqual(['gas', 'oil', 'gasWell', 'oilRig']);
    // a must-build zone is tagged; its visitors show apart
    const coast = screen.getByTestId('legend-coast');
    expect(coast.textContent).toContain('only here');
    expect(coast.textContent).toContain('also');
    expect(coast.querySelector('img[data-machine="deuteriumExtractor"]')).not.toBeNull();
    expect(screen.getByTestId('legend-plateau').textContent).not.toContain('only here');
  });

  it('shows the hidden zones with the toggle, and remembers it', () => {
    render(<MapLegend onSite={new Set<Zone>(['plateau'])} highlight={null} onHighlight={noop} />);
    expect(screen.queryByTestId('legend-lake')).toBeNull();
    fireEvent.click(screen.getByTestId('legend-toggle'));
    for (const z of LEGEND_ZONES) expect(screen.getByTestId(`legend-${z}`)).toBeTruthy();
    expect(localStorage.getItem('megagen-idle-legend-all')).toBe('1');
    cleanup();
    render(<MapLegend onSite={new Set<Zone>(['plateau'])} highlight={null} onHighlight={noop} />);
    expect(screen.getByTestId('legend-lake')).toBeTruthy();
  });

  it('has no toggle when every zone is on the site', () => {
    render(<MapLegend onSite={new Set<Zone>(LEGEND_ZONES)} highlight={null} onHighlight={noop} />);
    expect(screen.queryByTestId('legend-toggle')).toBeNull();
  });

  it('keeps the full description in the tooltip, not the visible legend', () => {
    render(<MapLegend onSite={new Set<Zone>(['river'])} highlight={null} onHighlight={noop} />);
    expect(screen.getByTestId('map-legend').textContent).not.toContain(ZONES.river.description);
    fireEvent.mouseEnter(screen.getByTestId('legend-tip-river'));
    expect(screen.getByRole('tooltip').textContent).toBe(`River: ${ZONES.river.description}`);
  });

  it('pointing at a row lights up that zone on the map', () => {
    useStore.getState().resetGame();
    useStore.setState(deriveRates({ ...createInitialState(0), roomCapacity: 23 }));
    const { container } = render(<MapPanel onSelect={noop} />);
    expect(screen.queryAllByTestId('legend-highlight')).toHaveLength(0);
    fireEvent.mouseEnter(screen.getByTestId('legend-plateau'));
    const lit = screen.getAllByTestId('legend-highlight');
    expect(lit.length).toBe(container.querySelectorAll('[data-terrain="plateau"]').length);
    fireEvent.mouseLeave(screen.getByTestId('legend-plateau'));
    expect(screen.queryAllByTestId('legend-highlight')).toHaveLength(0);
    // a tap lights it too (phones send no hover)
    fireEvent.click(screen.getByTestId('legend-ridge'));
    expect(screen.getAllByTestId('legend-highlight').length).toBeGreaterThan(0);
  });
});
