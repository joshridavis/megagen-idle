import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useJustBecame } from './useJustBecame';

afterEach(() => vi.useRealTimers());

describe('useJustBecame (0.43)', () => {
  it('is true for a while after the flag turns on, then false again', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ flag, epoch }) => useJustBecame(flag, epoch, 1000), { initialProps: { flag: false, epoch: 0 } });
    expect(result.current).toBe(false);
    rerender({ flag: true, epoch: 0 });
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(false);
  });

  it('stays off when the flag changes because a game was loaded', () => {
    const { result, rerender } = renderHook(({ flag, epoch }) => useJustBecame(flag, epoch), { initialProps: { flag: false, epoch: 0 } });
    rerender({ flag: true, epoch: 1 });
    expect(result.current).toBe(false);
  });

  it('stays off when the flag was already on', () => {
    const { result, rerender } = renderHook(({ flag, epoch }) => useJustBecame(flag, epoch), { initialProps: { flag: true, epoch: 0 } });
    rerender({ flag: true, epoch: 0 });
    expect(result.current).toBe(false);
  });
});
