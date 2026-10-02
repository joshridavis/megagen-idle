import { describe, expect, it } from 'vitest';
import { cloudErrorText, createSupabaseService, type SupabaseLike } from './cloud';

type Row = Record<string, unknown>;

/** A tiny in-memory stand-in for the Supabase client: just the calls the game makes. */
function fakeClient() {
  const tables: Record<string, Row[]> = { saves: [], profiles: [] };
  const log: string[] = [];
  const user = { id: 'u1', email: 'a@b.c', user_metadata: { username: 'Josh' } };
  const query = (table: string) => {
    const filters: [string, unknown][] = [];
    let mode: 'select' | 'delete' = 'select';
    const rows = () => tables[table].filter((r) => filters.every(([k, v]) => r[k] === v));
    const b = {
      select: () => b,
      eq: (k: string, v: unknown) => (filters.push([k, v]), b),
      limit: () => b,
      delete: () => ((mode = 'delete'), b),
      maybeSingle: async () => ({ data: rows()[0] ?? null, error: null }),
      upsert: async (row: Row, opts: { onConflict: string; ignoreDuplicates?: boolean }) => {
        log.push(`upsert:${table}`);
        const keys = opts.onConflict.split(',');
        const i = tables[table].findIndex((r) => keys.every((k) => r[k] === row[k]));
        if (i < 0) tables[table].push(row);
        else if (!opts.ignoreDuplicates) tables[table][i] = row;
        return { error: null };
      },
      then: (resolve: (r: { data: Row[] | null; error: unknown }) => void) => {
        if (mode === 'delete') {
          tables[table] = tables[table].filter((r) => !rows().includes(r));
          resolve({ data: null, error: null });
        } else resolve({ data: rows(), error: null });
      },
    };
    return b;
  };
  const client: SupabaseLike = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
      signUp: async () => ({ error: null }),
      signInWithPassword: async ({ password }) =>
        password === 'pw-ok-123' ? { data: { user }, error: null } : { data: { user: null }, error: { message: 'Invalid login credentials' } },
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      updateUser: async () => ({ error: null }),
    },
    from: query,
    rpc: async (fn: string) => (log.push(`rpc:${fn}`), { error: null }),
  };
  return { client, tables, log };
}

describe('Supabase service (0.68)', () => {
  it('signs in, creates the profile once, and maps saves to and from rows', async () => {
    const { client, tables } = fakeClient();
    const svc = createSupabaseService(client, 'https://example.test/');
    await expect(svc.saves.list()).rejects.toThrow('Please sign in first.');
    const u = await svc.auth.signIn('a@b.c', 'pw-ok-123');
    expect(u).toEqual({ id: 'u1', email: 'a@b.c', username: 'Josh' });
    await svc.auth.signIn('a@b.c', 'pw-ok-123');
    expect(tables.profiles).toEqual([{ id: 'u1', username: 'Josh' }]);
    await svc.saves.save('auto', '{"x":1}', { savedAt: Date.UTC(2026, 0, 1), version: 17, energy: 42, completion: 0.5 });
    await svc.saves.save('auto', '{"x":2}', { savedAt: Date.UTC(2026, 0, 2), version: 17, energy: 43, completion: 0.6 });
    expect(tables.saves).toHaveLength(1);
    expect(tables.saves[0]).toMatchObject({ user_id: 'u1', slot: 'auto', saved_at: '2026-01-02T00:00:00.000Z', data: '{"x":2}' });
    expect(await svc.saves.list()).toEqual([{ slot: 'auto', source: 'cloud', savedAt: Date.UTC(2026, 0, 2), version: 17, energy: 43, completion: 0.6 }]);
    expect((await svc.saves.load('auto'))!.text).toBe('{"x":2}');
    await svc.saves.remove('auto');
    expect(tables.saves).toHaveLength(0);
  });

  it('usernames: free or taken', async () => {
    const { client, tables } = fakeClient();
    tables.profiles.push({ id: 'x', username: 'Taken' });
    const svc = createSupabaseService(client, '');
    expect(await svc.auth.usernameFree('Taken')).toBe(false);
    expect(await svc.auth.usernameFree('Fresh')).toBe(true);
  });

  it('account deletion calls the database function and signs out', async () => {
    const { client, log } = fakeClient();
    const svc = createSupabaseService(client, '');
    await svc.auth.signIn('a@b.c', 'pw-ok-123');
    await svc.auth.deleteAccount();
    expect(log).toContain('rpc:delete_my_account');
    await expect(svc.saves.list()).rejects.toThrow('Please sign in first.');
  });

  it('turns provider errors into plain sentences', async () => {
    const { client } = fakeClient();
    await expect(createSupabaseService(client, '').auth.signIn('a@b.c', 'bad')).rejects.toThrow('Wrong email or password.');
    expect(cloudErrorText({ message: 'Email not confirmed' })).toContain('confirm your email');
    expect(cloudErrorText(new TypeError('Failed to fetch'))).toContain('Could not reach the server');
  });
});
