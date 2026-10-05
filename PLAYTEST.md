# Playtest 22.1 (v0.22.1, hotfix): the Decorations button is always in reach

The version at the bottom of the screen should read **v0.22.1**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 251 hours** (simulated, unchanged).

## What changed

- **Decorations button fixed (1.64):** on the Map tab, a **🎨 Decorations** button now floats at the bottom right of the screen, so it is there however far down the map you are. (In the map header it scrolled away, or hid under the pinned bar.) The panel opens in that corner and is never taller than the space under the top bar. **Remove** and **Close** stay at its bottom. On phones the button sits above the research chip.
- **Backlog:** your notes are ordered by priority (items 1.53 to 1.63, see `BACKLOG.md`). 1.62 now means harder research level requirements, as you described.

## Things to try

1. Map tab, scroll to the bottom of your map, click **🎨 Decorations** at the bottom right, and place a few things near the bottom of the map.
2. Close it with **Close**, ✕ or Escape. The button comes back in the same corner.
3. On a phone, with a research running: the button sits above the research chip.

---

# Previous: Playtest 22 (v0.22.0): a ⚡ button by the pinned bar, cloud save from any tab, decorations over the map

The version at the bottom of the screen should read **v0.22.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 251 hours** (simulated, unchanged: this version adds no balance changes).
- Key milestones: first research 15 min, first Wind Turbine 2.3 h, first Coal Plant 3.2 h, 25% at 8.2 h, 50% at 31.9 h, first Nuclear Fission Plant 54.9 h, 75% at 80.8 h, first Fusion Reactor 113.5 h, first Micro-Supernova 225.1 h, 100% at 251 h.

## What is new since playtest 21.1

- **A ⚡ button by the pinned energy bar (1.45):** scroll down until the big "Generate energy" button is out of view, and a round yellow ⚡ button appears at the end of the pinned bar. It gives the same energy per click and the same "+N" (which floats down here). It hides again when the big button is back on screen, so there are never two.
- **Cloud save from any tab (1.46):** a ☁️ button in the pinned bar (on the website, where accounts are on). Its colored dot shows the state: green saved, yellow not saved yet, blue saving, red error, gray signed out. Click it for **Save to cloud now**, **Load cloud save**, the time of the last cloud save and **Account settings**. Signed out, it offers **Sign in**, which opens Settings → Account. "Load cloud save" now asks first, in the menu and in Settings, since it replaces the game on this device.
- **Decorations in a panel over the map (1.47):** the box under the map is gone. Click **🎨 Decorations** in the map header: a panel opens at the bottom right (a sheet at the bottom of the screen on phones), and the map stays usable. Pick a decoration and click tiles without scrolling. **Close** (or ✕, or Escape) ends decorating.
- **Store images (1.52):** `npm run brand` draws the Steam capsules, logo and app icon from the current sprites (in `docs/steam/capsules/` and `src/assets/brand/`).

## Things to try

1. On the Generators tab, scroll down to the Coal Plant and click the ⚡ by the bar a few times. Does the energy rise the same as with the big button?
2. Scroll back up: the ⚡ disappears once the big button shows.
3. On a phone: scroll down and tap the ⚡. Is it easy to hit, and does the bar still fit?
4. On the website, from the Map or Research tab, click ☁️ → **Save to cloud now**. The dot turns green and the menu says "just now".
5. ☁️ → **Load cloud save** → Cancel, then again → **Yes, load it**.
6. Sign out, then click ☁️ → **Sign in**: you should land on Settings → Account.
7. Map tab → **🎨 Decorations**, pick the Tree (player level 5) and place a few, then press Escape.
8. Do the same on a phone: does the sheet leave enough of the map to place things?

## Known issues

- The ⚡ and ☁️ buttons stack on top of each other beside the bar on phones, so the bar stays inside the screen.
- On phones, the decorations sheet covers the lower part of the screen; scroll the map up into the space above it.

## Questions

1. Is the ⚡ by the bar the right size and place, or should it look more like the big button?
2. Is the cloud dot enough, or do you want the "saved N minutes ago" text in the bar on computers?
3. Is the decorations panel in a good spot (bottom right), or would you rather it sit to the side of the map?
4. Your 11 new notes are in the backlog as items 1.53 to 1.63 (see the PR). Which should come first?

---

# Previous: Playtest 21.1 (v0.21.1, hotfix): cloud saves on a new device, sign-up, notifications

The version at the bottom of the screen should read **v0.21.1**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 251 hours** (simulated, unchanged).

## What changed

- **Bug fixed (1.44):** signing in on a new device (or an incognito tab) right after saving to the cloud kept the blank new game and **uploaded it over your cloud save**. Now a game that has not started (no research, nothing built, no room bought) always loads the cloud save. When both saves have real progress, you are asked, and the one with **more progress** is suggested.
- **Sign-up fixed (1.43):** "Invalid path specified in request URL" came from a Supabase address with `/rest/v1/` at the end; the game now uses only the project address.
- **Browser notifications (1.07):** Settings → Notifications, off by default. Only while the game is in the background, at most 3 an hour.

## Important: your cloud save

Your test probably replaced the cloud save with the blank incognito game. Your first browser still has the real game. Open it and sign in. If you are asked, pick **This device** (marked "more progress"). Or use Settings → **Save to cloud** there. Then try the incognito test again: the game should load right away.

## Things to try

1. Repeat your test: save to the cloud, open an incognito tab, sign in. The game should load at once.
2. Turn on notifications in Settings, start a research, switch to another tab and wait for it to finish.

---

# Previous: Playtest 21 (v0.21.0): a bonus place for every machine, a tidy map legend, decorations, clearer event log

The version at the bottom of the screen should read **v0.21.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 251 hours** (simulated; was 259 h). The new map bonuses for Coal, Gas, Oil and Nuclear plants make the late game a little faster.
- Key milestones: first research 15 min, first Wind Turbine 2.3 h, first Coal Plant 3.2 h, 25% at 8.2 h, 50% at 31.9 h, first Nuclear Fission Plant 54.9 h, 75% at 80.8 h, first Fusion Reactor 113.5 h, first Micro-Supernova 225.1 h, 100% at 251 h.

## What is new since playtest 20.1

- **A bonus place on the map for every machine (1.38):**
  - Coal Plants: +20% on a **Coal field** (beside their fuel).
  - Natural Gas and Oil Power Plants: +20% on an **Oil and gas field**. Two oil fields grew to 8 tiles wide so these 5-wide plants fit.
  - Nuclear Fission Plants: +20% on a new **Cooling lake** (left side, rows 13 to 15 of the map).
  - Deuterium Extractors: +10% on the **Coast**. They may stand there, but they make way when a Tidal Power Station needs the spot.
  - New machines go to a free spot on their bonus place by themselves; machines you already have stay put (drag them to get the bonus).
- **A tidy map legend (1.39):** one short row per zone with its tile, bonus and the machines it suits as small icons. The full description is in the tooltip. It shows only zones on your site; "Show all zones" shows the rest (remembered). Hover or tap a row to light up that zone on the map.
- **A distinct emoji for every kind of log entry (1.40):** for example ☀️ sunny spell, ☁️ overcast, 🍀 good event, ⚠️ bad event, 👀 sighting, ⚡ lightning, 🚚 delivery, 🚒 fire, 📜 contract offers, ✅ contract done, ⌛ contract expired, 🐾 new pet, 🐣 pet grown, ⭐ player level, 🎓 research level, ⚙️ new generator, ⛏️ new producer. Older entries keep their old icon.
- **The research chip opens its details (1.41):** clicking the floating research chip opens the Research tab with that research's details already open.
- **Map decorations (1.13):** a Decorations box under the map. Tree (player level 5), Company flag (5 achievements), Pond (10 contracts), Windsock (15 achievements), Lamp post (player level 20), Founder statue (50 contracts). Pick one and click free tiles; 🧹 Remove takes them away. Up to 6 of each. Just for looks: no room, no bonus, and a machine always wins a tile.

## Things to try

1. Open the Map and look at the new legend. Click "Show all zones", then hover a few rows to see where each zone is.
2. Drag a Coal Plant onto a coal field and check the ⭐ and its rate.
3. If you have Gas or Oil plants, try one on the wide oil and gas field (rows 10 to 12, left side).
4. If you have a Nuclear Fission Plant, move it onto the Cooling lake.
5. Open the Event log and see whether the icons make it easier to scan.
6. While a research runs, click the floating chip at the bottom from another tab.
7. Place a few decorations, then move a machine over one: it hides, and comes back when the machine moves away.
8. Check that the legend fits on your phone.

## Known issues

- There is only one Cooling lake spot (one Nuclear Fission Plant gets the bonus), and two spots for gas and oil plants, because the map patches are 4 tiles wide. More can be added if you want.
- Decorations are placed with a mouse or touch only (no keyboard cursor for them yet).
- Old event log entries keep the old shared ✨ icon.

## Questions for you

1. Are the new bonus places worth moving your plants for? Is one lake spot enough, or should there be more?
2. Is the new legend easy to read, on the computer and on your phone?
3. Do the log icons help, or are some of them confusing?
4. Are the decoration unlocks at the right points? Which other decorations would you like?
5. Next up in the backlog: browser notifications (1.07), then the performance pass (0.42). Any change to that order before launch work continues?

---

# Previous: Playtest 20.1 (v0.20.1, hotfix): tooltips under the pinned energy bar

The version at the bottom of the screen should read **v0.20.1**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 259 hours** (simulated, unchanged).

## What changed (only the bug you reported)

- **Hovering a card just under the pinned energy bar:** the bar now always stays on top and fully visible. The card's tooltip opens below the card when there is no room above it, instead of jumping up behind the bar.
- The same applies to the Upgrade and Scrap tooltips in "Your generators", and to the ⭐ and 📍 tips on the Map.
- Research details, notices and celebrations still show above the bar.

## Things to try

1. Scroll the Generators tab until a build card sits right under the energy bar, then hover its button: the tooltip opens below the card.
2. Do the same with Upgrade and Scrap in "Your generators".

## Questions for you

1. Does hovering near the top feel right now?

---

# Previous: Playtest 20 (v0.20.0): launch polish: phones, keyboard, crash safety, looks and Stats

The version at the bottom of the screen should read **v0.20.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 259 hours** (simulated, unchanged; nothing in this build changes pacing).
- Key milestones: first research 15 min, first Wind Turbine 2.3 h, first Coal Plant 3.2 h, 25% at 8.2 h, 50% at 31.9 h, first Nuclear Fission Plant 54.9 h, 75% at 82.8 h, first Fusion Reactor 118 h, first Micro-Supernova 217 h, 100% at 259 h.

## What is new since playtest 19.6

- **Flapping birds** in the "Flock of birds" sighting (done just before this run).
- **Phones and keyboard (0.41):**
  - At phone width nothing scrolls sideways any more (the tab bar used to push the whole page). Tabs wrap onto a second row on phones.
  - On touch screens every button is at least 44 px to tap. Rows in "Your generators" put Turn on/off and Scrap under the name instead of squeezing it.
  - Keyboard: a clear yellow focus ring everywhere; arrow keys, Home and End move between tabs; dialogs keep Tab inside them. On the Map you can move a machine without a mouse: Tab to it, Enter, arrow keys, Enter (Escape cancels).
  - Settings → "Reduce motion" now stills every animation (celebrations, glows, pulses), not only random events.
- **Crash safety (0.46):**
  - If a save is ever damaged, the game no longer breaks or starts over silently: it keeps a copy, uses your other good copy if there is one, and tells you in the event log. Settings → Save then offers "Download the kept copy".
  - If the game ever hits an error while drawing, you get a "Something went wrong" screen with Try again, Download save and Reset game, instead of a blank page.
- **Visual polish (0.43):**
  - The energy bar (energy, rate, room, level) stays pinned at the top while you scroll.
  - All tabs fit on one row on a desktop screen; the selected tab has a yellow top edge.
  - Panels and headings look the same on every tab.
  - A newly built machine fades into "Your generators"; a build card glows when it unlocks.
- **Stats tab (0.39):** lifetime energy, play time, clicks and energy from clicks, your last offline gain, energy by generator type with percentages, resources made, burned and net per second, and your top generators. Play time and the last offline gain start counting from this version.

## Things to try

1. Open the game on your phone. Scroll through each tab: does anything need sideways scrolling, or is any button hard to hit?
2. Scroll down a long generator list: the energy bar should stay at the top.
3. Open the **Stats** tab. Do the percentages match what you expect from your generators?
4. Close the game for an hour, come back, then check "Last offline gain" in Stats.
5. On a computer, press Tab through the page; try the arrow keys on the tab bar.
6. On the Map, Tab to a machine, press Enter, move it with the arrow keys, press Enter.
7. Turn on Settings → Reduce motion and finish a research: the celebration shows without moving.
8. Build a new machine and watch it fade into the list.

## Known issues

- Play time counts only from this version on, and only while the game is open on screen.
- Map tiles stay small on phones (the map is a grid of tiles); machines on it can still be dragged or moved by keyboard.

## Questions for you

1. Is the pinned energy bar helpful, or does it take too much room on your phone?
2. Is anything missing from the Stats tab that you would like to see?
3. Do the new fade-in and unlock glow feel right, or too subtle?
4. The launch-priority list is now done. Next in the order are your requests after 19.5 and 19.6: a bonus place on the map for every machine (1.38), a tidy map legend (1.39), a distinct emoji per event log entry (1.40) and the research chip opening the running research (1.41). Keep that order?

---

# Previous: Playtest 19.6 (v0.19.6, hotfix): fewer events when you come back

The version at the bottom of the screen should read **v0.19.6**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 259 hours** (simulated, unchanged).

## What changed (only the bug you reported)

- **Coming back after a while:** timed events (Sunny spell, Overcast, Strong winds, Calm air, Volunteer crew, Coal shortage, Equipment wear) no longer start when you open the game. They would have run out long before you returned. Only one-off events (finds, grants, losses, pets) can still happen while you are away, at most three.
- **No clashing weather:** Overcast cannot start during a Sunny spell (and the other way around), and the same goes for wind and other effects on the same target. Once one ends, the other can happen.

## Things to try

1. Close the game for an hour or more, then open it: no new 10-minute weather effects in the event log.
2. Play for a while: timed events still happen while the game is open.

## Questions for you

1. Does coming back feel calmer now? Is up to three one-off events on return still too many?

---

# Previous: Playtest 19.5 (v0.19.5, hotfix): smaller map event bonuses

The version at the bottom of the screen should read **v0.19.5**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 259 hours** (simulated, unchanged). Map events only happen while you watch the Map tab, so the simulator does not count them.

## What changed (only what you asked for)

- **Lightning:** +25% for the struck type (was +50%), for 3 minutes. A second strike on the same type still adds 3 more minutes.
- **Delivery truck:**
  - It brings 8 minutes of that producer's output (was 15). It already gave more as your producers grew.
  - It now also gives 3% more for each player level above 1: about 1.6 times as much at level 21, and 2.5 times at level 51.
- **Unchanged:** the fire (less common, and you have to click it), the flood, and the birds and falling star (no bonus).

## Questions for you

1. Do the lightning and truck bonuses feel right now?

---

# Previous: Playtest 19.4 (v0.19.4)

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
