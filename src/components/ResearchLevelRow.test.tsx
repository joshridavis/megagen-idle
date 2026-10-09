import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
import { createInitialState } from '../data/initialState';
import { RESEARCH_BY_ID } from '../data/research';
import { useStore } from '../store';

afterEach(cleanup);

const open = (id: string, researchLevel: number) => {
  useStore.setState({ ...createInitialState(Date.now()), researchLevel });
  render(<App />);
  fireEvent.click(screen.getByRole('tab', { name: 'Research' }));
  fireEvent.click(screen.getByTestId(`research-node-${id}`));
  return screen.getByTestId('research-level-req');
};

describe('research level in the requirements (1.90)', () => {
  it('is red when the level is too low', () => {
    const need = RESEARCH_BY_ID.nuclear_fission.requiredLevel;
    const row = open('nuclear_fission', 2);
    expect(row.textContent).toBe(`${need} (yours: 2)`);
    expect(row.className).toContain('text-red-400');
    expect(row.previousElementSibling?.textContent).toBe('Research level');
  });

  it('is green when the level is met', () => {
    const row = open('hydropower', 40);
    expect(row.className).toContain('text-emerald-400');
    expect(row.className).not.toContain('text-red-400');
  });

  it('shows for a research with no prerequisites, and is no longer under the title', () => {
    expect(RESEARCH_BY_ID.basic_solar.prerequisites).toEqual([]);
    const row = open('basic_solar', 1);
    expect(row.textContent).toBe('1 (yours: 1)');
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).not.toContain('Needs research level');
    expect(dialog.textContent).not.toContain('raises your level by 1');
    // said once, in the rewards
    expect(screen.getByTestId('research-rewards').textContent).toContain('Research level +1');
  });
});
