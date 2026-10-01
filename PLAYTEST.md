# Playtest 4: slower pacing, boost tooltip, mid-tier generators (after item 0.36)

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over. Prices and research times change at once. Research already running keeps its old timer.

## New since last playtest

- **Your feedback:**
  - **Higher energy costs.** Generators cost 30 minutes of their output: Solar 900, Wind 1,440, Coal 3,600. New games start with 900 energy, so the first Solar is still immediate. Research costs about 5× more: Basic Solar 250, Wind 1,000, Fossil Fuels 1,500 energy + 10 coal. Room expansion is unchanged.
  - **Much longer research, growing with level.** Basic Solar takes 10 minutes, Wind 30, Fossil Fuels 45, then 1 h, 1 h 15, 1 h 30 and 2 h for the new research. A built-in check makes sure higher-level research always takes longer.
  - **Boost breakdown.** Hover over (or Tab to) the energy rate under your energy total. It shows energy from generators, each boost (for example Basic Solar +10%) with what it adds, and the total. A green ▲% next to the rate means a boost is active. The "+1 per click" line under the button works the same way.
- **Three mid-tier generators:**
  - Hydropower Dam: 5/s, 8 room, needs research level 5.
  - Tidal Power Station: 6/s, 9 room, needs level 6.
  - Natural Gas Plant: 8/s, 10 room, needs level 7, and burns natural gas.
- **New research:**
  - Hydropower, Tidal Power and Gas Turbines unlock the three generators above.
  - Natural Gas Extraction gives you a Gas Well: 1 gas every 10 minutes, enough for 3 gas plants.
- **Scrap.** You can now scrap a generator to free its room. There's no refund, and it needs a confirm click. This lets you replace early Solar Panels with better machines once room is full.
- **Room expansion animation.** A construction overlay fades in and out for 2 seconds. Hover "Room" for an explanation.
- An automated browser smoke test now runs on every pull request.

## Pacing I measured (idle player, no clicking, scraps weak generators for better ones)

- Basic Solar done at about 18 minutes, Wind at about 2 hours, Coal at about 2 hours 50 minutes.
- Hydropower at about 4 hours, Tidal at about 7 hours, Gas Plants at about 9 hours.
- About 50 energy/s after 14 hours.

## Things to try

1. Hover over the energy rate before and after Basic Solar completes. Does the breakdown make the boost clear?
2. Do the new research times feel right? Open a research node to see how long it takes.
3. Fill your room, then scrap a Solar Panel to make space for something better.
4. Expand your room and watch the construction overlay.
5. Reach Hydropower and build a dam. Is it worth the room?
6. Build gas plants after the Gas Well. With 4 or more plants, gas runs out and they switch off.
7. Tab through the page with the keyboard. The rate tooltip should appear on focus.

## Known issues

- Only one Gas Well (and one of each other producer) for now. Buying more producers is item 0.31.
- Mid-tier cards make the page tall. A layout polish is planned (items 0.41 and 0.43).
- No "welcome back" summary (0.28), no in-game reset or short number format (0.29) yet.
- Placeholder art.

## Questions for you

1. Are the new energy costs and research times about right, or still too fast or too slow?
2. Is the boost breakdown tooltip what you had in mind? Should resources get the same now, or later?
3. Is Scrap with no refund fair, or should it give some resources back?
4. Do Hydro, Tidal and Gas feel like meaningful upgrades over Solar, Wind and Coal?
