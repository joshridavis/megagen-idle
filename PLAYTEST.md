# Playtest 16 (v0.16.0): a bigger map with terrain, moving machines, and playtest 15 fixes (after item 1.05)

The version at the bottom of the screen should read **v0.16.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 114 hours** (simulated idle player; v0.15.0 was about 112).
  - Hydro and tidal now sit on the river and coast and get +10% there, which shifts a few milestones.
  - The simulator does not move machines yet, so a player who puts solar and wind on their zones will be a little faster.
- **Milestones:**
  - Content: first Wind about 2.3 h, Coal 3.5 h, Hydro 5.3 h, Tidal 8.1 h, Gas 10.1 h, Oil 17.4 h, Nuclear 44 h.
  - Max levels: every generator type maxed by about 66 h.
  - Contracts: every contract perk by about 23 h, 200 contracts by about 100 h.
  - The last stretch to 114 h is the 2 billion lifetime energy achievement.
- **Target:** 200+ hours. Map events, decorations, the fictional generators and the final balance pass are still to come.

## New since last playtest

- **Your feedback:**
  - **A bigger, more detailed map** (Map tab).
    - **Terrain:** your site now sits in a landscape 24 tiles wide, with open sea on the right. A river winds down the middle; there are sunny plateaus and windy ridges, a sandy coast, and scattered rocks, grass tufts and flowers. Land you don't own yet is shown dimmed behind a dashed fence.
    - **Zones:**
      - A **sunny plateau** gives Solar Panels +20%, and a **windy ridge** gives Wind Turbines +20%, when the whole machine stands on it.
      - **Hydropower Dams must be built on the river**, and **Tidal Power Stations on the coast** (at least half their tiles). Fully on it, they get +10%.
      - If the river or coast is full, the build button says so.
    - **Where you see the bonus:** ⭐ on the map, 📍 in Your generators, and "Placement on the map" in the energy breakdown. Generator cards say which zone suits them.
    - **Moving machines:** click a machine, then click a tile. A green or red footprint shows whether it fits. Bright tiles mean a bonus. After your first move, everything stays where it is, and new machines fill free land.
  - **Map bug fixed:** a big machine (your coal plant #32) no longer draws over others.
  - **Amber accent** now visibly changes the top bar, like the other accents.
  - **American English** everywhere.
  - **Event messages are readable.**
    - Event and achievement pop-ups stay 12 seconds and pause while your mouse is on them.
    - Hover (or tab to) an active effect to see exactly what it does, in numbers. For example: "−30% energy from Solar Panels: −0.15 energy/s from your 1 running".
  - **The event log is kept** across reloads (the latest 100 entries), so an event you missed is still there.
  - **Pets were working, now you can see it.** The Wheel Hamster's bonus was always added to clicks, but the "+2 per click" label and the pop-up ignored it. They now show the real value (+3 with a young hamster), and every breakdown lists your active pet.
- **Release plan:** "website" now means a site with sign-up, log-in and cloud saves. The accounts work (0.67) moves up to come right after the map.
- **Added to the backlog:**
  - Map events you can watch on the map (1.12).
  - Map decorations as cosmetic rewards (1.13).

## Things to try

1. Open the Map. Does it look more interesting now? Is it big enough?
2. Hover over tiles to read what each zone does.
3. Click a Solar Panel, then a bright tile on a sunny plateau. Check the ⭐ and that your energy/s went up.
4. Do the same with a Wind Turbine on a windy ridge.
5. If you have Hydropower or Tidal, find them on the river and the coast. Try moving one off it (it should refuse).
6. Click "Generate energy" with the Wheel Hamster active. The pop-up should show +3 (or more with research).
7. Wait for a random event. Is the pop-up readable now? Hover the effect chip under the energy display.
8. Reload the page and open the event log. Are your earlier events still there?

## Known issues

- Moving is click, then click; there is no drag and drop yet.
- The simulator doesn't move solar and wind onto their zones yet (planned in 1.06), so the hours above are a little pessimistic.
- No producer zones yet (a coal or gas field for mines). Say if you want them.
- Placeholder art.

## Questions for you

1. Is the map the right size now, and does the terrain look varied enough?
2. Do +20% (plateau, ridge) and +10% (river, coast) feel worth moving machines for?
3. Is click-then-click moving comfortable, or do you want drag and drop too?
4. Should new machines be placed on their bonus zone automatically, or is that your job (as now)?
5. Would you like producer zones (for example a coal field that boosts coal mines)?
