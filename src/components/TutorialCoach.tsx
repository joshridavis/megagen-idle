import { useEffect } from 'react';
import { TUTORIAL_DONE, TUTORIAL_STEPS } from '../data/tutorial';
import { useStore } from '../store';
import { nextTutorialStep } from '../utils/tutorial';

/**
 * First-run walkthrough (0.40): a small card in the page flow (never covering
 * the game), highlighting one thing at a time and moving on when it is done.
 */
export default function TutorialCoach() {
  const { step, replay } = useStore((s) => s.settings.tutorial);
  const lifetimeEnergy = useStore((s) => s.lifetimeEnergy);
  const records = useStore((s) => s.records);
  const currentResearch = useStore((s) => s.currentResearch);
  const completedResearch = useStore((s) => s.completedResearch);
  const setStep = useStore((s) => s.setTutorialStep);

  useEffect(() => {
    if (step >= TUTORIAL_DONE) return;
    const next = nextTutorialStep(step, { lifetimeEnergy, records, currentResearch, completedResearch }, replay);
    if (next !== step) setStep(next);
  }, [step, replay, lifetimeEnergy, records, currentResearch, completedResearch, setStep]);

  if (step >= TUTORIAL_DONE) return null;
  const s = TUTORIAL_STEPS[step];
  const last = step === TUTORIAL_DONE - 1;
  const highlight = s.targets.map((t) => `[data-tutorial="${t}"]`).join(',');
  return (
    <>
      <style>{`${highlight}{outline:3px solid #ffc825;outline-offset:3px;animation:tutorial-pulse 1.4s ease-in-out infinite}`}</style>
      <div
        role="region"
        aria-label="Tutorial"
        data-testid="tutorial"
        className="w-full max-w-md rounded-lg border-2 border-yellow-400 bg-slate-900 p-4 shadow-xl"
      >
        <div className="mb-1 flex items-center justify-between text-xs text-yellow-300">
          <span className="font-semibold uppercase tracking-wide">Tutorial</span>
          <span>
            Step {step + 1} of {TUTORIAL_DONE}
          </span>
        </div>
        <h2 className="font-bold">{s.title}</h2>
        <p className="mt-1 text-sm text-slate-300">{s.text}</p>
        <div className="mt-3 flex justify-between gap-2">
          {!last && (
            <button type="button" onClick={() => setStep(TUTORIAL_DONE)} className="min-h-11 text-sm text-slate-400 hover:text-white">
              Skip tutorial
            </button>
          )}
          {(last || replay) && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="ml-auto min-h-11 rounded bg-yellow-400 px-4 py-2 font-semibold text-slate-900 hover:bg-yellow-300"
            >
              {last ? 'Got it' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
