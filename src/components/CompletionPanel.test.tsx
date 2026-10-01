import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import { GeneratorType } from '../types/generator';
import { formatCompletion, getCompletion } from '../utils/completion';

afterEach(cleanup);

describe('completion log (0.66)', () => {
  it('formats completion with one decimal, rounded down, 100% only when complete', () => {
    expect(formatCompletion(0)).toBe('0.0%');
    expect(formatCompletion(0.17188)).toBe('17.1%');
    expect(formatCompletion(0.99999)).toBe('99.9%');
    expect(formatCompletion(1)).toBe('100.0%');
  });

  it('lists every entry of every part, and the counts match the entries', () => {
    const s = { ...createInitialState(0), records: { builtTypes: [GeneratorType.SOLAR], bestLevel: { solar: 3 } } };
    const c = getCompletion(s);
    for (const p of c.parts) {
      expect(p.items).toHaveLength(p.total);
      expect(p.items.filter((i) => i.done)).toHaveLength(p.done);
    }
    const maxed = c.parts.find((p) => p.label === 'Generator types at max level')!;
    expect(maxed.items.find((i) => i.id === 'solar')).toMatchObject({ done: false, detail: 'Lv 3/10' });
  });

  it('shows the % on its tab and lists what is left when a part is opened', () => {
    useStore.setState({ ...createInitialState(0), completedResearch: ['basic_solar'] });
    render(<App />);
    const pct = formatCompletion(getCompletion(useStore.getState()).ratio);
    expect(screen.getByTestId('completion-tab-pct').textContent).toBe(pct);
    fireEvent.click(screen.getByRole('tab', { name: /Completion/ }));
    expect(screen.getByTestId('completion-total').textContent).toBe(pct);
    fireEvent.click(screen.getByRole('button', { name: /^Research ?\d+\/\d+/ }));
    const list = screen.getByTestId('completion-research').querySelector('ul')!;
    expect(within(list).getByText('Basic Solar').parentElement!.textContent).toContain('(done)');
    expect(within(list).getByText('Wind Power Fundamentals').parentElement!.textContent).toContain('(not yet)');
  });
});
