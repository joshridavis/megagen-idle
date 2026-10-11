import { useEffect, useState } from 'react';

/** Whether a CSS media query matches, kept current as the window changes (false where matchMedia is missing). */
export function useMediaQuery(query: string): boolean {
  const get = () => typeof window !== 'undefined' && !!window.matchMedia?.(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mq = typeof window !== 'undefined' ? window.matchMedia?.(query) : undefined;
    if (!mq) return;
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, [query]);
  return matches;
}
