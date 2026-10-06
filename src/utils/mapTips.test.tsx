import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import MapPanel from '../components/MapPanel';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import { GeneratorType } from '../types/generator';
import type { GameState } from '../types/state';
import { machineTip } from './mapTips';
import { deriveRates } from './simulation';
import { layoutSite } from './siteMap';

afterEach(cleanup);

const fmt = { rate: (n: number) => n.toFixed(2), ratePer: (n: number) => `${(n * 3600).toFixed(0)}/h` };
const withCoal = (over: Partial<GameState> = {}): GameState =>
  deriveRates({
    ...createInitialState(0),
    roomCapacity: 40,
    completedResearch: ['fossil_fuels'],
    resources: { ...createInitialState(0).resources, coal: 1000 },
    activeGenerators: [
      { id: 'gen-1', type: GeneratorType.SOLAR, isActive: true, level: 2 },
      { id: 'gen-2', type: GeneratorType.COAL, isActive: true, level: 1 },
    ],
    ...over,
  });

describe('map tooltips (1.63)', () => {
  it('a generator shows its number, output, fuel, level and zone', () => {
    const s = withCoal();
    const placed = layoutSite(s).placed;
    const solar = machineTip(s, placed.find((p) => p.key === 'gen-1')!, fmt);
    expect(solar.title).toBe('Solar Panel #1');
    expect(solar.lines[0]).toMatch(/^\+[\d.]+ energy\/s$/);
    expect(solar.lines.some((l) => l.startsWith('Level 2 of '))).toBe(true);
    expect(solar.lines.some((l) => /sunny plateau/.test(l))).toBe(true);
    const coal = machineTip(s, placed.find((p) => p.key === 'gen-2')!, fmt);
    expect(coal.lines.some((l) => l.startsWith('🔥 Burns') && l.includes('coal'))).toBe(true);
    // switched off: no output, and it says so
    const off = withCoal({ activeGenerators: [{ id: 'gen-1', type: GeneratorType.SOLAR, isActive: false, level: 1 }] });
    const t = machineTip(off, layoutSite(off).placed.find((p) => p.key === 'gen-1')!, fmt);
    expect(t.lines.some((l) => l.includes('energy/s'))).toBe(false);
    expect(t.warning).toBe('Switched off');
  });

  it('a producer shows what one of them makes', () => {
    const s = withCoal();
    const quarry = layoutSite(s).placed.find((p) => p.kind === 'producer' && p.id === 'quarry')!;
    const t = machineTip(s, quarry, fmt);
    expect(t.title).toBe('Stone Quarry');
    expect(t.lines[0]).toMatch(/^\+\d+\/h stone$/);
    expect(t.kind).toBe('Producer');
    expect(t.lines[1]).toContain('you have 1');
    // owner, playtest 25: no level and no fuel lines on a producer
    expect(t.lines.some((l) => /level|burn/i.test(l))).toBe(false);
  });

  it('a fuel producer has no burn line either, and generators say they are generators (owner, playtest 25)', () => {
    const s = withCoal();
    const mine = layoutSite(s).placed.find((p) => p.kind === 'producer' && p.id === 'coalMine')!;
    const t = machineTip(s, mine, fmt);
    expect(t).toMatchObject({ title: 'Coal Mine', kind: 'Producer' });
    expect(t.lines.some((l) => /burn|level/i.test(l))).toBe(false);
    expect(machineTip(s, layoutSite(s).placed.find((p) => p.key === 'gen-2')!, fmt).kind).toBe('Generator');
  });

  it('hovering or focusing a machine on the map shows the tooltip beside it', () => {
    useStore.getState().resetGame();
    useStore.setState(withCoal());
    render(<MapPanel onSelect={() => {}} />);
    expect(screen.queryByTestId('machine-tip')).toBeNull();
    fireEvent.mouseEnter(screen.getByTestId('map-gen-1').parentElement!);
    expect(screen.getByTestId('machine-tip').textContent).toContain('Solar Panel #1');
    expect(screen.getByTestId('machine-tip-kind').textContent).toContain('Generator');
    fireEvent.mouseLeave(screen.getByTestId('map-gen-1').parentElement!);
    expect(screen.queryByTestId('machine-tip')).toBeNull();
    fireEvent.focus(screen.getByTestId('map-quarry-1'));
    expect(screen.getByTestId('machine-tip').textContent).toContain('Stone Quarry');
    expect(screen.getByTestId('machine-tip-kind').textContent).toContain('Producer');
    fireEvent.blur(screen.getByTestId('map-quarry-1'));
    expect(screen.queryByTestId('machine-tip')).toBeNull();
  });
});
