import type { NumberNotation } from '../types/state';

/** "1h 5m", "3m 20s", "45s". Negative or NaN counts as 0. */
export function formatDuration(seconds: number): string {
  const s = Number.isFinite(seconds) ? Math.max(0, Math.ceil(seconds)) : 0;
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (d) return h ? `${d}d ${h}h` : `${d}d`;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${r ? `${r}s` : ''}`.trim();
  return `${r}s`;
}

/** Short suffixes, each 1000x the previous. */
const SUFFIXES = ['', 'K', 'M', 'B', 'T'];

/** From this size on, short notation switches to scientific. */
export const SCIENTIFIC_THRESHOLD = 1e15;

/** Keeps 3 significant digits, cutting off (never rounding up) so 999,999 shows as 999K. */
function threeSig(x: number): string {
  const digits = x >= 100 ? 0 : x >= 10 ? 1 : 2;
  const f = 10 ** digits;
  const text = (Math.floor(x * f + 1e-9) / f).toFixed(digits);
  // trim zeros after the decimal point only: "1.50" -> "1.5", but "360" stays "360"
  return digits ? text.replace(/\.?0+$/, '') : text;
}

function scientific(abs: number): string {
  const exp = Math.floor(Math.log10(abs));
  let mant = abs / 10 ** exp;
  if (mant >= 10) mant = 9.99; // float edge
  return `${threeSig(mant)}e${exp}`;
}

/**
 * Formats a number for display. Below 1000: whole number with `decimals`
 * (cut off, not rounded). From 1000: "1.23K", "45.6M", "789B", "1.2T";
 * from 1e15 (or always, in scientific notation) "1.23e15"; "full" shows
 * every digit with separators. Negative numbers keep their sign; NaN shows "—".
 */
export function formatNumber(n: number, notation: NumberNotation = 'short', decimals = 0): string {
  if (Number.isNaN(n)) return '—';
  if (!Number.isFinite(n)) return n > 0 ? '∞' : '-∞';
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs < 1000 || notation === 'full') {
    const f = 10 ** decimals;
    const cut = Math.floor(abs * f + 1e-9) / f;
    return sign + cut.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  if (notation === 'scientific' || abs >= SCIENTIFIC_THRESHOLD) return sign + scientific(abs);
  const tier = Math.min(SUFFIXES.length - 1, Math.floor(Math.log10(abs) / 3));
  return sign + threeSig(abs / 1000 ** tier) + SUFFIXES[tier];
}

/** Rates: 2 decimals under 10, 1 decimal under 1000, then like formatNumber. */
export function formatRate(n: number, notation: NumberNotation = 'short'): string {
  const abs = Math.abs(n);
  if (abs < 10) return formatNumber(n, notation, 2);
  if (abs < 1000) return formatNumber(n, notation, 1);
  return formatNumber(n, notation);
}

/** Whole-hour limits as words: "24 hours", "1 hour", "90 minutes" if not whole hours. */
export function formatHours(seconds: number): string {
  if (seconds % 3600 !== 0) return `${Math.round(seconds / 60)} minutes`;
  const h = seconds / 3600;
  return `${h} hour${h === 1 ? '' : 's'}`;
}
