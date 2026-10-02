import type { SpriteId } from '../assets';

/**
 * In-game guide (0.40, playtest 11). Plain text, one section per topic, so it
 * is easy to keep up to date as features arrive. Numbers that can change are
 * filled in by the Guide component from the data files.
 */
export interface GuideSection {
  id: string;
  title: string;
  icon: SpriteId;
  paragraphs: string[];
}

export const GUIDE: GuideSection[] = [
  {
    id: 'goal',
    title: 'The goal',
    icon: 'energy_icon',
    paragraphs: [
      'MegaGen Idle is about generating energy. You start with one solar panel and work up to oil, nuclear and beyond.',
      'Energy is the main currency: you spend it on generators, producers, research and room. Reinvest it to grow faster.',
    ],
  },
  {
    id: 'clicking',
    title: 'Clicking',
    icon: 'energy_icon',
    paragraphs: [
      'The "Generate energy" button makes energy by hand. It matters most in the first minutes.',
      'Click research (Hand-Crank Dynamo and the research after it) makes each click worth more. Late ones add a share of your energy per second to every click.',
    ],
  },
  {
    id: 'generators',
    title: 'Generators and room',
    icon: 'solar_panel',
    paragraphs: [
      'Generators make energy every second, even while the game is closed. Each one takes room.',
      'Room is limited. Expand it on the Generators tab with energy and resources. Better generators give more energy per room, so you can scrap old ones to make space.',
      'Upgrade a generator (⬆ in your generator list) for more output without taking more room.',
    ],
  },
  {
    id: 'fuel',
    title: 'Fuel',
    icon: 'coal_plant',
    paragraphs: [
      'Some generators burn a resource, shown as "Burns" on their card: coal, natural gas, oil or uranium.',
      'If a fuel runs out, those generators switch off until you have fuel again. Generators higher in your list get fuel first; reorder them with ▲ ▼ or by dragging.',
    ],
  },
  {
    id: 'resources',
    title: 'Resources and producers',
    icon: 'producer_mine',
    paragraphs: [
      'Metal, stone, coal and other resources pay for building and fuel. Producers on the Producers tab make them over time.',
      'Each extra producer of a kind costs more than the last. Producers take room too, and some research makes them produce more.',
    ],
  },
  {
    id: 'research',
    title: 'Research',
    icon: 'research_advanced',
    paragraphs: [
      'Research takes real time, even while the game is closed. Only one runs at a time. It unlocks new machines and gives permanent boosts.',
      'The tree has three branches: energy and research, resources, and fuels. Each finished research raises your research level, and some research needs a certain level.',
    ],
  },
  {
    id: 'offline',
    title: 'Away and offline',
    icon: 'research_progress_segment',
    paragraphs: [
      'Your generators, producers and research keep going while the game is closed, for up to {offline}. When you come back, a summary shows what happened.',
      'The game saves automatically. In Settings you can export a save file as a backup or to move to another device.',
    ],
  },
  {
    id: 'level',
    title: 'Player level',
    icon: 'research_check',
    paragraphs: [
      'Your player level grows with all the energy you have ever produced; spending never lowers it.',
      'Each level gives a small permanent bonus to energy from all generators.',
    ],
  },
  {
    id: 'completion',
    title: 'Completion',
    icon: 'research_check',
    paragraphs: [
      'The Completion tab shows how close you are to 100%: every research, every generator type built and upgraded to max level, every room expansion and every producer type.',
      'Records are permanent: scrapping a generator never lowers your completion.',
    ],
  },
  {
    id: 'events',
    title: 'Random events',
    icon: 'sighting_spaceship',
    paragraphs: [
      'Now and then something unexpected passes by while you watch the game. Some sightings are common, some are very rare.',
      'Every sighting you discover is listed in the Completion tab. The event log at the bottom of the screen shows what happened this session.',
    ],
  },
];
