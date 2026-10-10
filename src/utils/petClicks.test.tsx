import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import StatisticsPanel from '../components/StatisticsPanel';
import { ACHIEVEMENTS } from '../data/achievements';
import { createInitialState } from '../data/initialState';
import { PET_CLICK_CAP } from '../data/pets';
import { useStore } from '../store';
import { migrateSave, SAVE_VERSION } from '../store/migrations';
import { getCompletion } from './completion';
import { countPetClick } from './petClicks';
import PetWalkers from '../components/PetWalkers';

afterEach(cleanup);

describe('petting your pets (1.51)', () => {
  it('counts clicks, at most a few per second', () => {
    let recent: number[] = [];
    let counted = 0;
    // 20 clicks in one second: only the cap counts
    for (let i = 0; i < 20; i++) {
      const r = countPetClick(recent, 1000 + i * 50);
      recent = r.recent;
      if (r.counts) counted++;
    }
    expect(counted).toBe(PET_CLICK_CAP.count);
    // a second later the window has moved on
    expect(countPetClick(recent, 1000 + 19 * 50 + PET_CLICK_CAP.ms).counts).toBe(true);
    // an auto-clicker for a minute gains at most count per second
    recent = [];
    counted = 0;
    for (let t = 0; t < 60_000; t += 10) {
      const r = countPetClick(recent, t);
      recent = r.recent;
      if (r.counts) counted++;
    }
    expect(counted).toBeLessThanOrEqual(60 * PET_CLICK_CAP.count);
  });

  it('the store keeps the count and the achievements unlock at 10, 100 and 1,000', () => {
    useStore.getState().resetGame();
    let now = 1e12;
    for (let i = 0; i < 9; i++) useStore.getState().petPet((now += 1000));
    expect(useStore.getState().stats.petClicks).toBe(9);
    expect(useStore.getState().achievements.pet_10).toBeUndefined();
    useStore.getState().petPet((now += 1000));
    expect(useStore.getState().achievements.pet_10).toBeDefined();
    useStore.setState({ stats: { ...useStore.getState().stats, petClicks: 999 } });
    expect(useStore.getState().achievements.pet_100).toBeDefined();
    expect(useStore.getState().achievements.pet_1k).toBeUndefined();
    useStore.getState().petPet((now += 1000));
    expect(useStore.getState().achievements.pet_1k).toBeDefined();
  });

  it('they are bonus achievements (play style), so 100% does not need them; one is a title', () => {
    const defs = ['pet_10', 'pet_100', 'pet_1k'].map((id) => ACHIEVEMENTS.find((a) => a.id === id)!);
    expect(defs.every((d) => d.bonus)).toBe(true);
    expect(defs[2]).toMatchObject({ title: true, tier: 'uncommon' });
    const s = createInitialState(0);
    expect(getCompletion({ ...s, stats: { ...s.stats, petClicks: 5000 } } as typeof s).ratio).toBe(getCompletion(s).ratio);
  });

  it('old saves load with 0', () => {
    const old = { ...createInitialState(0), stats: { clicks: 4, returns: 0, playSeconds: 0, clickEnergy: 0, startedAt: null, lastOffline: null } };
    expect(migrateSave(old, SAVE_VERSION).stats.petClicks).toBe(0);
  });

  it('clicking a walking pet pets it, and the Stats tab shows it', () => {
    useStore.getState().resetGame();
    useStore.setState({ pets: { active: 'cat', extra: [], slots: 1, owned: { cat: { stage: 3, growUntil: null, foundAt: 0 } } } });
    render(<PetWalkers />);
    fireEvent.click(screen.getByTestId('walking-pet-cat'));
    expect(useStore.getState().stats.petClicks).toBe(1);
    cleanup();
    render(<StatisticsPanel />);
    expect(screen.getByTestId('stats-totals').textContent).toContain('Pets petted');
  });
});
