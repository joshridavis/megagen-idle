/**
 * The bridge between the desktop app and the game (1.96). The game sees only
 * `window.megagenDesktop` (see src/platform/desktop.ts), never Electron itself.
 */
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('megagenDesktop', {
  readSave: (key: string): Promise<string | null> => ipcRenderer.invoke('save:read', key),
  writeSave: (key: string, text: string): Promise<boolean> => ipcRenderer.invoke('save:write', key, text),
  removeSave: (key: string): Promise<boolean> => ipcRenderer.invoke('save:remove', key),
  openExternal: (url: string): void => ipcRenderer.send('link:open', url),
  isMinimized: (): boolean => ipcRenderer.sendSync('window:isMinimized'),
  onWindowState: (callback: (minimized: boolean) => void): (() => void) => {
    const handler = (_e: unknown, minimized: boolean) => callback(minimized);
    ipcRenderer.on('window:state', handler);
    return () => ipcRenderer.removeListener('window:state', handler);
  },
});
