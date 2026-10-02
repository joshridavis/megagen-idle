import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { createInitialState } from '../data/initialState';
import { useStore } from '../store';
import type { Contract } from '../types/state';
import { contractShortfall, sharesNeed } from '../utils/contracts';
import ContractsPanel from './ContractsPanel';

afterEach(cleanup);
const c = (over: Partial<Contract>): Contract => ({ id: 'c-1', kind: 'energy', tier: 1, deadline: 1e15, status: 'open', ...over });

describe('contracts explain delivery versus production (0.97)', () => {
  it('says exactly what a delivery still needs', () => {
    const s = { energy: 40_000, resources: { ...createInitialState(0).resources, metal: 10 } };
    expect(contractShortfall(s, c({ energy: 100_000 }))).toEqual([{ id: 'energy', missing: 60_000 }]);
    expect(contractShortfall(s, c({ kind: 'resources', resources: { metal: 50, stone: 5 } }))).toEqual([{ id: 'metal', missing: 40 }]);
    expect(contractShortfall(s, c({ kind: 'produce', produce: 1e9 }))).toEqual([]);
  });

  it('notices when two deliveries need the same thing', () => {
    const a = c({ id: 'a', energy: 10 });
    const b = c({ id: 'b', energy: 20 });
    const p = c({ id: 'p', kind: 'produce', produce: 5 });
    expect(sharesNeed([a, b, p], a)).toBe(true);
    expect(sharesNeed([a, p], a)).toBe(false);
    expect(sharesNeed([a, b, p], p)).toBe(false);
  });

  it('labels each card and names what is missing on the button', () => {
    useStore.getState().resetGame();
    useStore.setState({
      researchLevel: 3,
      energy: 40_000,
      lifetimeEnergy: 500,
      contracts: {
        ...createInitialState(0).contracts,
        nextOfferAt: 1e15,
        open: [c({ id: 'a', energy: 100_000 }), c({ id: 'b', energy: 110_000 }), c({ id: 'p', kind: 'produce', produce: 1000, startLifetime: 0 })],
      },
    });
    render(<ContractsPanel />);
    expect(screen.getByTestId('contract-kind-a').textContent).toBe('Delivery');
    expect(screen.getByTestId('contract-kind-p').textContent).toBe('Production');
    expect(screen.getByRole('button', { name: 'Need 60K more energy' })).toBeTruthy();
    expect(screen.getByTestId('contract-a').textContent).toContain('You have 40K of 100K energy');
    expect(screen.getByTestId('contract-a').textContent).toContain('paid separately');
    expect(screen.getByTestId('contract-p').textContent).toContain('Produced so far: 500 of 1K');
  });
});

describe('clearer perk shop (1.00)', () => {
  it('explains points, shows effects and prices in points', () => {
    useStore.getState().resetGame();
    useStore.setState({
      researchLevel: 3,
      contracts: { ...createInitialState(0).contracts, nextOfferAt: 1e15, points: 6, open: [c({ id: 'a', energy: 10, tier: 2 })] },
    });
    render(<ContractsPanel />);
    expect(screen.getByTestId('points-help').textContent).toContain('★★ = 2');
    expect(screen.getByTestId('perk-buy-slot').textContent).toBe('Buy for 5 points');
    expect(screen.getByTestId('perk-buy-deadline').textContent).toBe('Costs 10 points · need 4 more');
    expect(screen.getByTestId('perk-effect-slot').textContent).toBe('Contract slots: 3 → 4');
    expect(screen.getByTestId('perk-effect-offers').textContent).toBe('New offer every 30 min → 20 min');
    expect(screen.getByTestId('contract-a').textContent).toContain('🏅 2 pts');
  });
});
