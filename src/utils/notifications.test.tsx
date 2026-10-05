import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationSettings from '../components/NotificationSettings';
import { createInitialState } from '../data/initialState';
import { ENTRY_ICONS } from '../data/logIcons';
import { DEFAULT_NOTIFY, MAX_PER_HOUR, NOTIFY_WINDOW_MS, type NotifySettings } from '../data/notifyRules';
import { platform } from '../platform';
import { useStore } from '../store';
import { migrateSave } from '../store/migrations';
import { resetNotifyHistory } from '../store/slices/logSlice';
import { notifyTypeOf, selectNotifications } from './notifications';

const on: NotifySettings = { ...DEFAULT_NOTIFY, enabled: true };
const research = (name: string) => ({ kind: 'research' as const, icon: ENTRY_ICONS.researchComplete, text: `Research complete: ${name}`, toast: false });
const level = { kind: 'level' as const, icon: ENTRY_ICONS.playerLevel, text: 'Player level 5 reached', toast: false };

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  resetNotifyHistory();
});

describe('choosing notifications (1.07)', () => {
  it('sends nothing unless switched on', () => {
    expect(selectNotifications([research('Hydropower')], DEFAULT_NOTIFY, [], 0).notice).toBeNull();
    expect(selectNotifications([research('Hydropower')], undefined, [], 0).notice).toBeNull();
  });

  it('respects the per-type switches; defaults: research on, level off', () => {
    expect(notifyTypeOf(level)).toBe('level');
    expect(selectNotifications([level], on, [], 0).notice).toBeNull();
    expect(selectNotifications([level], { ...on, types: { ...on.types, level: true } }, [], 0).notice?.body).toBe('Player level 5 reached');
    const r = selectNotifications([research('Hydropower')], on, [], 0);
    expect(r.notice).toEqual({ title: 'MegaGen Idle: Research complete', body: 'Research complete: Hydropower' });
    // entries that never notify (unlocks, sightings, achievements)
    expect(selectNotifications([{ kind: 'unlock', icon: ENTRY_ICONS.generatorUnlocked, text: 'x' }], on, [], 0).notice).toBeNull();
  });

  it('collapses several at once into one summary', () => {
    const r = selectNotifications([research('Hydropower'), research('Tides'), level, research('Oil')], on, [], 5);
    expect(r.notice).toEqual({ title: 'MegaGen Idle: 3 things happened', body: 'Research complete: Hydropower, and 2 more' });
    expect(r.history).toEqual([5]);
  });

  it(`sends at most ${MAX_PER_HOUR} an hour`, () => {
    let history: number[] = [];
    let sent = 0;
    for (let i = 0; i < 10; i++) {
      const r = selectNotifications([research(`R${i}`)], on, history, i * 60_000);
      history = r.history;
      if (r.notice) sent++;
    }
    expect(sent).toBe(MAX_PER_HOUR);
    // an hour after the first, one more may go
    expect(selectNotifications([research('Later')], on, history, NOTIFY_WINDOW_MS + 1).notice).not.toBeNull();
  });

  it('old saves get notifications off', () => {
    const old = { ...createInitialState(0), settings: { ...createInitialState(0).settings } } as Record<string, unknown>;
    delete (old.settings as Record<string, unknown>).notifications;
    expect(migrateSave(old, 20).settings.notifications).toEqual(DEFAULT_NOTIFY);
  });
});

describe('sending (1.07)', () => {
  beforeEach(() => useStore.getState().resetGame());

  it('only in the background, with permission and opt-in', () => {
    const notify = vi.spyOn(platform, 'notify').mockImplementation(() => {});
    vi.spyOn(platform, 'notifyPermission').mockReturnValue('granted');
    const bg = vi.spyOn(platform, 'isBackground').mockReturnValue(true);
    // not opted in
    useStore.getState().logEvents([research('A')], 1);
    expect(notify).not.toHaveBeenCalled();
    useStore.getState().setNotifications({ enabled: true });
    // visible: never
    bg.mockReturnValue(false);
    useStore.getState().logEvents([research('B')], 2);
    expect(notify).not.toHaveBeenCalled();
    bg.mockReturnValue(true);
    useStore.getState().logEvents([research('C')], 3);
    expect(notify).toHaveBeenCalledWith('MegaGen Idle: Research complete', 'Research complete: C');
    // permission withdrawn
    vi.spyOn(platform, 'notifyPermission').mockReturnValue('denied');
    useStore.getState().logEvents([research('D')], 4);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it('Settings asks for permission only when switched on, and stays off if refused', async () => {
    const ask = vi.spyOn(platform, 'requestNotifyPermission').mockResolvedValue(false);
    vi.spyOn(platform, 'notifyPermission').mockReturnValue('default');
    render(<NotificationSettings />);
    expect(ask).not.toHaveBeenCalled();
    expect((screen.getByTestId('notify-research') as HTMLInputElement).closest('fieldset')!.disabled).toBe(true);
    fireEvent.click(screen.getByTestId('notify-enabled'));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('did not allow'));
    expect(useStore.getState().settings.notifications.enabled).toBe(false);
    ask.mockResolvedValue(true);
    fireEvent.click(screen.getByTestId('notify-enabled'));
    await waitFor(() => expect(useStore.getState().settings.notifications.enabled).toBe(true));
    fireEvent.click(screen.getByTestId('notify-level'));
    expect(useStore.getState().settings.notifications.types.level).toBe(true);
  });
});
