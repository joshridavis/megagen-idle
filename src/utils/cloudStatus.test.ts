import { describe, expect, it } from 'vitest';
import { cloudSyncState, timeAgo } from './cloudStatus';

const base = { status: 'signedIn' as const, busy: false, error: null, lastSyncAt: 0 };

describe('cloud sync state (1.46)', () => {
  it('words the time since the last cloud save', () => {
    expect(timeAgo(0, 30_000)).toBe('just now');
    expect(timeAgo(0, 60_000)).toBe('1 minute ago');
    expect(timeAgo(0, 5 * 60_000)).toBe('5 minutes ago');
    expect(timeAgo(0, 2 * 3600_000)).toBe('2 hours ago');
    expect(timeAgo(0, 3 * 86400_000)).toBe('3 days ago');
    expect(timeAgo(10_000, 0)).toBe('just now'); // clock skew never goes negative
  });

  it('shows signed out, saving, error, not yet and saved', () => {
    expect(cloudSyncState({ ...base, status: 'signedOut' }, 0).kind).toBe('signedOut');
    expect(cloudSyncState({ ...base, status: 'connecting' }, 0).kind).toBe('connecting');
    expect(cloudSyncState({ ...base, busy: true, error: 'x' }, 0).kind).toBe('saving');
    expect(cloudSyncState({ ...base, error: 'Network down' }, 0)).toEqual({ kind: 'error', label: 'Cloud save failed' });
    expect(cloudSyncState({ ...base, lastSyncAt: null }, 0).kind).toBe('notYet');
    expect(cloudSyncState(base, 3 * 60_000)).toEqual({ kind: 'saved', label: 'Saved 3 minutes ago' });
  });
});
