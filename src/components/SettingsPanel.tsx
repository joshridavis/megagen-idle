import { useEffect, useRef, useState } from 'react';
import { SAVE_KEY, useStore } from '../store';
import { damagedSaveFile, type DamagedSave } from '../store/saveGuard';
import { forgetDamagedSave, getDamagedSave } from '../store/storage';
import { exportSave, parseSaveFile } from '../utils/saveFile';
import { downloadText, saveFileName } from '../utils/download';
import type { GameState, NumberNotation } from '../types/state';
import { MAX_OFFLINE_SECONDS } from '../data/time';
import { formatHours } from '../utils/format';
import { useNumberFormat } from './useNumberFormat';
import { ART_CREDITS, LIBRARY_CREDITS, type Credit } from '../data/credits';
import { platform } from '../platform';
import { cloudEnabled } from '../store/cloud';
import AccountPanel from './AccountPanel';
import NotificationSettings from './NotificationSettings';
import { SUPPORTER_COLOR } from '../data/purchases';
import { isSupporter } from '../utils/purchases';
import { PurchasesSettings, SupportLink, TestStoreSwitch } from './Purchases';

function CreditList({ items }: { items: Credit[] }) {
  return (
    <ul className="mt-1 space-y-1">
      {items.map((c) => (
        <li key={c.name}>
          <a
            href={c.url}
            onClick={(e) => {
              e.preventDefault();
              platform.openExternal(c.url);
            }}
            className="text-sky-300 underline hover:text-sky-200"
          >
            {c.name}
          </a>{' '}
          <span className="text-slate-400">
            · {c.what} · {c.license}
          </span>
        </li>
      ))}
    </ul>
  );
}

const NOTATIONS: { id: NumberNotation; label: string; example: string }[] = [
  { id: 'short', label: 'Short', example: '1.23M' },
  { id: 'scientific', label: 'Scientific', example: '1.23e6' },
  { id: 'full', label: 'Full', example: '1,234,567' },
];

/** Settings tab: number notation, save export/import, reset, and offline notes. No audio settings. */
export default function SettingsPanel() {
  const supporter = useStore((s) => isSupporter(s));
  const loadSave = useStore((s) => s.loadSave);
  const fmt = useNumberFormat();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState<GameState | null>(null);
  const notation = useStore((s) => s.settings.notation);
  const reduceMotion = useStore((s) => s.settings.reduceMotion);
  const petsWalk = useStore((s) => s.settings.petsWalk ?? true);
  const setPetsWalk = useStore((s) => s.setPetsWalk);
  const setReduceMotion = useStore((s) => s.setReduceMotion);
  const replayTutorial = useStore((s) => s.replayTutorial);
  const setNotation = useStore((s) => s.setNotation);
  const resetGame = useStore((s) => s.resetGame);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  // a save set aside by crash recovery (0.46), if this device keeps one
  const [damaged, setDamaged] = useState<DamagedSave | null>(null);
  useEffect(() => {
    let live = true;
    void getDamagedSave(SAVE_KEY).then((d) => live && setDamaged(d));
    return () => {
      live = false;
    };
  }, []);

  const onExport = () => {
    downloadText(saveFileName(), exportSave(useStore.getState()));
    setMessage({ kind: 'ok', text: 'Save exported. Keep the file somewhere safe.' });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const result = parseSaveFile(await file.text());
    if (fileRef.current) fileRef.current.value = '';
    if (!result.ok) {
      setPending(null);
      setMessage({ kind: 'error', text: `${result.error} Your current game was not changed.` });
      return;
    }
    setPending(result.state);
    setMessage(null);
  };

  return (
    <section aria-label="Settings" className="w-full max-w-2xl space-y-4">
      {cloudEnabled() && <AccountPanel />}
      <fieldset className="panel">
        <legend className="sr-only">Number notation</legend>
        <h2 className="mb-2 panel-title">Numbers</h2>
        <div className="flex flex-wrap gap-2">
          {NOTATIONS.map((n) => (
            <label
              key={n.id}
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded border px-3 py-2 has-focus-visible:outline-2 has-focus-visible:outline-sky-400 ${notation === n.id ? 'border-sky-400 bg-sky-950/60' : 'border-slate-600'}`}
            >
              <input
                type="radio"
                name="notation"
                value={n.id}
                checked={notation === n.id}
                onChange={() => setNotation(n.id)}
                className="accent-sky-400"
              />
              <span>
                {n.label} <span className="font-mono text-xs text-slate-400">{n.example}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="panel">
        <h2 className="mb-2 panel-title">Motion</h2>
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(e) => setReduceMotion(e.target.checked)}
            className="h-5 w-5 accent-sky-400"
          />
          <span>
            Reduce motion
            <span className="block text-xs text-slate-400">
              Stills the game's animations (celebrations, glows, map and random-event animations). Events still happen, and show as a notice instead.
            </span>
          </span>
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={petsWalk}
            onChange={(e) => setPetsWalk(e.target.checked)}
            className="h-5 w-5 accent-sky-400"
            data-testid="setting-pets-walk"
          />
          <span>
            Pets walk on screen
            <span className="block text-xs text-slate-400">Your active pets walk along the bottom of the screen on every tab. Click one to pet it.</span>
          </span>
        </label>
      </div>
      <NotificationSettings />
      <div className="panel">
        <h2 className="mb-2 panel-title">Tutorial</h2>
        <button type="button" onClick={replayTutorial} className="min-h-11 rounded bg-slate-600 px-4 py-2 font-semibold hover:bg-slate-500">
          Replay the tutorial
        </button>
        <p className="mt-2 text-xs text-slate-400">The Guide tab explains every part of the game.</p>
      </div>
      <div className="panel">
        <h2 className="mb-1 panel-title">Save</h2>
        <p className="mb-3 text-sm text-slate-300">
          Your game saves automatically in this browser. Export a copy to back it up or move it to another device.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onExport} className="min-h-11 rounded bg-sky-600 px-4 py-2 font-semibold hover:bg-sky-500">
            Export save
          </button>
          <label className="inline-flex min-h-11 cursor-pointer items-center rounded bg-slate-600 px-4 py-2 font-semibold hover:bg-slate-500 has-focus-visible:outline-2 has-focus-visible:outline-sky-400">
            Import save…
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Import save file"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
        </div>
        {pending && (
          <div role="alert" className="mt-3 rounded bg-amber-950/60 p-3 text-sm text-amber-100">
            <p className="mb-2">
              This save has {fmt.num(pending.energy)} energy, {pending.activeGenerators.length} generators and
              research level {pending.researchLevel}. Loading it <strong>replaces your current game</strong>.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  loadSave(pending);
                  setPending(null);
                  setMessage({ kind: 'ok', text: 'Save loaded.' });
                }}
                className="min-h-11 rounded bg-amber-600 px-3 py-2 font-semibold hover:bg-amber-500"
              >
                Load this save
              </button>
              <button type="button" onClick={() => setPending(null)} className="min-h-11 rounded bg-slate-600 px-3 py-2 font-semibold hover:bg-slate-500">
                Cancel
              </button>
            </div>
          </div>
        )}
        {damaged && (
          <div className="mt-3 rounded bg-slate-900/60 p-3 text-sm text-slate-300" data-testid="damaged-save">
            <p className="mb-2">
              🛟 A saved game from {new Date(damaged.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} could not be
              loaded ({damaged.reason}). A copy was kept on this device.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadText(saveFileName('damaged-save', new Date(damaged.at)), damagedSaveFile(damaged))}
                className="min-h-11 rounded bg-sky-700 px-3 py-2 font-semibold hover:bg-sky-600"
              >
                Download the kept copy
              </button>
              <button
                type="button"
                onClick={() => void forgetDamagedSave(SAVE_KEY).then(() => setDamaged(null))}
                className="min-h-11 rounded bg-slate-600 px-3 py-2 font-semibold hover:bg-slate-500"
              >
                Delete it
              </button>
            </div>
          </div>
        )}
        {message && (
          <p role="status" className={`mt-3 text-sm ${message.kind === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>
            {message.text}
          </p>
        )}
      </div>
      <div className="panel text-sm text-slate-300">
        <h2 className="mb-1 panel-title">Offline progress</h2>
        Generators, producers and research keep going while the game is closed, for up to{' '}
        <strong>{formatHours(MAX_OFFLINE_SECONDS)}</strong>. Research that finishes later still completes.
      </div>
      <PurchasesSettings />
      <SupportLink />
      <details className="panel text-sm text-slate-300" data-testid="credits">
        <summary className="cursor-pointer panel-title">Credits</summary>
        <p className="mt-2">MegaGen Idle. All sprites are drawn by the game's own script, using the AAP-64 palette.</p>
        {supporter && (
          // the Supporter Pack's thank-you (1.95)
          <p className="mt-2 font-semibold" style={{ color: SUPPORTER_COLOR }} data-testid="supporter-thanks">
            And thank you, Supporter, for helping MegaGen Idle grow.
          </p>
        )}
        <h3 className="mt-3 font-semibold text-slate-200">Art</h3>
        <CreditList items={ART_CREDITS} />
        <h3 className="mt-3 font-semibold text-slate-200">Open-source software</h3>
        <CreditList items={LIBRARY_CREDITS} />
        <p className="mt-2 text-xs text-slate-400">Full license texts: THIRD_PARTY_NOTICES.md in the game's repository.</p>
      </details>
      <TestStoreSwitch />
      <div className="rounded-lg border border-red-900 bg-slate-800 p-4">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-red-300">Reset</h2>
        <p className="mb-3 text-sm text-slate-300">Start over from the beginning. This deletes your progress in this browser.</p>
        {resetStep === 0 && (
          <button type="button" onClick={() => setResetStep(1)} className="min-h-11 rounded bg-red-800 px-4 py-2 font-semibold hover:bg-red-700">
            Reset game…
          </button>
        )}
        {resetStep > 0 && (
          <div role="alert" className="rounded bg-red-950/60 p-3 text-sm text-red-100">
            <p className="mb-2">
              {resetStep === 1
                ? 'Are you sure? Consider exporting your save first.'
                : 'Last chance: this cannot be undone. Really delete everything?'}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (resetStep === 1) setResetStep(2);
                  else {
                    resetGame();
                    setResetStep(0);
                    setPending(null);
                    setMessage({ kind: 'ok', text: 'Game reset. Good luck!' });
                  }
                }}
                className="min-h-11 rounded bg-red-700 px-3 py-2 font-semibold hover:bg-red-600"
              >
                {resetStep === 1 ? 'Yes, reset' : 'Delete everything'}
              </button>
              <button type="button" autoFocus onClick={() => setResetStep(0)} className="min-h-11 rounded bg-slate-600 px-3 py-2 font-semibold hover:bg-slate-500">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
