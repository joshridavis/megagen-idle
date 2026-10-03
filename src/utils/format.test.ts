import { describe, expect, it } from 'vitest';
import { formatDuration, formatNumber, formatRate, formatRatePer, rateUnit } from './format';

describe('formatNumber (short notation)', () => {
  it.each([
    [0, '0'],
    [7.9, '7'],
    [999, '999'],
    [999.99, '999'],
    [1000, '1K'],
    [1234, '1.23K'],
    [12_345, '12.3K'],
    [123_456, '123K'],
    [999_999, '999K'],
    [1e6, '1M'],
    [3_456_789, '3.45M'],
    [1e9, '1B'],
    [1.5e12, '1.5T'],
    [999.9e12, '999T'],
    [1e15, '1e15'],
    [1.234e21, '1.23e21'],
    [-1234, '-1.23K'],
    [-5, '-5'],
  ])('%s → %s', (n, out) => {
    expect(formatNumber(n)).toBe(out);
  });

  it('NaN and infinities are safe', () => {
    expect(formatNumber(Number.NaN)).toBe('—');
    expect(formatNumber(Infinity)).toBe('∞');
    expect(formatNumber(-Infinity)).toBe('-∞');
  });
});

describe('other notations', () => {
  it('scientific from 1000', () => {
    expect(formatNumber(999, 'scientific')).toBe('999');
    expect(formatNumber(1000, 'scientific')).toBe('1e3');
    expect(formatNumber(1e6, 'scientific')).toBe('1e6');
    expect(formatNumber(4.567e9, 'scientific')).toBe('4.56e9');
  });
  it('full shows every digit', () => {
    expect(formatNumber(1_234_567, 'full')).toBe('1,234,567');
    expect(formatNumber(1e15, 'full')).toBe('1,000,000,000,000,000');
  });
});

describe('formatRate', () => {
  it('uses more decimals for small rates', () => {
    expect(formatRate(0.55)).toBe('0.55');
    expect(formatRate(0)).toBe('0.00');
    expect(formatRate(12.34)).toBe('12.3');
    expect(formatRate(-1 / 60)).toBe('-0.01');
    expect(formatRate(2500)).toBe('2.5K');
  });
});

describe('formatDuration', () => {
  it('formats days, hours, minutes, seconds', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(200)).toBe('3m 20s');
    expect(formatDuration(3900)).toBe('1h 5m');
    expect(formatDuration(3 * 86400)).toBe('3d');
    expect(formatDuration(90000)).toBe('1d 1h');
    expect(formatDuration(-5)).toBe('0s');
    expect(formatDuration(Number.NaN)).toBe('0s');
  });
});

describe('formatHours', () => {
  it('words whole-hour limits', async () => {
    const { formatHours } = await import('./format');
    expect(formatHours(24 * 3600)).toBe('24 hours');
    expect(formatHours(3600)).toBe('1 hour');
    expect(formatHours(5400)).toBe('90 minutes');
  });
});

describe('round values keep their zeros (playtest 11 bug: 360,722 showed as 36K)', () => {
  it('never drops zeros from the whole-number part', () => {
    expect(formatNumber(360_722)).toBe('360K');
    expect(formatNumber(100_000)).toBe('100K');
    expect(formatNumber(50_000)).toBe('50K');
    expect(formatNumber(200_000_000)).toBe('200M');
    expect(formatNumber(10_000)).toBe('10K');
    expect(formatNumber(1_000)).toBe('1K');
    expect(formatNumber(1_500)).toBe('1.5K');
    expect(formatNumber(2e17, 'scientific')).toBe('2e17');
    expect(formatNumber(3e17, 'short')).toBe('3e17');
  });

  it('matches full notation to 3 significant digits for many values', () => {
    for (let n = 1000; n < 1e12; n = Math.floor(n * 1.37) + 7) {
      const short = formatNumber(n);
      const value = parseFloat(short) * 1000 ** ['', 'K', 'M', 'B'].indexOf(short.replace(/[\d.]/g, ''));
      expect(value, `${n} -> ${short}`).toBeLessThanOrEqual(n);
      expect(value, `${n} -> ${short}`).toBeGreaterThan(n * 0.99);
    }
  });
});

describe('slow rates per minute or hour (playtest 19.3)', () => {
  it('picks a unit that does not round to zero', () => {
    expect(rateUnit(0)).toBe('s');
    expect(rateUnit(0.8)).toBe('s');
    expect(rateUnit(0.05)).toBe('min');
    expect(rateUnit(0.0014)).toBe('h');
    expect(formatRatePer(0.8)).toBe('0.80/s');
    expect(formatRatePer(0.05)).toBe('3.00/min');
    expect(formatRatePer(0.0014)).toBe('5.04/h');
    expect(formatRatePer(0)).toBe('0.00/s');
  });
});
