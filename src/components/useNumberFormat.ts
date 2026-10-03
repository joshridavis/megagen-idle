import { useStore } from '../store';
import { formatNumber, formatRate, formatRatePer } from '../utils/format';

/** Number formatters that follow the player's notation preference. */
export const useNumberFormat = () => {
  const notation = useStore((s) => s.settings.notation);
  return {
    /** Amounts and costs (whole numbers below 1000). */
    num: (n: number, decimals = 0) => formatNumber(n, notation, decimals),
    /** Per-second rates (more decimals when small). */
    rate: (n: number) => formatRate(n, notation),
    /** A rate with its unit: per second, or per minute / hour when slow ("4.8/min"). */
    ratePer: (perSecond: number) => formatRatePer(perSecond, notation),
  };
};
