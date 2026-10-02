import { AUTO_SLOT, type SaveBackend, type SaveMeta, type SaveSummary, type StoredSave } from './saveBackend';

/**
 * Accounts and cloud saves (0.68), behind a small interface so the game and
 * its tests never depend on the provider. The provider is Supabase (see
 * docs/PUBLIC_RELEASE.md); its library is loaded only when the build has the
 * two public settings below, so builds without them work exactly as before.
 */

/** Public project settings, from GitHub repository variables at build time. Not secrets (see the plan, section 5). */
export const CLOUD_URL: string = import.meta.env.VITE_SUPABASE_URL ?? '';
export const CLOUD_KEY: string = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
export const cloudConfigured = () => CLOUD_URL !== '' && CLOUD_KEY !== '';

export interface CloudUser {
  id: string;
  email: string;
  username: string | null;
}

export type AuthEvent = 'signedIn' | 'signedOut' | 'passwordRecovery';

export interface CloudAuth {
  current(): Promise<CloudUser | null>;
  /** Calls back on sign-in, sign-out and when a password-reset link was opened. Returns an unsubscribe function. */
  onChange(callback: (event: AuthEvent, user: CloudUser | null) => void): () => void;
  /** Creates an account; the player confirms by email before signing in. */
  signUp(email: string, password: string, username: string): Promise<void>;
  signIn(email: string, password: string): Promise<CloudUser>;
  signOut(): Promise<void>;
  /** Emails a link to set a new password. */
  resetPassword(email: string): Promise<void>;
  /** Sets a new password after a reset link was opened. */
  updatePassword(password: string): Promise<void>;
  /** Deletes the login and every cloud save, for good. */
  deleteAccount(): Promise<void>;
  /** Whether a username is still free (3–20 letters, digits or _). */
  usernameFree(username: string): Promise<boolean>;
}

export interface CloudService {
  auth: CloudAuth;
  saves: SaveBackend;
}

export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/;
export const MIN_PASSWORD = 8;

/** A readable message for a provider error. */
export function cloudErrorText(e: unknown): string {
  const msg = e instanceof Error ? e.message : typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e);
  if (/invalid login credentials/i.test(msg)) return 'Wrong email or password.';
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email first: open the link we sent you.';
  if (/already registered|already been registered/i.test(msg)) return 'An account with this email already exists. Sign in instead.';
  if (/rate limit|too many/i.test(msg)) return 'Too many tries. Please wait a minute and try again.';
  if (/fetch|network|failed to/i.test(msg)) return 'Could not reach the server. Check your connection and try again.';
  return msg || 'Something went wrong. Please try again.';
}

// ---- Supabase implementation --------------------------------------------

/** The part of the Supabase client this file uses (so tests can pass a fake). */
export interface SupabaseLike {
  auth: {
    getSession(): Promise<{ data: { session: { user: SupaUser } | null }; error: unknown }>;
    onAuthStateChange(cb: (event: string, session: { user: SupaUser } | null) => void): { data: { subscription: { unsubscribe(): void } } };
    signUp(args: { email: string; password: string; options?: { data?: Record<string, unknown>; emailRedirectTo?: string } }): Promise<{ error: unknown }>;
    signInWithPassword(args: { email: string; password: string }): Promise<{ data: { user: SupaUser | null }; error: unknown }>;
    signOut(): Promise<{ error: unknown }>;
    resetPasswordForEmail(email: string, opts?: { redirectTo?: string }): Promise<{ error: unknown }>;
    updateUser(args: { password: string }): Promise<{ error: unknown }>;
  };
  // the query builder is chainable and awaitable; typed loosely on purpose
  from(table: string): any; // eslint-disable-line @typescript-eslint/no-explicit-any
  rpc(fn: string): PromiseLike<{ error: unknown }>;
}

interface SupaUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

interface SaveRow {
  slot: string;
  version: number;
  saved_at: string;
  energy: number;
  completion: number;
  data?: string;
}

const toUser = (u: SupaUser): CloudUser => ({
  id: u.id,
  email: u.email ?? '',
  username: typeof u.user_metadata?.username === 'string' ? (u.user_metadata.username as string) : null,
});

const check = (r: { error: unknown }) => {
  if (r.error) throw new Error(cloudErrorText(r.error));
};

const toSummary = (r: SaveRow): SaveSummary => ({
  slot: r.slot,
  source: 'cloud',
  savedAt: Date.parse(r.saved_at),
  version: r.version,
  energy: r.energy,
  completion: r.completion,
});

/** CloudService over a Supabase client. `redirectTo` is where email links (confirm, reset) return to. */
export function createSupabaseService(client: SupabaseLike, redirectTo: string): CloudService {
  let userId: string | null = null;
  const needUser = () => {
    if (!userId) throw new Error('Please sign in first.');
    return userId;
  };
  /** The profile row (the public username) is created on the first sign-in, after the email is confirmed. */
  const ensureProfile = async (u: CloudUser) => {
    if (!u.username) return;
    await client.from('profiles').upsert({ id: u.id, username: u.username }, { onConflict: 'id', ignoreDuplicates: true });
  };

  const auth: CloudAuth = {
    current: async () => {
      const { data } = await client.auth.getSession();
      const u = data.session ? toUser(data.session.user) : null;
      userId = u?.id ?? null;
      return u;
    },
    onChange: (callback) => {
      const { data } = client.auth.onAuthStateChange((event, session) => {
        const u = session ? toUser(session.user) : null;
        userId = u?.id ?? null;
        if (event === 'PASSWORD_RECOVERY') callback('passwordRecovery', u);
        else if (event === 'SIGNED_IN') callback('signedIn', u);
        else if (event === 'SIGNED_OUT') callback('signedOut', null);
      });
      return () => data.subscription.unsubscribe();
    },
    signUp: async (email, password, username) => {
      check(await client.auth.signUp({ email, password, options: { data: { username }, emailRedirectTo: redirectTo } }));
    },
    signIn: async (email, password) => {
      const r = await client.auth.signInWithPassword({ email, password });
      check(r);
      if (!r.data.user) throw new Error('Sign-in failed. Please try again.');
      const u = toUser(r.data.user);
      userId = u.id;
      await ensureProfile(u).catch(() => undefined);
      return u;
    },
    signOut: async () => {
      check(await client.auth.signOut());
      userId = null;
    },
    resetPassword: async (email) => check(await client.auth.resetPasswordForEmail(email, { redirectTo })),
    updatePassword: async (password) => check(await client.auth.updateUser({ password })),
    deleteAccount: async () => {
      check(await client.rpc('delete_my_account'));
      await client.auth.signOut().catch(() => undefined);
      userId = null;
    },
    usernameFree: async (username) => {
      const r = await client.from('profiles').select('id').eq('username', username).limit(1);
      check(r);
      return (r.data ?? []).length === 0;
    },
  };

  const saves: SaveBackend = {
    source: 'cloud',
    isAvailable: async () => userId !== null,
    list: async () => {
      const r = await client.from('saves').select('slot,version,saved_at,energy,completion').eq('user_id', needUser());
      check(r);
      return ((r.data ?? []) as SaveRow[]).map(toSummary).sort((a, b) => b.savedAt - a.savedAt);
    },
    load: async (slot): Promise<StoredSave | null> => {
      const r = await client.from('saves').select('slot,version,saved_at,energy,completion,data').eq('user_id', needUser()).eq('slot', slot).maybeSingle();
      check(r);
      const row = r.data as SaveRow | null;
      return row && row.data !== undefined ? { summary: toSummary(row), text: row.data } : null;
    },
    save: async (slot, text, meta: SaveMeta) => {
      const row = {
        user_id: needUser(),
        slot,
        version: meta.version,
        saved_at: new Date(meta.savedAt).toISOString(),
        energy: meta.energy,
        completion: meta.completion,
        data: text,
        updated_at: new Date().toISOString(),
      };
      check(await client.from('saves').upsert(row, { onConflict: 'user_id,slot' }));
      return { ...meta, slot, source: 'cloud' };
    },
    remove: async (slot) => check(await client.from('saves').delete().eq('user_id', needUser()).eq('slot', slot)),
  };

  return { auth, saves };
}

let service: Promise<CloudService | null> | null = null;

/** The cloud service for this build, or null when it is not configured. The library loads on first use. */
export function getCloudService(): Promise<CloudService | null> {
  if (service) return service;
  if (!cloudConfigured()) return Promise.resolve(null);
  service = import('@supabase/supabase-js').then(({ createClient }) => {
    // keepalive lets the last upload finish while the tab closes (saves are about 11 KB, under the 64 KB keepalive limit)
    const client = createClient(CLOUD_URL, CLOUD_KEY, { global: { fetch: (input, init) => fetch(input, { ...init, keepalive: true }) } });
    const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
    return createSupabaseService(client as unknown as SupabaseLike, base);
  });
  return service;
}

/** Tests replace the service with a fake. */
export function setCloudServiceForTests(s: CloudService | null): void {
  service = s ? Promise.resolve(s) : null;
}

/** Whether accounts are on in this build (or a test service is set). */
export const cloudEnabled = () => service !== null || cloudConfigured();

export { AUTO_SLOT };
