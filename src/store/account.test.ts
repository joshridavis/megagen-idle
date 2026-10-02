import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { exportSave } from '../utils/saveFile';
import { setCloudServiceForTests, type CloudService, type CloudUser } from './cloud';
import {
  CLOUD_SAVE_INTERVAL_MS,
  decideOnSignIn,
  deleteAccount,
  readLastSync,
  resolveChoice,
  chooseUsername,
  signIn,
  signInWithProvider,
  signUp,
  uploadDue,
  useAccount,
  writeLastSync,
} from './account';
import { AUTO_SLOT, createKVBackend, SAME_SAVE_MS, summarize, type SaveSummary } from './saveBackend';
import type { AsyncKV } from './storage';
import { useStore } from '.';

function memoryKV(): AsyncKV {
  const m = new Map<string, unknown>();
  return {
    getItem: async <T,>(k: string) => (m.has(k) ? (structuredClone(m.get(k)) as T) : null),
    setItem: async <T,>(k: string, v: T) => {
      m.set(k, structuredClone(v));
      return v;
    },
    removeItem: async (k: string) => void m.delete(k),
  };
}

const USER: CloudUser = { id: 'u1', email: 'a@b.c', username: 'Josh' };

function fakeService(opts: { taken?: string[] } = {}) {
  const calls: string[] = [];
  const s: CloudService = {
    auth: {
      current: async () => null,
      onChange: () => () => undefined,
      signUp: async (email) => void calls.push(`signUp:${email}`),
      signIn: async (email, password) => {
        if (password !== 'correct-horse') throw new Error('Invalid login credentials');
        calls.push(`signIn:${email}`);
        return USER;
      },
      signOut: async () => void calls.push('signOut'),
      resetPassword: async () => undefined,
      updatePassword: async () => undefined,
      deleteAccount: async () => void calls.push('delete'),
      usernameFree: async (u) => !(opts.taken ?? []).includes(u),
      signInWith: async (p) => void calls.push(`oauth:${p}`),
      setUsername: async (username) => (calls.push(`username:${username}`), { ...USER, username }),
    },
    saves: createKVBackend(memoryKV(), 'cloud'),
  };
  return { s, calls };
}

const sum = (source: 'local' | 'cloud', savedAt: number): SaveSummary => ({ slot: AUTO_SLOT, source, savedAt, version: 1, energy: 0, completion: 0 });

beforeEach(() => {
  localStorage.clear();
  useStore.setState({ ...createInitialState(0), energy: 500 });
  useAccount.setState({ status: 'signedOut', user: null, lastSyncAt: null, busy: false, error: null, notice: null, choice: null, recovering: false, needsUsername: false });
});
afterEach(() => setCloudServiceForTests(null));

describe('sign-in decision (0.68)', () => {
  it('no cloud save: keep and upload the game here', () => {
    expect(decideOnSignIn(sum('local', 5), null, null)).toEqual({ kind: 'use', source: 'local' });
  });

  it('the cloud save has not changed since this device synced: just continue, no question', () => {
    expect(decideOnSignIn(sum('local', 9_000_000), sum('cloud', 1_000_000), 1_000_000)).toEqual({ kind: 'use', source: 'local' });
  });

  it('another device uploaded since: ask, suggesting the newer save', () => {
    const d = decideOnSignIn(sum('local', 2_000_000), sum('cloud', 5_000_000), 1_000_000);
    expect(d).toMatchObject({ kind: 'ask', newer: 'cloud' });
  });

  it('first sign-in on this device with a different cloud save: ask', () => {
    expect(decideOnSignIn(sum('local', 9_000_000), sum('cloud', 1_000_000), null).kind).toBe('ask');
  });

  it('uploads are due every few minutes, by timestamps', () => {
    expect(uploadDue(null, 0)).toBe(true);
    expect(uploadDue(1_000, 1_000 + CLOUD_SAVE_INTERVAL_MS - 1)).toBe(false);
    expect(uploadDue(1_000, 1_000 + CLOUD_SAVE_INTERVAL_MS)).toBe(true);
  });

  it('remembers the last sync per account on this device', () => {
    writeLastSync('u1', 123);
    writeLastSync('u2', 456);
    expect(readLastSync('u1')).toBe(123);
    expect(readLastSync('nobody')).toBeNull();
  });
});

describe('account flows with a fake cloud (0.68)', () => {
  it('signing in with no cloud save uploads the game here', async () => {
    const { s } = fakeService();
    setCloudServiceForTests(s);
    await signIn(' a@b.c ', 'correct-horse');
    expect(useAccount.getState()).toMatchObject({ status: 'signedIn', choice: null, error: null });
    const cloud = await s.saves.load(AUTO_SLOT);
    expect(JSON.parse(cloud!.text).state.energy).toBe(500);
    expect(readLastSync('u1')).toBe(useAccount.getState().lastSyncAt);
  });

  it('a wrong password shows a friendly error', async () => {
    setCloudServiceForTests(fakeService().s);
    await signIn('a@b.c', 'nope');
    expect(useAccount.getState()).toMatchObject({ status: 'signedOut', error: 'Wrong email or password.' });
  });

  it('a newer save from another device asks, and picking it loads it here', async () => {
    const { s } = fakeService();
    setCloudServiceForTests(s);
    const other = { ...createInitialState(0), energy: 99_999 };
    const later = Date.now() + 10 * SAME_SAVE_MS;
    await s.saves.save(AUTO_SLOT, exportSave(other, later), summarize(other, later));
    await signIn('a@b.c', 'correct-horse');
    const choice = useAccount.getState().choice;
    expect(choice).toMatchObject({ kind: 'ask', newer: 'cloud' });
    // nothing is uploaded while the player is choosing
    expect((await s.saves.load(AUTO_SLOT))!.summary.energy).toBe(99_999);
    await resolveChoice('cloud');
    expect(useStore.getState().energy).toBe(99_999);
    expect(useAccount.getState().choice).toBeNull();
  });

  it('keeping the game here overwrites the cloud save', async () => {
    const { s } = fakeService();
    setCloudServiceForTests(s);
    const other = { ...createInitialState(0), energy: 1 };
    const later = Date.now() + 10 * SAME_SAVE_MS;
    await s.saves.save(AUTO_SLOT, exportSave(other, later), summarize(other, later));
    await signIn('a@b.c', 'correct-horse');
    await resolveChoice('local');
    expect((await s.saves.load(AUTO_SLOT))!.summary.energy).toBe(500);
    expect(useStore.getState().energy).toBe(500);
  });

  it('sign-up checks the username first and asks to confirm the email', async () => {
    const { s, calls } = fakeService({ taken: ['Josh'] });
    setCloudServiceForTests(s);
    expect(await signUp('a@b.c', 'correct-horse', 'Josh')).toBeUndefined();
    expect(useAccount.getState().error).toBe('That username is taken. Try another one.');
    expect(await signUp('a@b.c', 'correct-horse', 'Josh2')).toBe(true);
    expect(calls).toContain('signUp:a@b.c');
    expect(useAccount.getState().notice).toContain('open the link we sent to a@b.c');
  });

  it('deleting the account signs out and leaves the game here untouched', async () => {
    const { s, calls } = fakeService();
    setCloudServiceForTests(s);
    await signIn('a@b.c', 'correct-horse');
    await deleteAccount();
    expect(calls).toContain('delete');
    expect(useAccount.getState()).toMatchObject({ status: 'signedOut', user: null });
    expect(useStore.getState().energy).toBe(500);
  });

  it('Google or Discord: goes to the provider, then asks once for a username (1.22)', async () => {
    const { s: svc, calls } = fakeService({ taken: ['Taken'] });
    setCloudServiceForTests(svc);
    await signInWithProvider('google');
    expect(calls).toContain('oauth:google');
    // back from the provider: an account with no username yet
    useAccount.setState({ status: 'signedIn', user: { id: 'u1', email: 'g@x.y', username: null }, needsUsername: true });
    expect(await chooseUsername('no')).toBeUndefined();
    expect(useAccount.getState().error).toBe('Usernames are 3 to 20 letters, digits or _.');
    expect(await chooseUsername('Taken')).toBeUndefined();
    expect(useAccount.getState().error).toBe('That username is taken. Try another one.');
    expect(await chooseUsername(' New_Name ')).toBe(true);
    expect(calls).toContain('username:New_Name');
    expect(useAccount.getState()).toMatchObject({ needsUsername: false, user: { username: 'New_Name' } });
  });
});
