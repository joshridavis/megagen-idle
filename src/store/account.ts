import { create } from 'zustand';
import { platform } from '../platform';
import { exportSave, parseSaveFile } from '../utils/saveFile';
import { cloudEnabled, cloudErrorText, getCloudService, USERNAME_PATTERN, type CloudService, type CloudUser, type OAuthProvider } from './cloud';
import { AUTO_SLOT, SAME_SAVE_MS, summarize, type SaveChoice, type SaveSummary } from './saveBackend';
import type { GameState } from '../types/state';
import { useStore } from '.';

/**
 * Accounts and cloud sync state (0.68). Not part of the game save: the
 * provider keeps the session itself. When the build has no cloud settings
 * the status stays 'off' and nothing here does anything.
 */
export type AccountStatus = 'off' | 'connecting' | 'signedOut' | 'signedIn';

export interface AccountState {
  status: AccountStatus;
  user: CloudUser | null;
  /** When this device last uploaded, or downloaded, the automatic cloud save. */
  lastSyncAt: number | null;
  busy: boolean;
  error: string | null;
  notice: string | null;
  /** The local and cloud saves differ: the player picks one (owner: newest wins, with a prompt). */
  choice: Extract<SaveChoice, { kind: 'ask' }> | null;
  /** A password-reset link was opened: ask for a new password. */
  recovering: boolean;
  /** Signed in with Google or Discord for the first time: ask for a username (1.22). */
  needsUsername: boolean;
}

export const useAccount = create<AccountState>()(() => ({
  status: 'off',
  user: null,
  lastSyncAt: null,
  busy: false,
  error: null,
  notice: null,
  choice: null,
  recovering: false,
  needsUsername: false,
}));

/** How often the automatic cloud save uploads while playing. */
export const CLOUD_SAVE_INTERVAL_MS = 5 * 60_000;
/** How often to check whether an upload is due (uploads are timestamp-based, not counted). */
export const CLOUD_CHECK_MS = 30_000;

const SYNC_KEY = 'megagen-idle-cloud-sync';

/** When this device last synced with an account's cloud save (per device, per account). */
export function readLastSync(userId: string): number | null {
  try {
    const all = JSON.parse(localStorage.getItem(SYNC_KEY) ?? '{}') as Record<string, number>;
    return typeof all[userId] === 'number' ? all[userId] : null;
  } catch {
    return null;
  }
}

export function writeLastSync(userId: string, at: number): void {
  try {
    const all = JSON.parse(localStorage.getItem(SYNC_KEY) ?? '{}') as Record<string, number>;
    localStorage.setItem(SYNC_KEY, JSON.stringify({ ...all, [userId]: at }));
  } catch {
    // storage blocked: the next sign-in asks again, which is safe
  }
}

/**
 * A game that has not really started (no research done, nothing built, no
 * room bought): never worth keeping over a cloud save.
 */
export function isFreshGame(s: Pick<GameState, 'completedResearch' | 'activeGenerators' | 'expansionLevel'>): boolean {
  return s.completedResearch.length === 0 && s.activeGenerators.length === 0 && s.expansionLevel === 0;
}

/**
 * What to do after signing in. The local summary is stamped "now", so its
 * time says nothing about when it was played: it is never compared with the
 * cloud save's time (owner bug after playtest 21: a new device signed in a
 * minute after a cloud save looked "newer" and uploaded a blank game over it).
 * - No cloud save: keep the game here and upload it.
 * - A fresh game here: load the cloud save.
 * - The cloud save has not changed since this device last synced: continue here.
 * - Otherwise ask, suggesting the save with more progress (on a tie, the
 *   cloud save if another device uploaded since, else the one with more energy).
 */
export function decideOnSignIn(local: SaveSummary, cloud: SaveSummary | null, lastSyncAt: number | null, localFresh = false): SaveChoice {
  if (!cloud) return { kind: 'use', source: 'local' };
  if (localFresh) return { kind: 'use', source: 'cloud' };
  if (lastSyncAt !== null && cloud.savedAt <= lastSyncAt + SAME_SAVE_MS) return { kind: 'use', source: 'local' };
  const tie = cloud.completion === local.completion;
  const cloudAhead = cloud.completion > local.completion || (tie && (lastSyncAt !== null || cloud.energy >= local.energy));
  return { kind: 'ask', newer: cloudAhead ? 'cloud' : 'local', local, cloud };
}

/** Whether the automatic upload is due. */
export const uploadDue = (lastSyncAt: number | null, now: number) => lastSyncAt === null || now - lastSyncAt >= CLOUD_SAVE_INTERVAL_MS;

const localSummary = (now = Date.now()): SaveSummary => ({ ...summarize(useStore.getState(), now), slot: AUTO_SLOT, source: 'local' });

const set = (patch: Partial<AccountState>) => useAccount.setState(patch);

async function svc(): Promise<CloudService> {
  const s = await getCloudService();
  if (!s) throw new Error('Cloud saves are not set up in this version of the game.');
  return s;
}

/** Runs an account action with a busy flag and a friendly error. */
async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
  set({ busy: true, error: null, notice: null });
  try {
    return await action();
  } catch (e) {
    set({ error: cloudErrorText(e) });
    return undefined;
  } finally {
    set({ busy: false });
  }
}

/** Uploads the current game as the automatic cloud save. */
export async function uploadNow(now = Date.now()): Promise<boolean> {
  const { user, choice } = useAccount.getState();
  if (!user || choice) return false; // never overwrite the cloud while the player is choosing
  const s = await svc();
  await s.saves.save(AUTO_SLOT, exportSave(useStore.getState(), now), summarize(useStore.getState(), now));
  writeLastSync(user.id, now);
  set({ lastSyncAt: now });
  return true;
}

/** Replaces the game here with the cloud save. */
export async function loadCloud(now = Date.now()): Promise<boolean> {
  const { user } = useAccount.getState();
  if (!user) return false;
  const stored = await (await svc()).saves.load(AUTO_SLOT);
  if (!stored) throw new Error('There is no cloud save yet.');
  const parsed = parseSaveFile(stored.text, now);
  if (!parsed.ok) throw new Error(`The cloud save could not be loaded: ${parsed.error}`);
  useStore.getState().loadSave(parsed.state);
  writeLastSync(user.id, stored.summary.savedAt);
  set({ lastSyncAt: stored.summary.savedAt });
  return true;
}

async function afterSignIn(user: CloudUser): Promise<void> {
  set({ status: 'signedIn', user, lastSyncAt: readLastSync(user.id), needsUsername: !user.username });
  const s = await svc();
  const cloud = (await s.saves.list()).find((x) => x.slot === AUTO_SLOT) ?? null;
  const choice = decideOnSignIn(localSummary(), cloud, readLastSync(user.id), isFreshGame(useStore.getState()));
  if (choice.kind === 'ask') set({ choice });
  else if (choice.kind === 'use' && choice.source === 'cloud') await loadCloud();
  else await uploadNow();
}

/** The player's pick when the saves differ. */
export async function resolveChoice(source: 'local' | 'cloud'): Promise<void> {
  await run(async () => {
    set({ choice: null });
    if (source === 'cloud') await loadCloud();
    else await uploadNow();
    set({ notice: source === 'cloud' ? 'Loaded your cloud save.' : 'Kept the game on this device and saved it to the cloud.' });
  });
}

export const signIn = (email: string, password: string) =>
  run(async () => {
    const user = await (await svc()).auth.signIn(email.trim(), password);
    await afterSignIn(user);
    return user;
  });

export const signUp = (email: string, password: string, username: string) =>
  run(async () => {
    const s = await svc();
    if (!(await s.auth.usernameFree(username))) throw new Error('That username is taken. Try another one.');
    await s.auth.signUp(email.trim(), password, username);
    set({ notice: `Almost done: open the link we sent to ${email.trim()}, then sign in here.` });
    return true;
  });

export const signOut = () =>
  run(async () => {
    await uploadNow().catch(() => false); // keep the latest progress before leaving
    await (await svc()).auth.signOut();
    set({ status: 'signedOut', user: null, lastSyncAt: null, choice: null, needsUsername: false, notice: 'Signed out. Your game keeps playing on this device.' });
  });

/** Leaves for Google or Discord; the game reloads signed in (1.22). */
export const signInWithProvider = (provider: OAuthProvider) => run(async () => (await svc()).auth.signInWith(provider));

/** Saves the username for an account made with Google or Discord. Returns true when set. */
export const chooseUsername = (username: string) =>
  run(async () => {
    const name = username.trim();
    if (!USERNAME_PATTERN.test(name)) throw new Error('Usernames are 3 to 20 letters, digits or _.');
    const s = await svc();
    if (!(await s.auth.usernameFree(name))) throw new Error('That username is taken. Try another one.');
    const user = await s.auth.setUsername(name);
    const prev = useAccount.getState().user;
    set({ user: { ...prev, ...user, email: user.email || prev?.email || '' }, needsUsername: false, notice: `Welcome, ${name}!` });
    return true;
  });

export const resetPassword = (email: string) =>
  run(async () => {
    await (await svc()).auth.resetPassword(email.trim());
    set({ notice: `If an account exists for ${email.trim()}, a link to set a new password is on its way.` });
  });

export const updatePassword = (password: string) =>
  run(async () => {
    await (await svc()).auth.updatePassword(password);
    set({ recovering: false, notice: 'Password changed.' });
  });

export const deleteAccount = () =>
  run(async () => {
    await (await svc()).auth.deleteAccount();
    set({ status: 'signedOut', user: null, lastSyncAt: null, choice: null, needsUsername: false, notice: 'Your account and cloud saves are deleted. The game on this device is untouched.' });
  });

export const saveToCloud = () =>
  run(async () => {
    await uploadNow();
    set({ notice: 'Saved to the cloud.' });
  });

export const loadFromCloud = () =>
  run(async () => {
    await loadCloud();
    set({ notice: 'Loaded your cloud save.' });
  });

let started = false;

/**
 * Starts accounts and syncing once, at app start. Does nothing when the build
 * has no cloud settings. Returns a cleanup function (for tests).
 */
export function startCloud(now: () => number = Date.now): () => void {
  if (started || !cloudEnabled()) return () => undefined;
  started = true;
  let stop: (() => void)[] = [];
  set({ status: 'connecting' });
  void (async () => {
    const s = await getCloudService().catch(() => null);
    if (!s) {
      set({ status: 'off' });
      return;
    }
    stop.push(
      s.auth.onChange((event) => {
        if (event === 'passwordRecovery') set({ recovering: true });
        else if (event === 'signedOut') set({ status: 'signedOut', user: null, choice: null });
      }),
    );
    const user = await s.auth.current().catch(() => null);
    if (user) await afterSignIn(user).catch((e) => set({ error: cloudErrorText(e) }));
    else set({ status: 'signedOut' });
  })();
  const timer = setInterval(() => {
    const a = useAccount.getState();
    if (a.status === 'signedIn' && !a.busy && uploadDue(a.lastSyncAt, now())) void uploadNow(now()).catch(() => false);
  }, CLOUD_CHECK_MS);
  // closing or hiding the game: upload right away (the request survives the tab closing)
  stop.push(
    platform.onBackground((hidden) => {
      if (hidden && useAccount.getState().status === 'signedIn') void uploadNow(now()).catch(() => false);
    }),
  );
  return () => {
    clearInterval(timer);
    stop.forEach((f) => f());
    stop = [];
    started = false;
  };
}
