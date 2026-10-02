import { useRef, useState } from 'react';
import { useStore } from '../store';
import { exportSave, parseSaveFile } from '../utils/saveFile';
import type { GameState, NumberNotation } from '../types/state';
import { MAX_OFFLINE_SECONDS } from '../data/time';
import { formatHours } from '../utils/format';
import { useNumberFormat } from './useNumberFormat';

const NOTATIONS: { id: NumberNotation; label: string; example: string }[] = [
  { id: 'short', label: 'Short', example: '1.23M' },
  { id: 'scientific', label: 'Scientific', example: '1.23e6' },
  { id: 'full', label: 'Full', example: '1,234,567' },
];

/** Settings tab: number notation, save export/import, reset, and offline notes. No audio settings. */
export default function SettingsPanel() {
  const loadSave = useStore((s) => s.loadSave);
  const fmt = useNumberFormat();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [pending, setPending] = useState<GameState | null>(null);
  const notation = useStore((s) => s.settings.notation);
  const reduceMotion = useStore((s) => s.settings.reduceMotion);
  const setReduceMotion = useStore((s) => s.setReduceMotion);
  const replayTutorial = useStore((s) => s.replayTutorial);
  const setNotation = useStore((s) => s.setNotation);
  const resetGame = useStore((s) => s.resetGame);
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);

  const onExport = () => {
    const text = exportSave(useStore.getState());
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `megagen-idle-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
      <fieldset className="rounded-lg bg-slate-800 p-4">
        <legend className="sr-only">Number notation</legend>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Numbers</h2>
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
      <div className="rounded-lg bg-slate-800 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Motion</h2>
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
              Turns off random-event animations. Events still happen, and show as a notice instead.
            </span>
          </span>
        </label>
      </div>
      <div className="rounded-lg bg-slate-800 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Tutorial</h2>
        <button type="button" onClick={replayTutorial} className="min-h-11 rounded bg-slate-600 px-4 py-2 font-semibold hover:bg-slate-500">
          Replay the tutorial
        </button>
        <p className="mt-2 text-xs text-slate-400">The Guide tab explains every part of the game.</p>
      </div>
      <div className="rounded-lg bg-slate-800 p-4">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">Save</h2>
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
        {message && (
          <p role="status" className={`mt-3 text-sm ${message.kind === 'ok' ? 'text-emerald-300' : 'text-red-300'}`}>
            {message.text}
          </p>
        )}
      </div>
      <div className="rounded-lg bg-slate-800 p-4 text-sm text-slate-300">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">Offline progress</h2>
        Generators, producers and research keep going while the game is closed, for up to{' '}
        <strong>{formatHours(MAX_OFFLINE_SECONDS)}</strong>. Research that finishes later still completes.
      </div>
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
