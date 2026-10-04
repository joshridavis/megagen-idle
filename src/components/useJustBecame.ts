import { useEffect, useRef, useState } from 'react';

/**
 * True for `ms` after `flag` turns from false to true while mounted (0.43: a
 * card just unlocked). A change in `epoch` (a game loaded or reset) updates
 * the flag silently, so loading a save does not light everything up.
 */
export function useJustBecame(flag: boolean, epoch: number, ms = 2000): boolean {
  const prev = useRef({ flag, epoch });
  const [on, setOn] = useState(false);
  useEffect(() => {
    const was = prev.current;
    prev.current = { flag, epoch };
    if (!flag || was.flag || was.epoch !== epoch) return;
    setOn(true);
    const t = setTimeout(() => setOn(false), ms);
    return () => clearTimeout(t);
  }, [flag, epoch, ms]);
  return on;
}
