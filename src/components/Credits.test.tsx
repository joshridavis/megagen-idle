import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { LIBRARY_CREDITS } from '../data/credits';
import SettingsPanel from './SettingsPanel';
import pkg from '../../package.json';

afterEach(cleanup);

describe('Credits (0.67)', () => {
  it('lists the palette and every shipped library', () => {
    render(<SettingsPanel />);
    const credits = within(screen.getByTestId('credits'));
    expect(credits.getByText('AAP-64 palette')).toBeTruthy();
    for (const c of LIBRARY_CREDITS) expect(credits.getByText(c.name)).toBeTruthy();
  });

  it('credits every runtime dependency in package.json', () => {
    const named = LIBRARY_CREDITS.map((c) => c.name.toLowerCase().replace(/\s/g, ''));
    for (const dep of Object.keys(pkg.dependencies)) {
      const base = dep.replace(/^@[^/]+\//, '').replace(/-(dom|js)$/, '');
      expect(named.some((n) => n === base || n === base.replace(/-/g, '')), dep).toBe(true);
    }
  });
});
