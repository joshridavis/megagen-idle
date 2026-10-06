import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
// @ts-expect-error plain .mjs module without types
import { AAP64 } from '../../scripts/lib/palette.mjs';
import App from '../App';
import { ACHIEVEMENTS, TITLE_TIERS, titleTier } from '../data/achievements';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';

afterEach(cleanup);

/** WCAG relative luminance of a #rrggbb color. */
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** The top bar's background (Tailwind slate-800). */
const BAR = '#1e293b';
const toHex = (rgb: string) =>
  '#' +
  rgb
    .match(/\d+/g)!
    .slice(0, 3)
    .map((n) => Number(n).toString(16).padStart(2, '0'))
    .join('');

describe('title tiers (1.66)', () => {
  it('every title has a tier, and only titles have one', () => {
    const titles = ACHIEVEMENTS.filter((a) => a.title);
    expect(titles.length).toBeGreaterThanOrEqual(16);
    for (const a of ACHIEVEMENTS) {
      if (a.title) expect(TITLE_TIERS.map((t) => t.id)).toContain(a.tier);
      else expect(a.tier).toBeUndefined();
    }
    expect(titleTier('maxed_all')?.id).toBe('legendary');
    expect(titleTier('gens_1')).toBeNull();
    expect(titleTier(null)).toBeNull();
  });

  it('tier colors are AAP-64, distinct and readable on the top bar', () => {
    const palette = new Set((AAP64 as string[]).map((h) => `#${h}`));
    for (const t of TITLE_TIERS) {
      expect(palette.has(t.color)).toBe(true);
      expect(contrast(t.color, BAR)).toBeGreaterThanOrEqual(4.5);
    }
    expect(new Set(TITLE_TIERS.map((t) => t.color)).size).toBe(TITLE_TIERS.length);
  });

  it('the top bar shows the chosen title in its tier color, Legendary with a shine', async () => {
    useStore.setState({ ...createInitialState(Date.now()), achievements: { level_10: 1, maxed_all: 2 } });
    useStore.getState().setCosmetics({ title: 'level_10' });
    render(<App />);
    let shown = await screen.findByTestId('player-title');
    expect(shown.textContent).toBe('Apprentice');
    expect(shown.dataset.tier).toBe('common');
    expect(toHex(shown.style.color)).toBe(titleTier('level_10')!.color);
    expect(shown.className).not.toContain('title-shine');
    cleanup();
    useStore.getState().setCosmetics({ title: 'maxed_all' });
    render(<App />);
    shown = await screen.findByTestId('player-title');
    expect(shown.dataset.tier).toBe('legendary');
    expect(toHex(shown.style.color)).toBe(TITLE_TIERS[4].color);
    expect(shown.className).toContain('title-shine');
  });

  it('the picker groups titles by tier, highest first, and lists locked ones grayed out', async () => {
    useStore.setState({ ...createInitialState(Date.now()), achievements: { energy_100k: 1 } });
    render(<App />);
    fireEvent.click(await screen.findByRole('tab', { name: /Achievements/ }));
    const select = await screen.findByTestId('title-select');
    const groups = [...select.querySelectorAll('optgroup')].map((g) => g.label);
    expect(groups).toEqual(['Legendary', 'Epic', 'Rare', 'Uncommon', 'Common']);
    const open = within(select).getByRole('option', { name: 'Live Wire' }) as HTMLOptionElement;
    expect(open.disabled).toBe(false);
    const locked = within(select).getByRole('option', { name: /Know-it-all/ }) as HTMLOptionElement;
    expect(locked.disabled).toBe(true);
    expect(locked.textContent).toContain('Complete every research.');

    const tiers = screen.getByTestId('title-tiers');
    expect([...tiers.querySelectorAll('h3')].map((h) => h.textContent)).toEqual(groups);
    expect(screen.getByTestId('title-energy_100k').dataset.unlocked).toBe('true');
    const lockedChip = screen.getByTestId('title-research_all');
    expect(lockedChip.dataset.unlocked).toBe('false');
    expect(lockedChip.className).toContain('text-slate-500');
    expect(lockedChip.textContent).toContain('Complete every research.');
    expect(within(screen.getByTestId('title-tier-legendary')).getByTestId('title-research_all')).toBeTruthy();
  });

  it('achievement cards that give a title show its tier', async () => {
    useStore.setState(createInitialState(Date.now()));
    render(<App />);
    fireEvent.click(await screen.findByRole('tab', { name: /Achievements/ }));
    expect((await screen.findByTestId('achievement-tier-maxed_all')).textContent).toContain('Legendary title');
    expect(screen.getByTestId('achievement-tier-level_10').textContent).toContain('Common title');
    expect(screen.queryByTestId('achievement-tier-gens_1')).toBeNull();
  });
});
