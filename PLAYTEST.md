# Playtest 33 (v0.33.0): slower late player levels, the top bar on small phones, the website fixes, and the editions

The version at the bottom of the game screen and in the site footer should read **v0.33.0**.

## How to play

- **In a browser:** after merging, https://joshridavis.github.io/megagen-idle/play/ (the temporary GitHub Pages deploy, still the **full game** for your playtests). Once Cloudflare Pages is set up (`docs/PUBLIC_RELEASE.md`, section 9c), use the pull request's **preview link**, where `/play/` is the full game too.
- **Your save:** the same address keeps your save. Your player level will drop once when the update loads (see below); nothing you own or unlocked is lost.
- **The free demo:** the public site's `/play/` (megagenidle.com, once Cloudflare is live) will be the demo, with only the free part. The github.io address stays on the full game so your save is never opened by the demo. To look at the demo before then: `npm install`, then `PLAY_EDITION=demo npm run build:web` and `npm run preview -- --outDir dist-web`, then open http://localhost:4173/play/ (it uses its own browser storage on localhost, not your github.io save). Screenshots: `docs/screenshots/full-game-*-2.04-*.png`.
- **Locally (full game):** `npm install`, then `npm run dev`, then http://localhost:5173/play/.

## Estimated play time

- **100% completion: about 776.2 hours** (simulated with `npm run simulate`; was 761.4 h), so roughly 4 to 5 weeks with the game closed most of the time.
- Key times: 25% at 11.4 h, first Natural Gas Plant 17.1 h, end of the free part (Oil Refining) 58.4 h, first Oil Power Plant 74.5 h, 50% at 78.8 h, first Nuclear Fission Plant 143.1 h, 75% at 300.4 h, first Fusion Reactor 335.8 h, first Micro-Supernova 440.4 h, last room expansion (13) at 559.6 h (was 496.9 h), 100% at 776.2 h.
- Player levels in the simulator: 55 at 158 h (unchanged), 70 at 234 h, 80 at 340 h, 88 at 458 h, 95 at 560 h, 99 at 658 h (was 327 h).

## What's new

- **Late player levels come much more slowly (2.10, your report: 87 to 92 in one night):** levels 1 to 55 need exactly what they did. From level 55 on, each level costs a little more than the one before (7% more at 55, 13% at 80, 18% at 99), so level 99 needs about 45 billion lifetime energy instead of 2.5 billion and lands near 100% completion. In the simulator, no 12-hour stretch after level 80 gives more than one more level. **Your save:** the level comes from your lifetime energy, so it is recalculated once: a save at level 92 shows about **level 76** (no celebration for that). Everything you bought or unlocked stays, the level bonus follows the new level, and the room expansions at levels 80, 88 and 95 keep those requirements.
- **The top bar fits on small phones (2.07):** below 400 px wide the ☁️ cloud button moves to the page's top right corner, beside the logo; the stat box is a little tighter and the room numbers wrap; below 360 px the energy icon hides. The title under your level stays inside the box. Before and after: `docs/screenshots/top-bar-2.07-*.png`.
- **Developer name (2.08):** the press kit says "Developer: MiracleBadger", with no country; the page data for search engines says the same. Nothing else in the repository named a company or a country.
- **Link previews (2.09):** the github.io build now puts its own address in the preview tags, so Discord can fetch the picture (megagenidle.com is not live yet). Cloudflare keeps megagenidle.com.
- **Editions (2.04):** one codebase builds three editions. The **demo** (the public web, itch.io, galaxy.click and the Steam demo) has only the free part, up to research level 9; the Full Game's research, machines and their numbers are not in its files at all. Its Oil, Nuclear, Fusion and Micro-Supernova cards and the Uranium Mine and Deuterium Extractor show as locked "Full Game" cards, and the research tree ends with "Twelve more research". The **full** edition (Steam) has everything open. The **mobile** edition (Android, iOS) has everything inside and locks what comes after the free part until the Full Game is bought. A calm **"Get the Full Game"** panel says what comes next, "Your save carries over" and "Buy once. No ads. No pay-to-win." It opens by itself at most once per session (at the end of the free part); a small ⭐ button by the top bar opens it any time. In the web demo it links to the stores (all empty today, so it says "Coming March 11, 2027 to Steam, Google Play and the App Store"); in the Steam demo, to the Steam page; on mobile, a buy button with the store's price and Restore purchases. The web demo also has "Support the developer on Ko-fi" in Settings. A demo save loads unchanged in the full and mobile editions.

## Things to try

1. Open your save. Check the new player level in the top bar, and hover it: the tooltip shows the lifetime energy and how much the next level needs. Does the gap to the next level feel right?
2. Leave the game closed overnight and open it again. How many levels did the night give? (Before: five. Now one or two at level 76, fewer as you climb.)
3. On your phone: does the top bar fit inside its box now, with the level bar and your title inside? Is the ☁️ button in the top right corner easy to find (if you use accounts)?
4. Open the Press page: it should say "Developer: MiracleBadger".
5. After merging and deploying, paste https://joshridavis.github.io/megagen-idle/?v=2 into Discord. Does the picture show now? (The `?v=2` gets past Discord's cache.)
6. If you can, try the demo locally (see "How to play"): look at the locked cards in Generators and Producers, tap one, and read the panel. Tap the ⭐ by the top bar.
7. In the demo, Settings: the Ko-fi line sits above Credits.

## Known issues

- The github.io address plays the full game, so the Full Game panel and the ⭐ button do not appear there; see the screenshots or try the demo locally.
- The store buttons in the panel stay hidden until their links are filled in `src/site/links.ts` (Steam, Google Play, the App Store).
- The mobile edition has no store yet: its buy button does nothing until RevenueCat comes with item 1.97.
- Grid Contracts and 12 of the 14 pets stay in the demo: with the free part ending at research level 9, they come before the boundary (the playbook's list was written for an earlier boundary). Only the two pets found through Full Game machines are left out.

## Questions

1. Your new player level after loading: does dropping to about 76 feel acceptable, or would you rather keep the level you had and have the next levels wait until your lifetime energy catches up?
2. Late levels now take about 12 to 25 hours of play each in the simulator from level 85 on. Too slow, too fast, or right?
3. The "Get the Full Game" panel text (screenshot `docs/screenshots/full-game-panel-2.04-demo.png`): anything to add or cut?
4. Should the demo keep Grid Contracts and most pets (as now), or should they move behind the Full Game? Moving them would mean a different boundary than research level 9.
5. On small phones, is the ☁️ button in the top corner a good place, or would you rather have it under the box?
