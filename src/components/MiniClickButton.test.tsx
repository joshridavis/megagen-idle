import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';

// A fake IntersectionObserver the test drives by hand (jsdom has none).
let observers: { cb: IntersectionObserverCallback; el: Element | null }[] = [];
class FakeObserver {
  entry: { cb: IntersectionObserverCallback; el: Element | null };
  constructor(cb: IntersectionObserverCallback) {
    this.entry = { cb, el: null };
    observers.push(this.entry);
  }
  observe(el: Element) {
    this.entry.el = el;
  }
  disconnect() {
    observers = observers.filter((o) => o !== this.entry);
  }
  unobserve() {}
  takeRecords() {
    return [];
  }
}
const setBigInView = (inView: boolean) =>
  act(() => {
    for (const o of observers) {
      if (o.el?.getAttribute('data-testid') !== 'click-button') continue;
      o.cb([{ isIntersecting: inView, target: o.el } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
    }
  });

beforeEach(() => {
  observers = [];
  vi.stubGlobal('IntersectionObserver', FakeObserver);
  useStore.setState(createInitialState(Date.now()));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Generate-energy button by the pinned bar (1.45)', () => {
  it('is hidden while the big button is on screen', () => {
    render(<App />);
    expect(screen.queryByTestId('mini-click-button')).toBeNull();
    setBigInView(true);
    expect(screen.queryByTestId('mini-click-button')).toBeNull();
    expect(screen.getAllByRole('button', { name: 'Generate energy' })).toHaveLength(1);
  });

  it('appears in the top bar when the big button scrolls out of view, and hides again', () => {
    render(<App />);
    setBigInView(false);
    const mini = screen.getByTestId('mini-click-button');
    expect(screen.getByTestId('top-bar').contains(mini)).toBe(true);
    expect(mini.getAttribute('aria-label')).toBe('Generate energy');
    setBigInView(true);
    expect(screen.queryByTestId('mini-click-button')).toBeNull();
  });

  it('gives the same energy, stats and "+N" pop as the big button', () => {
    render(<App />);
    const start = useStore.getState();
    fireEvent.click(screen.getByTestId('click-button'));
    const afterBig = useStore.getState();
    const perBig = afterBig.energy - start.energy;
    setBigInView(false);
    fireEvent.click(screen.getByTestId('mini-click-button'));
    const afterMini = useStore.getState();
    expect(afterMini.energy - afterBig.energy).toBeCloseTo(perBig, 6);
    expect(afterMini.stats.clicks).toBe(start.stats.clicks + 2);
    expect(screen.getByTestId('mini-click-button').parentElement!.querySelector('.click-pop-down')?.textContent).toMatch(/^\+/);
  });
});
