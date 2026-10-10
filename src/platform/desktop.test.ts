import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AsyncKV } from '../store/storage';
import { createDesktopKV, createDesktopPlatform, type DesktopBridge } from './desktop';

/** A fake Electron bridge: files in a Map, window state set by the test. */
function fakeBridge(files = new Map<string, string>()) {
  let listener: ((m: boolean) => void) | null = null;
  const opened: string[] = [];
  const bridge: DesktopBridge = {
    readSave: async (k) => files.get(k) ?? null,
    writeSave: async (k, t) => {
      files.set(k, t);
      return true;
    },
    removeSave: async (k) => files.delete(k),
    openExternal: (u) => void opened.push(u),
    isMinimized: () => false,
    onWindowState: (cb) => {
      listener = cb;
      return () => (listener = null);
    },
  };
  return { bridge, files, opened, setMinimized: (m: boolean) => listener?.(m), listening: () => listener !== null };
}

const browserKV = (data: Record<string, unknown>): AsyncKV & { reads: number } => {
  const kv = {
    reads: 0,
    getItem: async <T,>(k: string) => {
      kv.reads++;
      return (data[k] as T) ?? null;
    },
    setItem: async <T,>(_k: string, v: T) => v,
    removeItem: async () => {},
  };
  return kv;
};

afterEach(() => {
  delete (window as unknown as { megagenDesktop?: unknown }).megagenDesktop;
  vi.resetModules();
});

describe('the desktop platform (1.96)', () => {
  it('is in the background while the window is minimized, and back on restore', () => {
    const f = fakeBridge();
    const p = createDesktopPlatform(f.bridge);
    expect(p.name).toBe('desktop');
    const seen: boolean[] = [];
    const off = p.onBackground((h) => seen.push(h));
    f.setMinimized(true);
    expect(p.isBackground()).toBe(true);
    f.setMinimized(true); // repeated events report once
    f.setMinimized(false);
    expect(seen).toEqual([true, false]);
    expect(p.isBackground()).toBe(false);
    off();
    expect(f.listening()).toBe(false);
  });

  it('opens links in the system browser and has no store yet', async () => {
    const f = fakeBridge();
    const p = createDesktopPlatform(f.bridge);
    p.openExternal('https://megagenidle.com/');
    expect(f.opened).toEqual(['https://megagenidle.com/']);
    expect(p.purchases.name).toBe('none');
  });

  it('saves in files, as JSON', async () => {
    const f = fakeBridge();
    const kv = createDesktopKV(f.bridge, null);
    await kv.setItem('megagen-idle-save', '{"state":{}}');
    await kv.setItem('megagen-idle-save:savedAt', 123);
    expect(f.files.get('megagen-idle-save')).toBe(JSON.stringify('{"state":{}}'));
    expect(await kv.getItem('megagen-idle-save:savedAt')).toBe(123);
    await kv.removeItem('megagen-idle-save');
    expect(await kv.getItem('megagen-idle-save')).toBeNull();
  });

  it('copies the browser save over once when there is no file yet', async () => {
    const f = fakeBridge();
    const browser = browserKV({ 'megagen-idle-save': 'old game' });
    const kv = createDesktopKV(f.bridge, browser);
    expect(await kv.getItem('megagen-idle-save')).toBe('old game');
    expect(f.files.get('megagen-idle-save')).toBe(JSON.stringify('old game'));
    // from now on the file is used; the browser is not read again
    expect(await kv.getItem('megagen-idle-save')).toBe('old game');
    expect(browser.reads).toBe(1);
    // a file that exists always wins over the browser copy
    const g = fakeBridge(new Map([['megagen-idle-save', JSON.stringify('file game')]]));
    expect(await createDesktopKV(g.bridge, browserKV({ 'megagen-idle-save': 'old game' })).getItem('megagen-idle-save')).toBe('file game');
  });

  it('the game picks the desktop platform when the bridge is there, the web otherwise', async () => {
    expect((await import('./index')).platform.name).toBe('web');
    vi.resetModules();
    (window as unknown as { megagenDesktop: DesktopBridge }).megagenDesktop = fakeBridge().bridge;
    const { platform } = await import('./index');
    expect(platform.name).toBe('desktop');
    expect(platform.saveKV).toBeDefined();
  });
});
