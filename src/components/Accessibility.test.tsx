import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import { GeneratorType } from '../types/generator';
import { deriveRates } from '../utils/simulation';
import MapPanel from './MapPanel';
import { useFocusTrap } from './useFocusTrap';

afterEach(cleanup);

const fresh = () => {
  useStore.getState().resetGame();
  useStore.setState({ ...createInitialState(Date.now()), welcomeBack: null });
  useStore.getState().setTutorialStep(99);
};

describe('Keyboard access (0.41)', () => {
  it('tabs are one Tab stop; arrows, Home and End move between them', () => {
    fresh();
    render(<App />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.filter((t) => t.tabIndex === 0)).toHaveLength(1);
    const generators = screen.getByRole('tab', { name: /Generators/ });
    generators.focus();
    fireEvent.keyDown(generators, { key: 'ArrowRight' });
    const map = screen.getByRole('tab', { name: /Map/ });
    expect(map.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(map);
    expect(map.tabIndex).toBe(0);
    expect(generators.tabIndex).toBe(-1);
    fireEvent.keyDown(map, { key: 'End' });
    expect(screen.getByRole('tab', { name: /Settings/ }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' });
    expect(generators.getAttribute('aria-selected')).toBe('true'); // wraps around
    fireEvent.keyDown(generators, { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: /Settings/ }).getAttribute('aria-selected')).toBe('true');
    fireEvent.keyDown(document.activeElement!, { key: 'Home' });
    expect(generators.getAttribute('aria-selected')).toBe('true');
  });

  it('the tab bar wraps instead of scrolling sideways, and hidden labels stay inside their tab', () => {
    fresh();
    render(<App />);
    const nav = screen.getByRole('tablist');
    expect(nav.className).toContain('flex-wrap');
    expect(nav.className).not.toContain('overflow-x-auto');
    for (const tab of screen.getAllByRole('tab')) expect(tab.className.split(' ')).toContain('relative');
  });

  it('the in-game Reduce motion setting marks the page so CSS animations stop', () => {
    fresh();
    render(<App />);
    expect(document.documentElement.hasAttribute('data-reduce-motion')).toBe(false);
    fireEvent.click(screen.getByRole('tab', { name: /Settings/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Reduce motion/ }));
    expect(useStore.getState().settings.reduceMotion).toBe(true);
    expect(document.documentElement.hasAttribute('data-reduce-motion')).toBe(true);
    fireEvent.click(screen.getByRole('checkbox', { name: /Reduce motion/ }));
    expect(document.documentElement.hasAttribute('data-reduce-motion')).toBe(false);
  });

  it('moves a machine on the map with Enter, the arrow keys and Enter; Escape cancels', () => {
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
    const solar = screen.getByTestId('map-gen-1');
    // Escape cancels a move
    fireEvent.click(solar);
    fireEvent.keyDown(solar, { key: 'ArrowRight' });
    fireEvent.keyDown(solar, { key: 'Escape' });
    expect(screen.getByTestId('map-info').textContent).not.toContain('Moving');
    expect(useStore.getState().mapPins['gen-1']).toBe(0);
    // arrows move the outline, Enter places it (tile 16 is on the sunny plateau)
    fireEvent.click(solar);
    for (let i = 0; i < 16; i++) fireEvent.keyDown(solar, { key: 'ArrowRight' });
    expect(screen.getByTestId('map-info').textContent).toContain('place here (+20%)');
    fireEvent.keyDown(solar, { key: 'Enter' });
    expect(useStore.getState().mapPins['gen-1']).toBe(16);
    // arrow keys do nothing while the machine is not selected
    fireEvent.keyDown(screen.getByTestId('map-gen-1'), { key: 'ArrowLeft' });
    expect(screen.getByTestId('map-info').textContent).not.toContain('Moving');
  });
});

function Trap() {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref);
  return (
    <>
      <button type="button">outside</button>
      <div ref={ref}>
        <button type="button">first</button>
        <button type="button" disabled>
          off
        </button>
        <button type="button">last</button>
      </div>
    </>
  );
}

describe('useFocusTrap (0.41)', () => {
  it('wraps Tab from the last control to the first, and Shift+Tab back', () => {
    render(<Trap />);
    const first = screen.getByRole('button', { name: 'first' });
    const last = screen.getByRole('button', { name: 'last' });
    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
    // focus that escaped the dialog is brought back in
    screen.getByRole('button', { name: 'outside' }).focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
  });
});
