import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import { useAccount } from '../store/account';
import { setCloudServiceForTests, type CloudService } from '../store/cloud';
import { AUTO_SLOT, createKVBackend } from '../store/saveBackend';
import type { AsyncKV } from '../store/storage';
import AccountPanel from './AccountPanel';
import CloudDialogs from './CloudDialogs';
import SettingsPanel from './SettingsPanel';

function memoryKV(): AsyncKV {
  const m = new Map<string, unknown>();
  return {
    getItem: async <T,>(k: string) => (m.has(k) ? (structuredClone(m.get(k)) as T) : null),
    setItem: async <T,>(k: string, v: T) => (m.set(k, structuredClone(v)), v),
    removeItem: async (k: string) => void m.delete(k),
  };
}

const service = (): CloudService => ({
  auth: {
    current: async () => null,
    onChange: () => () => undefined,
    signUp: async () => undefined,
    signIn: async () => ({ id: 'u1', email: 'a@b.c', username: 'Josh' }),
    signOut: async () => undefined,
    resetPassword: async () => undefined,
    updatePassword: async () => undefined,
    deleteAccount: async () => undefined,
    usernameFree: async () => true,
    signInWith: async () => undefined,
    setUsername: async (username) => ({ id: 'u1', email: 'a@b.c', username }),
  },
  saves: createKVBackend(memoryKV(), 'cloud'),
});

afterEach(() => {
  cleanup();
  setCloudServiceForTests(null);
});
beforeEach(() => {
  localStorage.clear();
  useStore.setState({ ...createInitialState(0) });
  useAccount.setState({ status: 'signedOut', user: null, lastSyncAt: null, busy: false, error: null, notice: null, choice: null, recovering: false, needsUsername: false });
});

describe('Account panel (0.68)', () => {
  it('is hidden in Settings when the build has no cloud settings', () => {
    render(<SettingsPanel />);
    expect(screen.queryByTestId('account-panel')).toBeNull();
  });

  it('checks the password and username before sending anything', async () => {
    setCloudServiceForTests(service());
    render(<AccountPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Create an account' }));
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'J!' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });
    await act(async () => fireEvent.submit(screen.getByRole('form', { name: 'Create an account' })));
    expect(screen.getByRole('alert').textContent).toBe('Passwords need at least 8 characters.');
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'long enough' } });
    await act(async () => fireEvent.submit(screen.getByRole('form', { name: 'Create an account' })));
    expect(screen.getByRole('alert').textContent).toBe('Usernames are 3 to 20 letters, digits or _.');
    fireEvent.change(screen.getByLabelText(/Username/), { target: { value: 'Josh_2' } });
    await act(async () => fireEvent.submit(screen.getByRole('form', { name: 'Create an account' })));
    expect(screen.getByRole('status').textContent).toContain('open the link we sent');
    expect(screen.getByRole('form', { name: 'Sign in' })).toBeTruthy();
  });

  it('signs in and shows the account with its last cloud save', async () => {
    setCloudServiceForTests(service());
    render(<AccountPanel />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'long enough' } });
    await act(async () => fireEvent.submit(screen.getByRole('form', { name: 'Sign in' })));
    expect(screen.getByText('Josh')).toBeTruthy();
    expect(screen.getByTestId('last-sync').textContent).not.toContain('not yet');
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeTruthy();
  });

  it('the choice dialog shows both saves and loads the picked one', async () => {
    const s = service();
    setCloudServiceForTests(s);
    const cloudGame = { ...createInitialState(0), energy: 777 };
    const { exportSave } = await import('../utils/saveFile');
    const { summarize } = await import('../store/saveBackend');
    const meta = summarize(cloudGame, Date.now() + 3_600_000);
    await s.saves.save(AUTO_SLOT, exportSave(cloudGame), meta);
    useAccount.setState({
      status: 'signedIn',
      user: { id: 'u1', email: 'a@b.c', username: 'Josh' },
      choice: { kind: 'ask', newer: 'cloud', local: { ...meta, slot: AUTO_SLOT, source: 'local', savedAt: 1, energy: 5 }, cloud: { ...meta, slot: AUTO_SLOT, source: 'cloud' } },
    });
    render(<CloudDialogs />);
    expect(screen.getByRole('dialog').textContent).toContain('Which game do you want to keep?');
    expect(screen.getByText('(newer)')).toBeTruthy();
    await act(async () => fireEvent.click(screen.getAllByRole('button', { name: 'Use this one' })[1]));
    expect(useStore.getState().energy).toBe(777);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows "Continue with" buttons only for providers that are turned on (1.22)', async () => {
    setCloudServiceForTests(service());
    render(<AccountPanel providers={[]} />);
    expect(screen.queryByTestId('oauth-buttons')).toBeNull();
    cleanup();
    render(<AccountPanel providers={['google', 'discord']} />);
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Continue with Discord' })).toBeTruthy();
  });

  it('asks a new Google or Discord player for a username (1.22)', async () => {
    setCloudServiceForTests(service());
    useAccount.setState({ status: 'signedIn', user: { id: 'u1', email: 'g@x.y', username: null }, needsUsername: true });
    render(<CloudDialogs />);
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'Pixel_Fan' } });
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Save username' })));
    expect(useAccount.getState().user?.username).toBe('Pixel_Fan');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
