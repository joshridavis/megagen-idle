# Playtest 17 (v0.17.0): drag and drop, producer zones, more map details (after item 1.18)

The version at the bottom of the screen should read **v0.17.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over. The first time your map changes, every machine is saved where it stands.

## Estimated play time

- **100% completion: about 119 hours** (simulated; v0.16.0 was about 114).
  - The terrain patches changed to make room for the producer zones, so a few milestones moved.
  - The simulator now earns "Own 50 generators" on purpose instead of by chance.
- **Milestones:**
  - Content: first Wind about 2.3 h, Coal 3.5 h, Hydro 5.7 h, Tidal 7.2 h, Gas 9.2 h, Oil 16.5 h, Nuclear 44 h.
  - Contracts: every contract perk by about 26 h, 200 contracts by about 102 h.
  - Max levels: every generator type maxed by about 71 h.
  - The last stretch to 119 h is the 2 billion lifetime energy achievement.
- **Target:** 200+ hours. Map events, decorations, the fictional generators and the final balance pass are still to come.

## New since last playtest (your playtest 16 feedback)

- **Tooltips on ⭐ and 📍.** Hover the ⭐ on the map or the 📍 in Your generators. For example: "Sunny plateau: +20% output, because the whole Solar Panel stands on it."
- **Drag and drop.**
  - Press on a machine and drag it. The green or red outline follows your pointer, and bright tiles give a bonus.
  - Works with a mouse and on phones. A short tap still selects, and click-then-click still works.
- **Smart placement, then it stays put.**
  - A new Solar Panel or Wind Turbine goes onto a free plateau or ridge spot when there is one.
  - Producers do the same with their zones, and hydro and tidal go to the river and coast as before.
  - After that, nothing moves by itself: building, scrapping and room expansions leave machines where they are.
  - One exception: if the site was crowded and something sits on the river or coast, it makes way when a new dam or tidal station needs that spot.
  - The starting land is plain. The first room expansion opens a windy ridge and a sunny plateau right next to it.
- **Producer zones (+20% each):**
  - **Coal field:** Coal Mines.
  - **Rocky outcrop:** Stone Quarries, Metal Mines and Uranium Mines.
  - **Oil and gas field:** Gas Wells and Oil Rigs.
  - A resource's bonus is averaged over all its producers, so 2 of your 4 coal mines on a field give coal +10%.
  - It shows as "Placement on the map" when you hover a resource rate, and producer cards say which zone suits them.
- **More small details on the map:** bushes, stumps, mushrooms, logs, cacti, dry grass, boulders, bent grass, reeds and lily pads on the river, shells and driftwood on the coast, and boats and buoys at sea.

## Things to try

1. Hover a ⭐ on the map and a 📍 in Your generators.
2. Drag a Solar Panel onto a sunny plateau, on a computer and on your phone if you can.
3. Build a new Solar Panel or Wind Turbine. Does it land on its zone? Do your other machines stay where they were?
4. Find a coal field, a rocky outcrop and an oil and gas field. Drag a mine onto one, then hover your coal, stone or metal rate to see "Placement on the map".
5. Look around the map: are the new small objects nice, or too busy?

## Known issues

- On a phone, starting a drag on a machine stops the map from scrolling until you let go.
- Placeholder art.

## Questions for you

1. Does drag and drop feel right, on a computer and on a phone?
2. Is the "makes way for a new dam" exception on the river and coast clear and fair?
3. Is +20% for producers worth moving them? Is averaging over all producers of a resource clear?
4. With the map nearly done, what next: map events (1.12) and decorations (1.13) first, or accounts and cloud saves (0.67) for the website first?
