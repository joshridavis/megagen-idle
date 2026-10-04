import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import ErrorBoundary from './ErrorBoundary';

afterEach(cleanup);

let broken = true;
function Game() {
  if (broken) throw new Error('boom');
  return <p>The game</p>;
}

describe('ErrorBoundary (0.46)', () => {
  it('shows the recovery screen instead of a blank page, logs the error, and recovers on Try again', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    useStore.getState().clearLog();
    broken = true;
    render(
      <ErrorBoundary>
        <Game />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('recovery').textContent).toContain('Something went wrong');
    expect(screen.getByText('boom')).toBeTruthy();
    expect(useStore.getState().eventLog[0].text).toContain('The game hit an error');
    expect(useStore.getState().eventLog[0].kind).toBe('save');
    broken = false;
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('The game')).toBeTruthy();
  });

  it('downloads the save from the recovery screen', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const created = vi.fn(() => 'blob:x');
    URL.createObjectURL = created;
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    broken = true;
    render(
      <ErrorBoundary>
        <Game />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Download save' }));
    expect(created).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(screen.getByRole('status').textContent).toContain('Save downloaded');
  });

  it('reset starts a new game after asking, and the game draws again', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    useStore.setState({ ...createInitialState(0), energy: 12345 });
    broken = true;
    render(
      <ErrorBoundary>
        <Game />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reset game…' }));
    broken = false;
    fireEvent.click(screen.getByRole('button', { name: 'Yes, start over' }));
    expect(await screen.findByText('The game')).toBeTruthy();
    expect(useStore.getState().energy).toBe(900);
  });
});
