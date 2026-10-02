import { afterEach, describe, expect, it, vi } from 'vitest';
import { platform } from '.';
import { webPlatform } from './web';

const setVisibility = (v: 'visible' | 'hidden') => {
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => v });
  document.dispatchEvent(new Event('visibilitychange'));
};

afterEach(() => setVisibility('visible'));

describe('platform layer (0.87)', () => {
  it('the game runs on the web platform today', () => {
    expect(platform.name).toBe('web');
    expect(platform).toBe(webPlatform);
  });

  it('reports going to the background and back, and can unsubscribe', () => {
    const seen: boolean[] = [];
    const off = platform.onBackground((hidden) => seen.push(hidden));
    setVisibility('hidden');
    expect(platform.isBackground()).toBe(true);
    setVisibility('visible');
    off();
    setVisibility('hidden');
    expect(seen).toEqual([true, false]);
  });

  it('opens links in a new tab without giving the page access', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    platform.openExternal('https://example.com');
    expect(open).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener,noreferrer');
    open.mockRestore();
  });
});
