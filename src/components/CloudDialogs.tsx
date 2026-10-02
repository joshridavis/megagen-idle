import { useState, type FormEvent } from 'react';
import { MIN_PASSWORD } from '../store/cloud';
import { chooseUsername, resolveChoice, updatePassword, useAccount } from '../store/account';
import type { SaveSummary } from '../store/saveBackend';
import { useNumberFormat } from './useNumberFormat';

const when = (at: number) => new Date(at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

/**
 * Dialogs that can appear on any tab (0.68): choosing between the save on
 * this device and the cloud save when they differ, and setting a new
 * password after opening a reset link.
 */
export default function CloudDialogs() {
  const choice = useAccount((s) => s.choice);
  const recovering = useAccount((s) => s.recovering);
  const needsUsername = useAccount((s) => s.needsUsername);
  if (choice) return <ChooseSave local={choice.local} cloud={choice.cloud} newer={choice.newer} />;
  if (recovering) return <NewPassword />;
  if (needsUsername) return <ChooseUsername />;
  return null;
}

/** After the first sign-in with Google or Discord (1.22). */
function ChooseUsername() {
  const [name, setName] = useState('');
  const busy = useAccount((s) => s.busy);
  const error = useAccount((s) => s.error);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void chooseUsername(name);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="choose-username-title">
      <form onSubmit={submit} className="w-full max-w-sm space-y-2 rounded-lg bg-slate-800 p-4 shadow-xl">
        <h2 id="choose-username-title" className="text-lg font-semibold">
          Choose your username
        </h2>
        <p className="text-sm text-slate-400">3 to 20 letters, digits or _. It may be shown on future leaderboards.</p>
        <input
          required
          autoFocus
          autoComplete="username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Username"
          className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
        />
        {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
        <button type="submit" disabled={busy} className="min-h-11 rounded bg-emerald-600 px-3 py-2 font-semibold hover:bg-emerald-500 disabled:opacity-60">
          Save username
        </button>
      </form>
    </div>
  );
}

function Card({ title, s, newer, onPick, busy }: { title: string; s: SaveSummary; newer: boolean; onPick: () => void; busy: boolean }) {
  const fmt = useNumberFormat();
  return (
    <div className={`flex flex-1 flex-col gap-1 rounded border p-3 ${newer ? 'border-emerald-400' : 'border-slate-600'}`}>
      <h3 className="font-semibold">
        {title} {newer && <span className="text-xs text-emerald-300">(newer)</span>}
      </h3>
      <p className="text-sm text-slate-300">Saved {when(s.savedAt)}</p>
      <p className="text-sm text-slate-300">
        {fmt.num(s.energy)} energy · {Math.floor(s.completion * 1000) / 10}% complete
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={onPick}
        className={`mt-2 min-h-11 rounded px-3 py-2 font-semibold disabled:opacity-60 ${newer ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-600 hover:bg-slate-500'}`}
      >
        Use this one
      </button>
    </div>
  );
}

function ChooseSave({ local, cloud, newer }: { local: SaveSummary; cloud: SaveSummary; newer: 'local' | 'cloud' }) {
  const busy = useAccount((s) => s.busy);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="choose-save-title">
      <div className="w-full max-w-lg rounded-lg bg-slate-800 p-4 shadow-xl">
        <h2 id="choose-save-title" className="text-lg font-semibold">
          Which game do you want to keep?
        </h2>
        <p className="mb-3 text-sm text-slate-400">The game on this device and your cloud save are different. The one you do not pick is replaced.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Card title="This device" s={local} newer={newer === 'local'} busy={busy} onPick={() => void resolveChoice('local')} />
          <Card title="Cloud save" s={cloud} newer={newer === 'cloud'} busy={busy} onPick={() => void resolveChoice('cloud')} />
        </div>
      </div>
    </div>
  );
}

function NewPassword() {
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const busy = useAccount((s) => s.busy);
  const error = useAccount((s) => s.error);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setErr(`Passwords need at least ${MIN_PASSWORD} characters.`);
    setErr(null);
    void updatePassword(password);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="new-password-title">
      <form onSubmit={submit} className="w-full max-w-sm space-y-2 rounded-lg bg-slate-800 p-4 shadow-xl">
        <h2 id="new-password-title" className="text-lg font-semibold">
          Set a new password
        </h2>
        <input
          type="password"
          required
          autoFocus
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="New password"
          className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
        />
        {(err ?? error) && <p role="alert" className="text-sm text-red-300">{err ?? error}</p>}
        <button type="submit" disabled={busy} className="min-h-11 rounded bg-emerald-600 px-3 py-2 font-semibold hover:bg-emerald-500 disabled:opacity-60">
          Save password
        </button>
      </form>
    </div>
  );
}
