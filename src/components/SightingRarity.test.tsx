import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
import { TITLE_TIERS } from '../data/achievements';
import { EVENTS, RARITY_LABEL, rarityColor } from '../data/events';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';

afterEach(cleanup);

const sightings = EVENTS.filter((e) => e.animation);
const hex = (rgb: string) => '#' + rgb.match(/\d+/g)!.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
const luminance = (h: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** The row: slate-900 at 60% over the slate-800 panel. */
const ROW = '#151e30';

describe('sightings show their rarity after they are found (1.91)', () => {
  it('found shows name, rarity and count; unfound shows ??? and the rarity', () => {
    const [found, hidden] = sightings;
    useStore.setState({ ...createInitialState(Date.now()), seenEvents: { [found.id]: { count: 3, firstSeen: 1 } } });
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /Completion/ }));
    const a = screen.getByTestId(`sighting-rarity-${found.id}`);
    expect(a.textContent).toBe(RARITY_LABEL[found.rarity]);
    expect(a.parentElement!.textContent).toBe(`${found.name}${RARITY_LABEL[found.rarity]}×3`);
    const b = screen.getByTestId(`sighting-rarity-${hidden.id}`);
    expect(b.parentElement!.textContent).toBe(`???${RARITY_LABEL[hidden.rarity]}`);
    expect(hex(b.style.color)).toBe(rarityColor(hidden.rarity));
  });

  it('each rarity uses the color of the title tier of the same name, readable on the row', () => {
    for (const e of sightings) {
      const tier = TITLE_TIERS.find((t) => t.id === e.rarity)!;
      expect(tier.name).toBe(RARITY_LABEL[e.rarity]);
      expect(rarityColor(e.rarity)).toBe(tier.color);
      const [hi, lo] = [luminance(tier.color), luminance(ROW)].sort((x, y) => y - x);
      expect((hi + 0.05) / (lo + 0.05)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
