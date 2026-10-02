import { TUTORIAL_DONE, TUTORIAL_STEPS, type TutorialStep } from '../data/tutorial';
import type { GameState } from '../types/state';

type TutorialState = Pick<GameState, 'lifetimeEnergy' | 'records' | 'currentResearch' | 'completedResearch'>;

/** Whether a step's goal is reached in this state. The last step waits for "Got it". */
export function isStepComplete(id: TutorialStep['id'], s: TutorialState): boolean {
  switch (id) {
    case 'click':
      return s.lifetimeEnergy > 0;
    case 'build':
      return s.records.builtTypes.length > 0;
    case 'research':
      return s.currentResearch !== null || s.completedResearch.length > 0;
    default:
      return false;
  }
}

/** The step to show after `step`, skipping steps already done (not on a replay, which uses "Next"). */
export function nextTutorialStep(step: number, s: TutorialState, replay: boolean): number {
  let next = step;
  if (replay) return next;
  while (next < TUTORIAL_DONE && isStepComplete(TUTORIAL_STEPS[next].id, s)) next++;
  return next;
}
