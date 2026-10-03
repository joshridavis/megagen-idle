# Playtest 19.4 (v0.19.4, hotfix): your playtest 19.3 fixes

The version at the bottom of the screen should read **v0.19.4**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 259 hours** (simulated; v0.19.3 was about 211).
- **Milestones:**
  - Early game unchanged: Wind 2.3 h, Coal 3.2 h, Hydro 5.5 h.
  - Mid and late game slower: first Nuclear 55 h (was 44 h), first Fusion 118 h (was 79 h), every contract perk 174 h, first Micro-Supernova 217 h (was 176 h).

## What changed (only what you asked for)

1. **No more "+0.00/s".** A slow rate shows per minute or per hour instead, for example "+4.40/min" or "+2.20/h". The tooltip uses the same unit ("Uranium per hour").
2. **Metal and stone cost twice as much, everywhere they are spent:** building generators and producers, upgrades, research, room expansions and pet food.
   - A new game starts with twice the metal and stone, so the first builds work the same.
   - Your save keeps what you have; only prices change.
3. **Room expansions are slightly harder:** 20% more energy, on top of the doubled metal and stone.
   - There is no separate storage upgrade in the game, so I took "storage upgrades" to mean room expansions. Tell me if you meant something else.
4. **Research takes 25% longer** (for example, 10 minutes is now 13).
5. **Bug: the Uranium Mine from research was missing on the map.**
   - Producers that research gives you (Gas Well, Oil Rig, Uranium Mine, Deuterium Extractor) were free and took no room, so the map left them out.
   - They now appear on the map, and your site gains the tiles they stand on, so they still cost you no room.
6. **Level ups are in the event log:** "Player level 12 reached: +1.1% energy from all generators" and "Research level 5 reached".
7. **Lightning:**
   - A strike on a type that is already boosted adds 3 more minutes to its timer.
   - A strike on another type gets its own boost, so both run at once (before, the second strike replaced the first).
   - The log and the active-event chip name the struck type, for example "Lightning strike (Wind Turbine)".

## Things to try

1. Look at the resource bar: slow resources now show /min or /h.
2. Check the new prices on generators, producers, research and the next room expansion.
3. Open the Map tab: your Gas Well, Oil Rig or Uranium Mine from research should be there.
4. Open the event log after a level up.
5. Keep the Map tab open for lightning; watch the timer on the active-event chip after a second strike.

## Questions for you

1. Do the new metal and stone prices feel right, or too steep?
2. Did "storage upgrades" mean room expansions?
3. Is research now about the right length?

---

# Previous: Playtest 19.3 (v0.19.3)

The version at the bottom of the screen should read **v0.19.3**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 211 hours** (simulated, unchanged).

## What changed (only what you asked for)

- **The birds are redrawn.** Instead of four tiny gray marks, three gulls now fly over the map in a V.
  - Each is about one tile in size, with a white body, gray wings with dark tips, a yellow beak and a dark outline.
  - They flap their wings out of step and face the way they fly.
- Nothing else changed.

## Things to try

1. Keep the Map tab open until the birds fly over (about one map event every 3 to 4 minutes; birds are one of the common ones).

## Questions for you

1. Do the birds look like birds now?

---

# Previous: Playtest 19.2 (v0.19.2)

The version at the bottom of the screen should read **v0.19.2**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 211 hours** (simulated, unchanged). Map events only happen while you watch the Map tab, so the simulator does not count them.

## What changed (only what you asked for)

- **Map events are halfway between the old and the new pace:** about 17 an hour while the Map tab is open, so one every 3 to 4 minutes.
  - v0.19.0 had one about every 3 minutes; v0.19.1 had one every 4 to 5.
- Nothing else changed. The new perk prices stay as they are.

## Things to try

1. Keep the Map tab open for 10 to 15 minutes. You should see 3 or 4 events: birds, lightning, a delivery truck, a fire, a flood, or (rarely) a falling star.

## Questions for you

1. Now that you can see them: do the new event designs and animations look good?
2. Does the pace feel right now?

---

# Previous: Playtest 19.1 (v0.19.1)

The version at the bottom of the screen should read **v0.19.1**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 211 hours** (simulated; v0.19.0 was about 138). This reaches your 200-hour target.
  - It comes almost entirely from the costlier contract perks.
- **Milestones:**
  - Content: Wind 2.3 h, Coal 3.5 h, Hydro 5.7 h, Gas 10 h, Oil 17 h, Nuclear 44 h.
  - Late game: first Fusion Reactor 79 h, every contract perk 166 h (was 32 h), first Micro-Supernova 176 h.
  - The simulated player spends every contract reward on points until the perks are maxed, which slows the Micro-Supernova. A player who takes materials sometimes will get there sooner.

## What changed (only what you asked for)

- **Bug: things moving backwards.**
  - The delivery truck and the birds now face the way they travel.
  - The truck drives in from the left and stops beside the producer.
  - I checked every other random event and sighting: the whale swam tail first, so it is now mirrored. The rest were already right.
- **No more emoji on the map.** Events have their own pixel designs and animations:
  - birds that flap their wings;
  - a delivery truck that bounces on its wheels;
  - a lightning bolt;
  - a flickering fire;
  - a falling star with a trail;
  - waves for the river flood.
  - They stay still if you turn on reduced motion.
- **Map events are about 35% rarer**, roughly one every 4 to 5 minutes while you watch the Map tab (it was about one every 3 minutes).
- **Where is the Exclusion Zone?** You aren't missing anything.
  - The zone lies further south, below the land you have now. It comes into view once your site grows past 480 tiles; room expansions 9 and 10 open it.
  - The map now shows a note about this until you get there.
- **Contract perks are much harder to max.**
  - There are 13 perk levels for about 600 points in all (it was 5 levels for 48).
  - Each level adds a step: one more slot (up to 6), deadlines +25% each, bundles and boosts +15% each, and new offers 5 minutes sooner each (down to every 15 minutes).
  - Levels you already bought stay bought. Level 1 of "Patient customers", "Better terms" and "Busy grid" now gives the first, smaller step; the next levels go further than before.

## Things to try

1. Leave the Map tab open and watch for birds, the truck and a fire. Do they look right and move the right way?
2. Look under the map legend for the Exclusion Zone note.
3. Open Contracts and look at the perk shop: the new levels and prices.

## Known issues

- The fictional generators still reuse placeholder art.
- Accounts are tested against fakes only until your live test (see the v0.19.0 checklist below).

## Questions for you

1. Do the new event designs look good, and is the pace of events right now?
2. Are the new perk prices about right, too steep, or still too easy?
3. When you're ready: map decorations (1.13), then browser notifications (1.07), as you said.

---

# Previous: Playtest 19 (v0.19.0)

## New since last playtest (your playtest 18 feedback)

- **Fictional generators.**
  - **Fusion Reactor** (research level 12): 200 energy/s, 16 tiles, burns 1 deuterium per hour.
  - **Micro-Supernova** (level 14): a star that lives and dies every second in a fast-time pocket dimension. 780 energy/s, 25 tiles, burns 2 deuterium per hour.
  - Each gives about 2.5 times the energy per tile of the tier before.
  - **Deuterium**, a new resource, comes from the new **Deuterium Extractor** (1 every 6 minutes, from sea water).
  - A new **Experimental physics** research branch (5 nodes) unlocks it all, after Reactor Safety Systems.
  - **Room tiers 9 and 10** (+180 and +240 room).
- **Map upgrade: the Exclusion Zone.**
  - The last two room tiers open a fenced, shielded purple zone at the bottom of the map, with warning signs, pylons and a soft glow.
  - Fusion Reactors and Micro-Supernovas must be built there (+10% fully inside).
  - It holds about 280 tiles, so you choose how many of each to fit.
- **Map events** (only while the Map tab is open, about one every few minutes):
  - birds flying over;
  - lightning that supercharges the generator it hits (+50% for that type, 3 minutes);
  - a delivery truck that brings resources to a producer;
  - a **fire at a coal plant: click it within 30 seconds** to put it out for a reward;
  - a river flood that slows dams briefly;
  - a rare falling star at sea.
- **Scrapping refunds 10%** of everything spent on the machine, build and upgrades. The Scrap tooltip and the confirm show the exact amount.
- **Sign in with Google and Discord:** the code is ready. The buttons stay hidden until you turn them on (`docs/PUBLIC_RELEASE.md`, section 9b, about 20 minutes). New Google or Discord players choose a username the first time.

## Please test: accounts and cloud saves (live)

I can't reach the live site or Supabase from my sandbox, so this part needs you. It takes about 5 minutes:

1. Open the game's Settings. If you don't see "Account and cloud saves", re-run the deploy: Actions → Deploy to GitHub Pages → Run workflow.
2. **Create an account** with your email, a username and a password. Open the confirmation email, then sign in.
3. Check that "Last cloud save" shows a time.
4. **Open the game in a second browser** (or a private window) and sign in there. You should get your game, not a new one.
5. Play a minute in the second browser, wait until it saves (or click "Save to cloud now"), then reload the first one. It should ask "Which game do you want to keep?" and mark the newer one.
6. Optional: try "Forgot password?".
7. Optional, with a throwaway account: "Delete my account".

Tell me what you see, especially any error message, and I'll fix it.

## Things to try

1. Research toward Fusion (Heavy Water Extraction first) and build a Deuterium Extractor.
2. Expand to room tier 9 and look at the Exclusion Zone on the map. Build a Fusion Reactor there.
3. Leave the Map tab open for a while. Did you catch a fire in time?
4. Scrap an upgraded machine and check the refund.

## Known issues

- The fictional generators reuse placeholder art, and map events use emoji for now.
- Accounts are tested against fakes only until your live test.

## Questions for you

1. Do the Fusion Reactor and Micro-Supernova feel like a satisfying late game?
2. Is the Exclusion Zone a good limit, or too tight?
3. Are map events too frequent, too rare, or about right? Is the fire fun?
4. Next: map decorations (1.13) and browser notifications (1.07) are queued. Should more content come first to get closer to 200 hours (for example geothermal or biomass generators, or a deeper research tree)?
