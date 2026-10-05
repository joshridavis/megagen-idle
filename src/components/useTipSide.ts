import { useCallback, useRef, useState } from 'react';

/** The pinned top bar (0.43) carries this test id; tooltips keep clear of it. */
export const TOP_BAR_TEST_ID = 'top-bar';

/** Bottom edge of the pinned top bar on screen (px), or 0 without one. */
export function topBarBottom(): number {
  if (typeof document === 'undefined') return 0;
  const bar = document.querySelector(`[data-testid="${TOP_BAR_TEST_ID}"]`);
  return bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 0;
}

/** Gap kept between a tooltip and the top bar (px). */
const GAP = 8;

/**
 * A CSS hover tooltip that normally opens above its anchor opens below it
 * instead when there is no room between the anchor and the pinned top bar
 * (playtest 20 bug). Call `place` on pointer enter and focus of the group.
 */
export function useTipSide<T extends HTMLElement>() {
  const tip = useRef<T>(null);
  const [below, setBelow] = useState(false);
  const place = useCallback(() => {
    const el = tip.current;
    const anchor = el?.parentElement;
    if (!el || !anchor) return;
    // measure the hidden tooltip for a moment
    const display = el.style.display;
    el.style.display = 'block';
    const height = el.offsetHeight;
    el.style.display = display;
    setBelow(anchor.getBoundingClientRect().top - height - GAP < topBarBottom() + GAP);
  }, []);
  return { tip, below, place };
}
