import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { topBarBottom } from './useTipSide';

/** Width of the tip in px, and the gap kept from the anchor and the screen edges. */
const TIP_WIDTH = 224;
const GAP = 8;

/**
 * A small tooltip drawn on top of the page (1.19, playtest 17): it is never
 * cut off by a scrolling list or the map, sits centered above its anchor (below
 * when there is no room above), and stays inside the screen. Shown on hover
 * and keyboard focus. Use for short help on small marks like ⭐ and 📍.
 */
export default function FloatingTip({
  text,
  children,
  className = '',
  testId,
  focusable = true,
  onOpenChange,
}: {
  text: string;
  children: ReactNode;
  className?: string;
  testId?: string;
  /** False inside a button or link, which already takes keyboard focus. */
  focusable?: boolean;
  /** Told when the tip opens or closes (the map hides its machine tooltip meanwhile, 1.63). */
  onOpenChange?: (open: boolean) => void;
}) {
  const anchor = useRef<HTMLSpanElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const [open, setOpenState] = useState(false);
  const setOpen = (v: boolean) => {
    setOpenState(v);
    onOpenChange?.(v);
  };
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !anchor.current) return;
    const a = anchor.current.getBoundingClientRect();
    const height = tip.current?.offsetHeight ?? 0;
    const maxLeft = Math.max(GAP, window.innerWidth - TIP_WIDTH - GAP);
    const left = Math.min(Math.max(a.left + a.width / 2 - TIP_WIDTH / 2, GAP), maxLeft);
    const above = a.top - GAP - height;
    // never over the pinned top bar (playtest 20): below the anchor when there is no room above
    setPos({ left, top: above >= topBarBottom() + GAP ? above : a.bottom + GAP });
  }, [open]);

  return (
    <span
      ref={anchor}
      tabIndex={focusable ? 0 : undefined}
      className={`cursor-help ${className}`}
      data-testid={testId}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open &&
        createPortal(
          <div
            ref={tip}
            role="tooltip"
            className="pointer-events-none fixed z-[100] rounded border border-slate-600 bg-slate-950 p-2 text-left text-xs leading-snug text-slate-100 shadow-xl"
            style={{ width: TIP_WIDTH, left: pos?.left ?? -9999, top: pos?.top ?? -9999 }}
          >
            {text}
          </div>,
          document.body,
        )}
    </span>
  );
}
