import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';
import { createInitialState } from '../data/initialState';
import { GUIDE } from '../data/guide';
import { TUTORIAL_DONE, TUTORIAL_STEPS } from '../data/tutorial';
import { migrateSave } from '../store/migrations';
import { useStore } from '../store';
import { GeneratorType } from '../types/generator';
import { isStepComplete, nextTutorialStep } from './tutorial';

afterEach(cleanup);
const fresh = () => createInitialState(0);

describe('tutorial logic (0.40)', () => {
  it('teaches click, build, research, then waits for "Got it"', () => {
    expect(TUTORIAL_STEPS.map((s) => s.id)).toEqual(['click', 'build', 'research', 'done']);
    const s = fresh();
    expect(nextTutorialStep(0, s, false)).toBe(0);
    expect(nextTutorialStep(0, { ...s, lifetimeEnergy: 1 }, false)).toBe(1);
    const built = { ...s, lifetimeEnergy: 1, records: { builtTypes: [GeneratorType.SOLAR], bestLevel: { solar: 1 } } };
    expect(nextTutorialStep(1, built, false)).toBe(2);
    expect(nextTutorialStep(2, { ...built, completedResearch: ['basic_solar'] }, false)).toBe(3);
    expect(isStepComplete('done', built)).toBe(false);
  });

  it('a replay does not skip steps the player already did', () => {
    const veteran = {
      ...fresh(),
      lifetimeEnergy: 1e9,
      completedResearch: ['basic_solar'],
      records: { builtTypes: [GeneratorType.SOLAR], bestLevel: { solar: 1 } },
    };
    expect(nextTutorialStep(0, veteran, true)).toBe(0);
    expect(nextTutorialStep(0, veteran, false)).toBe(TUTORIAL_DONE - 1);
  });

  it('only fresh saves start the tutorial; older saves skip it', () => {
    expect(fresh().settings.tutorial).toEqual({ step: 0, replay: false });
    const v9 = { ...fresh(), settings: { notation: 'short', reduceMotion: false } } as Record<string, unknown>;
    expect(migrateSave(v9, 9).settings.tutorial.step).toBe(TUTORIAL_DONE);
  });
});

describe('tutorial and guide UI (0.40)', () => {
  it('shows the first step on a fresh save, moves on after a click, and can be skipped', () => {
    useStore.getState().resetGame();
    render(<App />);
    expect(screen.getByTestId('tutorial').textContent).toContain('Make some energy');
    fireEvent.click(screen.getByRole('button', { name: 'Generate energy' }));
    expect(screen.getByTestId('tutorial').textContent).toContain('Build your first generator');
    fireEvent.click(screen.getByRole('button', { name: 'Skip tutorial' }));
    expect(screen.queryByTestId('tutorial')).toBeNull();
    expect(useStore.getState().settings.tutorial.step).toBe(TUTORIAL_DONE);
  });

  it('reset brings the tutorial back, and replay runs it with Next', () => {
    useStore.getState().resetGame();
    expect(useStore.getState().settings.tutorial.step).toBe(0);
    useStore.setState({ settings: { ...useStore.getState().settings, tutorial: { step: TUTORIAL_DONE, replay: false } } });
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /Guide/ }));
    fireEvent.click(screen.getByRole('button', { name: /Replay the tutorial/ }));
    expect(screen.getByTestId('tutorial').textContent).toContain('Step 1 of');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByTestId('tutorial').textContent).toContain('Step 2 of');
  });

  it('every guide section renders and opens', () => {
    useStore.getState().resetGame();
    render(<App />);
    fireEvent.click(screen.getByRole('tab', { name: /Guide/ }));
    for (const g of GUIDE) {
      const section = screen.getByTestId(`guide-${g.id}`);
      if (!section.querySelector(`#guide-${g.id}-body`)) fireEvent.click(section.querySelector('button')!);
      expect(section.textContent).toContain(g.paragraphs[0].slice(0, 20));
    }
    // one section open at a time: open the offline one last and check its text
    fireEvent.click(screen.getByTestId('guide-goal').querySelector('button')!);
    fireEvent.click(screen.getByTestId('guide-offline').querySelector('button')!);
    expect(screen.getByTestId('guide-offline').textContent).toContain('24 hours');
  });
});
