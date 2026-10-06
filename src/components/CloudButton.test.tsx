import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '../App';
import { CLOUD_PRIMARY } from './cloudStyles';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import { useAccount, type AccountState } from '../store/account';
import { setCloudServiceForTests, type CloudService } from '../store/cloud';
import { AUTO_SLOT, createKVBackend } from '../store/saveBackend';
import type { AsyncKV } from '../store/storage';

function memoryKV(): AsyncKV {
  const m = new Map<string, unknown>();
  return {
    getItem: async <T,>(k: string) => (m.has(k) ? (structuredClone(m.get(k)) as T) : null),
    setItem: async <T,>(k: string, v: T) => (m.set(k, structuredClone(v)), v),
    removeItem: async (k: string) => void m.delete(k),
  };
}

const user = { id: 'u1', email: 'a@b.c', username: 'Josh' };
const service = (): CloudService => ({
  auth: {
    current: async () => null,
    onChange: () => () => undefined,
    signUp: async () => undefined,
    signIn: async () => user,
    signOut: async () => undefined,
    resetPassword: async () => undefined,
    updatePassword: async () => undefined,
    deleteAccount: async () => undefined,
    usernameFree: async () => true,
    signInWith: async () => undefined,
    setUsername: async (username) => ({ ...user, username }),
  },
  saves: createKVBackend(memoryKV(), 'cloud'),
});

const accountState: AccountState = { status: 'signedOut', user: null, lastSyncAt: null, busy: false, error: null, notice: null, choice: null, recovering: false, needsUsername: false };

afterEach(() => {
  cleanup();
  setCloudServiceForTests(null);
});
beforeEach(() => {
  localStorage.clear();
  useStore.setState({ ...createInitialState(Date.now()) });
  useAccount.setState(accountState);
});

/** Renders the app and waits for its cloud start-up (startCloud), then applies the account state. */
async function renderApp(account: Partial<AccountState> = {}) {
  render(<App />);
  await waitFor(() => expect(useAccount.getState().status).not.toBe('connecting'));
  act(() => {
    useAccount.setState({ ...accountState, ...account });
  });
  await screen.findByRole('tab', { name: /Map/ });
}

describe('Cloud save from any tab (1.46)', () => {
  it('is absent when the build has no cloud settings', () => {
    render(<App />);
    expect(screen.queryByTestId('cloud-button')).toBeNull();
  });

  it('opens from another tab', async () => {
    setCloudServiceForTests(service());
    await renderApp({ status: 'signedIn', user });
    fireEvent.click(screen.getByRole('tab', { name: /Research/ }));
    const button = screen.getByTestId('cloud-button');
    expect(button.dataset.sync).toBe('notYet');
    fireEvent.click(button);
    expect((await screen.findByTestId('cloud-menu')).textContent).toContain('Last cloud save: not yet');
    expect(screen.getByRole('button', { name: 'Save to cloud now' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: /Research/ }).getAttribute('aria-selected')).toBe('true');
  });

  it('saves now, and loads the cloud save after a confirmation, from the Research tab', async () => {
    const svc = service();
    setCloudServiceForTests(svc);
    await renderApp({ status: 'signedIn', user });
    fireEvent.click(screen.getByRole('tab', { name: /Research/ }));
    fireEvent.click(screen.getByTestId('cloud-button'));

    // save the game with 1,234 energy to the cloud
    act(() => {
      useStore.setState({ energy: 1234 });
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Save to cloud now' }));
    await waitFor(() => expect(useAccount.getState().busy).toBe(false));
    expect(useAccount.getState().lastSyncAt).not.toBeNull();
    expect((await svc.saves.list()).some((x) => x.slot === AUTO_SLOT)).toBe(true);
    await waitFor(() => expect(screen.getByTestId('cloud-button').dataset.sync).toBe('saved'));
    expect(screen.getByTestId('cloud-menu').textContent).toContain('just now');

    // play on, then load the cloud save back: asks first, Cancel keeps the game
    act(() => {
      useStore.setState({ energy: 99 });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load cloud save' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByTestId('load-cloud-confirm')).toBeNull());
    expect(useStore.getState().energy).toBe(99);
    fireEvent.click(screen.getByRole('button', { name: 'Load cloud save' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Yes, load it' }));
    await waitFor(() => expect(Math.floor(useStore.getState().energy)).toBe(1234));
    await waitFor(() => expect(screen.queryByTestId('load-cloud-confirm')).toBeNull());
    expect(screen.getByRole('tab', { name: /Research/ }).getAttribute('aria-selected')).toBe('true');
  });

  it('signed out, it links to the Account panel', async () => {
    setCloudServiceForTests(service());
    await renderApp();
    fireEvent.click(screen.getByRole('tab', { name: /Map/ }));
    fireEvent.click(await screen.findByTestId('cloud-button'));
    fireEvent.click(await screen.findByRole('button', { name: 'Sign in' }));
    expect(screen.queryByRole('button', { name: 'Save to cloud now' })).toBeNull();
    await waitFor(() => expect(screen.getByRole('tab', { name: /Settings/ }).getAttribute('aria-selected')).toBe('true'));
    expect(screen.getByTestId('account-panel')).toBeTruthy();
    expect(screen.queryByTestId('cloud-menu')).toBeNull();
  });

  it('Escape closes the menu and returns focus to the button', async () => {
    setCloudServiceForTests(service());
    await renderApp({ status: 'signedIn', user });
    fireEvent.click(await screen.findByTestId('cloud-button'));
    const save = await screen.findByRole('button', { name: 'Save to cloud now' });
    await waitFor(() => expect(document.activeElement).toBe(save));
    fireEvent.keyDown(save, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByTestId('cloud-menu')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(screen.getByTestId('cloud-button')));
  });

  it('styles Save like Settings and shows "Saving…" while it runs (1.68)', async () => {
    let finish: () => void = () => undefined;
    const svc = service();
    const slow: CloudService = {
      ...svc,
      saves: { ...svc.saves, save: (...args) => new Promise((done) => (finish = () => void svc.saves.save(...args).then(done))) },
    };
    setCloudServiceForTests(slow);
    await renderApp({ status: 'signedIn', user });
    fireEvent.click(screen.getByTestId('cloud-button'));
    const save = await screen.findByTestId('menu-save-cloud');
    expect(save.className).toContain(CLOUD_PRIMARY);
    fireEvent.click(save);
    await waitFor(() => expect(screen.getByTestId('menu-save-cloud').textContent).toBe('Saving…'));
    expect((screen.getByTestId('menu-save-cloud') as HTMLButtonElement).disabled).toBe(true);
    await act(async () => finish());
    await waitFor(() => expect(screen.getByTestId('menu-save-cloud').textContent).toBe('Save to cloud now'));
    // Settings → Account uses the same primary style
    fireEvent.click(screen.getByRole('tab', { name: /Settings/ }));
    expect((await screen.findByTestId('settings-save-cloud')).className).toContain(CLOUD_PRIMARY);
  });

  it('shows an error state on the button', async () => {
    setCloudServiceForTests(service());
    await renderApp({ status: 'signedIn', user, error: 'Network down' });
    expect((await screen.findByTestId('cloud-button')).dataset.sync).toBe('error');
    expect(screen.getByTestId('cloud-button').getAttribute('aria-label')).toBe('Cloud save: Cloud save failed');
  });
});
