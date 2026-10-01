import { useEffect, useRef } from 'react';
import { GENERATORS } from '../data/generators';
import { RESEARCH_BY_ID } from '../data/research';
import { RESOURCE_IDS, RESOURCE_NAMES } from '../data/resources';
import { MAX_OFFLINE_SECONDS } from '../data/time';
import { useStore } from '../store';
import { formatDuration } from '../utils/format';
import { useNumberFormat } from './useNumberFormat';

/** "Welcome back" summary of what happened while the game was closed. */
export default function WelcomeBack() {
  const report = useStore((s) => s.welcomeBack);
  const generators = useStore((s) => s.activeGenerators);
  const dismiss = useStore((s) => s.dismissWelcomeBack);
  const btn = useRef<HTMLButtonElement>(null);
  const { num: fmt } = useNumberFormat();

  useEffect(() => {
    if (!report) return;
    btn.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && dismiss();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [report, dismiss]);

  if (!report) return null;
  const capped = report.awaySeconds > report.creditedSeconds + 1;
  const resources = RESOURCE_IDS.filter((id) => Math.abs(report.resourcesGained[id]) >= 1);
  const outOfFuel = report.outOfFuel
    .map((id) => generators.find((g) => g.id === id))
    .filter(Boolean)
    .map((g) => `${GENERATORS[g!.type].name} #${g!.id.split('-')[1]}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={dismiss}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="w-full max-w-md rounded-lg border border-slate-600 bg-slate-800 p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        data-testid="welcome-back"
      >
        <h2 id="welcome-title" className="mb-1 text-xl font-bold">
          Welcome back!
        </h2>
        <p className="mb-3 text-sm text-slate-300">
          You were away for <strong>{formatDuration(report.awaySeconds)}</strong>.
          {capped && (
            <span className="block text-amber-300">
              Only the first {formatDuration(MAX_OFFLINE_SECONDS)} count toward offline progress.
            </span>
          )}
        </p>
        <ul className="mb-4 space-y-1 text-sm">
          <li>
            ⚡ <strong className="text-yellow-300">+{fmt(report.energyGained)}</strong> energy
          </li>
          {resources.map((id) => (
            <li key={id}>
              {report.resourcesGained[id] >= 0 ? '⛏️ +' : '🔥 '}
              {fmt(report.resourcesGained[id])} {RESOURCE_NAMES[id].toLowerCase()}
            </li>
          ))}
          {report.completedResearch.map((id) => (
            <li key={id} className="text-emerald-300">
              🎓 Research complete: {RESEARCH_BY_ID[id]?.name ?? id}
            </li>
          ))}
          {outOfFuel.length > 0 && (
            <li className="text-red-300">⚠️ Ran out of fuel and switched off: {outOfFuel.join(', ')}</li>
          )}
        </ul>
        <button
          ref={btn}
          type="button"
          onClick={dismiss}
          className="min-h-11 w-full rounded bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-500"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
