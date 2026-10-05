import { useState, type FormEvent } from 'react';
import { authProviders, MIN_PASSWORD, OAUTH_NAMES, USERNAME_PATTERN, type OAuthProvider } from '../store/cloud';
import LoadCloudConfirm from './LoadCloudConfirm';
import { CLOUD_BUTTON, CLOUD_PRIMARY, CLOUD_SECONDARY } from './cloudStyles';
import { deleteAccount, loadFromCloud, resetPassword, saveToCloud, signIn, signInWithProvider, signOut, signUp, useAccount } from '../store/account';

const input = 'mt-1 w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 focus-visible:outline-2 focus-visible:outline-sky-400';
const button = CLOUD_BUTTON;
export const PRIVACY_URL = `${import.meta.env.BASE_URL}privacy.html`;

const when = (at: number | null) => (at === null ? 'not yet' : new Date(at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }));

/**
 * Settings → Account (0.68): sign in, create an account, or manage it.
 * Hidden by the caller when the build has no cloud settings.
 */
export default function AccountPanel({ providers = authProviders() }: { providers?: OAuthProvider[] }) {
  const a = useAccount();
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'reset'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLoad, setConfirmLoad] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (mode === 'reset') return void resetPassword(email);
    if (password.length < MIN_PASSWORD) return setFormError(`Passwords need at least ${MIN_PASSWORD} characters.`);
    if (mode === 'signUp') {
      if (!USERNAME_PATTERN.test(username)) return setFormError('Usernames are 3 to 20 letters, digits or _.');
      const ok = await signUp(email, password, username);
      if (ok) setMode('signIn');
      return;
    }
    await signIn(email, password);
  };

  return (
    <div className="panel" data-testid="account-panel">
      <h2 className="mb-1 panel-title">Account and cloud saves</h2>
      {a.status === 'connecting' && <p className="text-sm text-slate-400">Connecting…</p>}
      {a.status === 'signedIn' && a.user && (
        <div className="space-y-2 text-sm">
          <p>
            Signed in as <strong>{a.user.username ?? a.user.email}</strong>
            {a.user.username && <span className="text-slate-400"> ({a.user.email})</span>}.
          </p>
          <p className="text-slate-400" data-testid="last-sync">
            Your game saves to the cloud every few minutes and when you close it. Last cloud save: {when(a.lastSyncAt)}.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={a.busy} onClick={() => {
                    setSaving(true);
                    void saveToCloud().finally(() => setSaving(false));
                  }} className={CLOUD_PRIMARY} data-testid="settings-save-cloud">
              {saving ? 'Saving…' : 'Save to cloud now'}
            </button>
            <button type="button" disabled={a.busy} onClick={() => setConfirmLoad(true)} className={CLOUD_SECONDARY}>
              Load cloud save
            </button>
            <button type="button" disabled={a.busy} onClick={() => void signOut()} className={CLOUD_SECONDARY}>
              Sign out
            </button>
          </div>
          {confirmLoad && (
            <LoadCloudConfirm busy={a.busy} onConfirm={() => void loadFromCloud().then(() => setConfirmLoad(false))} onCancel={() => setConfirmLoad(false)} />
          )}
          {!confirmDelete ? (
            <button type="button" onClick={() => setConfirmDelete(true)} className="text-xs text-red-300 underline hover:text-red-200">
              Delete my account
            </button>
          ) : (
            <div className="rounded border border-red-900 p-2 text-xs">
              <p className="mb-2 text-red-200">This deletes your login and every cloud save, for good. The game on this device stays.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={a.busy}
                  onClick={() => void deleteAccount().then(() => setConfirmDelete(false))}
                  className={`${button} bg-red-700 hover:bg-red-600`}
                >
                  Yes, delete it
                </button>
                <button type="button" autoFocus onClick={() => setConfirmDelete(false)} className={`${button} bg-slate-600 hover:bg-slate-500`}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {a.status === 'signedOut' && (
        <form onSubmit={(e) => void submit(e)} className="space-y-2 text-sm" aria-label={mode === 'signUp' ? 'Create an account' : mode === 'reset' ? 'Reset password' : 'Sign in'}>
          <p className="text-slate-400">
            {mode === 'signUp'
              ? 'Create a free account to keep your game in the cloud and play it on any device.'
              : mode === 'reset'
                ? 'We will email you a link to set a new password.'
                : 'Sign in to save your game in the cloud and continue it on any device. Playing without an account works as before.'}
          </p>
          {mode !== 'reset' && providers.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row" data-testid="oauth-buttons">
              {providers.map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={a.busy}
                  onClick={() => void signInWithProvider(p)}
                  className={`${button} flex-1 border border-slate-500 bg-slate-900 hover:bg-slate-700`}
                >
                  Continue with {OAUTH_NAMES[p]}
                </button>
              ))}
            </div>
          )}
          {mode !== 'reset' && providers.length > 0 && <p className="text-center text-xs text-slate-400">or with email</p>}
          <label className="block">
            Email
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
          </label>
          {mode === 'signUp' && (
            <label className="block">
              Username <span className="text-slate-400">(shown on future leaderboards)</span>
              <input required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className={input} />
            </label>
          )}
          {mode !== 'reset' && (
            <label className="block">
              Password
              <input
                type="password"
                required
                autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={input}
              />
            </label>
          )}
          {mode === 'signUp' && (
            <p className="text-xs text-slate-400">
              We store your email, username and saves, nothing else.{' '}
              <a href={PRIVACY_URL} target="_blank" rel="noreferrer" className="text-sky-300 underline">
                Privacy
              </a>
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={a.busy} className={`${button} bg-emerald-600 hover:bg-emerald-500`}>
              {mode === 'signUp' ? 'Create account' : mode === 'reset' ? 'Send link' : 'Sign in'}
            </button>
            {mode !== 'signIn' && (
              <button type="button" onClick={() => setMode('signIn')} className="text-sky-300 underline">
                I have an account
              </button>
            )}
            {mode === 'signIn' && (
              <>
                <button type="button" onClick={() => setMode('signUp')} className="text-sky-300 underline">
                  Create an account
                </button>
                <button type="button" onClick={() => setMode('reset')} className="text-sky-300 underline">
                  Forgot password?
                </button>
              </>
            )}
          </div>
        </form>
      )}
      {(formError ?? a.error) && (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {formError ?? a.error}
        </p>
      )}
      {a.notice && (
        <p role="status" className="mt-2 text-sm text-emerald-300">
          {a.notice}
        </p>
      )}
    </div>
  );
}
