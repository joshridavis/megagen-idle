import { afterEach, describe, expect, it, vi } from 'vitest';
import { BOOT_FADE_MIN_MS, BOOT_FADE_MS } from '../data/boot';
import { bootShouldFade, hideBootLoader } from './bootLoader';

const addLoader = () => {
  const el = document.createElement('div');
  el.id = 'boot-loader';
  document.body.appendChild(el);
  return el;
};

afterEach(() => {
  document.getElementById('boot-loader')?.remove();
  delete window.__megagenStarted;
  vi.useRealTimers();
});

describe('loading screen (1.49)', () => {
  it('fades only on slower loads and never with reduced motion', () => {
    expect(bootShouldFade(BOOT_FADE_MIN_MS - 1, false)).toBe(false);
    expect(bootShouldFade(BOOT_FADE_MIN_MS, false)).toBe(true);
    expect(bootShouldFade(5000, true)).toBe(false);
  });

  it('a fast load removes the loader at once and marks the game started', () => {
    const el = addLoader();
    hideBootLoader(50, false);
    expect(el.isConnected).toBe(false);
    expect(window.__megagenStarted).toBe(true);
  });

  it('a slower load fades the loader out, then removes it', () => {
    vi.useFakeTimers();
    const el = addLoader();
    hideBootLoader(1200, false);
    expect(el.classList.contains('boot-hide')).toBe(true);
    expect(el.isConnected).toBe(true);
    vi.advanceTimersByTime(BOOT_FADE_MS + 50);
    expect(el.isConnected).toBe(false);
  });

  it('does nothing harmful when there is no loader (tests, hot reload)', () => {
    expect(() => hideBootLoader(1000, false)).not.toThrow();
    expect(window.__megagenStarted).toBe(true);
  });
});
