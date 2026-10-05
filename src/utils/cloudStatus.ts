import type { AccountStatus } from '../store/account';

export type CloudSyncKind = 'signedOut' | 'connecting' | 'saving' | 'saved' | 'notYet' | 'error';

export interface CloudSyncState {
  kind: CloudSyncKind;
  /** Short text for the top-bar cloud button (1.46). */
  label: string;
}

/** "just now", "1 minute ago", "5 minutes ago", "2 hours ago", "3 days ago". */
export function timeAgo(at: number, now: number): string {
  const s = Math.max(0, Math.floor((now - at) / 1000));
  if (s < 60) return 'just now';
  const unit = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'} ago`;
  if (s < 3600) return unit(Math.floor(s / 60), 'minute');
  if (s < 86400) return unit(Math.floor(s / 3600), 'hour');
  return unit(Math.floor(s / 86400), 'day');
}

/** The sync state shown on the cloud button: signed out, saving, saved N minutes ago, or an error. */
export function cloudSyncState(a: { status: AccountStatus; busy: boolean; error: string | null; lastSyncAt: number | null }, now: number): CloudSyncState {
  if (a.status === 'connecting') return { kind: 'connecting', label: 'Connecting…' };
  if (a.status !== 'signedIn') return { kind: 'signedOut', label: 'Signed out' };
  if (a.busy) return { kind: 'saving', label: 'Saving…' };
  if (a.error) return { kind: 'error', label: 'Cloud save failed' };
  if (a.lastSyncAt === null) return { kind: 'notYet', label: 'Not saved yet' };
  return { kind: 'saved', label: `Saved ${timeAgo(a.lastSyncAt, now)}` };
}
