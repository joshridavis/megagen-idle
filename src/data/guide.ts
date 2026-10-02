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
    id: 'map',
    title: 'Site map',
    icon: 'tile_ground',
    paragraphs: [
      'The Map tab shows your site: one tile for each unit of room, and every machine covering as many tiles as the room it takes. Fenced land at the bottom is the next room expansion.',
      'Zones boost the machines that suit them, when the whole machine stands on them: sunny plateau (Solar Panels +20%), windy ridge (Wind Turbines +20%), coal field (Coal Mines +20%), rocky outcrop (Quarries, Metal and Uranium Mines +20%), oil and gas field (Gas Wells and Oil Rigs +20%).',
      'Hydropower Dams must be built on the river and Tidal Power Stations on the coast (+10% when fully on it). Other machines may stand there until a dam or station needs the spot.',
      'New machines go to a free spot on their zone when there is one; after that they stay put. Drag a machine to move it, or click it and then a tile. ⭐ marks a machine on its bonus zone.',
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
    id: 'contracts',
    title: 'Grid Contracts',
    icon: 'capacity_filled',
    paragraphs: [
      'From research level 3, customers send contracts: supply energy, deliver materials, or produce an amount of energy before a deadline. New offers arrive over time, even while you are away.',
      'When a contract is done, pick a reward: materials, a temporary energy boost, or Contract Points. Points depend on the contract size: ★ gives 1, ★★ gives 2, ★★★ gives 3 (each card shows it).',
      'Spend points in the perk shop on permanent perks, such as an extra contract slot; each button shows the price in points. Missing a deadline costs nothing but the reward.',
    ],
  },
  {
    id: 'pets',
    title: 'Pets',
    icon: 'pet_hamster_3',
    paragraphs: [
      'Eight energy pets can join you. Each one is found its own way: a player level, a building, a research, contracts, or a rare event. Unfound pets show a hint.',
      'Feed a pet energy or a resource and it grows over a few hours, from baby to young to adult, even while you are away. Your active pet gives a bonus that grows with it; change the active pet at any time.',
    ],
  },
  {
    id: 'achievements',
    title: 'Achievements',
    icon: 'achievement_unlocked',
    paragraphs: [
      'Achievements unlock by themselves as you play: total energy, generators, research, contracts, pets and more. The Achievements tab shows your progress toward each one.',
      'Bonus achievements depend on luck or play style (sightings, events, clicking, coming back) and do not count toward 100% completion.',
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
      'Now and then something unexpected passes by while you watch the game. Some sightings are common, some are very rare. Every sighting you discover is listed in the Completion tab.',
      'Other events change the game for a while, even while you are away: a sunny spell or strong winds boost your output, a grant or a rich seam gives you energy or metal, and overcast skies or a grid fault set you back a little. Negative events are a bit rarer and never take anything away for good.',
      'Running events show under your energy with the time left, and in the energy and resource tooltips. The event log at the bottom of the screen lists what happened this session.',
    ],
  },
];
