import { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { MachineTip as Tip } from '../utils/mapTips';
import { topBarBottom } from './useTipSide';

const WIDTH = 220;
const GAP = 8;

/**
 * The tooltip beside a machine on the map (1.63): above it, or below when there is no room under the
 * pinned top bar, always inside the screen, and it follows the machine while the page scrolls.
 */
export default function MachineTip({ anchor, tip }: { anchor: HTMLElement | null; tip: Tip }) {
  const box = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; side: 'above' | 'below' } | null>(null);

  useLayoutEffect(() => {
    if (!anchor) return;
    const place = () => {
      const a = anchor.getBoundingClientRect();
      const h = box.current?.offsetHeight ?? 0;
      const left = Math.min(Math.max(a.left + a.width / 2 - WIDTH / 2, GAP), Math.max(GAP, window.innerWidth - WIDTH - GAP));
      const above = a.top - GAP - h;
      if (above >= topBarBottom() + GAP) setPos({ left, top: above, side: 'above' });
      else setPos({ left, top: Math.min(a.bottom + GAP, Math.max(GAP, window.innerHeight - h - GAP)), side: 'below' });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [anchor, tip.title, tip.lines.length]);

  if (!anchor) return null;
  return createPortal(
    <div
      ref={box}
      role="tooltip"
      data-testid="machine-tip"
      data-side={pos?.side}
      className="pointer-events-none fixed z-[44] rounded border border-slate-600 bg-slate-950/95 p-2 text-left text-xs leading-snug text-slate-100 shadow-xl"
      style={{ width: WIDTH, left: pos?.left ?? -9999, top: pos?.top ?? -9999 }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-slate-50">{tip.title}</span>
        <span
          data-testid="machine-tip-kind"
          title={tip.kind === 'Generator' ? 'Makes energy' : 'Makes a resource'}
          className={`shrink-0 rounded px-1 text-[10px] font-semibold uppercase tracking-wide ${tip.kind === 'Generator' ? 'bg-amber-500/20 text-amber-300' : 'bg-sky-500/20 text-sky-300'}`}
        >
          {tip.kind === 'Generator' ? '⚡ Generator' : '⛏ Producer'}
        </span>
      </div>
      {tip.lines.map((l) => (
        <div key={l} className="text-slate-300">
          {l}
        </div>
      ))}
      {tip.warning && <div className="text-red-300">⚠ {tip.warning}</div>}
    </div>,
    document.body,
  );
}
