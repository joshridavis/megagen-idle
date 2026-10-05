import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { getClickBreakdown } from '../utils/breakdown';
import { useNumberFormat } from './useNumberFormat';

/**
 * One click on "Generate energy": the store action (energy, stats, tutorial) plus the floating "+N"
 * pops. Shared by the big button and the small one by the pinned bar (1.45), so both behave the same.
 */
export const useClickEnergy = () => {
  const clickEnergy = useStore((s) => s.clickEnergy);
  const completed = useStore((s) => s.completedResearch);
  const eps = useStore((s) => s.energyPerSecond);
  const pets = useStore((s) => s.pets);
  const click = useMemo(() => getClickBreakdown(completed, eps, pets), [completed, eps, pets]);
  const fmt = useNumberFormat();
  const clickText = click.total < 10 && click.total % 1 ? fmt.rate(click.total) : fmt.num(click.total);
  const [pops, setPops] = useState<number[]>([]);

  const onClick = () => {
    clickEnergy();
    const id = Date.now() + Math.random();
    setPops((p) => [...p.slice(-5), id]);
    setTimeout(() => setPops((p) => p.filter((x) => x !== id)), 700);
  };

  return { click, clickText, pops, onClick };
};
