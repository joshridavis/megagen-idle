/**
 * The website's texts (2.05): feature cards, "Fair by design" and the FAQ.
 * Node-safe, like links.ts: the pages are built from it at build time.
 * Always the full name "MegaGen Idle", never "MegaGen" alone (trademark).
 */

/** The developer's public name, where one is needed (owner, playtest 32); never a company name or a country. */
export const DEVELOPER_NAME = 'MiracleBadger';

/** One line, used everywhere (docs/RELEASE_DECISIONS.md). */
export const TAGLINE = "Build an energy empire, from one solar panel to a micro-supernova. It keeps generating while you're away.";

/** The landing page's pitch (1.94; the owner kept it at playtest 31). */
export const PITCH =
  'Start with one clumsy solar panel. Dig coal, pump oil, research smarter machines and fill your site with wind farms, dams and reactors, all the way to a micro supernova in a fast-time dimension. Your machines keep making energy while you are away.';

export interface Feature {
  title: string;
  text: string;
  /** A sprite id from src/assets/sprite-manifest.json. */
  sprite: string;
}

export const FEATURES: Feature[] = [
  { title: 'From one solar panel to a micro-supernova', text: 'Wind, coal, hydro, tidal, gas, oil, nuclear, fusion, and a little fiction at the very end.', sprite: 'solar_panel' },
  { title: 'It keeps going while you are away', text: 'Machines and research run on real time. Come back to a summary of what your grid made.', sprite: 'hydro_dam' },
  { title: 'Research that takes real time', text: 'A tree of research that unlocks machines and permanent boosts, running even with the game closed.', sprite: 'research_energy' },
  { title: 'Dig, pump and burn', text: 'Quarries, mines, gas wells and oil rigs feed your plants. Burning fuel pays more, if you keep it supplied.', sprite: 'producer_coal_mine' },
  { title: 'A site to plan', text: 'Every machine takes room on a map of plateaus, rivers, coast and coal fields, and some ground suits it better.', sprite: 'wind_turbine' },
  { title: 'Pets, contracts and surprises', text: 'Grid contracts, energy pets that grow up, achievements, and the odd UFO over your power lines.', sprite: 'pet_cat_3' },
];

export const FAIR: string[] = [
  'Buy once, own it: one Full Game unlock, and every update after it.',
  'No ads, not even optional ones.',
  'No premium currency, no energy for cash, no timers you must pay to skip.',
  'The Supporter Pack is cosmetic only: color themes, a card frame and a badge.',
  'Your save carries over from the free part to the Full Game.',
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQ: Faq[] = [
  {
    q: 'Is MegaGen Idle free?',
    a: 'The first part of the game is free: in your browser on this site, as a demo on Steam, and on Android and iPhone. The Full Game is a one-time purchase that unlocks everything after it.',
  },
  {
    q: 'How much can I play for free?',
    a: 'Everything up to research level 9: solar, wind, coal, hydro, tidal and natural gas power, oil drilling, and the research on the way, about 58 hours of play at an idle pace. The Full Game adds oil power, nuclear fission, fusion, the micro-supernova and the research that leads there.',
  },
  {
    q: 'What does the Full Game cost?',
    a: 'US$6.99 on Steam, and US$4.99 as an in-app purchase on Android and iPhone; the store shows the price in your currency. Buy it once and you own it, with every update after it.',
  },
  {
    q: 'Does it really keep going while I am away?',
    a: 'Yes. Your machines keep generating energy and your research keeps running while the game is closed, for up to a day. When you come back, a summary shows what you made.',
  },
  {
    q: 'Will my progress carry over to the Full Game?',
    a: 'Yes. A save from the free part loads unchanged in the Full Game. On Steam the full game picks up the demo save by itself; from the browser, use Export and Import in Settings.',
  },
  {
    q: 'Are there ads or microtransactions?',
    a: 'No ads and no premium currency. The only purchases are the Full Game and the optional Supporter Pack, which is cosmetic and never speeds anything up.',
  },
  {
    q: 'Which platforms?',
    a: 'Windows on Steam (it plays on Steam Deck), Android, iPhone and iPad, and any modern browser. macOS and Linux are planned after the launch. English only at launch.',
  },
];

/** Support page: how to export a save (illustrated with the Settings screenshot). */
export const EXPORT_STEPS: string[] = [
  'Open the Settings tab in the game.',
  'In the Save section, choose "Export save". A small file downloads to your device.',
  'On the other device or edition, open Settings and choose "Import save", then pick that file.',
];
