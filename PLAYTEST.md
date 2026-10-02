# Playtest 13 (v0.13.0): random events with effects, Grid Contracts, energy pets, generator sorting, slower early levels (after item 0.92)

The version at the bottom of the screen should read **v0.13.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 97 hours** (simulated idle player), up from about 67.5. Contracts and pets added most of it. Target: 200+.
- **Milestones:**
  - First Wind about 2.4 h, Coal about 3.5 h, Hydro about 5.8 h.
  - First Gas about 16.4 h, Oil about 17.4 h, Nuclear about 44 h.
  - First 10 contracts about 15 h; every contract perk about 26 h; all pets found by about 50 h and grown by about 60 h; 200 contracts about 97 h.
  - Player level 7 at 4 h, 33 at 32 h, about 85 at 100%.
- Gas plants now come later (16 h instead of 11 h), because contracts compete for your energy. It is still inside the target range.

## New since last playtest

- **Your feedback:**
  - **Early player levels are harder.** Level 2 now needs 200 energy (about 100 seconds of fast clicking), so you can no longer click from level 1 to 5 in seconds. Level-ups are still celebrated.
  - **Sort "Your generators".** A "Sort by" menu: your order (fuel priority), most or least energy/s, highest or lowest level, or type. Sorting is for viewing only; fuel still goes in your order.
  - **Negative events are slightly rarer than positive ones** (75% of the rate).
- **Random events with effects.**
  - 7 good events: sunny spell, strong winds, rich seam, coal find, government grant, eureka, volunteer crew.
  - 6 bad events: overcast, calm air, coal shortage, grid fault, pipe leak, equipment wear.
  - They can happen while you are away. Running effects show as green or red chips under your energy, with time left, and in the energy and resource tooltips.
  - Bad events are mild: nothing is lost for good, and fuel losses are capped at 10%.
- **Grid Contracts** (new Contracts tab, from research level 3).
  - Customers order energy, materials, or energy produced before a deadline. Up to 3 at a time; a new offer arrives every 30 minutes, also while you are away.
  - When one is done, pick a reward: materials, a +25% energy boost, or Contract Points.
  - Points buy permanent perks: an extra slot, longer deadlines, better rewards, faster offers.
- **Energy pets** (new Pets tab).
  - 8 pets: Wheel Hamster, Firefly Swarm, Solar Tortoise, Electric Eel, Wind-up Robot Dog, Static Cat, Magnetic Beetle and Glowing Jellyfish.
  - Each is found its own way; unfound pets show a silhouette and a hint. Two are found through rare events.
  - Feed a pet and it grows for a few hours (baby → young → adult). Your active pet gives a themed bonus that grows with it.
- **Completion** now also counts contract milestones (10/50/100/200), contract perks, pets found and pets grown.
- **Guide** has new sections for contracts and pets. On phones the tab bar now scrolls sideways (8 tabs).

## Things to try

1. Click from a fresh start (or watch your level): level 2 should take a while now.
2. Build a few generators and try each "Sort by" option. Does fuel still behave as before?
3. Wait for an effect event (about one every 2 hours). Do the chips under your energy and the tooltip lines make sense?
4. Reach research level 3 and open Contracts. Deliver one, produce one, and try each reward type. Buy a perk.
5. Open Pets. Find the Wheel Hamster (player level 8) and feed it. Come back after 2 hours: is it young?
6. Open Completion and look at the new parts.

## Known issues

- On a phone the tab bar needs a sideways scroll to reach Guide and Settings.
- Contract sizes come from your output at the time the offer appears, so an offer can feel easy or hard after a big change.
- Placeholder art.

## Questions for you

1. Do contracts feel like a fun second activity, or like a chore? Are a 30-minute offer timer and 2–4 hour deadlines right?
2. Are the pet bonuses meaningful, and is "feed, then wait" the right kind of growing?
3. Is about one effect event every 2 hours a good pace, or too rare or too frequent?
4. 100% is now about 97 h. Which should come next: the fictional late-game generators (fusion, micro-supernova), more real-world methods (geothermal, biomass, wave, orbital solar), or achievements?
