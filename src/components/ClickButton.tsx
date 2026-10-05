import { useEffect, useRef } from 'react';
import BreakdownTooltip from './BreakdownTooltip';
import { useClickEnergy } from './useClickEnergy';

/** The big "Generate energy" button. `onInViewChange` reports whether it is on screen (1.45). */
export default function ClickButton({ onInViewChange }: { onInViewChange?: (inView: boolean) => void }) {
  const { click, clickText, pops, onClick } = useClickEnergy();
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !onInViewChange || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) onInViewChange(e.isIntersecting);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      onInViewChange(true);
    };
  }, [onInViewChange]);

  return (
    <div className="relative">
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        data-tutorial="click"
        data-testid="click-button"
        className="select-none rounded-xl border-2 border-yellow-500 bg-yellow-400 px-8 py-4 text-xl font-bold text-slate-900 shadow-[0_4px_0_0_#b4202a] transition-transform hover:bg-yellow-300 active:translate-y-1 active:shadow-none focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
      >
        Generate energy
      </button>
      {pops.map((id) => (
        <span
          key={id}
          aria-hidden="true"
          className="click-pop pointer-events-none absolute left-1/2 top-0 font-mono font-bold text-yellow-300"
        >
          +{clickText}
        </span>
      ))}
      <div className="mt-2 text-center text-xs text-slate-400">
        <BreakdownTooltip id="click-breakdown" title="Energy per click" baseLabel="Base click" unit="" breakdown={click} digits={0}>
          +{clickText} per click
        </BreakdownTooltip>
      </div>
    </div>
  );
}
