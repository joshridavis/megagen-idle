/**
 * First-run walkthrough (0.40). Each step highlights the elements whose
 * `data-tutorial` attribute is listed in `targets`; it completes when its
 * condition in src/utils/tutorial.ts is met (or with "Next" on a replay).
 */
export interface TutorialStep {
  id: 'click' | 'build' | 'research' | 'done';
  title: string;
  text: string;
  targets: string[];
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'click',
    title: 'Make some energy',
    text: 'Click "Generate energy" to make energy by hand. Energy is what you spend on everything.',
    targets: ['click'],
  },
  {
    id: 'build',
    title: 'Build your first generator',
    text: 'Build a Solar Panel on the Generators tab. Generators make energy on their own, even while the game is closed.',
    targets: ['tab-generators', 'build-solar'],
  },
  {
    id: 'research',
    title: 'Start your first research',
    text: 'Open the Research tab and start Basic Solar. Research takes real time and gives permanent boosts and new machines.',
    targets: ['tab-research', 'research-basic_solar'],
  },
  {
    id: 'done',
    title: "You're all set!",
    text: 'That is the loop: make energy, build, research, and expand your room. The Guide tab explains everything else whenever you need it.',
    targets: ['tab-guide'],
  },
];

/** Settings value meaning "finished or skipped". */
export const TUTORIAL_DONE = TUTORIAL_STEPS.length;
