import type { ReactNode } from 'react';
import type { RateBreakdown } from '../utils/breakdown';

const fmt = (n: number, digits: number) => n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/**
 * Wraps a value; on hover or keyboard focus shows how it is built up:
 * base, each boost with its source, and the total. Reusable for resources.
 */
export default function BreakdownTooltip({
  id,
  title,
  baseLabel,
  unit,
  breakdown,
  digits = 2,
  emptyHint = 'No boosts yet. Research can add them.',
  align = 'center',
  children,
}: {
  id: string;
  title: string;
  baseLabel: string;
  unit: string;
  breakdown: RateBreakdown;
  digits?: number;
  /** Shown when there are no modifiers; empty string hides it. */
  emptyHint?: string;
  align?: 'center' | 'left';
  children: ReactNode;
}) {
  return (
    <span className="group relative inline-block">
      <span
        tabIndex={0}
        aria-describedby={id}
        className="cursor-help rounded underline decoration-dotted underline-offset-2 focus-visible:outline-2 focus-visible:outline-sky-400"
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={`pointer-events-none absolute top-full z-30 mt-2 hidden w-64 rounded ${align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'} bg-slate-950 p-3 text-left text-xs text-slate-200 shadow-lg group-hover:block group-has-focus-visible:block`}
      >
        <span className="mb-1 block font-semibold text-slate-100">{title}</span>
        <span className="flex justify-between gap-2">
          <span>{baseLabel}</span>
          <span className="font-mono">
            {fmt(breakdown.base, digits)} {unit}
          </span>
        </span>
        {breakdown.modifiers.length === 0 ? (
          emptyHint && <span className="mt-1 block text-slate-400">{emptyHint}</span>
        ) : (
          breakdown.modifiers.map((m, i) => (
            <span
              key={`${m.source}-${i}`}
              className={`flex justify-between gap-2 ${m.amount < 0 ? 'text-amber-300' : 'text-emerald-300'}`}
            >
              <span>
                {m.source}
                {m.percent !== undefined && ` (${m.percent >= 0 ? '+' : ''}${Math.round(m.percent * 100)}%)`}
              </span>
              <span className="font-mono">
                {m.amount < 0 ? '−' : '+'}
                {fmt(Math.abs(m.amount), digits)} {unit}
              </span>
            </span>
          ))
        )}
        <span className="mt-1 flex justify-between gap-2 border-t border-slate-700 pt-1 font-semibold">
          <span>Total</span>
          <span className="font-mono">
            {fmt(breakdown.total, digits)} {unit}
          </span>
        </span>
      </span>
    </span>
  );
}
