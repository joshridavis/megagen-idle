import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { getClickBreakdown } from '../utils/breakdown';
import BreakdownTooltip from './BreakdownTooltip';

export default function ClickButton() {
  const clickEnergy = useStore((s) => s.clickEnergy);
  const completed = useStore((s) => s.completedResearch);
  const click = useMemo(() => getClickBreakdown(completed), [completed]);
  const clickText = click.total.toLocaleString('en-US', { maximumFractionDigits: 2 });
  const [pops, setPops] = useState<number[]>([]);

  const onClick = () => {
    clickEnergy();
    const id = Date.now() + Math.random();
    setPops((p) => [...p.slice(-5), id]);
    setTimeout(() => setPops((p) => p.filter((x) => x !== id)), 700);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
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
