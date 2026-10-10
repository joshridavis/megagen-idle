/**
 * The desktop app (1.96): one window around the same Vite build as the web,
 * loaded from local files (works offline). Packaged for Windows (Steam) by
 * electron-builder in .github/workflows/desktop.yml.
 */
import { app, BrowserWindow, ipcMain, Menu, net, protocol, shell } from 'electron';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { APP_SCHEME, contentType, isExternalLink, isSaveKey, resolveAppFile, saveFilePath, START_URL } from './files';

// The built game: dist-desktop/ next to dist-electron/ (see npm run desktop:web).
const GAME_ROOT = join(__dirname, '..', 'dist-desktop');

protocol.registerSchemesAsPrivileged([
  { scheme: APP_SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

if (!app.requestSingleInstanceLock()) app.quit();

let win: BrowserWindow | null = null;

function createWindow(): void {
  win = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0f172b',
    autoHideMenuBar: true,
    title: 'MegaGen Idle',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      // keep the game's timers running at full speed while minimized is not needed:
      // gains are timestamp-based and the welcome-back summary uses minimize and restore
      backgroundThrottling: true,
    },
  });
  // links open in the system browser, never in a game window
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalLink(url)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (url.startsWith(`${APP_SCHEME}:`)) return;
    e.preventDefault();
    if (isExternalLink(url)) void shell.openExternal(url);
  });
  const send = (minimized: boolean) => win?.webContents.send('window:state', minimized);
  win.on('minimize', () => send(true));
  win.on('restore', () => send(false));
  win.on('closed', () => (win = null));
  void win.loadURL(START_URL);
}

// Saves: one file per key in the user data folder, written safely (temp file, then rename).
ipcMain.handle('save:read', async (_e, key: unknown) => {
  if (!isSaveKey(key)) return null;
  try {
    return await readFile(saveFilePath(app.getPath('userData'), key), 'utf8');
  } catch {
    return null;
  }
});
ipcMain.handle('save:write', async (_e, key: unknown, text: unknown) => {
  if (!isSaveKey(key) || typeof text !== 'string') return false;
  const file = saveFilePath(app.getPath('userData'), key);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(`${file}.tmp`, text, 'utf8');
  await rename(`${file}.tmp`, file);
  return true;
});
ipcMain.handle('save:remove', async (_e, key: unknown) => {
  if (!isSaveKey(key)) return false;
  await rm(saveFilePath(app.getPath('userData'), key), { force: true });
  return true;
});
ipcMain.on('link:open', (_e, url: unknown) => {
  if (typeof url === 'string' && isExternalLink(url)) void shell.openExternal(url);
});
ipcMain.on('window:isMinimized', (e) => {
  e.returnValue = win?.isMinimized() ?? false;
});

app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

void app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  protocol.handle(APP_SCHEME, async (request) => {
    const file = resolveAppFile(GAME_ROOT, request.url);
    if (!file) return new Response('Not found', { status: 404 });
    try {
      const res = await net.fetch(pathToFileURL(file).toString());
      return new Response(res.body, { status: res.status, headers: { 'content-type': contentType(file) } });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  });
  createWindow();
});

app.on('window-all-closed', () => app.quit());
