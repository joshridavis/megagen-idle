# Playtest 28.1 (v0.28.1, hotfix): click research adds 1% of energy/s, not 25%

The version at the bottom of the screen should read **v0.28.1**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 761.3 hours** (simulated, unchanged: the simulated player clicks only in its first 10 minutes).

## What changed

- **Click research (1.93):** Kinetic Capture and Grid Tap now add **1% of your energy per second** to each click, each (was 25% each). With both, a click adds at most 2%. At your 5,670 energy/s: 9 per click now, about 66 with Kinetic Capture, about 122 with both (it would have been about 2,844).
- The click breakdown (hover the click value) no longer says "(capped)" when nothing is capped.

## Things to try

1. Research tab: open Kinetic Capture and Grid Tap; both should say 1%.
2. Once you have them, hover the click value: the breakdown should show "1% of your energy/s" (or 2% with both) and match what a click gives.
3. Does clicking now feel like a small bonus that is still worth it while you watch the game?

---

# Previous: Playtest 28 (v0.28.0): harder middle and late game, three more room expansions, accents by tier, research level in the requirements, sighting rarity

The version at the bottom of the screen should read **v0.28.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 761 hours** (simulated with `npm run simulate`; was 327.3 h), so roughly 4 to 5 weeks with the game closed most of the time.
- Key times: first Wind Turbine 2.3 h, first Coal Plant 3.1 h, first Hydropower Dam 6.0 h, first Natural Gas Plant 17.1 h (all as before), 50% at 74.5 h (was 42.1 h), first Oil Power Plant 74.5 h (was 30.3 h), first Nuclear Fission Plant 143.1 h (was 54.9 h), 75% at 306.9 h (was 97.8 h), room expansion 10 at 326.5 h (was 113.7 h), first Fusion Reactor 335.8 h (was 97.7 h), first Micro-Supernova 440.4 h (was 186.7 h), last room expansion (13) at 496.4 h, 100% at 761.3 h.

## What changed

- **Harder pacing (1.87):** the first hours are unchanged, up to the first Natural Gas Plant. After that: research from research level 9 on (from Superconductors and Oil Drilling) costs 6 times the energy and takes 5 times as long. Room expansions 8 to 10 cost 10 times the energy. Generator upgrades from level 5 on get steeper (level 9 to 10 costs about 5 times more than before). New targets: last room expansion after at least 250 h, 75% after at least 300 h, 100% between 600 and 900 h. All are met. Your save keeps everything you have built, bought and researched.
- **Three more room expansions (1.88):** +300, +380 and +480 room, for player levels 80, 88 and 95, costing 1.8, 3.6 and 4.8 billion energy plus metal, stone, uranium and deuterium. The player level stops at 99, so the 100 and 120 suggested in the backlog could not be used. The new land is Exclusion Zone, with the river and coast running through it. Sprawling Complex now needs all 13. If you already earned it, you keep it, and the Completion tab shows 10 of 13.
- **Accents by tier (1.89):** one accent per title tier, in tier order and in the tier's exact color: Slate (Common, free), Lime (Uncommon, 5 achievements), Sky (Rare, 15), Rose (Epic, 25), Gold (Legendary, 36, the last). Violet is gone. Your old choice maps to the same color (Amber becomes Gold, Emerald becomes Lime). If that one is not unlocked yet, you get the highest accent you have unlocked.
- **Research level in the requirements (1.90):** the research details window shows "Research level: 26 (yours: 21)" next to Cost, Time and Requires: red when your level is too low, green when it is met. The gray line under the title is gone. "Research level +1" still shows in the rewards.
- **Sighting rarity (1.91):** Completion → Sightings discovered shows each sighting's rarity, found or not, in the matching tier color (Common gray, Uncommon green, Rare blue, Legendary gold).

## Things to try

1. Achievements → Cosmetics: check the five accents, their order and colors, and which one your save got. Pick one and look at the top bar.
2. Research tab: open a research above your level and one below it. Is the red or green research level row clear?
3. Completion tab → Sightings discovered: do the colored rarities read well, found and unfound?
4. Room panel: look at expansion 11 (level 80) and its cost. Does it feel like a late-game goal?
5. Map tab: if you buy expansion 11, scroll the new land and check the Micro-Supernova and Fusion Reactors still find a spot.
6. Upgrade a generator from level 5 up and compare the costs with what you remember.
7. Research tab: start one of the late research (for example Fusion Ignition) and check its time and cost.

## Known issues

- An existing late save is past most of the new gates: it keeps everything, so you will mainly feel the slower pace on the research you have left, the steeper upgrades and the three new expansions. A new game shows the full new pace.
- The balance simulator's stall threshold went from 8 h to 12 h, and player level-ups now count as progress in it: while saving for the costly late expansions, the simulated player buys little else for 9 to 12 hours. A real player who keeps upgrading a little will see more happen.

## Questions

1. Pacing: the simulator says about 761 h to 100% and 307 h to 75%. Does a 5x longer middle-game research time feel right, or should more of the slowdown come from costs?
2. Are room expansions 11 to 13 (levels 80, 88, 95; 1.8B to 4.8B energy) the right size and price?
3. Accents: are the names (Slate, Lime, Sky, Rose, Gold) good, and is Gold being the last one right?
4. Research details: is the new research level row placed well (after Time, before Requires)?

---

# Previous: Playtest 27.1 (v0.27.1, hotfix): the thought bubble's trail points at the pet

The version at the bottom of the screen should read **v0.27.1**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 327.3 hours** (simulated, unchanged: this fix changes no balance).

## What changed

- **Thought bubble trail (1.92):** the 💭 emoji has its own small bubbles built in, always toward its lower left. When a pet faced left, the bubble sat on its left and those small bubbles pointed away from the pet. The 💭 is now mirrored on that side, so its small bubbles always lead from the cloud down to the pet's head, joined by the small dots. The dots now show only with the 💭: the ❗ and 💤 have none.

## Things to try

1. Watch a pet that sits and thinks (💭) while facing left, and one facing right: the small bubbles should lead from the cloud to its head both ways.
2. Watch a jumping (❗) and a sleeping (💤) pet: no small dots beside them, and the 💤 reads normally.

## Backlog (not built yet, on hold until you say)

- 1.89: accent colors follow the title tier colors.
- 1.87: harder pacing, a slower middle and late game.
- 1.88: three more room expansions for the late game.
- 1.90: the research level needed shows in the requirements, red when missing.
- 1.91: sightings keep showing their rarity after they are found.

---

# Previous: Playtest 27 (v0.27.0): thought bubbles beside the head, clearer machine animations, a map animation switch, Landscape Architect in 100%, and scarcer fuel

The version at the bottom of the screen should read **v0.27.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 327.3 hours** (simulated with `npm run simulate`; was 293.3 h). The fuel change (1.86) makes the middle and late game a bit slower: you need more wells, rigs, mines and extractors, and they take room.
- Key times: first Wind Turbine 2.3 h, first Coal Plant 3.1 h, first Hydropower Dam 6.0 h, first Natural Gas Plant 17.2 h (was 11.6 h), first Oil Power Plant 30.3 h (was 22.9 h), first Nuclear Fission Plant 54.9 h, first Fusion Reactor 97.7 h (was 93.1 h), last room expansion 113.7 h (was 97.0 h), first Micro-Supernova 186.7 h, 100% at 327.3 h.
- The harder pacing you asked for (1.87, with targets of 600 to 900 h) is not in this version yet; it comes next.

## What changed

- **Thought bubbles beside the head (1.82):** a walking pet's 💭, ❗ and 💤 now float up beside its head on the side it faces, like a comic thought bubble, with two small dots trailing from the head. Near the edge of the screen the bubble flips to the other side so it is never cut off.
- **Clearer machine animations (1.83):** the Coal Power Plant's smoke now moves: its painted smoke drifts, and darker puffs rise higher from the stack. The Oil Power Plant's smoke is darker too, and the solar glint is brighter and comes every 3 s. The Stone Quarry no longer shakes: its crane hook lifts a stone block out of the pit, about once a second. The Metal Mine was redrawn: a lamp over the entrance blinks, and the cart sits on the rail beside the entrance, rolling a little, never in front of it. The Uranium Mine's cart now rolls out, away from the tunnel. Your favorites (nuclear steam, fusion glow, wind turbine, gas well, gas flare) are unchanged.
- **Animation switch on the map (1.84):** a third floating map button, **🎞️ Animations: On/Off** (just "🎞️ On/Off" on phones), next to Legend and Decorations. Off, every machine shows its still picture; map events and sightings still play. The game remembers your choice. It is not in Settings, as you asked; Reduce motion in Settings still keeps machines still, and the button's tooltip says so.
- **Landscape Architect counts toward 100% (1.85):** it is no longer a bonus achievement. If you earned it under the old rule (30 decorations), you keep it, and it counts.
- **Fuel is a real limit (1.86):** with all research, zones and pets, one producer now feeds about: **Gas Well → 3 Natural Gas Plants** (1 gas every 35 min, was 10), **Oil Rig → 2 Oil Power Plants** (1 oil every 16 min, was 5), **Uranium Mine → 2 Fission Plants** (1 uranium every 100 min, was 30), **Deuterium Extractor → 2 Fusion Reactors or 1 Micro-Supernova** (1 deuterium every 90 min, was 6). Your case of 1 extractor with 4 Fusion Reactors now burns more than it makes. The Coal Mine is unchanged: it is the first fuel, and slowing it would slow the first hours. You keep the fuel you already have.

## Things to try

1. Watch your walking pets: the bubbles should sit beside the head on the side each pet faces. Watch one walk to a screen edge: the bubble should stay on screen.
2. Map tab: look at a working Coal Power Plant, the Stone Quarry, the Metal Mine and the Uranium Mine. Does each one now read as working, and does none feel too busy?
3. Map tab: press 🎞️ to turn the animations off, reload the page, and check it is still off. Turn it on again.
4. Turn on Reduce motion in Settings, then look at the 🎞️ button's tooltip on the map.
5. Completion tab → Achievements: Landscape Architect should now be in the list.
6. Stats → Resources per second: with your current machines, how do deuterium, oil, natural gas and uranium look? Some may now go negative. Build producers until they are positive again, and see how much room that takes.
7. Producers tab: check the new rates on the Gas Well, Oil Rig, Uranium Mine and Deuterium Extractor cards.

## Known issues

- Existing saves keep their fuel stock, but with the new rates your fuel may now run down. When a fuel runs out, the plants that burn it switch off and the usual warning shows. Build more producers or switch some plants off.
- In this cloud sandbox the balance-simulator test takes 50 to 70 s; its time limit is now 120 s (was 60 s). Nothing in the game is affected.

## Questions

1. Fuel: does it now feel like a real limit, without being a chore? Is "one producer feeds about 2 or 3 plants" the right ratio?
2. Should the Coal Mine get the same treatment (it feeds about 10 Coal Plants late in the game), or stay generous as the starting fuel?
3. The new quarry crane and the mine lamp: clear at map size? Is the coal smoke visible enough now?
4. The animation switch: is its place next to Legend and Decorations good, and is "On/Off" clear enough on a phone?
5. The thought bubbles: is the side placement and the dot trail what you had in mind?

## Next in the order

- 1.89: accent colors follow the title tier colors.
- 1.87: harder pacing, a slower middle and late game (new targets: 100% in 600 to 900 h).
- 1.88: three more room expansions for the late game.
- 1.90: the research level needed shows in the requirements, red when missing.
- 1.91: sightings keep showing their rarity after they are found.

---

# Previous: Playtest 26 (v0.26.0): a foldable Cosmetics section, Remove all decorations, working machines that move, and pets at different speeds

The version at the bottom of the screen should read **v0.26.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 293.3 hours** (simulated with `npm run simulate`, unchanged: nothing in this round changes balance).
- Key times: first Wind Turbine 2.3 h, first Coal Plant 3.1 h, first Hydropower Dam 6.0 h, first Oil Power Plant 22.9 h, first Nuclear Fission Plant 54.9 h, first Fusion Reactor 93.1 h, last room expansion 97.0 h, first Micro-Supernova 191.3 h, 100% at 293.3 h.

## What changed

- **Fold away Cosmetics (1.69):** in the Achievements tab, the "Cosmetics" heading is now a button with a ▸/▾ arrow. Closed, it shows one line, "Title: … · Accent: …", with the title in its tier color. The game remembers your choice, also after a reload. It is open for a new player.
- **Remove all decorations (1.70):** the 🎨 Decorations panel has a **🧹 Remove all** button next to Remove and Close. It asks first ("Take all N decorations off the map? …"). Removing is free, and you keep every copy you bought, so you can place them again for free. Escape or Cancel changes nothing.
- **Working machines move on the map (1.71):** wind turbines turn and dam, tidal and oil-rig water flows. Coal, gas and oil plants smoke, the nuclear tower steams and solar panels glint. Fusion reactors and supernova cores pulse. Producers work too: mine carts roll, the gas-well pump nods, the coal-mine wheel turns, the quarry shakes and the deuterium extractor bubbles. A machine you switch off, or one out of fuel, is completely still, at once. Machines of one kind don't move in step. Reduce motion (in the game or on your system) keeps them all still. The animations stop while the page is hidden.
- **Landscape Architect needs every decoration (1.78):** it now asks you to **own all 36 decorations** (all 6 of each kind; the number grows if more kinds come). It is still a bonus achievement with its Epic title. If you already earned it at 30, you keep it.
- **Pets walk at different speeds (1.79):** each walk is a slow stroll, a normal walk or a quick trot, and the walking bob speeds up when they trot. On average they move at about the same speed as before. The Solar Tortoise is slower than most and the Wind-up Robot Dog is quicker; the Wheel Hamster is a little quick too.

## Things to try

1. Achievements tab: close Cosmetics, reload the page, and check that it stays closed and the summary line is right. Open it again with the keyboard (Tab to it, then Enter).
2. Map tab: place a few decorations, then 🎨 → 🧹 Remove all. Try Cancel and Escape first, then confirm. Place them again: it costs nothing.
3. Map tab: look over your site. Is every machine's animation clear and fitting? Is any of them too busy or too fast (the quarry shake, the turbines)?
4. Switch a generator off on the Generators tab, then look at it on the map: it should be still. Switch it on again.
5. Turn on Reduce motion in Settings: every machine on the map stops.
6. With pets walking, watch for a while: do you see slow strolls and quick trots? If you have the Solar Tortoise or the Wind-up Robot Dog, put it out.
7. Check the Landscape Architect card in the Achievements tab: it should say "Own all 36 decorations."

## Known issues

- None known in the new features. In this cloud sandbox two slow checks sometimes run out of time when everything runs at once (the balance-simulator test and one browser smoke test); both pass on their own, and nothing in the game is affected.

## Questions

1. The machine animations: right amount of movement, or would you like them calmer (slower or subtler), or livelier?
2. Do the second frames read well at map size (the turning wind turbine, the nodding pump jack, the rolling mine carts)?
3. The pet speeds: is the mix of strolls and trots right, and is the trot too fast?
4. Should Landscape Architect stay a bonus achievement (outside 100%), or count toward 100% now that it needs every copy?

## Next in the order

- 1.82: thought bubbles beside the pet's head, on the side it faces (your report on v0.25.3).
- 1.80: pets celebrate your level ups, research, achievements and so on, and react to random events.
- 1.81: two or three active pets on screen sometimes interact.
- Then 1.55 (more random events) and 1.54 (more decorations).

---

# Previous: Playtest 25.3 (v0.25.3, hotfix): the 💤 sits on the pet, and tooltips say Generator or Producer

The version at the bottom of the screen should read **v0.25.3**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 293.3 hours** (simulated, unchanged: these fixes change no balance).

## What changed

- **The 💤 stays with the pet (1.76):** it showed far above and beside a small sleeping pet. It now sits just above the pet, over its head, at the pet's real size: low for a baby, higher for an adult. Other bubbles (💭, ❗) also sit just above the pet.
- **Generator or Producer in the map tooltips (1.77):** as you asked, the producer tooltip no longer mentions levels or fuel burned. Every machine's tooltip has a small tag next to its name instead: **⚡ Generator** (amber, makes energy) or **⛏ Producer** (blue, makes a resource).

## Things to try

1. Watch a sleeping pet (a baby one if you have it out): the 💤 is right above its head.
2. Map tab: hover an Oil Rig and an Oil Power Plant. Is the Generator / Producer tag clear enough?

## Backlog (not built yet, on hold until you say)

- 1.78: Landscape Architect needs all 36 decorations.
- 1.79: walking pets at different speeds.
- 1.80: pets celebrate your level ups, research, achievements and so on, and react to random events.
- 1.81: two or three active pets on screen sometimes interact: greet, play, nap side by side or share food.

They come after 1.69, 1.70 and 1.71 and before 1.55 and 1.54. Move them if you prefer.

---

# Previous: Playtest 25.2 (v0.25.2, hotfix): the research chip and the pets stay on top

The version at the bottom of the screen should read **v0.25.2**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 293.3 hours** (simulated, unchanged: this fix changes no balance).

## What changed

- **Hovered cards no longer cover things (1.75):** a generator card you hover is lifted so its tooltip shows over the cards around it. Near the bottom of the screen it was also lifted over the research chip and the walking pets. Both now stay on top of a hovered card. The map buttons and panels, the pinned top bar, toasts and dialogs are still above them.

## Things to try

1. With a research running, scroll so a generator card sits behind the research chip, and hover it: the chip stays in front.
2. Do the same where a pet is walking: the pet stays in front.

---

# Previous: Playtest 25.1 (v0.25.1, hotfix): pets eat and play on the ground, nap longer and rest

The version at the bottom of the screen should read **v0.25.1**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## Estimated play time

- **100% completion: about 293.3 hours** (simulated, unchanged: this fix changes no balance).

## What changed

- **Eating and playing (1.74):** the apple and the ball no longer float above a walking pet. They lie on the ground in front of its mouth, on the side it faces. While eating, the pet nods down to the apple, which gets smaller bite by bite. While playing, the ball bounces in front of it. Sleeping 💤, sitting 💭 and jumping ❗ keep their bubble above the pet.
- **Calmer pets (1.74):**
  - A nap now lasts 45 seconds to 2 minutes.
  - A new **rest**: the pet just stands still for 5 to 20 seconds, with no bubble. It is the most common thing they do.
  - Pets stop after 3 walks out of 4 (fewer than half before), and after eating, playing and so on they often rest before walking on.

## Things to try

1. Watch the walking pets for a few minutes until one eats and one plays. Does it look right now?
2. Do the pets now feel calm enough, or still too busy? Is a nap of up to 2 minutes the right length?

---

# Previous: Playtest 25 (v0.25.0): pets that grow on screen and walk around, six more pets, and your three bug reports

The version at the bottom of the screen should read **v0.25.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 293.3 hours** (simulated; was 243.9 h). No stalls.
  - Completion now needs all 6 copies of every decoration (257.1 h with that alone).
  - The six new pets add 12 completion entries and long feeding times, since one pet grows at a time. The Soot Owl and the Atomic Axolotl eat a lot of energy, which pushes player level 80, and with it the 3rd pet slot, later.
- Key milestones: first research 15 min, first Wind Turbine 2.3 h, first Coal Plant 3.1 h, 25% at 10.1 h, 50% at 35.3 h, first Nuclear Fission Plant 54.9 h, 75% at 93.1 h, first Fusion Reactor 93.1 h, 2nd pet slot 97.5 h, every contract perk 179.1 h, first Micro-Supernova 191.3 h, 3rd pet slot and 100% at 293.3 h.

## What is new since playtest 24

- **Your bug reports:**
  - **Oil Rig tooltip (1.72):** the Oil Rig is a *producer*: it makes oil, has no levels and burns nothing. That is why it showed no level, unlike generators such as the Oil Power Plant. Every producer's map tooltip now says "Producer (no levels)". A producer of a fuel also shows what your running generators burn of it, and the net, for example "🔥 Your generators burn 12/h oil · net +7.8/h".
  - **Decorations in the Completion tab (1.73):** the Decorations part always read "0 bought". The Completion tab left your decorations out, while the % on its tab button counted them, so the two disagreed. Fixed. The achievements were fine: they unlock from what you own.
  - **"25 decorations bought" (1.73):** gone. Each decoration kind now counts as done in Completion when you own all 6 copies, shown as "n/6 bought".
- **Pets growing (1.58):** a growing pet pulses gently with small sparkles, and its card shows a progress bar and "Growing to young: Xh left". When it reaches the next stage while you play, a celebration shows on any tab: the old sprite grows, flashes and turns into the new one. Growth that happens while you are away is only logged (🐣), like research.
- **Pets walk on screen (1.60):** your active pets walk along the bottom of the screen on every tab. Now and then they stop to eat 🍎, play ⚽, sleep 💤, sit 💭 or jump ❗. Click one to see its reaction. While research runs, they walk just above the research chip, so they never hide it. Settings → Motion → **Pets walk on screen** turns them off; Reduce motion makes them stand still.
- **Six more pets (1.56):**

  | Pet | How to find it | Adult bonus |
  |---|---|---|
  | Coal Mole | player level 15 | +15% coal |
  | Bubble Toad | build a Gas Power Plant | +15% natural gas |
  | Lab Mouse | research Automated Labs | research 10% faster |
  | Courier Pigeon | complete 25 contracts | +20% contract bundles and boosts |
  | Soot Owl | player level 35 | +8% from coal, gas and oil plants |
  | Atomic Axolotl | build a Fusion Reactor | +10% from fission and fusion plants |

  Babies give a quarter and young pets half of that, as for the others. "Full House" and "Proud Keeper" now need all 14 pets.

## Things to try

1. Map tab: hover an Oil Rig, then a Coal Mine. Do the "Producer (no levels)" line and the 🔥 burn line answer what you were looking for?
2. Completion tab → Decorations: does it now show what you own (for example "6/6 bought" for the Tree)?
3. Pets tab: you probably meet several new pets at once (you are past level 35 and have built gas plants). Feed one and watch its card: the pulse, the sparkles and the bar.
4. Leave the game open on another tab until that pet grows: does the celebration show, and is it clear what happened?
5. Watch the pets at the bottom of the screen for a minute on a few tabs. Click one. Do they ever get in the way?
6. On a phone, with a research running: the pets walk above the chip, and the chip and the map buttons stay clickable.
7. Settings → Motion: turn "Pets walk on screen" off and on, then try Reduce motion.

## Known issues

- The walking pets use the same sprite as their card, with a pose for each action (squash, tilt, hop) instead of new animation frames: no new art.
- Clicking a walking pet plays its reaction but is not counted yet; counting pets petted is item 1.51 (petting achievements).
- 100% completion moved to 293.3 h. The 3rd pet slot (player level 80) is still the last thing reached.

## Questions

1. Oil Rig: was the missing level what you expected from a producer, or would you like producers to get levels (upgrades) of their own? That would be a new feature, so it would be a new backlog item.
2. Decorations: is "all 6 of each kind" right for 100% completion? Should Landscape Architect (30 bought, a bonus achievement) become "all 36"?
3. Walking pets: is the speed right, and are the actions and bubbles fun or distracting?
4. New pets: are the bonuses and where you find them about right? Are the Soot Owl's and the Atomic Axolotl's energy feeding costs (2M/40M and 20M/400M) too steep?
5. Next come your playtest 24 requests: 1.69 (open and close the Cosmetics section), 1.70 (remove all decorations at once) and 1.71 (working machines animate on the map), then 1.55 (more random events) and 1.54 (more decorations). Keep that order?

---

# Previous: Playtest 24 (v0.24.0): title tiers, map events anywhere, decorations for energy, pet growth and pet slots

The version at the bottom of the screen should read **v0.24.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over. Decorations you already placed count as owned copies, free of charge.

## Estimated play time

- **100% completion: about 243.9 hours** (simulated; was 264.7 h). No stalls.
  - Decorations and the two pet slots add new things to buy, and completion now includes them.
  - Pets give less as babies but the same as adults, and only one grows at a time.
  - Slot 2 and 3 let three pets' bonuses add up, which speeds up the end game.
- Key milestones: first research 15 min, first Wind Turbine 2.3 h, first Coal Plant 3.1 h, 25% at 7.9 h, 50% at 33.5 h, first Nuclear Fission Plant 54.9 h, 75% at 84.9 h, 2nd pet slot 90.5 h, first Fusion Reactor 93.1 h, every contract perk 177.0 h, first Micro-Supernova 190.1 h, 3rd pet slot and 100% at 243.9 h.
- Decorations in the simulation: first at 2.1 h, 10 at 10.1 h, every kind at 60.9 h.

## What is new since playtest 23

- **Title tiers (1.66):** every title now has a tier, each with its own color:

  | Tier | Color | Titles |
  |---|---|---|
  | Common | gray | Live Wire, Apprentice |
  | Uncommon | green | Power Station, Engineer, Trusted Partner |
  | Rare | blue | Chief Engineer, Energy Baron, Grid Operator, Human Dynamo, Sky Watcher |
  | Epic | rose | Grid Backbone, MegaGen, Proud Keeper, Landscape Architect (new) |
  | Legendary | gold, with a soft glow | Every Kind, Know-it-all, Perfect Machines |

  - The title under your player level shows in its tier color.
  - Achievements → Cosmetics groups the titles by tier, highest first. Locked titles are listed too, grayed out, with what earns them.
  - Achievement cards say which tier of title they give.
  - Epic is rose rather than purple: no purple in the game's palette is readable enough on the dark top bar.
- **Map events anywhere (1.67):**
  - The birds fly at a random height, either way across (they face the way they fly), on a slight slope.
  - The falling star can land anywhere in the sea.
  - The delivery truck comes in from the left or the right edge and stops on that side of its producer.
- **Decorations are bought with energy (1.53, reworked after your note):**
  - You buy copies with the **Buy** button in the 🎨 panel, up to 6 of each kind. First-copy prices: Tree 1K, Company flag 5K, Pond 100K, Windsock 250K, Lamp post 1M, Founder statue 10M.
  - Each next copy of the same kind costs ×1.6. The price shows red when you are short.
  - Copies you own are placed, removed and placed again for free, as often as you like. Each card shows "placed / owned · owned / 6".
  - The old requirements (level, achievements, contracts) still apply.
  - New achievements: Green Thumb (1), Site Beautifier (10), Collector (every kind), and Landscape Architect (30, a bonus achievement with an Epic title).
  - Completion has a new "Decorations" part: every kind once, plus 25 bought in all.
- **Pets grow one at a time (1.57):**
  - While one pet grows, Feed is off on the others ("Another pet is growing (Xh left)").
  - Bonuses are now Baby 1×, Young 2×, Adult 4× of a base value. Adults give the same as before, so babies and young pets give less.
  - Each card shows "Grows to: +X% as Young/Adult".
- **Pet slots (1.59):** in the Pets tab you can buy a 2nd active slot (100M energy, player level 45) and a 3rd (1B, player level 80).
  - Bonuses of different active pets add up, and the energy breakdown lists each pet.
  - **Make active** fills a free slot. When all slots are full, it takes the first slot's place (the button says whose).
  - **Rest** frees a slot.
  - Completion counts the two slots.

## Things to try

1. Achievements tab: pick a title. Is its color right in the top bar? Do the tiers make sense to you, and is it clear what earns each locked title?
2. Map tab: watch for a while. Do the birds, the star and the truck now show up in different places?
3. 🎨 Decorations: buy a Tree, place it, remove it and place it somewhere else: no extra cost. Buy a second one: does its price feel right?
4. Achievements tab: are the new decoration achievements (Green Thumb, Site Beautifier, Collector) earned where you expect?
5. Pets tab: feed one pet, then look at another. Feed should be off with the time left. Check the "Grows to" line.
6. Pets tab: you are past player level 45, so the 2nd slot only waits for 100M energy. Buy it, make a second pet active, and look at the energy breakdown (hover the energy rate).
7. Completion tab: open "Decorations" and "Pet slots".

## Known issues

- The 3rd pet slot is the last thing the simulation buys (243.9 h). It is meant as an end-game energy sink.
- Babies and young pets now give less than before; adults are unchanged.

## Questions

1. Title tier colors: is rose fine for Epic, or would you rather have a less readable purple?
2. Decoration prices: is ×1.6 per copy right, and are the base prices about right for where each one unlocks?
3. Is 6 copies of each kind the right maximum?
4. Pet slots: are 100M at level 45 and 1B at level 80 right? The stacked bonuses make the end game faster.
5. Next in the order are 1.58 (pet growing animation), 1.60 (pets walking on screen), 1.56 (more pets), 1.55 (more random events) and 1.54 (more decorations). Keep that order?

---

# Previous: Playtest 23 (v0.23.0): map tooltips, a legend panel, harder research and player level gates

The version at the bottom of the screen should read **v0.23.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 264.7 hours** (simulated; was 251 h). The new player level gates on room expansions and contract perks slow the middle game a little. No stalls.
- Key milestones: first research 15 min, first Wind Turbine 2.3 h, first Coal Plant 3.2 h, 25% at 8.9 h, 50% at 31.9 h, first Nuclear Fission Plant 54.9 h, 75% at 85.0 h, first Fusion Reactor 120.5 h, first Micro-Supernova 228.1 h, 100% at 264.7 h.
- Room expansions now come at 0.6, 2.2, 2.9, 5.2, 7.3, 10.9, 15.4, 28.6, 61.7 and 92.1 h. Expansion 8 moved the most (was 19.9 h).

## What is new since playtest 22.1

- **Map tooltips (1.63):** hover (or tap) a machine on the map and a small tooltip appears right beside it, so you no longer need the info line above the map:
  - its name and number, energy per second, fuel it burns, and its level;
  - for producers, what one of them makes;
  - its zone bonus, or the bonus it would get on its zone;
  - a red line if it is switched off or on the wrong land.
  
  The tooltip stays on screen: below the machine when it is just under the top bar, above it otherwise.
- **The legend in a floating panel (1.65):** a **🗺️ Legend** button now sits next to **🎨 Decorations** at the bottom right of the Map tab. It opens a panel with everything that was under the map: the zones, the ⭐ note, "Show all zones", the "Dimmed land" note and the Exclusion Zone hint. Hovering a row still lights that zone on the map. Only one panel opens at a time.
- **Harder research gates (1.62):** the upper research now needs a much higher research level:

  | Research | Needs research level |
  |---|---|
  | Nuclear Fission | 17 (was 9) |
  | Heavy Water and Fusion Ignition | 26 (was 11) |
  | Fast-Time Dimension | 35 (was 13) |
  | Stellar Harvest | 38 (was 14), all but one of the other research |

  Research you already finished stays finished, and a research in progress completes.
- **Player level as a hard requirement (1.61):**
  - Room expansions need player level 1, 3, 5, 8, 10, 13, 17, 22, 50 and 70 (Generators tab → Room shows "Requires player level N (you have M)").
  - Each contract perk level needs player level 10, 30, 55 and 75 (1st to 4th level).
  - Pet slots will get theirs with item 1.59.
- **☁️ menu buttons (1.68):** "Save to cloud now" is now a blue button, as in Settings, and shows "Saving…" while it saves. "Load cloud save" is the gray button below it.

## Things to try

1. Map tab: hover a few machines (a Solar Panel, a Coal Plant, a producer). Is the tooltip readable and in the right place? Try one at the very bottom of your big map.
2. On a phone, tap a machine on the map: the tooltip shows with the selection.
3. Click **🗺️ Legend**, hover the rows, then **🎨 Decorations**: only one panel opens at a time.
4. Research tab: look at Heavy Water or Fast-Time Dimension. Do the new level requirements feel right for where you are (research level 21)?
5. Generators tab → Room: your next expansion is 10 of 10 or later, so check whether it now waits for a player level.
6. Contracts tab: the perk shop shows "Needs player level N" where you are below a perk's level.
7. ☁️ in the top bar: the Save button is blue and says "Saving…" for a moment.

## Known issues

- Your save is far along, so most of the new gates are already behind you. The research gates from Heavy Water up are the ones you will meet.
- The simulator researches in tree order, so the research gates alone did not change its timeline; the slower middle game comes from the player level gates.

## Questions

1. Map tooltips: is there anything else you want in them (for example upgrade cost or the refund for scrapping)?
2. Are the research levels now hard enough, or should the research level also rise more slowly?
3. Player level gates: are 50 and 70 right for the last two room expansions?
4. Next in the order are 1.66 (title tiers), 1.67 (map events in random places) and 1.53 (decorations bought with energy). Keep that order?

---

# Previous: Playtest 22.1 (v0.22.1, hotfix): the Decorations button is always in reach

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
