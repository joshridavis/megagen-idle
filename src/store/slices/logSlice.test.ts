import { beforeEach, describe, expect, it } from 'vitest';
import { LOG_KEY, loadLog, saveLog } from './logSlice';

describe('saved event log (playtest 15)', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips entries and survives a reload', () => {
    const entry = { id: 'a', at: 1, kind: 'event', text: 'Overcast' } as never;
    saveLog([entry]);
    expect(loadLog()).toEqual([entry]);
  });

  it('returns an empty log for missing or broken data', () => {
    expect(loadLog()).toEqual([]);
    localStorage.setItem(LOG_KEY, '{oops');
    expect(loadLog()).toEqual([]);
  });
});
