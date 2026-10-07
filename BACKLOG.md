# MegaGen Idle — Backlog

All paths are **relative to the repo root**. Read `CLAUDE.md` first.

**Starting point: the repository is empty.** There is no existing code and no existing art. Item 0.00 creates the project from scratch.

**Scope:** every item's code and config is done inside cloud sessions. Release work (Electron for Steam, Capacitor for Android and iOS, in-app purchases, the public website, store build configs, GitHub Actions workflows and `codemagic.yaml`) is in scope; a release item may wait on an owner step such as a store account or a secret, and names it. Audio, new hand-made or AI-generated art, secrets in the repo, and anything needing Xcode or Android Studio on a local machine are out of scope (see "Out of scope"). Sprites are generic stand-ins made by a script and ship as they are.

**Public launch:** March 11, 2027 on Steam (Windows), Google Play, the App Store and megagenidle.com. Free part plus a one-time "Full Game" unlock and a cosmetic "Supporter Pack"; never pay-to-win, no ads, no premium currency (see `CLAUDE.md`).

**Status values:** `Done` · `Not started` · `In progress` · `Partial` (with a note on what remains)

## Autonomy and playtest rules

`PLAYTEST_EVERY = 5` (items completed between playtests; the owner can change this number).

- **Run continuously.** Take the next `Not started` item in the order below, finish it (code, tests, build, status update, commit), and move straight to the next. Do not ask for approval between items.
- **Never block on one item.** If an item cannot be finished, mark it `Partial` with a note, open the PR with what works, and move to the next item.
- **Playtest checkpoint.** After every `PLAYTEST_EVERY` completed items, check whether the game is *playable*: it builds, tests pass, it loads, and the features finished since the last checkpoint can be reached from the UI. If yes, **stop and wait for the owner** (see "Playtest checkpoints" in `CLAUDE.md`). If not playable yet, keep going and check again after each following item.
- **This is the only planned pause.** Playtest feedback becomes new items at the top of the order, then the run continues.
- **When the list runs out,** extend it by following "Writing new backlog items" in `CLAUDE.md`, then continue. The list should never be empty.

## Order of work

Deployment and documentation come early so playtesting only needs a browser. Resources exist before anything costs them. `→ CHECKPOINT` marks where a playtest is due if the game is playable.

**Hold lifted (owner, 2026-10-07):** the owner asked to continue from the order of work. The hold set after playtest 25 (2026-10-06) is over; the run goes on with 1.69, 1.70, 1.71, 1.78 and 1.79 toward checkpoint 26.

**Hold lifted earlier (owner, 2026-10-06):** after playtest 24 the owner asked to continue. 1.58, 1.60, 1.56 and the bug fixes 1.72 and 1.73 were built for checkpoint 25 (PR #42, in the order below); the playtest 24 requests 1.69 to 1.71 were written on `main` at the same time and come next.

0. 1.74 Fix: walking pets: food and toys on the ground, long naps, and rests (owner reports, playtest 25; Done) → HOTFIX v0.25.1
0. 1.75 Fix: a hovered generator card covers the research chip and the walking pets (owner reports, playtest 25; Done) → HOTFIX v0.25.2
0. 1.76 Fix: the 💤 floats far from a small sleeping pet (owner report, playtest 25; Done) → HOTFIX v0.25.3
0. 1.77 Fix: machine tooltips say "Generator" or "Producer"; no level or fuel lines on producers (owner correction to 1.72, playtest 25; Done) → HOTFIX v0.25.3

**After playtest 24 (owner, 2026-10-06):** these come first after checkpoint 25, then the rest of the playtest 22 list below (1.55, 1.54, ...).

0. 1.69 Collapse and expand the Cosmetics section in the Achievements tab (owner request; small; Done)
0. 1.70 Remove all decorations from the map at once (owner request; small)
0. 1.71 Working machines animate on the map (owner request)

**After playtest 25 (owner, 2026-10-06):** the owner kept the order 1.69, 1.70, 1.71, then 1.55 and 1.54; these new items come right after 1.71 (Claude's placement; the owner can move them).

0. 1.78 Landscape Architect: own all 36 decorations (owner request; small)
0. 1.79 Walking pets at different speeds (owner request; small)
0. 1.80 Pets celebrate your milestones and react to random events (owner request)
0. 1.81 Active pets on screen interact with each other (owner request)

**After playtest 22 (owner, 2026-10-05):** these come first, in this order (approximate priority, set by Claude at the owner's request), then the rest of the playtest 21 list below.

0. 1.64 Fix: the Decorations button out of reach on a big map (playtest 22 bug; Done) → HOTFIX v0.22.1
0. 1.68 Cloud menu buttons styled like Settings (owner request; small)
0. 1.62 Harder research level gates (owner: research level 21 in under a week is too easy)
0. 1.61 Player level as a hard requirement
0. 1.65 Map legend in a floating panel, like Decorations (owner request after hotfix 22.1)
0. 1.63 Map tooltips on hover, next to the machine → CHECKPOINT 23
0. 1.66 Title tiers by difficulty, each with its own color (owner request; Done)
0. 1.67 Map events in random places each time (owner report; Done)
0. 1.53 Decorations bought with energy, at rising prices, with achievements and completion (Done)
0. 1.57 Pets: raise one at a time, and a bonus that grows clearly with maturity (Done)
0. 1.59 Pet slots: up to 3 active pets, bought with energy (Done) → CHECKPOINT 24 (5 items since checkpoint 23, `PLAYTEST_EVERY = 5`)
0. 1.58 Pet growing animation (Done)
0. 1.72 Fix: the Oil Rig's map tooltip shows no level and no oil use (owner report, playtest 24; Done)
0. 1.73 Fix: decorations bought did not count in the Completion tab; completion needs all 6 of each (owner report, playtest 24; Done)
0. 1.60 Active pets walk on the screen (Done)
0. 1.56 More pets (Done) → CHECKPOINT 25 (5 items since checkpoint 24: 1.58, 1.72, 1.73, 1.60, 1.56)
0. 1.55 More random events
0. 1.54 More decorations

**After playtest 21 (owner, 2026-10-05):** these came first, in this order; 1.44 to 1.47 and 1.52 are Done, the rest follow the playtest 22 items above.

0. 1.44 Fix: a new device signing in could upload a blank game over the cloud save (owner bug report) → HOTFIX v0.21.1
0. 1.45 Generate-energy button next to the pinned energy bar
0. 1.46 Cloud save from any tab
0. 1.47 Decorations in a panel that opens over the map → CHECKPOINT 22
0. 1.51 Achievements for petting your pets
0. 1.52 Store images from the current art (owner request; Done)
0. 1.49 A designed loading screen for the website
0. 1.50 A dedicated MegaGen Idle logo
0. 1.48 Sprite quality pass: shadows, proportions, better map designs
0. (then 0.42 Performance pass and the rest of the order below)

**Launch priority (owner decision, 2026-10-03):** these come first, in this order. Items already `Done` are skipped, so the first open item is 0.41.

0. 0.65 Achievements (launch priority; already Done)
0. 0.41 Responsive layout and keyboard access (launch priority)
0. 0.46 Crash recovery and error boundaries (launch priority)
0. 0.43 Visual polish pass (launch priority)
0. 0.39 Statistics panel (launch priority) → CHECKPOINT 20
0. 1.42 Fix: tooltips under the pinned top bar (playtest 20 bug) → HOTFIX v0.20.1
0. (then 1.38, 1.39, 1.40 emoji, 1.41 below, in that order: owner confirmed, playtest 20)
0. 0.85 Random events with effects (launch priority; already Done)
0. 0.86 Grid Contracts: a second activity (launch priority; already Done)
0. 0.92 Energy pets: collect and grow (launch priority; already Done)
0. 0.34 Late-game fictional generators, with two more room tiers (launch priority; already Done)

**Earlier order** (history, then the remaining items):

0. 0.48 Offline cap to 24 hours (playtest 1 feedback)
0. 0.49 Distinct color for fuel use (playtest 2 feedback)
0. 0.50 Generators cost energy (playtest 2 feedback)
0. 0.51 Higher energy costs for building and research (playtest 3 feedback)
0. 0.52 Longer research times that grow with level (playtest 3 feedback)
0. 0.53 Boost breakdown on hover (playtest 3 feedback)
0. 0.58 Higher stone prices (playtest 4 feedback)
0. 0.54 Scrap: cancel button and no-refund notice (playtest 4 feedback)
0. 0.55 Visible release version (playtest 4 feedback)
0. 0.56 Research level shown clearly (playtest 4 feedback)
0. 0.57 New room construction animation (playtest 4 feedback)
0. 0.31 Resource producers use room (moved up: playtest 4 feedback)
0. 0.59 Producer cost growth 20% (playtest 5 feedback)
0. 0.60 Scrap producers (playtest 5 feedback)
0. 0.61 Research rewards stand out (playtest 5 feedback)
0. 0.62 Scrollbars in game colors (playtest 5 feedback)
0. 0.63 Research-complete celebration (playtest 5 feedback)
0. 0.64 Tab icons (playtest 5 feedback) → CHECKPOINT
0. 0.69 Manual generator ordering (playtest 6 feedback)
0. 0.70 Scrap several producers at once (playtest 6 feedback)
0. 0.71 Offline limit shown as "24 hours" (playtest 7 feedback)
0. 0.72 Research progress visible on every tab (playtest 7 feedback)
0. 0.73 Room meter redesign and expansion animation (playtest 7 feedback)
0. 0.74 More room expansion tiers (playtest 7 feedback)
0. 0.75 Resource boost research (playtest 7 feedback) → CHECKPOINT
0. 0.76 Save-on-close safeguard (playtest 8 feedback)
0. 0.77 Floating research chip (playtest 8 feedback)
0. 0.78 Third starting research: Basic Mining (playtest 8 feedback)
0. 0.79 Fix: welcome back after switching tabs (playtest 9 bug)
0. 0.80 Fix: build-card tooltip unreadable over the card above (playtest 9 bug)
0. 0.81 Research tree in branches (playtest 9 feedback)
0. 0.82 100% completion includes max upgrades (playtest 9 feedback)
0. 0.83 More click-power research (playtest 10 feedback)
0. 0.88 Player level from lifetime energy (playtest 10 feedback)
0. 0.66 Perfection (completion) tracker, visible to the player (moved up: playtest 10 feedback)
0. 0.38 Event log and notifications (moved up: needed by random events)
0. 0.84 Random events: framework and sightings (playtest 10 feedback) → CHECKPOINT
0. 0.89 Fix: short numbers lost their zeros (playtest 11 bug)
0. 0.93 Fix: research chains jump rows in the tree (playtest 11 bug)
0. 0.94 Research tree lines as a trunk with branches (playtest 11 feedback)
0. 0.90 Player level reward, celebration and welcome-back line (playtest 11 feedback)
0. 0.91 Sightings stay longer on screen (playtest 11 feedback)
0. 0.40 First-run onboarding and in-game guide (moved up and widened: playtest 11 feedback) → CHECKPOINT
0. 0.95 Player levels harder to gain early (playtest 12 feedback)
0. 0.96 Sort your generator list (playtest 12 feedback)
0. (0.85 moved to the top: launch priority)
0. (0.86 moved to the top: launch priority)
0. (0.92 moved to the top: launch priority) → CHECKPOINT
0. 0.98 Fix: meteor shower and shooting stars fly the wrong way (playtest 13 bug)
0. 0.97 Contracts explain delivery versus production (playtest 13 feedback)
0. 0.99 Pets react when clicked (playtest 13 feedback)
0. (0.65 moved to the top: launch priority)
0. 0.87 Multi-platform release plan: website, Steam, mobile (playtest 10 feedback; superseded by the owner's launch guide) → CHECKPOINT
0. 1.00 Clearer contract perk shop (playtest 14 feedback)
0. 1.03 Sort generators by "upgradable first" (playtest 14 feedback)
0. 1.01 Cosmetic rewards for achievements (playtest 14 feedback)
0. 1.02 Release plan ordered from easiest to hardest (playtest 14 feedback)
0. 1.04 Site map: see your machines on a map (playtest 14 feedback) → CHECKPOINT
0. 1.08 Map: machines no longer overlap (playtest 15 bug)
0. 1.09 Amber accent visible; American English everywhere (playtest 15 feedback)
0. 1.10 Readable event notices: longer toasts, exact effect on hover, saved log (playtest 15 feedback)
0. 1.11 Pet bonuses shown in the click and rate breakdowns (playtest 15 bug)
0. 1.05 Larger, detailed map: terrain zones, rivers and coast, moving machines (playtest 14 and 15 feedback) → CHECKPOINT 16
0. 1.14 Tooltips on the map ⭐ and the 📍 placement marks (playtest 16 feedback)
0. 1.17 New solar and wind built on their bonus zone; machines stay put once built (playtest 16 feedback)
0. 1.16 Drag and drop to move machines on the map (playtest 16 feedback)
0. 1.15 More variety in the small map details (playtest 16 feedback)
0. 1.18 Producer zones: fields and outcrops that boost mines, quarries and wells (playtest 16 feedback) → CHECKPOINT 17
0. 1.19 Tooltips drawn on top of the page, never cut off (playtest 17 bug)
0. 1.20 No zone slivers too narrow for a machine (playtest 17 bug)
0. 1.21 Active bonuses can be opened and closed (playtest 17 feedback)
0. 0.67 Public release plan: accounts and cloud saves (moved up: playtest 15 and 17, the website needs accounts)
0. 0.68 Accounts and cloud saves (needs owner setup, see 0.67; skipped until then)
0. 1.06 Map polish: expansions grow the map, simulator and balance (playtest 14 feedback) → CHECKPOINT 18
0. 1.22 Sign in with Google and Discord (playtest 18 feedback)
0. 1.24 Scrapping refunds 10% of everything spent (playtest 18 feedback)
0. (0.34 moved to the top: launch priority)
0. 1.23 Map upgrade: the Exclusion Zone for fictional generators (playtest 18 feedback)
0. 1.12 Map events you can watch on the map (playtest 15 feedback; playtest 18: after the fictional generators) → CHECKPOINT 19
0. 1.25 Map events and sightings face the way they move (playtest 19 bug)
0. 1.26 Dedicated pixel designs and animations for map events (playtest 19 feedback)
0. 1.27 Map events rarer; Exclusion Zone hint on the map (playtest 19 feedback)
0. 1.28 Much costlier contract perks (playtest 19 feedback) → HOTFIX v0.19.1
0. 1.29 Map events halfway between the old and new pace (playtest 19.1 feedback) → HOTFIX v0.19.2
0. 1.30 Birds that look like birds (playtest 19.2 feedback) → HOTFIX v0.19.3
0. 1.31 Slow rates per minute or hour instead of "0.00/s" (playtest 19.3 feedback)
0. 1.32 Balance: metal and stone costs x2, room expansions harder, research 25% longer (playtest 19.3 feedback)
0. 1.33 Producers granted by research shown on the map (playtest 19.3 bug)
0. 1.34 Level ups in the event log (playtest 19.3 feedback)
0. 1.35 Lightning strikes stack per generator type (playtest 19.3 bug) → HOTFIX v0.19.4
0. 1.36 Smaller bonuses for the common map events; delivery grows with player level (playtest 19.4 feedback) → HOTFIX v0.19.5
0. 1.37 No timed events started on return from time away; no clashing weather (owner bug report) → HOTFIX v0.19.6
0. 1.40 Flapping birds in the flock-of-birds sighting (owner request)
0. 1.38 A bonus place on the map for every machine (owner request, after playtest 19.5)
0. 1.39 A tidy, readable map legend (owner request, after playtest 19.5)
0. 1.40 A distinct emoji for every kind of event log entry (owner request, after playtest 19.6)
0. 1.41 The research chip opens the running research's details (owner request, after playtest 19.6)
0. 1.13 Map decorations as cosmetic rewards (playtest 15 feedback) → CHECKPOINT 21
0. 1.07 Browser notifications, opt-in and rate-limited (playtest 14 feedback)
0. 1.43 Fix: sign-up "Invalid path specified in request URL" (owner report, after playtest 21)
0. (0.39 moved to the top: launch priority)
1. 0.00 Bootstrap and repo verification
2. 0.04 Idle engine
3. 0.26 Clicker
4. 0.22 Web build and GitHub Pages deploy
5. 0.37 README and local-run instructions → CHECKPOINT 1
6. 0.27 Generic sprites, asset index and asset check
7. 0.19 State slices
8. 0.11 Resource system
9. 0.07 Generator system
10. 0.09 Generator UI → CHECKPOINT 2
11. 0.10 Research system
12. 0.13 Research UI
13. 0.16 Room system
14. 0.20 Mid-tier generators and room UI
15. 0.36 Smoke tests and CI → CHECKPOINT 3
16. 0.28 Save safety and offline summary
17. 0.29 Number formatting and settings screen
18. 0.30 Permanent-boost research
19. (0.31 moved to the top, playtest 4)
20. 0.35 Balance simulator → CHECKPOINT 4
21. 0.32 Generator upgrades
22. 0.33 Tier 3 generators and wider tree
23. (0.34 moved to the top, playtest 14)
24. (0.38 moved to the top, playtest 10)
25. (0.39 moved to the top, playtest 14)
26. (0.40 moved to the top, playtest 11)
27. (0.41 moved to the top: launch priority)
28. 0.42 Performance pass
29. (0.43 moved to the top: launch priority)
30. 0.18 Test coverage pass → CHECKPOINT 6
31. 0.44 More real-world generation methods
32. 0.45 Deeper research tree
33. (0.46 moved to the top: launch priority)
34. 0.47 Balance re-tune and difficulty curve review
35. (0.65 moved to the top, playtest 13)
36. (0.66 moved to the top, playtest 10)
37. (0.67 moved to the top, playtest 15)
38. (0.68 moved to the top, playtest 17)

---

## Asset manifest

Every sprite below is a generic stand-in generated by item 0.27 (the energy icon is created earlier, in 0.00). There is no real art in the project yet. Palette: AAP-64, transparent backgrounds. For buildings, aim for top-left lighting and a rough isometric look even in the generic version.

| Asset ID | File (under `src/assets/sprites/`) | Size |
|---|---|---|
| energy_icon | `energy_currency_icon_32.png` | 32×32 |
| solar_panel, solar_panel_inactive | `generators/solar_panel.png`, `generators/solar_panel_inactive.png` | 48×48 |
| wind_turbine, wind_turbine_inactive | `generators/wind_turbine.png`, `generators/wind_turbine_inactive.png` | 64×64 |
| coal_plant, coal_plant_inactive | `generators/coal_plant.png`, `generators/coal_plant_inactive.png` | 64×64 |
| hydro_dam, hydro_dam_inactive | `generators/hydro_dam.png`, `generators/hydro_dam_inactive.png` | 80×64 |
| gas_plant, gas_plant_inactive | `generators/gas_plant.png`, `generators/gas_plant_inactive.png` | 64×64 |
| tidal_station, tidal_station_inactive | `generators/tidal_station.png`, `generators/tidal_station_inactive.png` | 64×48 |
| oil_plant, oil_plant_inactive | `generators/oil_plant.png`, `generators/oil_plant_inactive.png` | 64×64 |
| nuclear_plant, nuclear_plant_inactive | `generators/nuclear_plant.png`, `generators/nuclear_plant_inactive.png` | 64×64 |
| fusion_reactor, supernova_core (+ _inactive) (0.34) | `generators/{name}.png` | 64×64 |
| resource_coal / stone / metal / natural_gas / oil / uranium / deuterium | `resources/{name}.png` | 24×24 |
| producer_quarry, producer_mine, producer_coal_mine, producer_gas_well, producer_oil_rig, producer_uranium_mine, producer_deuterium_extractor | `producers/{name}.png` | 48×48 |
| room_expansion | `ui/room_expansion.png` | 96×96, semi-transparent |
| capacity_empty, capacity_filled, capacity_critical, capacity_building | `ui/capacity_{state}.png` | 16×16 |
| sighting_spaceship, sighting_birds, sighting_paper_plane, sighting_ufo | `events/{name}.png` | 32×16 (paper plane 16×16, UFO 32×24) |
| sighting_balloon, sighting_cat, sighting_whale, sighting_meteor | `events/{name}.png` | 16×24, 24×16, 48×24, 16×16 |
| pet_{hamster,firefly,tortoise,eel,robodog,cat,beetle,jellyfish,mole,toad,mouse,pigeon,owl,axolotl}_{1,2,3} (baby, young, adult; the last six added by 1.56) | `pets/{name}_{stage}.png` | 32×32 |
| achievement_unlocked, achievement_locked | `ui/achievement_{state}.png` | 24×24 |
| tile_ground, tile_locked | `map/ground.png`, `map/locked.png` | 16×16 |
| map_bird_1/2 (16×16, one gull, wing up and down; playtest 19.2); map_truck (32×16); map_bolt (16×32); map_fire_1/2, map_wave (16×16); map_star (24×24): map events, moving ones face right (playtest 19) | `events/{name}.png` | as listed |
| tile_plateau, tile_ridge, tile_river, tile_coast, tile_sea; tile_coalfield, tile_outcrop, tile_oilfield (1.18); tile_exclusion (1.23); tile_lake (1.38) | `map/{name}.png` | 16×16 |
| decor_tree, decor_flag, decor_pond, decor_windsock, decor_lamp, decor_statue (1.13) | `map/{name}.png` | 16×16 |
| deco_rock, deco_tuft, deco_flower; deco_bush, stump, mushroom, log, cactus, drygrass, boulder, bentgrass, reeds, lily, shell, driftwood, boat, buoy (1.15); deco_warning, deco_pylon (1.23) (transparent details drawn over tiles) | `map/deco_{name}.png` | 16×16 |
| research_energy / materials / efficiency / advanced | `research/icon_{name}.png` | 32×32 |
| research_progress_segment | `research/progress_segment.png` | 8×8 tile |
| research_lock | `research/lock.png` | 16×16 |
| research_check | `research/check.png` | 16×16 |
| research_panel_bg | `research/panel_bg.png` | 128×128 tileable |

Later items (0.33, 0.34, 0.44) add their own rows here and extend the generator script. A machine-readable copy of this table (asset ID → file and size) lives in `src/assets/sprite-manifest.json`; the generator, `check:assets` and the typed `sprites` index in `src/assets/index.ts` all follow it, so a new sprite is added to the table, that JSON, the generator's `DRAW` map and the index.

**Replacing a stand-in with real art:** put the real PNG at the same path and size, and remove its entry from `src/assets/generic-assets.json`. No code change is needed.

---

## Out of scope (nothing here blocks the plan)

- **Audio:** sound effects and music (original items 0.05, 0.06, 0.14, 0.15). Do not add audio code, hooks or settings.
- **AI-generated art:** the original Stable Diffusion tasks (0.08, 0.12, 0.17). Stand-ins are used instead.
- **New art:** no new hand-made or AI-generated art. The current generic sprites ship at launch as they are.
- **Secrets in the repo:** signing keys, store credentials and API keys live in GitHub or Codemagic secrets, never in the repo.
- **Local platform tooling:** anything that needs Xcode or Android Studio on a local machine. Store builds and signing run in GitHub Actions or Codemagic instead.

Electron (Steam) and Capacitor (Android, iOS) packaging moved into scope with the launch decision (2026-10-03).

---

## Items

### 0.51 — Higher energy costs for building and research — CODE — Done
**Goal:** apply playtest 3 feedback: energy costs for building and research are reached too easily.
**Details:** raise `GENERATOR_ENERGY_COST_SECONDS` from 600 (10 minutes of output) to 1800 (30 minutes): Solar 900, Wind 1,440, Coal 3,600. Keep the first Solar Panel buildable at once by setting `STARTING_ENERGY` to its cost (900). Raise research energy costs about 5×: Basic Solar 250, Wind Power Fundamentals 1,000, Fossil Fuels 101 1,500 energy + 10 coal. Room expansion prices stay (owner: "good"). All numbers stay in data files.
**Acceptance:** tests for the new costs; a fresh save can still build a Solar Panel at once; a pacing probe shows no stall (idle player still reaches every current unlock).

### 0.52 — Longer research times that grow with level — CODE — Done
**Goal:** apply playtest 3 feedback: research must take much longer, and each research level must take longer than the one before.
**Details:** new durations: Basic Solar (level 1) 10 minutes, Wind Power Fundamentals (level 2) 30 minutes, Fossil Fuels 101 (level 2) 45 minutes. Rule, enforced by a data test for all current and future research: a research takes longer than every research with a lower level requirement, and longer than each of its prerequisites. Later items that add research (0.20, 0.30, 0.33, 0.45) must follow it.
**Acceptance:** the data test passes and fails if the rule is broken; durations shown in the panel match.

### 0.53 — Boost breakdown on hover — CODE — Done
**Goal:** apply playtest 3 feedback: when a research or other non-building boost changes how much is gained, the player can see it. Hovering (or focusing) the energy rate shows the base rate from generators, each active boost with its source and effect, and the total.
**Details:** pure `getEnergyBreakdown(state)` in `src/utils/` returning base, a list of modifiers (source name, percent, energy per second it adds) and total; boosts come from research effects, so future boosts appear automatically. Built as a reusable rate-breakdown shape and tooltip so resources can use it later. Keyboard accessible (tooltip on focus too). Also shows the click value and its boost when click power is boosted.
**Acceptance:** tooltip lists Basic Solar's +10% with its energy/s once it is completed, and shows only the base without boosts; unit tests for the breakdown; total matches the displayed rate.

### 0.49 — Distinct color for fuel use — CODE — Done
**Goal:** apply playtest 2 feedback: the "Burns" line on a generator card must not look like the red "cannot afford" color.
**Details:** give fuel use (the card's "Burns" line, and negative resource rates caused by fuel) its own color, such as amber, distinct from the red used for unaffordable costs. Keep red only for "you cannot afford this".
**Acceptance:** the "Burns" text and the unaffordable-cost text use different colors; a UI test checks the fuel line does not use the red class.

### 0.50 — Generators cost energy — CODE — Done
**Goal:** apply playtest 2 feedback: give energy a use. Building a generator also costs energy, equal to what it produces in 10 minutes.
**Details:** energy cost = base `energyPerSecond` × `GENERATOR_ENERGY_COST_SECONDS` (600, a named constant in `src/data/generators.ts`), rounded up; the build discount applies to it like other build costs. Cards show the energy cost (red when short); the build button says "Not enough energy" when that is the only thing missing. The owner wants the first Solar Panel buildable straight away, so new saves start with enough energy for one (300). Later generators (0.20, 0.33, 0.34, 0.44) follow the same rule automatically. Producers (0.31) and room expansion (0.16) already have their own energy costs.
**Acceptance:** Solar costs 300 energy, Wind 480, Coal 1200; building deducts energy; blocked without energy; a fresh save can still build a Solar Panel at once; tests cover the cost formula, the discount and the block.

### 0.58 — Higher stone prices — CODE — Done
**Goal:** apply playtest 4 feedback: stone is too cheap (players pile up thousands).
**Details:** stone costs on generators and research raised about 1.5×: Wind 5→8, Coal 10→15, Hydro 80→120, Tidal 60→90, Gas 50→75; Hydropower research 50→75. Room expansion prices unchanged (owner said they are good).
**Acceptance:** tests pass with the new numbers; a fresh save can still build its first Wind Turbine without a stall.

### 0.54 — Scrap: cancel button and no-refund notice — CODE — Done
**Goal:** apply playtest 4 feedback: scrapping stays refund-free, but the player can back out, and is told there is no refund before confirming.
**Details:** when Scrap is clicked, show "Confirm" and "Cancel" buttons plus a short inline message "No refund: the generator is removed for good." The Scrap button also has a tooltip (hover and keyboard focus) saying there is no refund. Cancel restores the normal row.
**Acceptance:** UI tests: Scrap → Cancel leaves the generator; Scrap → Confirm removes it; the no-refund text is visible while confirming and in the tooltip.

### 0.55 — Visible release version — CODE — Done
**Goal:** apply playtest 4 feedback: the game shows its release version, small, at the bottom of the screen.
**Details:** version comes from `package.json` (injected at build time by Vite `define`), shown as e.g. `v0.5.0` in a small footer, with the short commit hash when built in CI. From now on bump the minor version in `package.json` in each playtest PR (playtest 5 is `0.5.0`), and note it in the PR and the Playtest log. Document the rule in `CLAUDE.md` and `README.md`.
**Acceptance:** footer shows the version from `package.json`; a test checks it matches; the rule is documented.

### 0.56 — Research level shown clearly — CODE — Done
**Goal:** apply playtest 4 feedback: the owner saw "Research level 2" next to RESEARCH while a level-2 research was still running and read it as the level going up early.
**Details:** verify the level only rises when research completes (add a test that starting research never changes it, including through the store and the idle tick). Make the label unambiguous: "Your research level: N", and while a research runs, "Rises to N+1 when <name> finishes". Research nodes say "Needs level N" rather than "Lv N".
**Acceptance:** tests prove the level changes only on completion; the label text is unambiguous.
**Done notes:** the level was not rising early: "Research level 2" was the player's current level (earned by Basic Solar) shown while a level-2 research ran. Tests now prove the level rises only on completion; labels changed to "Your research level: N", "Rises to N+1 when X finishes" and "Needs level N" on nodes.

### 0.57 — New room construction animation — CODE — Done
**Goal:** apply playtest 4 feedback: the fading scaffolding overlay looks odd; try a different approach.
**Details:** replace the overlay with the capacity meter itself growing: after an expansion, the new room segments appear one after another as scaffolding (amber) and settle into normal empty segments, over about 2 seconds. Still derived only from `lastExpansionAt` (no separate timer state), so it cannot desync. Respects `prefers-reduced-motion` (segments appear at once). Remove the overlay.
**Acceptance:** test that segments added by the last expansion are the animated ones and that animation stops after the duration; reduced motion shows the final state.
**Done notes:** new generic sprite `ui/capacity_building.png` (16×16 scaffold) added to the manifest and generator. The old `room_expansion` overlay sprite is no longer used but stays in the manifest for later art. Dev builds expose `window.__megagenStore` for browser checks (stripped from production).

### 0.59 — Producer cost growth 20% — CODE — Done
**Goal:** apply playtest 5 feedback: each producer bought should cost 20% more than the previous one (was 15%).
**Details:** `PRODUCER_COST_GROWTH` 1.15 → 1.20 in `src/data/producers.ts`.
**Acceptance:** cost tests use the new factor; pacing probe shows no stall.

### 0.60 — Scrap producers — CODE — Done
**Goal:** apply playtest 5 feedback: producers can be scrapped like generators.
**Details:** pure `scrapProducer(state, id)` lowers the count by one (never below 0) and frees its room; no refund. Producer cards get the same Scrap flow as generators: tooltip saying there is no refund, then a confirm row with the notice, Confirm and Cancel. Scrapping does not lower the price of the next one below what the new count implies (price follows the count).
**Acceptance:** tests: count and room drop, no refund, cannot go below 0, Cancel keeps it; UI test for the flow.

### 0.61 — Research rewards stand out — CODE — Done
**Goal:** apply playtest 5 feedback: in the research panel, what the player gets from a research must be obvious.
**Details:** the "Gives" row becomes a highlighted reward box (green tint, 🎁 icon, "You get:" label), each reward on its own line with its own icon (⚡ unlocks a generator, ⛏️ grants a producer, 📈 a percentage boost). Research nodes show a small reward hint too (e.g. "🎁 Wind Turbine").
**Acceptance:** UI test that the reward box lists every unlock, producer grant and boost of a research.

### 0.62 — Scrollbars in game colors — CODE — Done
**Goal:** apply playtest 5 feedback: the scrollbar on long lists (Your generators) uses browser default white and gray; it should match the game.
**Details:** global scrollbar styling from the theme (slate track, sky/slate thumb, rounded) using `scrollbar-color`/`scrollbar-width` for Firefox and Chromium plus `::-webkit-scrollbar` rules for older WebKit. Applies to every scroll area (generator list, research tree, page).
**Acceptance:** CSS present for both engines; screenshot check in the PR.

### 0.63 — Research-complete celebration — CODE — Done
**Goal:** apply playtest 5 feedback: when a research finishes while the player is looking at the game, an animation celebrates it, whatever tab is open.
**Details:** the idle tick records a transient (not saved) "just completed" event when research completes during live play (not when catching up offline on load; that belongs to the welcome-back summary, 0.28). A global overlay plays a short burst (badge with the research icon, name, "Research complete!", reward line, sparkle burst) for about 3 seconds, then fades; clicking dismisses it; multiple completions queue. Respects `prefers-reduced-motion` (static banner, no burst). Announced to screen readers.
**Acceptance:** tests: a live completion triggers it on any tab; offline catch-up on load does not; it auto-hides; reduced motion shows the static version.
**Done notes:** a tick of at most `LIVE_TICK_MAX_SECONDS` (5 s) counts as live. Reduced motion is CSS-only (no burst, no scale), so it is not covered by a jsdom test.

### 0.64 — Tab icons — CODE — Done
**Goal:** apply playtest 5 feedback: each tab button shows a small image of what it holds.
**Details:** 20 px icon from the sprite index next to each tab label: Generators → solar panel, Producers → metal mine, Research → research (atom) icon. Icons are decorative (`alt=""`); labels stay for accessibility. Must still fit at 360 px.
**Acceptance:** each tab renders its icon; no horizontal scroll at 360 px.

### 0.69 — Manual generator ordering — CODE — Done
**Goal:** apply playtest 6 feedback: the player can arrange the "Your generators" list by hand.
**Details:** each row gets "Move up" and "Move down" buttons (keyboard accessible, 44 px targets), plus "to top" and "to bottom". Pure `moveGenerator(state, id, toIndex)` reorders `activeGenerators`; the order is saved. The order is also the fuel priority: when fuel runs short, generators higher in the list burn first (already how `burnFuel` works); the list header says so.
**Acceptance:** tests: moving changes order and persists through save/load; out-of-range moves are clamped; fuel goes to the top generator first.
**Done notes:** ▲/▼ buttons (Shift+click moves to top/bottom) plus drag-and-drop on desktop. Generator names now use their stable ID number, so reordering never renames them.

### 0.70 — Scrap several producers at once — CODE — Done
**Goal:** apply playtest 6 feedback: scrapping producers asks how many.
**Details:** the producer confirm row gets a number field (1 to owned, default 1) with − / + buttons and an "All" button; the notice states the number and the room freed. Pure `scrapProducer(state, id, count)` clamps to 0..owned.
**Acceptance:** tests: scrapping N lowers the count by N and frees N × room; values outside the range are clamped; Cancel changes nothing.

### 0.71 — Offline limit shown as "24 hours" — CODE — Done
**Goal:** apply playtest 7 feedback: the offline limit reads "24 hours", not "1d".
**Details:** a `formatHours` helper for whole-hour limits ("24 hours", "1 hour"); used by the Settings note and the welcome-back "only the first … count" line.
**Acceptance:** UI tests check both texts say "24 hours".

### 0.72 — Research progress visible on every tab — CODE — Done
**Goal:** apply playtest 7 feedback: while research runs, the player sees it on any tab with the time left; the running node in the tree blinks to show it is in progress.
**Details:** a compact chip under the top bar ("🔬 Wind Power Fundamentals · 12m 30s left" with a thin progress bar), visible on every tab; clicking it opens the Research tab. Hidden when nothing runs. The running research node gets a blinking (pulsing glow) border; `prefers-reduced-motion` gets a steady highlight instead.
**Acceptance:** UI tests: chip on the Generators tab shows name and time left; click switches to Research; node has the running animation class.

### 0.73 — Room meter redesign and expansion animation — CODE — Done
**Goal:** apply playtest 7 feedback: the segment build-in still looks odd (segments wrap onto new lines and shift).
**Details:** replace the segment grid with one fixed-width bar: used room (green, red at 90%+) and free room. After an expansion, the newly added share of the bar appears as an amber striped "under construction" section that slides in over about 1 s, holds, then turns into normal free room by 2 s. Still derived only from `lastExpansionAt`; reduced motion shows the final state. Tick marks every 10 room keep scale readable.
**Acceptance:** tests for the new segment phase logic; no layout shift (bar width fixed); screenshots in the PR.
**Done notes:** the owner's video (received mid-item) showed the old segment meter wrapping onto a second row and scaffold segments jumping between rows, and at times reappearing. The new bar replaces it; a browser check sampling every 50 ms shows the animation starts once, grows, ends at about 2 s and never returns. Stripes are CSS (AAP-64 amber and dark brown); the `capacity_*` sprites are no longer used by the bar but stay in the manifest.

### 0.74 — More room expansion tiers — CODE — Done
**Goal:** apply playtest 7 feedback: more room tiers (finite).
**Details:** add tiers 4 to 8 in `src/data/rooms.ts` with growing size and cost (energy, metal, stone, later coal). Total stays finite. Room panel shows "Expansion N of 8".
**Acceptance:** tests that tiers go in order, costs grow, and the last tier ends expansion; pacing probe still has no stall.

### 0.75 — Resource boost research — CODE — Done
**Goal:** apply playtest 7 feedback: research that boosts the other resources and gives discounts there.
**Details:** new bonus types: `resourceProduction` (all producers), per-resource production for metal and stone, `producerDiscount` (cheaper producers), `fuelEfficiency` (generators burn less fuel). About 6 research nodes in the Materials category, following the duration rule. Bonuses apply in the simulation, producer costs and fuel use; resource rate tooltips list the boosts like the energy tooltip does; the Bonuses panel shows them.
**Acceptance:** tests for each new bonus type, stacking and caps; tooltips show boosts; pacing probe has no stall.
**Done notes:** six nodes: Better Pickaxes (+25% metal), Controlled Blasting (+25% stone), Conveyor Belts (+15% all producers), Modular Mines (−15% producer cost, shares the build-discount cap), Efficient Boilers (−20% fuel), Deep Drilling (+20% all producers). 48 h probe: all 22 research done by about 25 h, room tiers 4–7 by about 20 h, no stalls; tier 8 stays a long-term goal.

### 0.76 — Save-on-close safeguard — CODE — Done
**Goal:** apply playtest 8 feedback: nothing done just before closing the tab is lost.
**Details:** the save storage also writes every save synchronously to a `localStorage` backup (with a timestamp) at the moment zustand saves; the IndexedDB write stays the main save and records its own timestamp when it completes. On load, whichever copy is newer wins. Works if `localStorage` is unavailable (falls back to IndexedDB only). Reset clears both.
**Acceptance:** unit tests for choosing the newer copy and for missing or corrupt copies; the e2e smoke test reloads right after an action under a 20× CPU slowdown and the action survives.

### 0.77 — Floating research chip — CODE — Done
**Goal:** apply playtest 8 feedback: the research chip sits oddly between the energy display and the button; it should float at the bottom of the screen without ever covering the version footer.
**Details:** the chip becomes `position: fixed` at the bottom center (with safe-area padding on phones); while it shows, the page gets matching bottom padding so scrolling to the end reveals the footer above it. Same content and click behavior as before.
**Acceptance:** UI test that the chip is rendered in the floating container and the page gets bottom padding only while research runs; browser check that the footer is visible at the bottom of the scroll with the chip shown.

### 0.78 — Third starting research: Basic Mining — CODE — Done
**Goal:** apply playtest 8 feedback: the tree should start from three basic research, one of them starting the resource upgrades.
**Details:** new level-1 root "Basic Mining" (+10% output from all producers, needs a Solar Panel built like Basic Solar, so starting energy cannot be stranded). Better Pickaxes, Controlled Blasting and Modular Mines now require Basic Mining instead of Standard Parts. Duration follows the rule (level 1, shorter than every level-2 research).
**Acceptance:** the tree has three roots (Basic Solar, Basic Mining, Fossil Fuels 101); data tests (duration rule, reachability) pass; pacing probe has no stall.

### 0.79 — Fix: welcome back after switching tabs — CODE — Done
**Goal:** fix playtest 9 bug: after switching to another browser tab and coming back, the summary always says "You were away for 1m 1s".
**Details:** cause: background tabs throttle the 1 s heartbeat to about once a minute, so every throttled tick looked like a return and replaced the summary. Fix: the summary after a page load comes only from the first catch-up tick; while the tab is hidden, the engine snapshots the state when it was hidden and, on return (if hidden for at least `WELCOME_BACK_MIN_SECONDS`), shows one summary covering the whole time away (energy, resources, research done, generators out of fuel). Hidden-tab ticks never create summaries.
**Acceptance:** tests: a hidden period of 10 minutes made of 61 s ticks gives one summary of about 10 minutes; short hides give none; load catch-up still works.

### 0.80 — Fix: build-card tooltip unreadable — CODE — Done
**Goal:** fix playtest 9 bug: hovering a lower build card shows its tooltip over the card above, see-through and hard to read.
**Details:** locked cards fade with `opacity`, which also faded their tooltip and trapped it below neighboring cards. Fade the card's content instead of the card, give tooltips a solid background, a border and a stacking order above every card.
**Acceptance:** tooltip of a locked card is fully opaque and above other cards (UI test checks the tooltip is outside the faded wrapper; screenshot in the PR).

### 0.81 — Research tree in branches — CODE — Done
**Goal:** apply playtest 9 feedback: the lines in the tree are hard to follow; split the tree so each of the three starting research leads its own branch.
**Details:** the layout groups each research under the root it descends from (through its first prerequisite) and stacks the branches as horizontal bands, each with a label and a divider; within a band, columns by depth. Lines inside a band stay short; the few cross-branch prerequisites are drawn fainter.
**Acceptance:** layout tests: every node is in its root's band, bands do not overlap, prerequisites are to the left; a 30-node tree still lays out without overlaps.

### 0.82 — 100% completion includes max upgrades — CODE — Done
**Goal:** apply playtest 9 answer: perfection means every generator type built and upgraded to its max level.
**Details:** permanent records in the save (`records.builtTypes`, `records.bestLevel` per type) updated by building and upgrading, so scrapping never lowers completion. Completion gains a "Generator types at max level" part. Save migration fills the records from current generators. Re-run the simulator and record hours to 100% in the report.
**Acceptance:** tests for the records (build, upgrade, scrap keeps them, migration) and for completion; report updated.
**Notes:** save version 6. The simulator now raises every type to max level after research and room are done; 100% completion moved from about 25 h to about 52 h, no stalls (see BALANCE_REPORT.md). Each new best level counts as a simulator milestone for stall detection.

### 0.83 — More click-power research — CODE — Done
**Goal:** apply playtest 10 feedback: more research that raises the energy gained per click.
**Details:** add 4 to 5 click-power research spread across levels (for example Ergonomic Handle, Flywheel, Geared Crank, Kinetic Capture, and a late one that adds a small fraction of current energy/s to each click). They live in the Energy & research branch after Hand-Crank Dynamo. Use the existing `clickPower` bonus type. If a "% of energy/s per click" effect is needed, add a new bonus type, `clickRateShare`, with a cap in `BONUS_CAPS`. All numbers go in `src/data/research.ts`. The click tooltip shows the breakdown. Durations follow the level rule.
**Acceptance:** each research raises the click value as described (unit tests); the duration-by-level data test passes; the simulator still meets its targets.
**Notes:** Ergonomic Handle, Flywheel and Geared Crank (click power); Kinetic Capture and Grid Tap (new `clickRateShare` bonus, a quarter second of energy/s per click each, capped at 0.5 s). The click tooltip shows the share.

### 0.88 — Player level from lifetime energy — CODE — Done
**Goal:** apply playtest 10 feedback: the player has a level based on the total energy produced over all time.
**Details:**
- **Tracking:** the save tracks `lifetimeEnergy`, the total energy ever produced: generators, clicks and offline gains, never reduced by spending. Save migration starts it at the current energy.
- **Level curve:** a pure `getPlayerLevel(lifetimeEnergy)` uses a curve in `src/data/playerLevel.ts`. The energy needed grows geometrically, so a level arrives every so often across the whole 200 h. The curve is checked with the simulator, which reports level against hours.
- **Display:** the top bar shows "Player level N" with a progress bar to the next level. Its tooltip gives the lifetime energy and how much is needed for the next level. The label is kept clearly distinct from the Research level.
- **Level-up:** a celebration, which reuses the research celebration style.
- **Rewards:** none at first, like achievements. PLAYTEST asks the owner whether levels should give a small bonus, for example +1% energy per level with a cap.
**Acceptance:** lifetime energy grows with production and clicks, online and offline, and never drops when spending (unit tests). Level thresholds are monotonic (data test). The save migrates.
**Notes:** `lifetimeEnergy` in the save (version 8). The curve is in `src/data/playerLevel.ts`. The top bar shows the level with a progress bar, a tooltip and a "Level up!" badge. The simulator report has a Player level column. No gameplay reward yet; the owner is asked at the next playtest.

### 0.84 — Random events: framework and sightings — CODE — Done
**Goal:** apply playtest 10 feedback: random events make the game feel alive and unpredictable. This item adds the framework and harmless "sightings" that are fun to discover.
**Details:**
- **Data:** events are listed in `src/data/events.ts`, each with an id, name, text, rarity tier, `when` and an effect list (empty for sightings).
  - Rarity tiers are common, uncommon, rare and legendary, with rough chances per hour of play kept in one table there. Legendary is meant to be a real surprise, for example a few times in 100 hours.
  - `when` is `foreground` (only while the game screen is visible) or `anytime` (can also roll while idle or offline).
- **Rolls:** a pure `rollEvents(state, seconds, rng)` is called by the idle engine. It is timestamp-based and takes a seeded RNG, so it is testable. Offline catch-up rolls only `anytime` events, and the number of events per catch-up is capped.
- **Sightings:** at least 10 cosmetic events, for example:
  - a small spaceship crossing the screen;
  - a flock of birds past the wind turbines;
  - a shooting star;
  - an aurora tint on the top bar;
  - a rainbow over the dam;
  - a lost balloon;
  - a cat walking along the room bar;
  - a UFO beam (legendary);
  - a meteor shower;
  - a whale passing the tidal station (needs tidal built).
- **Look:** each sighting is a short CSS or sprite animation that never blocks clicks. A discovered sighting is recorded in the save (`seenEvents`, with a count and first-seen time) for a later collection or achievement.
- **Settings:** an option to reduce motion turns the animations off but keeps the records.
- **Sprites:** new generic sprites go through the manifest and the generator script.
**Acceptance:** with a fixed seed, rolls are deterministic and match the rarity table over many simulated hours (tests). Foreground events never roll offline. Seen events persist through save, migration and reload.
**Notes:**
- **Content:** 11 sightings in 4 rarity tiers (per event, per hour of on-screen play: common 0.2, uncommon 0.07, rare 0.02, legendary 0.003), all `foreground` for now; `anytime` events come with 0.85. In total, about one sighting per hour on screen; the UFO about once in 330 hours.
- **Rolls:** at most one event per tick and three per catch-up. They use a seeded RNG in tests.
- **Saving:** `seenEvents` is saved (version 9).
- **Display and settings:** the Completion tab lists "Sightings discovered" (not counted toward 100%, since legendary ones are luck). Settings has "Reduce motion": no animation, a toast instead.
- **Sprites:** 8 new generic sprites under `sprites/events/`.

### 0.85 — Random events with effects — CODE — Done
**Goal:** apply playtest 10 feedback: some random events change the game, some for the better and some for the worse.
**Details:** add at least 12 effect events on the 0.84 framework, with a mix of positive and negative ones, each with a clear message in the event log (0.38) and a toast:
- **Positive:** Sunny spell (+50% solar for 10 min), Strong winds (+50% wind), Rich seam (a free batch of metal or coal), Government grant (energy equal to 10 minutes of output), Eureka (the running research is 10% faster), Volunteer crew (the next build is 20% cheaper).
- **Negative** (playtest 12: slightly rarer than positive ones): Overcast (−30% solar for 10 min), Calm air (−30% wind), Coal shortage (−20% coal mine output for 15 min), Grid fault (one random generator off until the player restarts it), Pipe leak (lose a little gas or oil), Equipment wear (−10% output for 10 min).
- **Rules:**
  - Effects are temporary bonuses stored with an end timestamp (`activeEffects`) and applied in `deriveRates` and the producer system. Timed effects that roll offline are applied for their real overlap with the offline period.
  - Negative events are milder and never block progress: no permanent loss, and resource losses are capped at a small share of stock.
  - Some only roll when relevant, for example Calm air only if the player owns wind turbines.
- **Display:** the energy and resource tooltips list active effects with the time left.
- **Balance:** the simulator gets a deterministic expected-value mode, so pacing stays testable.
**Acceptance:** each effect applies and expires correctly, including across offline time (unit tests). Negative events cannot push a resource below 0 or remove anything permanently. The simulator still meets its targets.
**Notes:**
- **Events:** 13 effect events in `src/data/events.ts`, all `anytime`.
- **Timed effects:** saved in `activeEffects` (save version 12) with an end time. Modifiers live in `src/utils/effectMods.ts` and are applied in the energy rate and production. They expire inside `advanceTime`, so offline time counts them exactly.
- **Instant effects:** `applyEventEffect` in `src/utils/eventEffects.ts`.
- **Requirements:** solar or wind built, a running research, two running generators, gas or oil in stock, a coal mine.
- **Display:** chips under the energy display with time left; the energy and resource tooltips list each event; the boost badge shows the overall change, up or down.
- **Deviations:** "Volunteer crew" became +50% producer output for 15 minutes instead of a next-build discount, which would need a new build-cost path. The simulator runs without events instead of an expected-value mode (see BALANCE_REPORT.md).

### 0.86 — Grid Contracts: a second activity — CODE — Done
**Goal:** apply playtest 10 feedback: the extra hours should come partly from a new kind of activity, not only more research and machines.
**Details:**
- **Contracts:** a Contracts tab offers up to 3 contracts at a time. Each asks the player to deliver something by a deadline, for example "Supply 50K energy within 2 hours", "Deliver 300 stone and 200 metal", or "Keep 5 coal plants running for 1 hour".
- **Delivery:** delivered energy and resources are spent.
- **Rewards:** the player picks a reward:
  - a resource bundle;
  - a temporary boost (reuses 0.85's `activeEffects`);
  - Contract Points, a new currency for a small shop of permanent perks (for example +1 contract slot, longer deadlines, a cosmetic theme).
- **Generation:** contracts scale with the player's progress and refresh on a real-time timer, offline too. Failing or abandoning a contract has no penalty except the lost chance.
- **Completion:** 100% completion counts contract milestones (for example 10, 50 and 100 contracts done) and the perk shop.
- **Data and logic:** all numbers go in `src/data/contracts.ts`; game rules are pure functions with tests.
**Acceptance:** contracts generate, progress, complete and expire correctly online and offline (unit tests); the reward choice works; completion includes the new parts; the simulator models contracts and reports the hours they add.
**Notes:**
- **Rules:** pure functions in `src/utils/contracts.ts`, numbers in `src/data/contracts.ts`. The state is saved in `contracts` (save version 13).
- **Kinds:** energy, resources and produce; produce contracts complete by themselves.
- **Timing:** offers fill on a real-time timer and catch up after an absence, one per missed interval up to the slots.
- **Rewards:** materials, a boost (the timed `contract_boost` effect) or points. 4 perks.
- **Completion:** contract milestones (10/50/100/200) and perk levels.
- **Simulator:** plays contracts with a seeded random source; 100% in about 102 h.
- **Tabs:** the tab bar now scrolls sideways on phones (7 tabs).

### 0.92 — Energy pets: collect and grow — CODE — Done
**Goal:** apply playtest 11 feedback: another light activity besides contracts. The player collects pets and grows them. Pets fit the energy theme (no dragons and the like) and stay simple.
**Details:**
- **Pets:** about 8 pets on the energy theme, for example a hamster on a wheel, an electric eel, a firefly swarm, a solar tortoise, a wind-up robot dog, a static-charged cat, a glowing jellyfish and a magnetic beetle.
- **Finding pets:** each is found through a rare event (0.84 framework), a contract reward (0.86), or a milestone such as building a type or reaching a player level.
- **Growing:** a pet grows through 3 stages (baby, young, adult) by being "fed" energy or a resource over real time, offline too.
- **Bonus:** one active pet gives a small themed bonus that grows with its stage, for example the eel +2/4/6% hydro and tidal output.
- **Display and completion:** a Pets panel shows the collection, with unfound pets as silhouettes. Completion counts pets found and pets fully grown.
- **Data and sprites:** all numbers go in `src/data/pets.ts`; sprites (3 stages each) go through the manifest and the generic script.
**Acceptance:** finding, feeding and growing work online and offline (unit tests); one active pet's bonus is applied and shown; completion includes pets; save migration.
**Notes:**
- **Data and rules:** `src/data/pets.ts` and `src/utils/pets.ts`; save version 14.
- **Pets:** Wheel Hamster (click), Firefly Swarm (solar, rare event), Solar Tortoise (solar and wind), Electric Eel (hydro and tidal), Wind-up Robot Dog (all producers), Static Cat (all energy, rare event), Magnetic Beetle (metal) and Glowing Jellyfish (uranium).
- **Mechanics:** feed, then wait (real time, offline too); one active pet.
- **Bonuses:** energy and production bonuses go into the effect modifiers; the click bonus goes into the click value.
- **Display:** a new Pets tab with silhouettes and hints.
- **Sprites:** 24 generic sprites under `sprites/pets/`.

### 0.87 — Multi-platform release plan: website, Steam, mobile — CODE — Done
**Status note:** Superseded by the owner's launch guide.
**Goal:** apply playtest 10 feedback: the owner wants to release on a dedicated website, on Steam and on mobile, with Melvor Idle-style saves across devices. This item makes a plan so the rollout goes smoothly. It builds no packages.
**Details:** write `docs/RELEASE_PLAN.md` covering:
- **Platforms:**
  - **Website:** custom domain on GitHub Pages or another static host.
  - **Steam:** an Electron or Tauri wrapper. Covers Steamworks SDK, achievements mapped to 0.65, Steam Cloud versus our own cloud save, and the store page checklist.
  - **Mobile:** Capacitor for Android and iOS. Covers the store accounts, signing, and privacy and data-safety forms.
- **Shared code:** one codebase, with a thin platform layer (`src/platform/`) for storage, the app lifecycle (pause and resume for offline gains), links and in-app purchases if ever wanted.
- **Saves:** how 0.67 and 0.68 fit in, so the same account loads on every platform.
- **Owner's steps:** the exact one-time steps only the owner can do: Steam partner fee, Apple and Google developer accounts, domain purchase, signing keys.
- **Timeline:** an order of steps, each with its blocking owner action.
- **Code now:** also add the `src/platform/` interface with the web implementation only, so later wrappers plug in without touching game logic.
**Acceptance:** the plan document is reviewed in the PR; the platform interface is in place with web implementation and tests; nothing needs secrets or platform tooling.
**Notes:** `docs/RELEASE_PLAN.md` covers the platforms and costs, the shared code with a thin platform layer, how 0.67 and 0.68 cloud saves work on every platform (Steam Cloud left off), the website, Steam (Tauri recommended), mobile (Capacitor), and an order of steps marking what only the owner can do. `src/platform/` has the interface and the web implementation (background and resume, external links); the idle engine now uses it for background handling. Tests added.

### 1.00 — Clearer contract perk shop — CODE — Done
**Goal:** apply playtest 14 feedback: the perk shop raised questions. Is the number on "Buy" a cost or an amount? How are points earned? Is every contract worth 1 point?
**Details:**
- **How points work:** a short box at the top of the shop: you earn Contract Points by choosing "Contract Points" as the reward when a contract is done, 1–3 points by size (★ = 1, ★★ = 2, ★★★ = 3), and you spend them here on permanent perks.
- **Buttons:** they read "Buy for N points" (or "Need N more points").
- **Perk effect:** each perk shows its current and next effect, for example "Slots: 3 → 4".
- **Contract cards:** each card shows how many points it would give.
- **Guide:** updated to match.
**Acceptance:** the shop shows the explanation, the costs say "points", and the button names the shortfall (component tests). The points reward on a card matches `contractRewards`.
**Notes:** a "How Contract Points work" box (choose points as the reward; ★/★★/★★★ = 1/2/3; the button number is the price). Buttons read "Buy for N points" or "Costs N points · need M more". Each perk shows its effect now and next (`perkEffectText`), and multi-level perks say "level 1 of 2". Contract cards show "🏅 N pts". The header reads "N Contract Points", and the Guide is updated.

### 1.03 — Sort generators by "upgradable first" — CODE — Done
**Goal:** apply playtest 14 feedback: a sort that shows first the generators the player can afford to upgrade right now.
**Details:** a new "Upgradable first" option in the Sort by menu. Upgrades affordable now come first, then generators not yet at max level, then maxed ones; ties keep your order. It re-sorts as energy and resources change and uses the same rule as the Upgrade button. View only; fuel priority is unchanged.
**Acceptance:** sorting order unit tests.

### 1.04 — Site map: see your machines on a map — CODE — Done
**Goal:** apply playtest 14 feedback: show the player's builds on a map, each taking space by its size. First step of three; it changes nothing about balance.
**Details:**
- **Map tab:** a new Map tab, a pixel-art tile grid. Each generator and producer occupies a footprint that matches its room cost (for example solar 2 tiles = 1×2, a dam 8 tiles = 2×4).
- **Placement:** new builds take the first free spot that fits. Existing saves place everything automatically on load (save migration).
- **Room:** room capacity stays the same number but is now visibly the number of usable tiles. Unbought expansion areas show as fenced-off land.
- **Interaction:** hovering a machine shows its name and output; clicking it jumps to it in the generator list.
- **Sprites:** the existing generator and producer sprites are drawn on the tiles, plus generic ground tiles via the manifest and the generator script.
- **Performance:** fine at 500+ tiles on a phone, using CSS grid or canvas.
**Acceptance:** every built machine appears once, with its footprint, and none overlap (unit tests on a pure placement function). Old saves get a valid layout. The map renders at 360 px and 1280 px.
**Notes:**
- **Map tab:** 16 tiles wide, one tile per unit of room.
- **Footprints:** every machine covers exactly its room cost, as square as possible and filled row by row (`footprint`). Pure `layoutSite` places them first-fit and falls back to single tiles when the site is fragmented, so it never overlaps (tests).
- **Interaction:** hover or focus shows name, level, output and tiles; clicking a generator jumps to it in the list and flashes it.
- **Locked land:** two rows of fenced land preview the next expansion.
- **Sprites:** new generic tile_ground and tile_locked.
- **Deviation:** the layout is calculated each time instead of saved, so no save migration is needed yet. Saved positions arrive with moving machines in 1.05.

### 1.05 — Larger, detailed map: terrain zones, rivers and coast, moving machines — CODE — Done
**Goal:** apply playtest 14 and 15 feedback: some areas suit some machines better, and the player can move machines on the map. Playtest 15: the map should be larger overall and more interesting to look at, not one repeated tile.
**Details:**
- **Size and look:** a larger map (wider and taller than today's grid, scrolling if needed) drawn with varied terrain tiles: grass, dirt, rock, sand, water, a river that winds across it and a coastline along one edge. Small details (rocks, tufts, ripples) are scattered with a fixed seed so the map looks the same on every visit. New tile sprites go in the manifest and the generic asset script.
- **Zones:** terrain zones in `src/data/map.ts`: sunny plateau (solar +), windy ridge (wind +), river (hydro only, +), coast (tidal only, +), coal or gas field (producers +), and plain (neutral).
- **Bonuses:** a machine gets its zone's bonus only if its whole footprint is inside the zone. Bonuses are moderate (+10–25%) and shown in the energy breakdown as "Placement".
- **Restrictions (confirmed in playtest 15):** hydro must be on the river and tidal must be on the coast. A machine built without a free spot of its zone waits unplaced until one is free (shown clearly), so building is never silently blocked.
- **Moving:** drag a machine on desktop, or tap it then tap a target on a phone. Free, and the game checks for overlap. A "best spot" hint highlights good tiles for the selected machine.
- **Game rules:** pure functions with tests.
**Acceptance:** zone bonuses apply only with the whole footprint inside the zone (tests); moving checks overlap and zone rules; the bonus shows in the breakdown; existing saves keep working (machines start on plain unless placed).
**Notes:**
- **Map:** 24 columns plus 2 of open sea, at least 10 rows; the site grows down it row by row and the land beyond is drawn dimmed behind a dashed fence. Terrain: plain, sunny plateau and windy ridge patches (4×3, seeded), a 4-wide river that bends every 3 rows, and a 3-wide coast. Seeded rocks, tufts and flowers on land. The first row is plain, with a plateau and a ridge close by.
- **Zones:** plateau +20% solar and ridge +20% wind, when the whole machine stands on it. Hydro needs at least half its tiles on the river and tidal half on the coast; fully on it gives +10%. Shown as "Placement on the map" in the energy breakdown, 📍 in Your generators, and ⭐ on the map. Generator cards say "Must be built on the river" or "+20% on a sunny plateau".
- **Placement:** new machines go on plain land, keeping the zones free. Hydro and tidal go to their zone automatically. Moving solar or wind onto its zone is the player's choice.
- **Moving:** click a machine, then a tile. A green or red footprint previews the spot, and bright tiles give a bonus. The first move pins every machine where it stands, so the layout stays as arranged and new machines fill free tiles. Saved as `mapPins` (save version 17).
- **Deviations:**
  - Click-then-click instead of dragging; it works the same on desktop and phones.
  - A hydro or tidal build with no free spot in its zone is blocked with "No free spot on the river/coast" instead of waiting unplaced.
  - No coal or gas field zone for producers yet (producer bonuses would need a per-producer production change).
- **New sprites:** tile_plateau, tile_ridge, tile_river, tile_coast, tile_sea, deco_rock, deco_tuft, deco_flower.
- **Simulator:** about 114 h to 100% (was 112). Layouts are cached; a full run takes about 7 s.

### 1.14 — Tooltips on the map ⭐ and the 📍 placement marks — CODE — Done
**Goal:** apply playtest 16 feedback: hovering the ⭐ on the map or the 📍 in Your generators explains it.
**Details:** a small tooltip (hover and keyboard focus, `role=tooltip`) naming the zone, the bonus and the rule, for example "Sunny plateau: +20% energy, because the whole Solar Panel stands on it". The 📍 tooltip says the same and that the Map tab is where machines are moved.
**Acceptance:** both marks show the tooltip on hover and focus (component tests).

### 1.17 — New solar and wind built on their bonus zone; machines stay put once built — CODE — Done
**Goal:** apply playtest 16 feedback: a new Solar Panel or Wind Turbine goes onto a free plateau or ridge spot when there is one; machines already on the map never move by themselves.
**Details:** placement of new machines prefers the bonus zone for solar and wind (hydro and tidal already go to theirs). Each new machine, generator or producer, is saved where it lands (`mapPins`), so building, scrapping or expanding never moves others. Old saves are pinned the first time the map changes. The player can still move anything.
**Acceptance:** a new solar lands fully on a free plateau spot when one exists (tests); existing machines keep their tiles after new builds and scraps (tests); the simulator gets the bonus.
**Notes:**
- Every machine is pinned where it lands (`deriveRates` settles the pins), and pins of scrapped machines are dropped.
- **One exception to "never moves":** machines other than dams may stand on the river (and others than tidal stations on the coast) when the site is crowded. They give way only when a new dam or station needs that spot; otherwise an early crowded site would block hydro for good (the simulator's first dam slipped from 5 h to 24 h). The zone text says so.
- **Starting land:** the first row is plain, and the first room expansion (about 17 min) opens a windy ridge and a sunny plateau. Early rates are unchanged and the zones arrive almost at once.
- **Simulator:** it now reaches "Own 50 generators at once" on purpose at the end, by building Solar Panels; before, it only got there by chance. About 112.6 h to 100%, no stalls.

### 1.16 — Drag and drop to move machines on the map — CODE — Done
**Goal:** apply playtest 16 feedback: drag a machine to a new spot.
**Details:** pointer events (mouse, pen and touch), so it works on phones too: press on a machine, drag, and the footprint preview follows the pointer (green or red, bright on bonus tiles); release on a valid spot to move. Click-then-click still works, and keyboard users keep the select-then-tile flow. No new dependency.
**Acceptance:** dragging moves a machine to a valid spot and does nothing on an invalid one (component tests with pointer events); a plain click still selects.
**Notes:** the drag starts after 6 px of movement, so a tap still selects. The tile under the pointer keeps its place in the machine (grab offset). Any drop ends the move, and an invalid drop says why. Checked in Chromium with real mouse events. Touch scrolling is off only when the drag starts on a machine.

### 1.15 — More variety in the small map details — CODE — Done
**Goal:** apply playtest 16 feedback: more kinds of small objects on the map.
**Details:** new generic detail sprites, chosen by terrain: bushes, tree stumps, mushrooms and logs on plain land; cacti and dry grass on plateaus; boulders and wind-bent grass on ridges; reeds and lily pads on the river; shells and driftwood on the coast; an occasional boat or buoy on the sea. Still seeded, so the map looks the same on every visit, and drawn under machines.
**Acceptance:** every terrain has at least two kinds of details (test); sprites in the manifest and the generic asset script.
**Notes:** 17 kinds of details, 14 of them new. Chances and kinds per terrain are in `DETAILS` (`src/data/map.ts`).

### 1.18 — Producer zones: fields and outcrops that boost mines, quarries and wells — CODE — Done
**Goal:** apply playtest 16 feedback: zones that boost producers, like the generator zones.
**Details:** new terrain patches: a coal field (Coal Mines +20%), a rocky outcrop (Quarries and Metal Mines +20%), and an oil and gas field (Gas Wells and Oil Rigs +20%), when the whole producer stands on it. New producers are placed on a free spot of their zone when there is one, like solar and wind (1.17). The bonus shows in the resource breakdown as "Placement on the map", with ⭐ on the map. New tile sprites for the new zones.
**Acceptance:** production rises only for producers fully on their zone (tests); the breakdown total matches the real rate; the simulator gets the bonus; old saves load.
**Notes:**
- **Zones:** Coal field (Coal Mines), Rocky outcrop (Quarries, Metal Mines and Uranium Mines; uranium added because it is a mine too), and Oil and gas field (Gas Wells and Oil Rigs). Each gives +20%.
- **Patches:** chances are now plateau 20%, ridge 20%, coal field 10%, outcrop 10% and oil and gas field 8%. Fixed patches keep an outcrop, a coal field and an oil field near the top. Existing maps change shape where random patches changed, but pinned machines stay where they are.
- **How the bonus counts:** a resource's bonus is the average over all its producers, so 2 of 4 coal mines on a field give coal +10%. Producers granted by research are not on the map and count as 0.
- **Where it shows:** "Placement on the map" in the resource breakdown, ⭐ on the map, and a zone hint on producer cards.
- **Sprites:** tile_coalfield, tile_outcrop, tile_oilfield.
- **Simulator:** about 119 h to 100%, no stalls.

### 1.19 — Tooltips drawn on top of the page, never cut off — CODE — Done
**Goal:** fix the playtest 17 bug: the 📍 tooltip in Your generators opened to the side and was cut off by the scrolling list.
**Details:** a shared `FloatingTip` component draws the tip on top of the page (a portal with fixed position). It is centered above its anchor, goes below when there is no room above, and is kept inside the screen. Used for 📍 and the map ⭐.
**Acceptance:** the tip is not inside the scrolling list and shows on hover and keyboard focus (component test); checked at 600 px wide in Chromium.

### 1.20 — No zone slivers too narrow for a machine — CODE — Done
**Goal:** fix the playtest 17 bug: where the river or coast cut a patch, a strip 1 or 2 tiles wide was left. A Solar Panel (2 wide) or a Wind Turbine (3 wide) could never stand fully on it, so the bonus was impossible there.
**Details:** in each row, a zone piece narrower than `MIN_ZONE_RUN` (3, the widest machine that wants a zone) after the river and coast becomes plain land. Pinned machines stay put; their bonuses follow the terrain.
**Acceptance:** a test scans 60 rows: every zone tile belongs to a run of at least 3 in its row. Simulator: about 110 h, no stalls.

### 1.21 — Active bonuses can be opened and closed — CODE — Done
**Goal:** apply playtest 17 feedback: the Active bonuses list in the Research tab gets long.
**Details:** the panel opens and closes from its header, which shows the count. Closed, it keeps a one-line summary of each bonus (icon and total). The choice is remembered on this device.
**Acceptance:** opening, closing, the summary and remembering are covered by a component test.

### 1.06 — Map polish: expansions grow the map, simulator and balance — CODE — Done
**Goal:** finish the map: room expansions open new land with its own terrain mix, and the simulator places machines sensibly.
**Details:**
- **Expansions:** each room tier unlocks a named area (for example "North Ridge", windy) with a preview before buying.
- **Simulator:** moves solar and wind onto their bonus zones (as a good player would, since 1.05 does not do it automatically), so pacing reflects good play; then re-run and tune.
- **Display:** a mini-map in the Generators tab and a zone legend.
- **Guide:** a Map section.
**Acceptance:** the simulator report includes placement bonuses; no stalls; expansion areas have tests.
**Notes:**
- **Expansions:** the Room panel previews the land the next expansion opens, by terrain (for example "36 plain, 24 river, 12 windy ridge"). It replaces named areas, since the site grows row by row through a single landscape.
- **Simulator:** placement on zones was already handled by 1.17 (new machines go to their zone), so the simulator gets the bonuses. About 110 h, no stalls.
- **Guide:** the Map section explains zones, the river and coast rule, placement and moving. The Map tab already has the zone legend.
- **Skipped:** the mini-map in the Generators tab; the Map tab covers it and the owner has not asked for it.

### 1.07 — Browser notifications, opt-in and rate-limited — CODE — Done
**Goal:** apply playtest 14 feedback: notify the player outside the game (browser notifications now, mobile later) when something worth coming back for happens, such as a research done or a level up. Handled carefully, because too many notifications are annoying.
**Details:**
- **Off by default.** Settings has a "Notifications" section with a master switch. Turning it on asks the browser for permission only at that moment, never on load.
- **Per-type toggles:** research complete (on), player level up (off), contract complete (on), pet grown (on), fuel ran out (on), rare sighting missed (off).
- **When:** only while the game is in the background (`platform.isBackground()`); never while the player is looking.
- **Limits:** at most `MAX_PER_HOUR` (default 3) per hour, collapsed into one summary when several arrive together ("Research done: Hydropower, and 2 more"). Quiet hours are optional.
- **Code:** a pure `selectNotifications(events, settings, history, now)` decides what to send, with tests. Sending goes through the platform layer (`platform.notify`), so a mobile wrapper can use native notifications later. A closed tab cannot notify on the web; the item notes this, and mobile push is planned with the app.
**Acceptance:** nothing is sent without opt-in and permission; nothing is sent while visible; the rate limit and per-type switches work (unit tests); the summary text is correct.
**Done notes:** Settings → Notifications (`NotificationSettings.tsx`), off by default; switching it on asks for permission then, and stays off if refused. Types: research complete, contract complete, pet grown, fuel ran out (on); player level up (off). "Rare sighting missed" was left out: sightings only happen while the game is on screen, so there is never one to miss. `selectNotifications` (`src/utils/notifications.ts`) picks by each entry's 1.40 icon; `MAX_PER_HOUR` in `src/data/notifyRules.ts`. Sending goes through `platform.notify`; the hourly count lives in memory (resets on reload). No quiet hours (optional). A closed tab cannot notify on the web; mobile push comes with the app. Save version 21.

### 1.08 — Map: machines no longer overlap — CODE — Done
**Goal:** fix the playtest 15 bug: a coal plant (#32) drew as a huge box over many other machines.
**Details:** when a machine's footprint could not fit as one rectangle, its tiles were scattered and the drawn box spanned all of them. Now each machine picks an exact rectangle when one fits (for example 10 tiles = 5×2, 12 = 4×3), big machines are placed first, and every tile is drawn on its own with the sprite on the machine's main block, so a machine never covers another's tiles.
**Acceptance:** tests check the shapes and that each machine's sprite sits inside its own tiles.

### 1.09 — Amber accent visible; American English everywhere — CODE — Done
**Goal:** apply playtest 15 feedback: the default Amber accent seemed to do nothing, and the text mixed American and British spelling.
**Details:** Amber now draws a yellow ring around the energy display like the other accents. All text, comments and docs use American spelling (color, center, gray, behavior, and so on); `CLAUDE.md` gains a Language rule. The Gray clouds event keeps its id, so saves are unaffected.
**Acceptance:** every accent changes the display; no British spellings remain in the UI.

### 1.10 — Readable event notices: longer toasts, exact effect on hover, saved log — CODE — Done
**Goal:** apply playtest 15 feedback: event messages disappeared too fast to read, the effect chips did not say exactly what they did, and an event seemed missing from the log.
**Details:**
- Event and achievement toasts stay 12 seconds (others 6), and pause while the pointer or focus is on them.
- Each active effect chip has an ⓘ tooltip (hover or keyboard focus) with the name, the exact effect in numbers for your current machines (for example "−30% energy from Solar Panels: −0.15 energy/s from your 1 running") and the time left.
- The event log is kept on this device across reloads (the latest 100 entries), so an event you missed is still there later. Reset clears it.
**Acceptance:** tests for toast durations, the effect text and the saved log.

### 1.11 — Pet bonuses shown in the click and rate breakdowns — CODE — Done
**Goal:** fix the playtest 15 bug: the Wheel Hamster's +100% click bonus seemed to do nothing.
**Details:** clicks did get the pet's bonus, but the "+2 per click" label, the click pop-up and the click breakdown ignored it, and so did the energy and resource breakdowns for other pets. All of them now include the active pet as a "(pet)" row, so the label and the pop-up match what a click really gives. The simulator also counts the click pet.
**Acceptance:** tests check that the click breakdown with a pet matches the real click value and that a generator pet shows in energy/s with the right total.

### 1.12 — Map events you can watch on the map — CODE — Done
**Goal:** apply playtest 15 feedback: some random events happen only while the Map tab is open and visibly do something on the map.
**Details:**
- **Events:** a handful, in `src/data/events.ts` with a `mapOnly` flag, for example: a flock of birds crossing (cosmetic), a lightning strike on a machine that briefly boosts it, a delivery truck driving to a producer that drops a small stack of resources, a river flood that slows hydro for a few minutes, a small fire on a coal plant to click and put out for a reward.
- **Rolling:** only while the Map tab is visible, at a rate tuned so a player watching the map sees one every few minutes; rarity tiers as for other events.
- **Display:** animated on the map at the affected machine or tile (CSS only, honoring reduced motion), with the usual toast and log entry. Clickable ones give their reward only when clicked.
- **Rules:** picking and applying stay pure functions with tests.
**Acceptance:** map events never roll on other tabs (tests); each event's effect matches its text; the sightings list in Completion includes them.
**Notes:**
- **Six events:**
  - Birds over the site (cosmetic).
  - Lightning strike: +50% from the struck generator's type for 3 minutes; the type is saved with the effect.
  - Delivery truck: 15 minutes of the target producer's resource.
  - Small fire at a coal plant: click within 30 s for 5 minutes of energy.
  - River flood: dams −20% for 5 minutes; needs hydro.
  - Falling star at sea (rare, cosmetic).
- **Rolling:** only while the Map tab is open and the page is visible, checked every 5 s from the real time passed. Rates (common 5/h each, uncommon 2.5/h, rare 1/h) give one every few minutes.
- **Display:** CSS animations at the target, off with reduced motion, plus the usual toast and log entry. Icons are emoji stand-ins (no new sprites).
- **Deviation:** Completion has no sightings list (sightings feed bonus achievements only), so map events are not added there.

### 1.13 — Map decorations as cosmetic rewards — CODE — Done
**Goal:** apply playtest 15 feedback: decorations make the map more personal.
**Details:** decorations (trees, a pond, a windsock, a statue, a flag, lamp posts) unlocked by achievements, levels and contracts, with no effect on balance. The player places them on free tiles and can remove them; they take no room. New sprites go in the manifest and the generic asset script. Saved with a migration.
**Acceptance:** unlocking and placing tested; decorations never block machines; old saves load.
**Done notes:** six decorations in `src/data/decorations.ts`: Tree (player level 5), Company flag (5 achievements), Pond (10 contracts), Windsock (15 achievements), Lamp post (player level 20), Founder statue (50 contracts); up to 6 of each. A Decorations box under the map: pick one, click free site tiles; 🧹 Remove clears them. Saved as `mapDecorations` (tile → id, save version 20). The layout ignores them; one under a machine is hidden and shows again if the machine moves. Rules in `src/utils/decorations.ts`. New sprites: `decor_tree`, `decor_flag`, `decor_pond`, `decor_windsock`, `decor_lamp`, `decor_statue`. Placing is by pointer only (no keyboard tile cursor for decorations yet).

### 1.01 — Cosmetic rewards for achievements — CODE — Done
**Goal:** apply playtest 14 feedback: achievements give cosmetic rewards, nothing that changes balance.
**Details:**
- **Titles:** unlocking certain achievements gives a title, for example "Live Wire", "Grid Operator" or "Proud Keeper". The player picks one to show under the player level in the top bar.
- **Accent colors:** at 5, 15, 25 and 36 achievements unlocked, a new accent color for the top bar's energy number and level bar unlocks (amber is the default).
- **Settings and saving:** the choices are in a Cosmetics section of the Achievements tab and saved in settings. Each achievement card says what it unlocks.
- **No gameplay effect:** a test checks that rates are unchanged.
**Acceptance:** titles and colors unlock with their achievements (unit tests); choosing one updates the top bar and survives a reload; locked ones cannot be chosen.
**Notes:**
- **Titles:** 16 title achievements; the chosen one shows under the player level.
- **Accents:** 5 accent colors (amber, then emerald at 5, sky at 15, violet at 25, rose at 36 achievements) color the energy number and outline the top bar.
- **Where:** a Cosmetics box at the top of the Achievements tab; cards say which title they unlock.
- **Saving:** in `settings.cosmetics` (save version 16); the store refuses locked choices.
- **No gameplay effect:** a test checks that rates are unchanged.

### 1.02 — Release plan ordered from easiest to hardest — CODE — Done
**Goal:** apply playtest 14 feedback: the owner has not chosen an order yet, but prefers to release from the easiest platform to the hardest, to get to production as soon as possible.
**Details:**
- **Order:** reorder `docs/RELEASE_PLAN.md`'s steps by effort and owner cost:
  1. The website on GitHub Pages: already live; a custom domain is optional.
  2. A web-game portal such as itch.io: free, uploads the same build.
  3. Android: $25, a closed test.
  4. Steam: $100, store review.
  5. iOS: $99 a year, a Mac.
- **Per step:** the time to production and what blocks it.
- **Deferred work:** say which steps can go live before accounts and cloud saves (0.67/0.68) are ready (all of them, with local saves and export/import), so nothing waits on the backend.
**Acceptance:** the plan document is updated, and the order and reasons are clear.
**Notes:** `docs/RELEASE_PLAN.md` section 6 now has a table ordered by effort and cost: website (live), itch.io, Android, Steam, iOS. Each step has cost, time to live and blockers. Every step can go live with local saves before accounts exist; cloud saves arrive later as an update. itch.io was added to the summary table.

### 0.98 — Fix: meteor shower and shooting stars fly the wrong way — CODE — Done
**Goal:** fix the playtest 13 bug: in the meteor shower, meteors moved against their own trail, so they looked like they were falling backwards.
**Details:** the meteor sprite has its glowing head at the bottom right and its trail up to the left, but the animation moved it down and to the left. Shooting stars had the same mismatch: their bright end trailed behind the motion. Every streak must move in the direction of its bright head, with its trail behind.
**Acceptance:** a screenshot check shows the meteors and stars head first. The animation direction matches the sprite (one shared direction constant or a comment in both places).
**Notes:** meteors now move down-right at 45° (their head is bottom right) and start from the left half. Shooting stars tilt 30° down and move along that tilt toward their bright end. The CSS uses equal units so the angle holds on any screen; a comment in `src/index.css` explains the rule. Checked with screenshots.

### 0.97 — Contracts explain delivery versus production — CODE — Done
**Goal:** apply playtest 13 feedback: it was unclear why two contracts showed "Not enough yet" and one did not.
**Details:**
- **Labels:** each card shows its kind clearly. "Delivery": you hand over energy or materials you have, and they are spent. "Production": counts energy your generators make from now on; nothing is spent, and it completes by itself.
- **Amounts:** delivery cards show "You have X of Y" for each item, and the button says what is missing (e.g. "Need 60K more energy").
- **Overlap note:** when two delivery contracts need the same thing, a short note says each one is paid separately.
**Acceptance:** the labels and the "need N more" text are correct for each kind (component tests).
**Notes:** each card has a "Delivery" or "Production" badge. Delivery cards say "You have X of Y" and that delivering spends it; the button names what is missing ("Need 74K more energy"). Production cards show the progress made so far and say nothing is spent. A note appears when two deliveries need the same thing. Helpers `contractShortfall` and `sharesNeed`, with tests.

### 0.99 — Pets react when clicked — CODE — Done
**Goal:** apply playtest 13 feedback: clicking a pet plays a short animation.
**Details:** clicking or tapping an owned pet's picture plays a 2–3 second animation: a hop or wiggle plus a few themed particles (sparks for the eel and the cat, glow for the firefly and the jellyfish, hearts otherwise). It is purely cosmetic and respects Reduce motion. Clicks while it plays are ignored.
**Acceptance:** clicking a pet adds the animation class and it clears after the duration (component test); no animation with Reduce motion on.
**Notes:** clicking an owned pet plays a 2.5 s hop and wiggle with 5 rising particles that suit the pet (sparks for the eel and the cat, ✦ for the firefly and the jellyfish, ❤ for the hamster, and so on). Clicks during the animation are ignored; Reduce motion turns it off.

### 0.95 — Player levels harder to gain early — CODE — Done
**Goal:** apply playtest 12 feedback: level-ups should stay celebrated, but levels must not come in seconds. Clicking from level 1 to level 4 or 5 should not be possible.
**Details:** retune the curve in `src/data/playerLevel.ts` so level 2 needs a couple of hundred lifetime energy (well over a minute of fast clicking). The curve grows a little less steeply after that, so level 99 still lands near the 200 h target as content grows. Check with the simulator. Saves keep their lifetime energy; the level is recalculated, so it may go down once on load, with no celebration for that.
**Acceptance:** level 2 needs at least 100 seconds of clicking at 2 clicks per second at the base click value (test). Thresholds rise strictly with level. The report's Player level column shows the new pacing.
**Notes:** the curve is 200 × (L − 1)^3.56. Level 2 needs 200 energy; level 10 about 500K; level 99 about 2.5B. In the simulator, level 6 comes at 3 h and level 53 at 100% (67.7 h).

### 0.96 — Sort your generator list — CODE — Done
**Goal:** apply playtest 12 feedback: sorting options for "Your generators".
**Details:**
- **Options:** a "Sort by" control above the list: your order (default, the fuel-priority order), most or least energy per second, level (high or low), type and name.
- **View only:** sorting changes only what is shown; the saved order, which decides fuel priority, never changes. While a sort other than "your order" is active, ▲ ▼ reordering and dragging are hidden, with a short note.
- **Saving:** the choice is kept in settings.
**Acceptance:** each sort orders the list correctly, and switched-off generators count as 0 energy/s (unit tests for a pure sort helper). The saved order is unchanged by sorting (test). The choice survives a reload.
**Notes:** pure `sortGenerators` in `src/utils/generatorSort.ts`, with 6 options (your order, most or least energy/s, highest or lowest level, type). The choice is saved in `settings.generatorSort` (save version 11). While sorted, ▲▼ and dragging are hidden and a note says fuel still follows your order. "Name" is covered by "Type" (same type, then build number).

### 0.89 — Fix: short numbers lost their zeros — CODE — Done
**Goal:** fix the playtest 11 bug: 360,722 energy showed as "36K" in short notation.
**Details:** `threeSig` in `src/utils/format.ts` trimmed trailing zeros even when there was no decimal point. So "360" became "36", and likewise 100K showed as "1K" and 200M as "2M". Trim zeros only after a decimal point.
**Acceptance:** regression tests for round values (360K, 100K, 50K, 200M, 2e17) plus a sweep check that short notation always agrees with the full number to 3 significant digits.

### 0.93 — Fix: research chains jump rows in the tree — CODE — Done
**Goal:** fix the playtest 11 bug: Geared Crank, Kinetic Capture and Grid Tap were drawn on the Hydropower row instead of continuing Flywheel's line.
**Details:** the layout packed every column from the top, so a lone child moved to the first free row. Now each node takes the free row nearest the average row of its prerequisites.
**Acceptance:** the click chain stays on one row (test); a lone child sits on its parent's row (test); no overlaps.

### 0.94 — Research tree lines as a trunk with branches — CODE — Done
**Goal:** apply playtest 11 feedback (the owner's sketch): a parent's lines should leave as one trunk that splits into its children, not as a fan of curves.
**Details:** lines between neighboring columns are drawn squared off, with rounded corners: out of the parent, along a vertical trunk in the gap, then into each child. When several parents in one column have bent lines, each gets its own trunk position; lower parents take the left positions, so lines do not share or cross trunks. Lines that skip columns or cross branches stay as faint curves.
**Acceptance:** a screenshot check of the whole tree shows no shared trunks; build and tests pass.

### 0.90 — Player level reward, celebration and welcome-back line — CODE — Done
**Goal:** apply playtest 11 feedback on player levels.
**Details:**
- **Reward:** each player level above 1 gives +0.1% energy from all generators. The value and a cap are in `src/data/playerLevel.ts`. It shows in the energy breakdown tooltip and the Bonuses panel as "Player level N".
- **Celebration:** a level-up during live play gets a celebration like "Research complete!", reusing that component and its queue; the small badge goes.
- **Welcome back:** the welcome-back summary after time away lists the levels gained, for example "Player level 12 → 15".
- **Simulator:** it applies the bonus.
**Acceptance:** the bonus is applied in the energy rate and the breakdown (unit tests); a live level-up queues one celebration per level reached; the away report includes levels gained (tests); the simulator still meets its targets.
**Notes:**
- **Bonus:** applied through `getEnergyBonuses` (research plus level) in `deriveRates`, on the generator cards and in the breakdown and Bonuses panel. Rates are re-derived when a level is reached (tick or click).
- **Celebration:** the research celebration now also shows "Level up!". Several quick level-ups merge into one for the highest level. The small badge is gone.
- **Welcome back:** shows "Player level A → B".
- **Tests:** tests of other mechanics turn the bonus off with `vi.mock`.
- **Simulator:** 100% in about 66.5 h (was 81.5 h).

### 0.91 — Sightings stay longer on screen — CODE — Done
**Goal:** apply playtest 11 feedback: the owner's game recorded an Aurora that the owner never noticed, so sightings should be harder to miss.
**Details:**
- **Duration:** every sighting lasts at least 15 seconds, and moving ones cross the screen more slowly (durations in `src/data/events.ts`).
- **Hidden tab:** a sighting that rolls while the tab is hidden waits until the tab is visible again, so it is not played to nobody.
- **Notice afterwards:** after a sighting, a small "✨ You spotted: Aurora" notice stays in the event log and as a toast, so a player who looked away still learns about it.
- **Frequency:** unchanged (owner: about one per hour of on-screen play is right).
**Acceptance:** duration minimum enforced by a data test; a sighting started while hidden is shown only when visible (test); the toast appears for sightings.
**Notes:**
- **Duration:** every sighting lasts 15–20 s (`MIN_SIGHTING_MS`), so moving ones cross more slowly. The shooting star and meteor shower show several streaks over that time.
- **Hidden tab:** the timer runs only while the page is visible, so a sighting waits for the player to return.
- **Notice:** a "You spotted: …!" toast appears when one ends.
- **Frequency:** unchanged.

### 0.48 — Offline cap to 24 hours — CODE — Done
**Goal:** apply playtest 1 feedback: offline gains should be credited for up to 24 hours, not 8.
**Details:** set `MAX_OFFLINE_SECONDS` in `src/data/time.ts` to 24 hours. Update the offline-cap mention in `PLAYTEST.md` and any test that relies on the old value. Keep click value and click feedback unchanged (owner is happy with them).
**Acceptance:** a gap longer than 24 h credits exactly 24 h of production; a 12 h gap is credited in full; tests pass.

### 0.00 — Create the project from scratch — CODE — Done
**Goal:** a working, buildable game skeleton that shows something on screen.
**Details:** the repo contains only `CLAUDE.md`, `BACKLOG.md` and `GETTING_STARTED.md`. Create the project: Vite + React + TypeScript, Tailwind, Zustand with `persist`, localforage as the storage backend, Vitest. Folders: `src/components`, `src/store`, `src/assets`, `src/utils`, `src/types`, `src/data`, plus `scripts/`. Initial state: `energy` 0, `resources` (coal, stone, metal, naturalGas all 0), `researchLevel` 1, `activeGenerators` [], `roomCapacity` 10, `roomUsed` 0. An `EnergyDisplay` component showing the energy total with its icon (generate a simple 32×32 lightning-bolt PNG at `src/assets/sprites/energy_currency_icon_32.png` and record it in `src/assets/generic-assets.json`; item 0.27 generalizes this). `.gitignore` covering `node_modules`, `dist` and editor files. npm scripts: `dev`, `build`, `preview`, `test`. One smoke unit test so `npm test` is meaningful from day one.
**Acceptance:** from a clean clone, `npm install`, `npm run build` and `npm test` all pass; `npm run dev` renders the energy display with its icon; no TypeScript errors.

### 0.04 — Idle calculation and time progression engine — CODE — Done
**Goal:** energy grows over time, and the game credits progress made while it was closed.
**Details:**
- Store: `energy`, `lastSavedTimestamp`, `totalProductionPerSecond`, `applyIdleGains(deltaSeconds)` which adds `totalProductionPerSecond * delta` and updates `lastSavedTimestamp`.
- `totalProductionPerSecond` defaults to 1 so there is something to see before generators exist. **Item 0.07 replaces this default with the value computed from built generators.**
- Persistence: Zustand `persist` with localforage (IndexedDB) as the storage backend.
- Hook `useIdleEngine` in `src/utils/idleEngine.ts`: on mount, apply offline gains for the time since `lastSavedTimestamp`; then a 1-second heartbeat. **Compute each delta from `Date.now()`** rather than assuming exactly 1s, so throttled background tabs stay accurate. Clamp negative deltas to 0 and cap offline gains with a named constant. Clear the interval on unmount.
- `src/App.tsx` calls `useIdleEngine()` at the top and renders `EnergyDisplay`.
**Acceptance:** build passes; counter rises about 1 per second; after a refresh it includes time passed; tests cover delta calculation, negative delta, very large gap, and the cap.

### 0.26 — Clicker — CODE — Done
**Goal:** the player can click to gain energy manually.
**Details:** `clickEnergy` action; click value in `src/data/player.ts` so research can boost it later; click button with press feedback.
**Acceptance:** each click adds the configured amount; rapid clicking works; unit test for the action.

### 0.22 — Web build and GitHub Pages deploy — CODE — Done
**Goal:** the game is live at a URL, so playtests need only a browser.
**Details:** Vite only (no Webpack). Set `base` in `vite.config.ts` to `/<repo-name>/`, taking the repo name from the git remote rather than guessing. Do not add lossy image compression (it damages pixel art). Add `.github/workflows/deploy.yml` that builds and deploys with the official GitHub Pages actions on pushes to `main`, and `.github/workflows/ci.yml` that runs `npm test` and `npm run build` on pull requests. No script that pushes to `main`.
**One-time owner step (does not block anything):** set the repo's Pages source to "GitHub Actions". Until then, workflows still pass and this item counts as done.
**Acceptance:** `npm run build && npm run preview` serves a working game under the base path; both workflow files are valid; the PR states the expected Pages URL.

### 0.37 — README and local-run instructions — CODE — Done
**Goal:** anyone can clone the repo and run the game without asking questions.
**Details:** create or update `README.md` with: what the game is (3 to 5 lines); the live GitHub Pages URL; **Run locally** (install Node.js 20 or newer, `npm install`, `npm run dev`, then open the printed `http://localhost:5173` address); **Other commands** (`npm run build`, `npm run preview`, `npm test`, and later `npm run check:assets` and `npm run simulate`) each with one line of explanation; project layout (one line per top-level `src/` folder); where the game numbers live (`src/data/`); how to replace a stand-in sprite with real art; how to reset a save (clear site data, or the in-game reset once 0.29 exists); a pointer to `BACKLOG.md`, `CLAUDE.md` and `PLAYTEST.md`. Keep it short and accurate: do not document commands that do not exist.
**Acceptance:** every command in the README runs successfully from a clean clone; no broken links.
**Standing rule:** whenever a later item adds, renames or removes a script or changes how the game is run, update `README.md` in that same item.

### 0.27 — Generic sprites, asset index and asset check — CODE — Done
**Goal:** every sprite in the manifest exists as a real PNG, so UI work looks complete and real art can replace it later with no code change.
**Details:**
- `scripts/generate-generic-assets.mjs` (Node, no AI tools; use `pngjs` or built-in `zlib`) draws flat pixel-style sprites at the exact manifest sizes and paths, each with a distinct silhouette and color: solar panel (blue grid in a frame), wind turbine (tower and three blades), coal plant (block with smokestack), dam, gas plant (tanks and pipes), tidal station, resource icons, producer buildings, expansion scaffolding, research icons (bolt, gear, gauge, atom), lock, check, progress segment, tileable blueprint-grid panel, capacity segments. Colors from AAP-64. Inactive variants are the same sprite desaturated by 40%. Transparent backgrounds. Deterministic output.
- The script **never overwrites a file it did not create**: it may regenerate anything listed in `src/assets/generic-assets.json` (with `--force`), and never touches a file that is not listed, since an unlisted file is real art the owner added. It records every file it creates in that JSON, including the energy icon from 0.00.
- `src/assets/index.ts` exports a typed `sprites` object (asset ID to Vite-imported URL). Components use it and never hard-code paths. A missing ID must be a TypeScript error, not a runtime one.
- `npm run check:assets` verifies each manifest sprite exists, is a PNG and has the right dimensions, and lists which are still generic. Non-zero exit only for missing or malformed files.
**Acceptance:** every manifest entry resolves to a real file; replacing a PNG with real art of the same size needs no code change; `check:assets` behaves as described; unit test for output sizes.

### 0.19 — State management by slices — CODE — Done
**Goal:** modular, typed store, done while the store is still small.
**Details:** slices in `src/store/slices/`: `energySlice` (energy, energyPerSecond), `resourceSlice` (resources, producers), `generatorSlice` (activeGenerators, availableGenerators), `researchSlice` (currentResearch, completedResearch, researchLevel), `roomSlice` (roomCapacity, roomUsed, expansionLevel), `settingsSlice` (preferences; no audio). Combine in `src/store/index.ts` with `persist` and `devtools`. Typed selectors in `src/store/selectors.ts` (`getTotalEnergyRate`, `getAvailableRoom`, `getUnlockedGenerators`). Types in `src/types/state.ts`. Components use selectors, not direct store access. Add a persisted-state version number and a migration hook so later changes do not break saves.
**Acceptance:** build and tests pass; no behavior change; no duplicated calculations.

### 0.11 — Resource system — CODE — Done
**Goal:** resources are produced, stored and consumed. Comes before generators, since generators cost resources.
**Details:**
- `src/utils/resourceSystem.ts`: `gatherResource`, `consumeResource` (returns success boolean), `canAfford`.
- Producers (data in `src/data/producers.ts`): stone quarry (1 stone / 10s), metal mine (1 metal / 15s), **coal mine (1 coal / 20s)**. Coal is needed by the Coal Plant and by research, so it must have a source. The player starts with one quarry, one mine and one coal mine already running. Production uses the same timestamp-based idle path as energy, so it accrues offline.
- Starting resources: 15 metal, 10 stone, 0 coal, so the first generator is reachable within a minute or two.
- `ResourceDisplay.tsx` shows the inventory with icons, amounts and per-second rates.
- **Fuel consumption (absorbs old bug item 0.23):** generators with `maintenanceCost` consume their resource each minute. If there is not enough, the generator auto-deactivates, the store records a "resource depleted" state, and a warning is shown. This logic lives in `resourceSystem` / `generatorSystem`; there is no `coalPowerPlant.ts`.
**Acceptance:** tests for affordability, consumption success and failure, passive rates, offline accrual, and the depletion-to-deactivation path including the warning.

### 0.07 — Generator building and management system — CODE — Done
**Goal:** the player can build, activate and deactivate generators within room limits.
**Details:**
- `src/types/generator.ts`: `Generator` with `id`, `type` (enum SOLAR, WIND, COAL, …), `energyPerSecond`, `roomCost`, `buildCost`, `maintenanceCost` (resources per hour), `isActive`, `level`.
- `src/data/generators.ts`. First tier: Solar Panel (0.5 energy/s, 2 room, 10 metal), Wind Turbine (0.8 energy/s, 3 room, 15 metal + 5 stone), Coal Plant (2 energy/s, 5 room, 20 metal + 10 stone, 60 coal/hour which is 1 per minute).
- `src/utils/generatorSystem.ts`: `canBuildGenerator`, `buildGenerator`, `toggleGenerator`, `getGeneratorStats` (applies research bonuses once they exist).
- `src/utils/energyGeneration.ts` (pure): `calculateEnergyRate`, `getGeneratorEfficiency`. Both the store and the UI use these.
- **Replace the temporary `totalProductionPerSecond` default from 0.04** with the value computed from active generators. Keep the clicker as the only income at zero generators.
**Acceptance:** building deducts resources and adds room use; blocked without resources or room; inactive generators produce nothing; starting from a fresh save the player can build their first generator; unit tests for each function.

### 0.09 — Generator building UI — CODE — Done
**Goal:** UI for browsing, building and managing generators.
**Details:** `GeneratorCard.tsx` (sprite, name, energy/s, room cost, build cost, build button disabled when unaffordable or out of room), `GeneratorGrid.tsx`, `ActiveGenerators.tsx` (list with sprite, stats, toggle, status). Active/inactive sprite variants by `isActive`. Hover tooltips. Tailwind grid. Sprites only from `src/assets/index.ts`.
**Unlocking:** the grid filters by unlocked research. Until the research system (0.10) exists, all first-tier generators count as unlocked, so the game stays playable.
**Acceptance:** the full loop works in a browser (click for energy, gather resources, build a generator, watch energy rise, toggle it off); real art added later needs no code change.

### 0.10 — Research system and skill tree foundation — CODE — Done
**Goal:** timed research that unlocks generators and bonuses.
**Details:**
- `src/types/research.ts`: `id`, `name`, `description`, `requiredLevel`, `cost` (energy + resources), `duration` (seconds), `prerequisites`, `unlocks`.
- `src/data/research.ts`. Initial tree: Basic Solar (unlocks Solar Panel, level 1, 50 energy, 60s); Wind Power Fundamentals (unlocks Wind Turbine, level 2, 200 energy, 120s, requires Basic Solar); Fossil Fuels 101 (unlocks Coal Plant, level 2, 300 energy + 5 coal, 180s).
- `src/utils/researchSystem.ts`: `canStartResearch`, `startResearch`, `completeResearch` (applies unlocks and bonuses, increments `researchLevel`).
- State: `currentResearch` (id, startTime, duration), `completedResearch`, `researchLevel`. Timestamp-based, so research finishes during offline time and completes on next load.
- Bonus effect types from the start: build discount %, research cost reduction %, research speed %, global energy %, click power %.
- Turning on research gating removes the temporary "all first-tier unlocked" rule from 0.09. Set starting state so the first research is affordable within a few minutes of play.
**Acceptance:** prerequisites and level gates enforced; research completes offline; a fresh save can reach the first unlock without a stall; unit tests for gating, completion, level increase and bonus application.
**Note (playtest 2):** the owner wants the Solar Panel buildable at once, so Solar is unlocked from the start and Basic Solar gives +10% energy from all generators instead of unlocking it. It is still the first research and Wind's prerequisite. It also requires owning a Solar Panel (`requiresBuilt`), so the starting energy cannot be spent on research before the first generator; a pacing probe showed that left an idle player with no income.

### 0.13 — Research tree UI — CODE — Done
**Goal:** interactive skill tree.
**Details:** `ResearchTree.tsx` (SVG or Canvas connection lines), `ResearchNode.tsx` (category icon, name, level requirement, cost, lock and complete states), `ResearchPanel.tsx` modal (description, costs, duration, start button disabled when unaffordable or locked, progress bar while researching). Visual states: pulse when available, grayed when locked, green when completed. Sprites from the asset index. The layout must stay readable as the tree grows (0.33, 0.45): use a computed layout, not hard-coded coordinates.
**Acceptance:** starting research from the panel updates state and shows progress; a tree with 30 nodes still renders readably.

### 0.16 — Room expansion and capacity — CODE — Done
**Goal:** limited room that the player can expand.
**Details:** `src/utils/roomSystem.ts`: `canExpandRoom`, `expandRoom(tier)`. Tiers in `src/data/rooms.ts`: Tier 1 (+10 room; 500 energy + 50 metal + 20 stone), Tier 2 (+15; 2000 energy + 150 metal + 80 stone), Tier 3 (+25; 8000 energy + 400 metal + 200 stone). State: `expansionLevel` 0, `roomCapacity` 10. `RoomPanel.tsx`: usage bar, expansion button with costs, next-tier benefits. Block building when `roomUsed + roomCost > roomCapacity`. Warning at 90% or more.
**Acceptance:** expansion deducts costs and raises capacity; building blocked over capacity; unit tests.

### 0.20 — Mid-tier generators and room expansion UI — CODE — Done
**Goal:** more generators, plus visuals for room expansion.
**Details:** add to `src/data/generators.ts`: Hydropower Dam (5 energy/s, 8 room, 100 metal + 80 stone, level 5), Natural Gas Plant (8 energy/s, 10 room, 150 metal + 50 stone, 2 natural gas/hour, level 7), Tidal Power Station (6 energy/s, 9 room, 120 metal + 60 stone, level 6). **Natural gas needs a source:** add a gas well producer, or make natural gas a research-unlocked output of an existing producer. Cards show level requirements and a locked state. Add research entries so levels 5 to 7 are reachable. Room expansion: construction sprite fades in and out over 2 seconds; capacity meter from the segment sprites; tooltips on room mechanics.
**Absorbs old bug item 0.21:** the expansion animation is driven by the expansion state in `roomSystem` so it cannot desynchronize. Add a test for this.
**Acceptance:** every fuel-burning generator has a reachable fuel source; animation starts and ends with the expansion; locked generators display correctly.
**Done notes:** natural gas comes from a Gas Well granted by the Natural Gas Extraction research (1 gas / 10 min, fuels 3 gas plants). Research nodes Hydropower, Natural Gas Extraction, Tidal Power and Gas Turbines make levels 5 to 8 reachable. Generators gained a `requiredLevel` gate. Also added **Scrap** (remove a generator, no refund) because a pacing probe showed room fills with Solar Panels before mid-tier unlocks, which made them unbuildable.

### 0.36 — Smoke tests and CI — CODE — Done
**Goal:** catch regressions on every PR.
**Details:** end-to-end smoke test: load the game, click for energy, build a generator, start research, reload, verify state persisted. Use Playwright if its browsers install in the cloud environment; if not, use React Testing Library with jsdom for the same flow and note the limitation in the PR. Add the smoke test to the CI workflow from 0.22.
**Acceptance:** CI runs unit tests, smoke test and build on pull requests; no real-time waits (use fake timers or injected time).

### 0.28 — Save safety and offline summary — CODE — Done
**Goal:** progress is safe and understandable.
**Details:** export the save as a JSON file; import with validation (reject corrupt or wrong-version files with a clear message, without touching the current save). Save schema version and migration functions (started in 0.19), tested against an old-version fixture. "Welcome back" modal after offline time: time away, energy gained, research completed, generators that ran out of fuel.
**Acceptance:** export, reset, import restores the exact state; corrupt file rejected safely; migration test passes.
**Done notes:** export/import live in a new Settings tab (0.29 adds reset and preferences there). Importing sets the save time to the moment of import, so no offline gains are credited for the time between export and import. The welcome-back summary appears after at least 60 s away (`WELCOME_BACK_MIN_SECONDS`) and says when the 24 h cap applied. On phones, inactive tabs show only their icon so four tabs fit at 360 px.

### 0.29 — Number formatting and settings screen — CODE — Done
**Goal:** big numbers stay readable and the player has basic controls.
**Details:** `formatNumber` (999, 1.2K, 3.4M, up to a scientific-notation threshold) used everywhere energy, resources and rates appear. Settings screen: reset save with two-step confirmation, export and import buttons from 0.28, number notation preference, and a note on the offline gain cap. No audio settings.
**Acceptance:** unit tests at boundaries (0, 999, 1000, 1e6, 1e15, negative, NaN); reset works; preference persists.
**Done notes:** three notations: short (default, 3 significant digits, K/M/B/T, scientific from `SCIENTIFIC_THRESHOLD` = 1e15), scientific, and full. Values are cut off, never rounded up, so the display never shows more than the player has. NaN shows "—".

### 0.30 — Permanent-boost research — CODE — Done
**Goal:** research that improves the whole game, as the design describes.
**Details:** about 8 research entries in the Efficiency and Materials categories using the bonus types from 0.10. Each has a level requirement and prerequisites. Bonuses of one type add together, with a named cap for discounts. A "Bonuses" panel shows what is active. Numbers are first guesses, tuned in 0.35.
**Acceptance:** tests for stacking and the cap; bonuses visibly change costs and rates; panel correct.
**Done notes:** eight entries: Hand-Crank Dynamo (+100% click), Standard Parts (−5% build), Lab Notebooks (+10% research speed), Grant Funding (−10% research cost), Smart Grid (+10% energy), Bulk Purchasing (−5% build), Automated Labs (+15% research speed), Superconductors (+15% energy); levels 3–7, durations follow the "higher level takes longer" rule. Active bonuses panel on the Research tab. Pacing probe: all 16 research done within 24 h of idle play, no stalls.

### 0.31 — Resource producers use room — CODE — Done
**Goal:** room constrains resource production too.
**Details:** quarry, mine and coal mine become buildable producers taking room (default 1 each, data-driven) and costing energy and resources. The player still starts with one of each already built. Rates scale linearly with count. Update the resource display and room panel. Re-check early pacing with 0.35.
**Acceptance:** building a producer deducts costs and room; a fresh save is still playable; tests for rate scaling and room checks.
**Done notes:** new Producers tab. Each producer costs energy + resources, growing ×1.15 per one owned (`PRODUCER_COST_GROWTH`); quarry, mine and coal mine take 1 room, the gas well 2 and needs Natural Gas Extraction. Base room raised 10 → 13 so the three starting producers do not shrink the room for generators (save migration adds 3 to existing saves). Resource rates got the hover breakdown (producers, fuel burned, net), as asked in playtest 3. New generic sprite `producers/gas_well.png`.

### 0.35 — Balance simulator — CODE — Done
**Goal:** tune pacing with numbers, since Claude cannot feel the game.
**Details:** `npm run simulate` runs a headless simulation using the pure game functions and a simple greedy player (occasional clicks; buys the best affordable item by payback time; researches when affordable) for 24 simulated hours. It writes `BALANCE_REPORT.md`: time to the first generator, time to each unlock, room and resource stalls. Targets in `src/data/pacingTargets.ts`. Owner targets so far: research much slower than first guesses (playtest 3), and **at least 200 hours of play for 100% completion once the game is finished** (playtest 8); the simulator must report hours to 100% completion so this can be tracked as content grows. Tune data files until targets are met within about 30% and record changes in the report. Owner playtest feedback overrides these targets.
**Acceptance:** deterministic; finishes in under 60 seconds; report generated; targets met or deviations explained.
**Done notes:** `src/sim/balanceSim.ts` (pure, tested), `scripts/simulate.ts` via `tsx`. It runs until 100% completion (cap 400 h) rather than 24 h, so the owner's 200 h target can be tracked. First run: all near-term targets met with no stalls; 100% completion at about 25 h, explained in the report's tuning log (content-limited; tuned in 0.47). Adds `src/utils/completion.ts`, the groundwork for 0.66.

### 0.32 — Generator upgrades — CODE — Done
**Goal:** machines improve without taking more room.
**Details:** use the `level` field. Upgrade cost and output growth formulas in the data file; max level per generator. Upgrade button and level display on cards. Research bonuses apply on top.
**Acceptance:** tests for cost growth, output growth and max level; room cost unchanged by upgrades.
**Done notes:** `UPGRADES` in `src/data/generators.ts`: max level 10, +25% base output per level, energy cost ×1.6 and resources ×1.3 per level. Each row in the generator list shows the level and an Upgrade button (cost and gain in a tooltip). The simulator found and this item fixed a room bug: producers granted by research now take no room. Late room tiers were re-costed; see the tuning log in `BALANCE_REPORT.md`.

### 0.33 — Tier 3 generators and wider tree — CODE — Done
**Goal:** more energy sources and a fuller research tree.
**Details:** Oil Power Plant and Nuclear Fission Plant, with new resources `oil` and `uranium`, their own producers and fuel use. Fill the Materials, Efficiency and Advanced Tech categories with nodes and prerequisites. Guideline: each tier gives roughly 2 to 3 times the energy per room of the previous one, at higher build and fuel cost. All numbers in data files. Add sprites to the manifest and the 0.27 script. Re-run 0.35 and tune.
**Acceptance:** new generators build, run, consume fuel and deactivate when out; research gates work; simulator targets still met.
**Notes:** Oil (level 9) and Nuclear (level 10) plants; oil and uranium resources; Oil Rig and Uranium Mine producers; 7 new research in materials, efficiency and advanced. New generic sprites: oil_plant(+inactive), nuclear_plant(+inactive), resource_oil, resource_uranium, producer_oil_rig, producer_uranium_mine. Save version 7. Simulator: 100% in about 82 h, no stalls.

### 0.34 — Late-game fictional generators, with two more room tiers — CODE — Done
**Goal:** the few fictional methods the design promises; the owner's first priority after accounts (playtest 18), aimed also at the 200-hour target.
**Details:**
- **Generators:** Fusion Reactor and Micro-Supernova (a supernova in a fast-time micro dimension). They need a high research level, take a large room and cost, and give large output. Fiction stays a minority of methods.
- **Fuel:** Fusion burns a new resource, deuterium, from a new producer (a Deuterium Extractor, granted once by research and then bought).
- **Research:** a new late branch, "Experimental physics", with a few nodes, including boosts for the two new generators.
- **Room:** room tiers 9 and 10, so the map grows enough to hold them.
- **Sprites:** through the manifest and the generic asset script.
- **Balance:** re-run the simulator and tune, aiming to move 100% toward 200 hours with content rather than slower pacing.
**Acceptance:** buildable late in the tree; unit tests; the simulator report includes them, with no stalls; old saves load.
**Notes:**
- **Fusion Reactor:** 200 energy/s, 16 room, burns 1 deuterium/h, research level 12.
- **Micro-Supernova:** 780 energy/s, 25 room, burns 2 deuterium/h, research level 14.
  - Each is about 2.5x the energy per room of the tier before.
  - Build costs use deuterium, not uranium (uranium choked the first tries).
- **Deuterium:** the Deuterium Extractor makes 1 every 6 minutes from 3 room; the first is granted by Heavy Water Extraction.
- **Research:** 5 nodes. Heavy Water Extraction, Fusion Ignition, Magnetic Confinement (fuel efficiency +10%), Fast-Time Dimension and Stellar Harvest (energy +15%).
- **Room:** tiers 9 and 10 add 180 and 240 room.
- **Saves:** save version 18.
- **Simulator:**
  - It now keeps fuel production 50% above use (at least 6/h), scrapping its weakest plant for room when needed.
  - It protects only the one generator it is raising to max level, and saves for that upgrade instead of spreading upgrades.
  - It scraps in batches (one recalculation), which brought a run from about 30 s to 15 s.
- **Result:** 100% at about **145 h** (was 112 h). First Fusion about 75 h, first Micro-Supernova about 96 h, both maxed by about 145 h. No stalls.


### 1.22 — Sign in with Google and Discord — CODE — Done
**Goal:** apply playtest 18 feedback: email sign-in, plus Google and Discord as options.
**Details:**
- **Buttons:** "Continue with Google" and "Continue with Discord" in the Account panel, through the provider's OAuth sign-in. They show only for providers listed in a new repository variable `VITE_AUTH_PROVIDERS` (for example `google,discord`), so nothing broken appears before the owner turns them on in Supabase.
- **First sign-in:** an account made this way has no username yet, so a "Choose your username" dialog appears once (same rules, checked for uniqueness).
- **Owner steps:** added to `docs/PUBLIC_RELEASE.md`. Register an OAuth app with Google (Google Cloud console) and with Discord (Discord Developer Portal), paste each client ID and secret into Supabase → Authentication → Sign In / Providers, and set the variable.
**Acceptance:** tests with a fake service for the buttons, the redirect call and the username dialog; no secrets in the repository.
**Notes:** the code is done and tested with fakes. The owner turns it on with section 9b of `docs/PUBLIC_RELEASE.md` (register the Google and Discord OAuth apps, paste the keys into Supabase, add `VITE_AUTH_PROVIDERS`, rerun the deploy). The live sign-in check rides with 0.68's live test.

### 1.44 — Fix: a new device signing in could upload a blank game over the cloud save — CODE — Done
**Goal:** fix an owner bug report after playtest 21: after saving to the cloud, signing in from a new (incognito) browser did not load the cloud save, and "Load cloud save" seemed to do nothing.
**Details:**
- **Cause:** the sign-in decision compared the cloud save's time with the game on this device stamped "now" (`summarize(state, now)`). Within a minute of a cloud save (`SAME_SAVE_MS`), the blank new game counted as "the same save, and newer": it was kept and **uploaded over the cloud save**. "Load cloud save" then loaded that blank game. After a minute the player was asked, with the blank game marked "newer".
- **Fix (`decideOnSignIn`, `src/store/account.ts`):** the local time is never compared. No cloud save: keep and upload. A game that has not started (`isFreshGame`: no research done, nothing built, no room bought): load the cloud save. Cloud unchanged since this device last synced: continue. Otherwise ask, suggesting the save with **more progress** (label "(more progress)" instead of "(newer)").
**Acceptance:** a test of the exact scenario (cloud save made seconds earlier, fresh game signs in: the cloud save loads and stays untouched); tests for the suggestion; the build and all tests pass.

### 1.45 — Generate-energy button next to the pinned energy bar — CODE — Done
**Goal:** owner request after playtest 21: when the page is scrolled and the energy bar is pinned at the top (0.43), the player can no longer click for energy without scrolling back up.
**Details:**
- While the bar is pinned and the big "Generate energy" button is out of view, a small round button appears at the end of the pinned bar, in the same color as "Generate energy", with the ⚡ icon. Clicking it does exactly what the big button does (same click value, same floating "+N" feedback, same stats and tutorial step).
- It is hidden while the big button is on screen (an `IntersectionObserver` on it), so there are never two at once. At least 44 px to tap on touch screens; `aria-label="Generate energy"`; keyboard reachable.
- Reduce motion: no pop animation.
**Acceptance:** tests: the small button appears only when the big one is out of view and gives the same energy per click; the build and all tests pass; Playwright at phone width: scroll down, tap it, energy rises.
**Notes:** both buttons share `useClickEnergy` (`src/components/useClickEnergy.ts`); the small one is `MiniClickButton`. Its "+N" floats down instead of up, since it sits at the top of the screen.

### 1.46 — Cloud save from any tab — CODE — Done
**Goal:** owner request after playtest 21: "Save to cloud" is only in Settings; it should be reachable from everywhere.
**Details:**
- A small cloud button in the pinned top bar (only in builds with accounts): ☁️ with the sync state (signed out, saving, saved N minutes ago, error).
- Clicking it opens a small menu: **Save to cloud now**, **Load cloud save** (with the same confirmation as Settings), the last sync time, and "Account settings" (opens Settings → Account). Signed out, it offers "Sign in" (opens Settings → Account).
- Reuses `saveToCloud` and `loadFromCloud` in `src/store/account.ts`; no new cloud logic. The Settings panel keeps its buttons.
- At phone width it fits in the bar with no sideways scroll.
**Acceptance:** tests with the fake cloud service: the menu saves and loads from another tab; signed out it links to the Account panel; it is absent when the build has no cloud settings; the build and all tests pass.
**Notes:** `CloudButton` (`src/components/CloudButton.tsx`), sync wording in `src/utils/cloudStatus.ts`. Settings had no confirmation before "Load cloud save" yet, so one shared confirmation (`LoadCloudConfirm`) now guards it in both places. On phones the ⚡ and ☁️ buttons stack beside the bar so it never scrolls sideways.

### 1.47 — Decorations in a panel that opens over the map — CODE — Done
**Goal:** owner request after playtest 21: the Decorations box under the map (1.13) means scrolling down and back up while decorating.
**Details:**
- Replace the box under the map with a **🎨 Decorations** button in the map header. It opens a compact floating panel docked to the side of the map (a bottom sheet on phones) listing the decorations, with Remove and Close. The map stays visible and usable while it is open, so the player picks and places without scrolling.
- Closing the panel ends decorating. Escape closes it. Focus moves into the panel when it opens and back to the button when it closes.
- Locked decorations still show what unlocks them.
**Acceptance:** tests: the button opens and closes the panel; placing works while it is open; Escape and Close end decorating; nothing about decorations remains under the map; Playwright at 375 px: the panel fits and the map stays reachable; the build and all tests pass.
**Notes:** the panel is a non-modal dialog fixed to the bottom right (a bottom sheet up to 45% of the screen on phones); while it is open on a phone, extra space under the map lets it scroll above the sheet. Escape first cancels a machine move, if one is in progress. The e2e smoke test now clicks the big button by test id, since the small ⚡ (1.45) shares its name.

### 1.48 — Sprite quality pass: shadows, proportions, better map designs — CODE — Not started
**Goal:** owner request after playtest 21: the generated sprites can look better (for example shadows under the birds, better proportions, and the plainer map designs).
**Details:**
- Improve the drawing functions in `scripts/generate-generic-assets.mjs` (still generated by the script, AAP-64 colors; no hand-made or AI art), then regenerate with `--force` only the files listed in `src/assets/generic-assets.json`.
- Soft drop shadows (a darker, partly transparent shape offset down) for flying things on the map (birds, map star) and for buildings and producers; consistent top-left lighting.
- Proportions: machines on the map read at their tile size (for example the Nuclear Fission Plant, gas and oil plants), producer icons at the same scale as each other.
- Upgrade the weakest map art: decorations details, map event sprites, tiles that look flat.
- Sizes and file names stay the same, so no code changes; `npm run check:assets` passes. Before and after screenshots in the PR.
**Acceptance:** regenerated sprites pass the asset check; a screenshot comparison in the PR; the build and all tests pass.

### 1.49 — A designed loading screen for the website — CODE — Not started
**Goal:** owner request after playtest 21: the page shows nothing designed while the game loads.
**Details:**
- A loading screen drawn in `index.html` itself (inline CSS, no extra download), so it shows before the JavaScript runs: the game logo (1.50, or the energy icon until then), a pulsing energy bar and "Charging up…", on the game's dark background.
- It fades out when the game has loaded the save and drawn its first screen; it never shows for less time than needed or flashes on fast loads (skip the fade under 300 ms).
- Reduce motion (the `prefers-reduced-motion` media query, since settings are not loaded yet): no pulse.
- If loading fails (script error), the screen shows "Could not load the game. Reload the page." after a timeout instead of spinning forever.
**Acceptance:** Playwright: the loader is visible before the app mounts and gone after; a test that the failure message appears when the app does not start; the build and all tests pass.

### 1.50 — A dedicated MegaGen Idle logo — CODE — Not started
**Goal:** owner request after playtest 21: replace the plain "MegaGen Idle" text with a dedicated logo.
**Details:**
- A pixel-art wordmark made by the generic asset script (palette AAP-64): "MEGAGEN" in bold pixel letters with a lightning bolt, "IDLE" smaller below; transparent background. Sizes: `logo_wordmark` (about 192×48) for the header and loader, `logo_icon` (32×32) for the favicon and app icons later.
- Add both to the Asset manifest and `sprites`; the header uses the image with `alt="MegaGen Idle"`. The browser tab icon uses `logo_icon`.
- The real logo can replace these files later at the same size without code changes.
**Acceptance:** the header shows the logo with the right alt text; `npm run check:assets` passes; the build and all tests pass.

### 1.51 — Achievements for petting your pets — CODE — Not started
**Goal:** owner request after playtest 21: achievements for petting the pets a number of times.
**Details:**
- Count pet clicks (the click reaction from 0.99) in the saved stats as `petClicks` (migration: 0).
- New achievements, for example: Gentle Hand (pet 10 times), Best Friend (100), Pet Whisperer (1,000). Each shows progress like the others. No gameplay reward (cosmetic, like the rest); one may unlock a title (1.01).
- Rapid clicking counts, but at most a few pets per second, so an auto-clicker gains nothing special.
- Stats tab shows "Pets petted".
**Acceptance:** tests: clicks count (with the rate cap), the achievements unlock at their counts, old saves load with 0; completion totals update; the build and all tests pass.

### 1.52 — Store images from the current art — CODE — Done
**Goal:** owner request: store and brand images for Steam (and later the other stores and the website), composed by code from the existing generic sprites. This is not new art (CLAUDE.md rule 3): the script only places existing sprites on simple shapes.
**Details:**
- `npm run brand` (`scripts/generate-brand.mjs`) draws, in AAP-64 colors only, with pixel art scaled by whole numbers (nearest-neighbor):
  - `src/assets/brand/logo.png`: "MegaGen" over "Idle" and a small lightning bolt in a bold pixel font, electric yellow with a dark outline and a drop shadow, transparent background, 1280 px wide.
  - `src/assets/brand/app_icon_1024.png`: the energy icon over the coal plant on a dark blue rounded square, no text.
  - `src/assets/brand/key_scene.png` (1920×1080): the eight generators in energy-history order (Solar, Wind, Coal, Hydro, Tidal, Gas, Oil, Nuclear) on a hill under a dusk sky, joined by glowing yellow power lines.
  - `docs/steam/capsules/`: store header 920×430, small 462×174 (logo nearly fills it, readable at 120×45), main 1232×706, vertical 748×896; library capsule 600×900, library header 920×430, library hero 3840×1240 (scene only, generators inside the central 860×380), library logo (= logo.png).
- No text other than the game's name. Output is deterministic and always overwritten.
**Acceptance:** a test runs the script into a temporary folder and checks sizes, AAP-64-only opaque pixels, the transparent logo and icon corners, whole-number scaling of the icon, and that the committed images match; the build and all tests pass.
**Notes:** the iOS App Store icon must not have transparency; the 1024 icon has transparent rounded corners for Steam and the web. A store-specific opaque version can be added when the Capacitor item needs it.

### 1.64 — Fix: the Decorations button out of reach on a big map — CODE — Done
**Goal:** fix a playtest 22 report: on a big map, once you scroll down, the 🎨 Decorations button in the map header is gone (or hidden under the pinned top bar), so decorating means scrolling back up.
**Details:**
- The button now floats at the bottom right of the screen on the Map tab, so it is always reachable. On phones it sits above the research chip while research runs. The panel opens in the same corner (a bottom sheet on phones), and the button comes back, with focus, when the panel closes.
- The panel is never taller than the space under the pinned bar. Remove and Close stay pinned at its bottom.
**Acceptance:** Playwright at 1280×520 and 375×640, scrolled to the bottom of the map: the button is fully on screen and not covered, and the panel, ✕, Remove and Close are fully on screen (below the bar on wide screens); unit tests updated; the build and all tests pass.

### 1.65 — Map legend in a floating panel, like Decorations — CODE — Done
**Goal:** owner request after hotfix 22.1: the decorations panel now works as expected. The map legend (zones, their bonuses and machines, "Only zones on your site", and the "Dimmed land" note) still sits under the map, so on a big map you scroll down to read it and back up to use it. Give it the same treatment as 1.64.
**Details:**
- Replace the legend under the map with a floating **🗺️ Legend** button at the bottom right of the screen on the Map tab, next to (left of) the 🎨 Decorations button. It uses the same style and stays clear of the research chip on phones.
- It opens a non-modal panel in the same corner (a bottom sheet on phones), never taller than the space under the pinned bar. The panel holds everything the legend has now: the zone rows, the ⭐ explanation, the "Show all zones / Only zones on your site" toggle, the "Dimmed land: the next room expansion adds N tiles" note and the Exclusion Zone hint.
- Hovering or tapping a row still lights up that zone on the map (1.39); the map stays usable while the panel is open.
- Only one of the two panels is open at a time: opening one closes the other. Close, ✕ and Escape close it, and focus returns to its button.
- Nothing about the legend remains under the map.
**Acceptance:** tests: the button opens and closes the panel, a row still highlights its zone, opening Legend closes Decorations and the other way round, and nothing legend-related is under the map. Playwright at 1280×520 and 375×640, scrolled to the bottom of the map: both buttons fully on screen without overlapping each other or the research chip, and the panel fully on screen. The 1.39 legend test still passes (updated to open the panel). The build and all tests pass.
**Notes:** a shared `MapFloatingPanel` (`src/components/MapFloatingPanel.tsx`) now frames both panels; the legend panel is a little wider on computers and lists the zones in one column. Closing the legend clears the zone highlight. While a panel is open, both floating buttons step aside (the panel sits in their corner).

### 1.66 — Title tiers by difficulty, each with its own color — CODE — Done
**Goal:** owner request after hotfix 22.1: sort the unlockable titles (1.01) into tiers by how hard each one is to earn, and color each title by its tier.
**Details:**
- Five tiers, for example **Common, Uncommon, Rare, Epic, Legendary**, each with one color from the AAP-64 palette that reads well on the dark top bar (for example gray, green, blue, purple, gold). Tiers and colors live in a data file (for example `src/data/achievements.ts`), so balancing is easy.
- Give every current title (16 today, such as `energy_100k`, `level_25`, `research_all`, `maxed_all`) a tier. Base the tier on when the simulator (`npm run simulate`) reaches it, or on how rare it is for titles the simulator does not track (for example `sight_5`). Rough guide: within the first ~10 h Common, ~10-50 h Uncommon, ~50-120 h Rare, ~120-200 h Epic, near 100% completion Legendary. List the tier of each title in the PR.
- The chosen title in the top bar (`PlayerLevelBadge`) shows in its tier color; Legendary may get a subtle shine (off under Reduce motion).
- The title picker in Achievements → Cosmetics groups titles by tier, from highest to lowest, each with its tier name and color. Locked titles are listed too, grayed out with what earns them, so the player sees what to aim for.
- Achievements that give a title show the tier on their card.
- New titles added later (for example by 1.53 or 1.51) must declare a tier; a test checks every title has one.
- Cosmetic only: no gameplay effect.
**Acceptance:** tests: every title has a tier; the top bar title uses its tier color; the picker groups by tier and shows locked titles; colors are AAP-64 and readable (contrast at least 4.5:1 on the bar background); the build and all tests pass.
**Notes:** tiers and colors are `TITLE_TIERS` in `src/data/achievements.ts`: Common `#8b93af` gray, Uncommon `#9cdb43` green, Rare `#249fde` blue, Epic `#e86a73` rose, Legendary `#ffd541` gold. Epic is rose, not purple: no AAP-64 purple reaches 4.5:1 on the slate-800 bar, and the light lavender was too close to the gray. Tiers by simulated time (v0.23.0): Common: Live Wire (3.8 h), Apprentice (7.3 h). Uncommon: Power Station (21.8 h), Engineer (25.1 h), Trusted Partner (47.9 h). Rare: Chief Engineer (61.7 h), Energy Baron (100 h), Grid Operator (103 h), Human Dynamo (10,000 clicks), Sky Watcher (5 sightings). Epic: Grid Backbone (128 h), MegaGen (132 h), Proud Keeper (176 h). Legendary: Every Kind (228 h), Know-it-all (243 h), Perfect Machines (265 h). The picker is a select with one group per tier (locked titles disabled, with what earns them), plus a list of every title by tier under it.

### 1.67 — Map events in random places each time — CODE — Done
**Goal:** owner report after hotfix 22.1: some map events (the birds, the delivery truck) always seem to appear in the same place. Each appearance should be somewhere new, anywhere on the map.
**Details:**
- **Checked in the code:**
  - The birds (`map_flock`, target `sky`) are always drawn on the same top row: `MapEventLayer` places them at a fixed height and `pickMapTarget` rolls nothing for the sky.
  - The falling star (`map_star`) only uses the top 4 rows of the sea (`ev.at % 4`).
  - The delivery truck goes to a random producer but always drives in from the left edge along that producer's row.
  - Lightning and fire already pick a random machine; the flood covers the whole river by design.
- **Fix:** `pickMapTarget` (`src/utils/mapEvents.ts`) rolls a position with the event's `rng` and stores it in the saved `MapEventState`, so a reload shows the same position. The layer draws from the stored position, never from a fixed row or `ev.at`.
  - **Birds:** a random row anywhere over the map's visible height, and a random direction (left to right or right to left, with the sprite mirrored so they never fly backwards, playtest 19); optionally a slight random slope.
  - **Falling star:** a random row over the whole height of the sea.
  - **Truck:** still goes to a random producer (as now). It enters from a random side (left or right edge, mirrored to face its way) and stops on that side of the producer.
  - Any later map event follows the same rule: positions come from the rng and are saved.
- Old saves with an event in progress (no stored position) fall back to the old placement.
- Reduce motion: still no movement, shown at the random spot.
**Acceptance:** tests with a seeded rng: different seeds give different rows or sides for the birds, star and truck, and the full range of rows is reachable; the stored position survives a save and load; the birds and truck face their direction of travel; old saves without a position still draw; the build and all tests pass.
**Notes:** `pickMapTarget` rolls a `pos` (`y` share of the height, `dir`, and for the birds a `slope` of up to ±1.5 rows, `FLOCK_MAX_SLOPE`) and keeps it in the event's `MapEventState`. Deviation: the map event in progress is not part of the save (it lasts seconds and a load clears it, as before), so "survives a save and load" became "stays put while the event plays"; an event without `pos` still draws in the old place. The truck from the right is mirrored and stops right of the producer; the flock from the right is mirrored as a whole, so the leader stays in front.

### 1.76 — Fix: the 💤 floats far from a small sleeping pet — CODE — Done
**Goal:** owner report, playtest 25 (screenshot): a sleeping baby pet's 💤 shows far above and to the side of it.
**Details:** two causes. The bubble's bob animation repeated the half-width centering shift that its Tailwind class already applies, so it moved sideways twice. It was also pinned above the full 40 px sprite box, while a baby is drawn only 55% tall (young 78%) and a sleeping pet is curled up lower still.
**Acceptance:** tests: the bubble sits just above the pet's drawn height for its stage (lower when asleep) and over its head while sleeping; the stage heights match the sprite script; the bob does not repeat the centering; the build and all tests pass.
**Notes:** `bubblePlace` in `src/components/PetWalkers.tsx` with `PET_STAGE_HEIGHT` and `PET_SLEEP_SQUASH` in `src/data/pets.ts` (kept in step with `PET_STAGE_SCALE` in the sprite script; a test checks). The bubble is tucked down 6 px, since emoji glyphs leave room under themselves. While sleeping it sits at 70% across (30% when facing left), over the head. Checked with zoomed browser screenshots of a sleeping baby and adult.

### 1.77 — Fix: machine tooltips say "Generator" or "Producer"; no level or fuel lines on producers — CODE — Done
**Goal:** owner correction, playtest 25: the producer tooltip from 1.72 should not mention levels or how much is burned; instead every machine tooltip should say briefly and clearly whether it is a producer or a generator.
**Details:** remove the "Producer (no levels)" and "🔥 Your generators burn … · net …" lines from producer tooltips. Every tooltip on the map gets a small tag beside its name: "⚡ Generator" (amber) or "⛏ Producer" (blue), with "Makes energy" / "Makes a resource" on hover.
**Acceptance:** tests: a producer tooltip has no level or burn line and its kind is Producer; a generator's kind is Generator; the tag shows on hover; the build and all tests pass.
**Notes:** `MachineTip.kind` in `src/utils/mapTips.ts`, drawn by `src/components/MachineTip.tsx`. Replaces the extra lines added by 1.72.

### 1.78 — Landscape Architect: own all 36 decorations — CODE — Not started
**Goal:** owner request, playtest 25: the Landscape Architect achievement (today: buy 30 decorations, a bonus achievement with an Epic title) should need every decoration copy that can be bought: all 6 of each kind, 36 today.
**Details:**
- Target = `DECORATIONS.length × DECORATION_LIMIT`, so it grows when 1.54 adds kinds. Its description says "Own all N decorations".
- Decide with the owner's answer whether it stays a bonus achievement (outside 100%); keep it a bonus unless the owner says otherwise. Its Epic title stays.
- Saves that already earned it at 30 keep it (achievements are never taken away); say so in the PR.
- Rename the id only if the code needs it; otherwise keep `decor_30` so earned saves stay valid, with a comment.
**Acceptance:** tests: it unlocks at all copies owned and not one short; the target follows the decoration count; an old save that earned it keeps it; the build and all tests pass.

### 1.79 — Walking pets at different speeds — CODE — Not started
**Goal:** owner request, playtest 25: the walking speed is fine on average, but every walk is the same speed; pets should move at different speeds.
**Details:**
- Each walk picks a pace: a slow stroll, the normal walk, or a short trot or run, with weights and speeds in `src/data/pets.ts` (for example 0.5×, 1×, 2× of `PET_WALK.speed`), so the average stays about the same.
- Optionally each pet kind has its own base pace (the Solar Tortoise slow, the Wind-up Robot Dog quick), kept in the data file.
- The walking bob follows the pace (faster bob when running). Reduce motion: unchanged (pets stand still).
**Acceptance:** tests with a seeded rng: walks come in several speeds, a walk's duration matches its distance and pace, and the long-run average stays within 20% of today's; the build and all tests pass.

### 1.80 — Pets celebrate your milestones and react to random events — CODE — Not started
**Goal:** owner request, playtest 25: the walking pets should celebrate when something good happens (player level up, research completed, achievement unlocked, and similar) and react when a random event happens.
**Details:**
- **Celebrate:** when a live celebration or achievement fires (research complete, level up, pet stage-up from 1.58, achievement unlocked, contract completed), every walking pet stops and plays a short celebration (a jump with sparkles or confetti and a 🎉 bubble) for a few seconds, then carries on.
- **React to random events:** each random event gets a reaction in `src/data/events.ts` or a mapping in `src/data/pets.ts`: for example 😮 and looking up for a sighting (spaceship, meteor shower, aurora), ☀ happy for a sunny spell, 🌧 hiding for a storm or overcast, 😨 for a negative event, 💰 for a delivery. Events with no specific reaction use a generic 👀.
- Reactions come from the store (celebrations, the event log or a small transient "pet reaction" queue), not from timers; at most one reaction plays at a time, and a burst of events plays one.
- Reduce motion: the pets stay still; only the bubble shows. The "Pets walk on screen" setting off: nothing.
**Acceptance:** tests: a level up, a research completion and an achievement each make the walking pets celebrate; a random event plays its reaction (and the generic one for an unmapped event); reactions do not pile up; Reduce motion shows only the bubble; the build and all tests pass.

### 1.81 — Active pets on screen interact with each other — CODE — Not started
**Goal:** owner request, playtest 25: when more than one pet is active and walking on screen (pet slots, 1.59), they should sometimes interact with each other.
**Details:**
- Now and then (tunable chance in `src/data/pets.ts`), two walking pets meet: one walks toward the other, they stop facing each other and do a short shared action, then go their own ways. For example:
  - greet: a ❤ or 👋 bubble between them;
  - play together: chase each other, or pass the ⚽ back and forth on the ground (1.74);
  - nap side by side: both sleep next to each other (long naps as in 1.74);
  - share food: both eat from one 🍎 on the ground between them.
- Only pets that are idle or resting are picked; a pet that is reacting or celebrating (1.80) is left alone. Interactions are rarer than solo actions, so they stay special.
- Pure logic in `src/utils/petWalk.ts` (pairing, meeting point, facing), tested with a seeded rng; the one existing timer drives it, no new timers.
- Clicking either pet during an interaction still plays its reaction.
- Reduce motion: no interactions (pets stand still). With one active pet nothing changes.
**Acceptance:** tests: with two or three active pets an interaction happens at its rate and never with one pet; the two pets meet, face each other and end free again; a busy pet is not picked; Reduce motion turns it off; the build and all tests pass.

### 1.75 — Fix: a hovered generator card covers the research chip and the walking pets — CODE — Done
**Goal:** owner reports, playtest 25: hovering a generator card near the bottom of the screen draws the card over the research chip docked at the bottom, and over the walking pets.
**Details:** a hovered card is raised to z-40 so its tooltip shows above its neighbors; the research chip dock was at z-30 and the walking pets at z-20. Put the chip at z-42 and the pets at z-41: above hovered cards, below the map's floating buttons and panels (z-44), the pinned top bar (z-45), and toasts, celebrations and dialogs (z-50).
**Acceptance:** Playwright at 1280 px: with a card hovered under the chip, the chip is on top; with a card hovered under a pet, the pet is on top; the test fails without the fix; the build and all tests pass.
**Notes:** `src/App.tsx` (chip dock) and `src/components/PetWalkers.tsx`; the e2e test imports a save with a running research and an active pet (a shared `importSave` helper in `e2e/layout.spec.ts`).

### 1.74 — Fix: walking pets: food and toys on the ground, long naps, and rests — CODE — Done
**Goal:** owner reports, playtest 25: when a walking pet eats, the apple shows above its head, so it does not look like eating; the same goes for the ball when it plays. A sleeping pet should sleep for a long while, not a few seconds. Pets should sometimes stop and do nothing, not walk nonstop.
**Details:** eat and play put their emoji on the ground in front of the pet's mouth (on the side it faces), not in a thought bubble. Eating nods the head down to the food, which gets smaller bite by bite; the ball bounces in front of the pet. Sleep, sit and jump keep their bubble above the pet. A nap lasts 45 s to 2 min. A new "rest" action: the pet stands still with no bubble, the most common action. Pets stop after most walks and often rest after an action. Reduce motion: no movement.
**Acceptance:** tests: an eating pet's food sits at the bottom, on its facing side, with no bubble; a nap lasts at least 45 s; pets stop after most walks; a resting pet shows no bubble and no pose; the build and all tests pass.
**Notes:** `PET_GROUND_ACTIONS` in `src/data/pets.ts`; the food and ball are drawn by `PetWalkers` with the CSS animations `pet-food` and `pet-ball`. Checked with browser screenshots. Timing in `src/data/pets.ts`: `PET_ACTION_MS` per action (sleep 45-120 s, rest 5-20 s, sit 6-15 s, eat and play 4-8 s, jump 2-4 s), `PET_ACTION_WEIGHTS` (rest 4, eat, play and sit 2, jump and sleep 1), `actionChance` 0.75 after a walk (was 0.45) and `restAfterAction` 0.35. Pets also start with a 5 s rest.

### 1.69 — Collapse and expand the Cosmetics section in the Achievements tab — CODE — Done
**Goal:** owner request after playtest 24: the Cosmetics section at the top of the Achievements tab (title picker, accent colors and the title tiers list from 1.66) has grown tall. The player should be able to close it and open it again.
**Details:**
- The "Cosmetics" heading becomes a toggle button (a ▸/▾ chevron, `aria-expanded`, `aria-controls`) that closes and opens the section. Keyboard: Enter and Space toggle it; it shows the focus ring.
- Closed, only the heading row shows, with a short summary of what is chosen (for example "Title: Engineer · Accent: Sky"), the title in its tier color.
- Open by default for a new player; the choice is remembered per device (a setting such as `settings.ui.cosmeticsOpen`, saved with the game, or `localStorage` wrapped in try/catch), so it stays closed across reloads.
- Reduce motion: no open/close animation.
- The achievements list below is unchanged.
**Acceptance:** tests: the section starts open; the toggle closes it (the title picker and tier list are gone, the summary shows) and opens it again; `aria-expanded` follows; the choice survives a reload (or a store reset of the UI only); Playwright at 360 px: no sideways scroll on the Achievements tab, open or closed; the build and all tests pass.

**Notes:** `settings.cosmeticsOpen` (saved with the game, open when missing) and `setCosmeticsOpen` in the settings slice; the heading button in `src/components/AchievementsPanel.tsx` shows a ▸/▾ chevron and, closed, "Title: … · Accent: …" with the title in its tier color. Closed means the body is not rendered, so there is no open/close animation at all. Tests: `src/components/CosmeticsToggle.test.tsx`, and a 360 px Playwright check in `e2e/layout.spec.ts`.

### 1.70 — Remove all decorations from the map at once — CODE — Not started
**Goal:** owner request after playtest 24: a button to clear every decoration from the map in one go, instead of removing them one by one.
**Details:**
- In the 🎨 Decorations panel, next to 🧹 Remove and Close in its pinned bottom bar, a **Remove all** button. Disabled when nothing is placed.
- It asks for confirmation first ("Take all N decorations off the map? You keep every copy and can place them again for free."), with Remove all / Cancel; Escape cancels. Focus returns to the button.
- Removing all is free and keeps every bought copy (1.53): `decorationsBought` does not change, only `mapDecorations` becomes empty. Decorations hidden under machines are removed too.
- A pure function (for example `removeAllDecorations` in `src/utils/decorations.ts`) and a store action; the map note says "All decorations removed: place them again any time for free."
**Acceptance:** tests: the button is disabled with nothing placed; confirming empties `mapDecorations` and leaves energy and `decorationsBought` unchanged; Cancel and Escape change nothing; the copies can be placed again for free afterwards; Playwright at 375 px: the button and the confirmation are fully on screen; the build and all tests pass.

### 1.71 — Working machines animate on the map — CODE — Not started
**Goal:** owner request after playtest 24: every machine on the map that is working should look like it is working. Today a running generator shows a still "active" sprite and a stopped one shows the "inactive" sprite; nothing moves.
**Details:**
- **What counts as working:** a generator that is switched on and producing (not out of fuel); a producer that is producing.
- **Turned off means static (owner):** a machine the player switches off is completely still, with its inactive look as now. The same goes for one that is out of fuel or idle.
  - Switching a machine off stops its animation at once.
  - Switching it back on starts the animation again.
  - No reload or tab change is needed for either.
- **One animation per machine type**, fitting what it does. For example:
  - Solar Panel: a light glint sweeping across.
  - Wind Turbine: turning blades.
  - Coal, Gas and Oil plants: rising smoke from the chimney.
  - Hydropower Dam and Tidal Station: moving water.
  - Nuclear Fission Plant: steam from the cooling tower.
  - Fusion Reactor and Micro-Supernova: a pulsing glow.
  - Producers: the mine cart or pickaxe moves, the quarry crusher shakes, the wells and rigs pump, the extractor bubbles.
- **Frames from the generic asset script:** 2 to 4 frames per animated machine, made by `scripts/generate-generic-assets.mjs` at the same size and AAP-64 palette as today's sprite. Add them to the Asset manifest in this file, `src/assets/sprite-manifest.json` and the typed `sprites`. No hand-made or AI art. Effects that are not frames (a glint, a glow, smoke puffs) may be CSS on top of the sprite.
- Animate with the existing `Frames` component and CSS. Give machines of one type a random start offset, so a row of turbines does not move in lockstep.
- **Performance:** CSS animations only, no per-frame JavaScript. The animations pause when the page is hidden or the Map tab is closed. A full late-game map (about 880 tiles, hundreds of machines) must stay smooth: use one shared animation per type, not a timer per machine.
- **Reduce motion** (in-game setting and the system setting): no movement; working machines show their first frame.
- Drag-and-drop (1.16), tooltips (1.63), map events (1.12) and the zone highlight (1.39) keep working on animated machines.
**Acceptance:**
- Tests:
  - every generator and producer type has an animation or effect;
  - a working machine renders animated and an off or out-of-fuel one renders still;
  - switching a machine off makes it static right away, and switching it on animates it again;
  - Reduce motion stops the animation;
  - the new frames are listed in `src/assets/generic-assets.json`.
- `npm run check:assets` passes.
- Playwright at 1280 px on a large site: the Map tab shows the animation classes, and no sideways scroll.
- The build and all tests pass.

### 1.68 — Cloud menu buttons styled like Settings — CODE — Done
**Goal:** owner request after hotfix 22.1: in the ☁️ menu in the top bar (1.46), "Save to cloud now" looks like plain text. It should stand out as the main action, as it does in Settings → Account.
**Details:**
- In `CloudButton`'s menu, **Save to cloud now** becomes a filled primary button in the same blue as in Settings (`bg-sky-700`, hover `bg-sky-600`, white bold text, rounded, at least 44 px tall), full width.
- **Load cloud save** becomes a secondary button like in Settings (`bg-slate-600`, hover `bg-slate-500`), below it. Account settings stays a link-style row.
- While saving, the primary button shows "Saving…" and is disabled, then the "Saved to the cloud." notice as now.
- Share the button styles with `AccountPanel` (one constant or small component), so the two places cannot drift apart.
- Signed out, **Sign in** gets the primary style too.
**Acceptance:** tests that the menu's Save button has the primary style and shows "Saving…" while busy, and that Settings uses the same style; the existing 1.46 tests still pass; the build and all tests pass.

### 1.53 — Decorations bought with energy, at rising prices, with achievements and completion — CODE — Done
**Goal:** owner request after playtest 22: decorations start locked and are bought with energy, one at a time, each copy costing more than the last.
**Details:**
- Every decoration kind starts locked. Each copy is **bought once with energy only** (owner clarification, playtest 24: you pay to unlock copies, not to place them), up to 6 copies of a kind: the first copy costs its base price, each next copy of the same kind costs more (for example base × 1.6^owned). Copies you own are placed, removed and placed again for free, as often as you like. Base prices and the growth factor go in `src/data/decorations.ts`, scaled so the first Tree is a small early purchase and the rarest decorations are a late-game energy sink.
- The current unlock rules (player level, achievements, contracts) become requirements to buy the kind; the price is paid on top.
- Removing a decoration from the map keeps the copy: it can be placed again for free. `DECORATION_LIMIT` (6) is the number of copies of a kind that can be bought.
- The 🎨 panel shows each kind's copies (placed / owned / 6) and a Buy button with the next price, red when there is not enough energy.
- New achievements, for example: first decoration, 10 decorations, every kind placed, 50 decorations. Cosmetic rewards only.
- 100% completion counts decorations (for example every kind bought at least once, plus a number of copies). Update `src/utils/completion.ts`, the Completion panel and `npm run simulate`, and report the new hours to 100%.
- Save migration: decorations already placed count as bought (no charge).
**Acceptance:** tests: the price rises with each copy, energy is spent on buying, only owned copies can be placed, placing and removing are free, the requirements still apply, old saves keep their decorations; achievements unlock; completion includes decorations; the simulation finishes with no stalls; the build and all tests pass.
**Notes:** base prices in `src/data/decorations.ts`: Tree 1K, Company flag 5K, Pond 100K, Windsock 250K, Lamp post 1M, Founder statue 10M; ×1.6 per copy (`DECORATION_PRICE_GROWTH`), up to 6 copies of a kind (`DECORATION_LIMIT`). Reworked after the owner's note on playtest 24: copies are bought with a Buy button in the 🎨 panel and then placed and removed for free (the first version charged on each placement). The owned count is saved as `decorationsBought` (save version 22; decorations already placed count as owned, free). Achievements: Green Thumb (1), Site Beautifier (10), Collector (every kind), and Landscape Architect (30, a bonus achievement with an Epic title; 36 is the most there is today). Completion: a "Decorations" part with every kind once plus 25 bought in all (`DECORATION_COPIES_GOAL`). The simulated player buys them (without placing); see `BALANCE_REPORT.md`.

### 1.54 — More decorations — CODE — Not started
**Goal:** owner request after playtest 22: more decorations for the map.
**Details:**
- About 8 new kinds that suit an energy site, for example flower bed, bench, hedge, rock garden, fountain, picnic table, weather station, small wind chime, solar garden light, memorial plaque. Each has a sprite made by `scripts/generate-generic-assets.mjs` (24×24, AAP-64), added to the Asset manifest and `sprites`.
- Each has a requirement and a base price in the 1.53 system, spread from early to late game.
- Some may be 2×1 or 2×2 tiles if the placement code allows it; otherwise all stay 1 tile.
**Acceptance:** the new kinds appear in the 🎨 panel, can be bought and placed, count toward completion; `npm run check:assets` passes; the build and all tests pass.

### 1.55 — More random events — CODE — Not started
**Goal:** owner request after playtest 22: more random events.
**Details:**
- About 10 new events in `src/data/events.ts`, mixed like the current 33: cosmetic sightings (for example a hot-air balloon, a rainbow, a comet), positive and negative effect events (for example heat wave: solar +, cooling −; grid surge; supply discount; equipment recall), and a few map events that visibly act on the map.
- Same rarity rules and rates as now (negative ones slightly rarer than positive ones, playtest 12); new sprites from the generic asset script; each has a log emoji (1.40) and a clear tooltip on its effect.
- Achievements that count events seen still work, and completion includes the new events if it lists events.
**Acceptance:** tests for each new effect; the event tests still pass (rates, no pile-up on return, 1.37); `npm run check:assets` passes; the build and all tests pass.

### 1.56 — More pets — CODE — Done
**Goal:** owner request after playtest 22: more pets.
**Details:**
- About 6 new energy-themed pets in `src/data/pets.ts`, with how they are found, their food, and a bonus by stage that does not repeat an existing one exactly (for example research speed, contract reward, producer output for one resource, offline gains, room cost). Sprites for every stage from the generic asset script.
- Pet achievements and completion include the new pets.
**Acceptance:** tests that each new pet is found, grows and gives its bonus; completion and achievements update; `npm run check:assets` passes; the build and all tests pass.
**Notes:** six pets in `src/data/pets.ts`: Coal Mole (player level 15; coal production), Bubble Toad (build a Gas Plant; natural gas production), Lab Mouse (research Automated Labs; research speed, a new bonus kind used by `getResearchDuration`), Courier Pigeon (25 contracts; contract bundles and boosts, a new bonus kind added to the Rewards perk factor), Soot Owl (player level 35; coal, gas and oil plants) and Atomic Axolotl (build a Fusion Reactor; fission and fusion plants). No two pets share a bonus (tested). 18 new generic sprites (`pets/{mole,toad,mouse,pigeon,owl,axolotl}_{1,2,3}.png`) drawn by `scripts/generate-generic-assets.mjs`. Achievements "Full House" and "Proud Keeper" and the completion parts count every pet, so they now need 14. 100% completion at 293.3 h (was 257.1 h), no stalls; see `BALANCE_REPORT.md`.

### 1.57 — Pets: raise one at a time, and a bonus that grows clearly with maturity — CODE — Done
**Goal:** owner request after playtest 22: only one pet can grow at a time, and a more mature pet gives a clearly larger effect.
**Details:**
- **One at a time:** while one pet is growing, Feed is disabled on the others, with "Another pet is growing (Xh left)". A save with several pets growing (made before this item) lets them finish.
- **Maturity:** the bonus already rises with the stage (Baby, Young, Adult); make the steps larger and visible, for example Baby 1×, Young 2×, Adult 4× of a base value, and show the next stage's bonus on the pet card ("Grows to: +X%").
- Rebalance with `npm run simulate` and report the hours to 100%.
**Acceptance:** tests: a second pet cannot start growing, the old-save case, the bonus per stage; the simulation has no stalls; the build and all tests pass.
**Notes:** `PET_STAGE_MULTIPLIERS = [1, 2, 4]` in `src/data/pets.ts`; each pet keeps its old adult bonus, so Baby and Young are lower than before and the step to Adult is clearly bigger. Feed is disabled on the other pets while one grows ("Another pet is growing (Xh left)"); a save with several growing lets them all finish. Pet cards show "Grows to: +X% as Young/Adult", with decimals for small bonuses. 100% completion at 267.6 h (was 250.1 h after 1.53), no stalls.

### 1.73 — Fix: decorations bought did not count in the Completion tab; completion needs all 6 of each — CODE — Done
**Goal:** owner report, playtest 24: with 29 decorations owned, the Completion tab's Decorations part read "0 bought" everywhere. Also: "25 decorations bought" makes no sense when each kind can be bought 6 times.
**Details:** the Completion panel builds its input for `getCompletion` field by field and left out `decorationsBought` (the % in the tab button used the full state, so the two disagreed). The achievements were not affected: they read the full state. Change the Decorations part to one entry per kind, done when all `DECORATION_LIMIT` (6) copies are owned, and drop `DECORATION_COPIES_GOAL`. Rerun `npm run simulate`.
**Acceptance:** a test that fails before the fix: the panel shows the copies owned and matches the tab %; the decoration achievements unlock through the store; completion needs 6 of each kind; the simulation has no stalls; the build and all tests pass.
**Notes:** fixed in `src/components/CompletionPanel.tsx`; entries read "n/6 bought". 100% completion at 257.1 h (was 243.9 h), no stalls. The achievements stay as they were (Green Thumb 1, Site Beautifier 10, Collector every kind, Landscape Architect 30 as a bonus).

### 1.72 — Fix: the Oil Rig's map tooltip shows no level and no oil use — CODE — Done (replaced by 1.77)
**Goal:** owner report, playtest 24: hovering an Oil Rig on the map shows no level, while other machines do, and no oil consumption.
**Details:** the Oil Rig is a producer: it makes oil, has no levels and burns nothing, unlike generators (the Oil Power Plant shows its level and the oil it burns). Make the producer tooltip say so, and show the fuel side of the resource it makes.
**Acceptance:** a producer's map tooltip says "Producer (no levels)"; a producer of a fuel (coal, gas, oil, uranium, deuterium) also shows what the running generators burn of it and the net per hour; tests; the build and all tests pass.
**Notes:** in `machineTip` (`src/utils/mapTips.ts`): the last line reads "Producer (no levels) · N tiles · you have N", and when running generators burn the resource, "🔥 Your generators burn X/h oil · net +Y/h" (from `getResourceBreakdown`, so fuel efficiency counts).

### 1.58 — Pet growing animation — CODE — Done
**Goal:** owner request after playtest 22: show the pet growing.
**Details:**
- While a pet grows, its card shows a gentle animation (for example a slow pulse and small sparkles) and a progress bar with time left.
- When it reaches the next stage: a short animation where the old sprite grows into the new one with a flash, on any tab if the Pets tab is closed (like the research celebration), and a log entry (🐣, as now).
- Reduce motion: no animation, only the message.
**Acceptance:** tests that the growing state and the stage-up celebration render, and that reduce motion turns the animation off; the build and all tests pass.
**Notes:** a growing pet's picture pulses slowly with four sparkles, and its card shows a progress bar and "Growing to young: Xh left" (`growProgress` in `src/utils/pets.ts`). A stage-up during live play queues a `pet` celebration (the same queue as research and level-ups, shown over any tab, including Pets): the old sprite grows, flashes and turns into the new one, with "🐣 Your pet grew up!". Catching up on time away only logs it (🐣), like research. Reduce motion: no pulse, no sparkles, no flash; the celebration shows the message and the new sprite.

### 1.59 — Pet slots: up to 3 active pets, bought with energy — CODE — Done
**Goal:** owner request after playtest 22: upgrades in the Pets tab to have more active pets at once, up to 3.
**Details:**
- The player starts with 1 active slot. Two upgrades in the Pets tab add a 2nd and a 3rd slot. **Energy only**, and very expensive (the bonuses stack), prices in `src/data/pets.ts`. Each also needs a player level (see 1.61).
- Active bonuses from different pets stack; the same pet cannot fill two slots. The energy breakdown (0.53) lists each active pet.
- Completion counts the two upgrades; rebalance with `npm run simulate` and report the hours.
**Acceptance:** tests: slots are bought with energy, bonuses of up to 3 pets stack, the level requirement holds, old saves keep their one active pet; the simulation has no stalls; the build and all tests pass.
**Notes:** `PET_SLOT_UPGRADES` in `src/data/pets.ts`: slot 2 costs 100M energy at player level 45, slot 3 costs 1B at level 80. The save keeps `pets.slots` and `pets.extra` (optional, so older saves load with 1 slot and their active pet; no save version bump). "Make active" fills a free slot, or takes the first slot's place when all are full (the button says whose); "Rest" frees a slot, but the last active pet stays. The energy, click and resource breakdowns list each active pet. Completion gains a "Pet slots" part (2 entries). 100% at 254.8 h (was 267.6 h after 1.57), no stalls.

### 1.60 — Active pets walk on the screen — CODE — Done
**Goal:** owner request after playtest 22: the active pets walk along the screen on every tab, do small things at random, and can be clicked; a setting turns it off.
**Details:**
- A layer at the bottom of the screen (above the content, below dialogs and toasts, never blocking clicks except on the pet itself) where each active pet walks left and right.
- At random it stops for a few seconds to do something: eat, play, sleep, sit, jump. Each action has a short sprite animation (frames from the generic asset script) and maybe an emoji bubble.
- Clicking a walking pet plays its reaction (0.99) and counts as petting (1.51).
- Settings → "Pets walk on screen" (on by default); Reduce motion: the pets stand still.
- Light on performance: CSS transforms with one timer, paused when the tab is hidden.
- On phones it does not cover the research chip or the bottom buttons.
**Acceptance:** tests: the layer shows the active pets on every tab, the setting hides it, a click counts as petting, reduce motion stops the walking; Playwright at 375 px: no sideways scroll and the bottom controls stay clickable; the build and all tests pass.
**Notes:** `PetWalkers` (`src/components/PetWalkers.tsx`) is a click-through layer (z-20) at the bottom of every tab; only the pets take clicks. The walk and action choices are pure (`src/utils/petWalk.ts`, numbers in `PET_WALK` in `src/data/pets.ts`): one 1 s timer, skipped while the tab is hidden; walks are CSS transform transitions. Actions eat 🍎, play ⚽, sleep 💤, sit 💭 and jump ❗ show a bubble and a CSS pose of the pet's current sprite. **Deviation:** no new sprite frames; the poses move the existing stage sprite, so no new art was added. While research runs, the layer sits just above the docked research chip, so the chip never hides the pets and stays clickable (z-30 above). Clicking a pet plays its 0.99 reaction; counting it as petting waits for 1.51, which adds the counter (`petClicks`). Settings → "Pets walk on screen" (`settings.petsWalk`, on by default; old saves get it from the default settings). Reduce motion: the pets stand still, spread out, with no poses. Playwright at 375 px: no sideways scroll, the research chip and the map buttons stay on top.

### 1.61 — Player level as a hard requirement — CODE — Done
**Goal:** owner request after playtest 22: the player level should gate more things, for example each room expansion, more active pets and contract upgrades.
**Details:**
- A minimum player level for each room expansion tier (`src/data/rooms.ts`), each pet slot (1.59) and each contract perk level (`src/data/contracts.ts`). More gates may follow the same pattern (for example decoration kinds).
- The button shows "Needs player level N" and is disabled until then; the requirement shows in its tooltip.
- Pick the levels from the simulated timeline so no gate is reached before its level comes naturally by much; rerun `npm run simulate`, check there are no stalls and report the hours.
**Acceptance:** tests for each gate (blocked below the level, allowed at it), and the simulator honors the gates; the build and all tests pass.
**Notes:** room expansions need player level 1, 3, 5, 8, 10, 13, 17, 22, 50, 70 (`playerLevel` in `src/data/rooms.ts`); contract perk levels need 10, 30, 55, 75 (`PERK_PLAYER_LEVELS` in `src/data/contracts.ts`). Pet slots get their level with 1.59. The simulator uses the same rules: 100% at 264.7 h (was 251.0 h), no stalls; details in `BALANCE_REPORT.md`.

### 1.62 — Harder research level gates — CODE — Done
**Goal:** owner feedback after playtest 22: research is too easy to climb. The highest research needs only research level 14, and the owner reached research level 21 in under a week of play. High-level research must need a clearly higher research level.
**Details:**
- (Replaces the first draft "research points": the owner confirmed no new point currency; the research level is the requirement.)
- Check how the global research level rises today (`src/data/research.ts`, the research slice) and how far the `requiredLevel` values spread (now 1 to 14).
- Spread the requirements of the upper research much higher, so the last research needs a level close to the maximum a player reaches by then, and make the research level rise more slowly at high levels if needed (for example more research per level). Numbers stay in the data files.
- Each locked research keeps saying exactly what it needs ("Needs research level N, you are M").
- Old saves: research already done stays done; a research in progress finishes. Only new starts check the new requirements.
- Rerun `npm run simulate`: no stalls, 100% stays above the 200 h target. Report the new hours and the research level timeline in the PR.
**Acceptance:** tests that the new requirements block and then allow research, and that old saves keep their research; the simulation has no stalls; the build and all tests pass.
**Notes:** the research level is 1 + research completed (39 research, top level 40). Levels 1-6 stay; the upper requirements were stretched in order (7→9, 8→13, 9→17, 10→21, 11→26, 12→31, 13→35, 14→38), so the duration rule still holds. Nuclear Fission now needs 16 research done, Fusion Ignition 25, and Stellar Harvest all but one of the others. Tests check that every research stays reachable. The simulation is unchanged (251.0 h, no stalls): the simulated player already researches in tree order, so the gates stop skipping ahead rather than slowing a normal game. If the game should also be slower overall, that is a separate pacing item.

### 1.63 — Map tooltips on hover, next to the machine — CODE — Done
**Goal:** owner request after playtest 22: on a big map, the info line above it is out of view; hovering a machine should show its details beside it.
**Details:**
- Hovering (or focusing) a generator or producer on the map shows a small tooltip next to it: name and number, output per second, fuel use, zone bonus or the zone it needs, and level if upgraded. Reuse `FloatingTip` and the side logic (`useTipSide`), so it stays inside the screen and under the pinned bar rules (1.42).
- On touch screens a tap shows it (the first tap selects for moving, as now; the tooltip shows with the selection).
- The info line above the map stays.
**Acceptance:** tests: hovering a generator and a producer shows their details; the tooltip stays on screen near the edges; Playwright: hover a machine near the bottom of a scrolled map and the tooltip is visible; the build and all tests pass.
**Notes:** the text comes from `machineTip` (`src/utils/mapTips.ts`), drawn by `MachineTip`. A producer shows what one of them makes, with research, event, pet and its own map bonus. While the ⭐ tooltip is open, the machine tooltip steps aside, so only one shows. The tooltip hides while a moving machine's outline is pointed at a tile.

### 1.43 — Fix: sign-up fails with "Invalid path specified in request URL" — CODE — Done
**Goal:** fix an owner report after playtest 21: creating an account on the live site showed "Invalid path specified in request URL".
**Details:** the Supabase library adds `auth/v1/...` to the configured URL. If `VITE_SUPABASE_URL` holds the RESTful endpoint from the Data API page (`https://<project>.supabase.co/rest/v1/`) instead of the bare Project URL, sign-up goes to `.../rest/v1/auth/v1/signup`, which Supabase rejects with exactly that message. `projectUrl` (`src/store/cloud.ts`) now keeps only the scheme and host of whatever was pasted, and `docs/PUBLIC_RELEASE.md` step 5 says what the Project URL looks like.
**Acceptance:** unit test that `projectUrl` trims a pasted REST endpoint and a trailing slash; the build and all tests pass; a live sign-up after the next deploy works (owner check).

### 1.42 — Fix: tooltips under the pinned top bar — CODE — Done
**Goal:** fix a playtest 20 bug: with the energy bar pinned (0.43), hovering a build card just under it raised the card over the bar (half hiding it), and the card's tooltip opened above the card, high up behind the bar.
**Details:**
- **Cause:** a hovered build card is raised to z-index 40 so its tooltip covers the card above (0.80), but the pinned bar was at 30. Tooltips that open upward (build card, Upgrade, Scrap) never checked for the bar.
- **Fix:** the bar now sits above hovered cards (`z-[45]`); dialogs (research details), toasts and celebrations moved above it (`z-50`). `useTipSide` (`src/components/useTipSide.ts`) opens these tooltips below their anchor when there is no room between it and the bar; `FloatingTip` (map ⭐ and 📍 tips) uses the bar's bottom edge as its limit too.
**Acceptance:** unit tests for the above/below choice and the floating tip; a Playwright test scrolls a build card under the bar, hovers it, and checks the bar stays on top and the tooltip opens below; the build and all tests pass.

### 1.40 — Flapping birds in the flock-of-birds sighting — CODE — Done
**Goal:** owner request: the "Flock of birds" random-event sighting (the screen-wide one, not the map event) looked bad because the birds were a static sprite.
**Details:**
- The sighting now draws a V of five gulls with the two-frame wing flap used by the map flock (`map_bird_1/2`), mirrored to face left, the way the sighting flies. Each gull flaps and drifts up and down on its own timing, so the flock never moves as one block.
- The two-frame swap moved out of `MapEventLayer.tsx` into a shared `src/components/Frames.tsx`.
- No new sprites. `sighting_birds` (the old static sprite) is no longer drawn; it stays in the asset list for now.
- Reduce motion still skips the sighting entirely.
**Acceptance:** a test checks the birds sighting draws five gulls, each with two wing frames; `npm run build` and `npm test` pass.

### 1.38 — A bonus place on the map for every machine — CODE — Done
**Goal:** owner request: many machines (for example the Coal Plant) have no place on the map that boosts them. Every generator and every producer should have one zone where it gets a bonus.
**Details:**
- **Today:** zones in `ZONES` (`src/data/map.ts`) boost Solar (Sunny plateau), Wind (Windy ridge), Hydro (River), Tidal (Coast), Fusion and Micro-Supernova (Exclusion Zone), and the Coal Mine, Quarry, Metal Mine, Uranium Mine, Gas Well and Oil Rig. Without a bonus place: the Coal Plant, Natural Gas Plant, Oil Power Plant, Nuclear Fission Plant and the Deuterium Extractor.
- **Assign each one, reusing a zone where it makes sense** (proposal; tune in the item):
  - Coal Plant → Coal field (a mine-mouth plant beside its fuel).
  - Natural Gas Plant and Oil Power Plant → Oil and gas field (beside their wells).
  - Deuterium Extractor → Coast (it draws deuterium from sea water).
  - Nuclear Fission Plant → a new **Cooling lake** zone (plants are built by water for cooling), a small lake area added to the terrain generator in `src/utils/mapTerrain.ts`, or the River banks if a new terrain does not fit the layout. A new terrain needs a `tile_lake` sprite: add it to the Asset manifest and `scripts/generate-generic-assets.mjs`.
- Bonuses are optional (not `required`), +20% like the other optional zones unless balance says otherwise; zones a type is required to stand on (river, coast, Exclusion Zone) keep their rules for their own machines, and the newcomers on them only seek a free spot the same way solar and wind do (they must never take a spot a dam, tidal station or experiment needs).
- The auto layout (`src/utils/siteMap.ts`) already seeks a bonus zone for solar and wind; it does the same for every newly assigned type. Zones that now serve several types (coal field, oil and gas field, coast) may need to be a little larger so they do not fill too quickly; check against the room tiers.
- Update the zone descriptions, `zoneTipText`, the Guide and the expansion preview. Run `npm run simulate`: placement bonuses are not simulated, but state the estimate in the PR.
**Acceptance:** a test that every `GeneratorType` and every producer id has a zone (`zoneFor` is never null); tests for the new assignments, the bonus and that required-zone machines still get their spots first; the build and all tests pass.
**Done notes:** Coal Plant → Coal field (+20%); Natural Gas and Oil Power Plants → Oil and gas field (+20%); Nuclear Fission Plant → new **Cooling lake** (+20%, sprite `tile_lake`); Deuterium Extractor → Coast as a *visitor* (`visitors` on `ZoneDef`, `zoneRequiredFor`): it gets the coast's +10% but may stand anywhere and makes way for tidal stations. Gas and oil plants are 5 tiles wide and the old oil fields only 4, so two plain patches next to oil fields became oil field (8 wide, rows 9–11 and 18–19), and one plain patch became the lake (4 × 3, rows 12–14, one Nuclear spot). Only plain land changed; no existing zone moved. The layout now retries zone-bound machines ignoring machines that may give way when its first try leaves one misplaced (a pinned extractor could split the coast). Simulator: 251.0 h to 100% (was 259.2 h).

### 1.41 — The research chip opens the running research's details — CODE — Done
**Goal:** owner request: clicking the sticky research progress chip (shown on every tab while research runs) opens the Research tab; it should also open the details popup of the running research, the same one shown when you click that research in the tree.
**Details:**
- **Today:** `ResearchChip` (`src/components/ResearchChip.tsx`) calls `onOpen`, which in `src/App.tsx` only runs `setTab('research')`. The popup is `ResearchPanel`, opened by local `openId` state in `src/components/ResearchTree.tsx`.
- **Fix:** let the chip pass the running research id along (for example a small transient "open research details" request in the store, or a prop/initial value for `ResearchTree`), so the Research tab opens with `ResearchPanel` already showing that research. Clicking the chip while already on the Research tab opens the popup too.
- Closing the popup leaves the player on the Research tab. If the research finished in the meantime (no current research), just open the tab.
- Keep focus handling right: focus goes into the popup and returns to a sensible element when it closes. Update the chip's `aria-label` ("Open its details").
- The request is UI-only and never saved.
**Acceptance:** tests: clicking the chip from another tab switches to Research and shows the popup for the running research; from the Research tab it opens the popup; with no running research it only opens the tab; closing the popup keeps the Research tab; the build and all tests pass.
**Done notes:** the chip passes the running research id; `App` keeps a UI-only request (`OpenResearchRequest`) that `ResearchTree` turns into its open popup, then clears, so returning to the tab later does not reopen it. Focus goes to the popup's Close button and back to the chip on close.

### 1.40 — A distinct emoji for every kind of event log entry — CODE — Done
**Goal:** owner request: many event log lines share the same ✨, so the log is hard to scan. Every different kind of entry should have its own emoji.
**Details:**
- **Today:** `LOG_ICONS` in `src/components/EventLog.tsx` has one emoji per `LogKind` (`research`, `unlock`, `fuel`, `room`, `event`, `achievement`, `level`), also used by `src/components/Toasts.tsx`. The broad `event` kind (✨) covers random events, map events, sightings, contracts and pets, and `level` (⭐) covers both player and research levels; `unlock` (🔓) covers new generators, producers and research.
- **Fix:** split the kinds so each entry type has its own icon, for example (tune in the item, no emoji used twice):
  - Effect events: positive 🍀, negative ⚠️; weather events by what they touch (☀️ sunny spell, ☁️ overcast, 🌬️ strong winds, 🍃 calm air). Simplest is an optional `icon` on each `EventDef` in `src/data/events.ts`, with a fallback per positive/negative.
  - Sightings 👀; map events 🗺️ (or the event's own icon: ⚡ lightning, 🚚 delivery, 🔥 fire, 🌊 flood).
  - Contracts: new offers 📜, complete ✅, expired ⌛.
  - Pets: found 🐾, grown up 🐣.
  - Player level ⭐, research level 🎓.
  - New generator ⚙️, new producer ⛏️, new research 🔓.
  - Unchanged: research complete 🔬, fuel 🔥 (pick another for the map fire), room 📦, achievement 🏆.
- Implementation: either more `LogKind` values or an optional `icon` on `LogEntry` that overrides the kind's default. Old saved log entries without the new field still show their kind's icon (no migration break).
- The toast uses the same icon. Icons stay `aria-hidden`; the text still says what happened.
**Acceptance:** tests: every log source writes its own icon (random effect, sighting, map event, contract offer, completion and expiry, pet found and grown, player level, research level, each unlock type); no two entry types share an emoji (a test over the icon table); an old saved entry still renders; the build and all tests pass.
**Done notes:** an optional `icon` on `LogEntry`, set by every source from `ENTRY_ICONS` (`src/data/logIcons.ts`) or `eventIcon(def)`; old entries fall back to their kind's icon. Icons as proposed; the map fire is 🚒 (fuel keeps 🔥). Events with their own icon: the four weather events and the lightning, delivery, fire and flood map events; the other map events show 🗺️. Contract and pet entries are built by small exported helpers (`contractLogEntries`, `petLogEntries`) so they can be tested.

### 1.39 — A tidy, readable map legend — CODE — Done
**Goal:** owner request: with a bonus place for every machine (1.38), the explanations under the map get long and messy. Make them short and easy to scan.
**Details:**
- **Today:** under the map (`src/components/MapPanel.tsx`) a wrapping line lists each terrain with "(+20% Solar Panels)" or "(Hydropower Dams only)", plus a ⭐ note, a fenced-land note and the Exclusion Zone hint. Long lists of machine names per zone will make this wrap into a hard-to-read block.
- **New layout:** a compact grid (two columns on wide screens, one on phones): each row has the tile sprite, the zone name and its bonus, and the machines it suits as small generator/producer icons (from the typed `sprites` object) instead of a sentence of names. "Must be built here" zones get a short "only here" tag.
- Long text (the full zone description) moves into the existing tooltip on each row, not the visible legend.
- Show only zones on the visible site by default, with a "Show all zones" toggle (remembered as a per-viewer UI setting, like other collapsed sections); the Exclusion Zone hint and the fenced-land note become one short line each at the end.
- Optional filter: hovering or tapping a legend row highlights that zone on the map.
- Works at phone width with no horizontal scroll.
**Acceptance:** tests: the legend renders one row per zone with its bonus and machine icons; hidden zones appear with the toggle; the full description is in the tooltip; at a 375 px wide viewport the legend does not overflow (jsdom or Playwright smoke test).
**Done notes:** new `src/components/MapLegend.tsx`. Each row: tile, zone name, bonus, an "only here" tag for must-build zones, the machines as icons (name on hover and in the label), and visitors (the Deuterium Extractor on the coast) after "also". The highlight is on: hovering, focusing or tapping a row lights that zone's tiles. "Show all zones" is remembered in `localStorage` (`megagen-idle-legend-all`). Plain land and ⭐ share one short line; the fenced-land note and the Exclusion Zone hint are one line each. Playwright test at 375 px.

### 1.37 — No timed events started on return from time away; no clashing weather — CODE — Done
**Goal:** fix an owner bug report: opening the game after a while often started two or three events at once, such as Overcast and Sunny spell together.
**Details:**
- **Cause:** the catch-up roll on load covers the whole time away (up to three events). Timed effects such as Overcast or Sunny spell were then started at the moment the game opened, for their full 10 to 15 minutes, even though they "happened" hours earlier and would have run out long ago. Opposite weather (Sunny spell and Overcast, Strong winds and Calm air) could also land together.
- **Fix:** catch-up no longer rolls timed effects; it only rolls one-off events (finds, grants, losses, pets), still at most three. Any roll covering a stretch longer than a timed effect's own duration (an app resumed after a long pause) skips that effect too. A timed event does not roll while another timed effect on the same target (the same generator type, resource, or all output) is still running.
- **Unchanged:** event rates, the catch-up cap, sightings and map events.
**Acceptance:** tests: catch-up never starts a timed effect; a long stretch skips it and a short one does not; no Overcast during a running Sunny spell, but it can follow once that ends.

### 1.36 — Smaller bonuses for the common map events; delivery grows with player level — CODE — Done
**Goal:** apply playtest 19.4 feedback. Map events now come more often, so the frequent ones should give smaller bonuses, and the delivery truck should bring more to higher-level players.
**Details:**
- **Lightning:** +25% for the struck type (was +50%), still 3 minutes per strike. Strikes on the same type still add time.
- **Delivery truck:** brings 8 minutes of that producer's resource (was 15), at least 5. It already scaled with production; now it also grows 3% per player level above 1 (×1.6 at level 21, ×2.5 at level 51). This uses a new optional `perLevel` on `grant-resource` effects.
- **Unchanged:** the fire (uncommon, needs a click), the flood (a penalty) and the birds and falling star (no bonus).
**Acceptance:** tests for the new lightning bonus and the level scaling of the delivery.

### 1.35 — Lightning strikes stack per generator type — CODE — Done
**Goal:** fix the playtest 19.3 bugs. A strike while a lightning boost was running reset the timer to 3 minutes instead of adding time. A strike on another type replaced the first boost, so that type lost its bonus.
**Details:**
- **Same type:** a strike on a type that already has a boost adds 3 minutes to the time left.
- **Another type:** gets its own boost and timer; both run at once.
- **Messages:** the log names the struck type ("Lightning struck a Coal Plant: +50% from your Coal Plants for 3 minutes."). The active-events chips name it too ("Lightning strike (Wind Turbine)").
**Acceptance:** tests for adding time, separate types, and an ended boost starting fresh.

### 1.34 — Level ups in the event log — CODE — Done
**Goal:** apply playtest 19.3 feedback: level ups should appear in the event log.
**Details:** each new player level ("Player level 12 reached: +1.1% energy from all generators") and research level ("Research level 5 reached") is logged, with a star icon. They are not toasts, so they add no pop-ups.
**Acceptance:** a test logs both and nothing when nothing changes.

### 1.33 — Producers granted by research shown on the map — CODE — Done
**Goal:** fix the playtest 19.3 bug: a Uranium Mine from research did not appear on the map.
**Details:**
- **Cause:** by design, producers granted by research (Gas Well, Oil Rig, Uranium Mine and Deuterium Extractor, one each) take no room, so the map left them out.
- **Fix:** they now stand on the map, and the site gains the tiles they cover (`grantedTiles`). They still use no room.
- **Preview:** the room expansion preview starts after that land.
**Acceptance:** a site map test places a granted Gas Well and grows the site by its size; checked in the running game.

### 1.32 — Balance: costlier metal and stone, harder room, longer research — CODE — Done
**Goal:** apply playtest 19.3 feedback: metal and stone costs are too low everywhere, room expansions ("storage upgrades") should be slightly harder, and research should take slightly longer.
**Details:** the knobs are in `src/data/balance.ts` and are applied where the data is defined.
- **`MATERIAL_COST_FACTOR` (2):** doubles every metal and stone cost: builds, upgrades (derived from the build cost), producers, research, room expansions and pet food. Starting metal and stone double too, so the first builds work the same.
- **`ROOM_ENERGY_FACTOR` (1.2):** room expansions also cost 20% more energy.
- **`RESEARCH_TIME_FACTOR` (1.25):** research takes 25% longer, rounded to whole minutes.
- **Assumption:** there is no storage mechanic, so "storage upgrades" is read as the room expansions, the only capacity upgrade.
- **Simulator speed:** the longer run took about 45 s in the test. Two speed-ups bring it back to about 30 s with the same results:
  - research bonuses are cached per research list;
  - the simulated player skips scrap-and-build attempts it cannot pay for, or that found no spot before.
**Acceptance:** tests updated for the new costs; simulator: 100% at about 259 h (was 211 h), early milestones unchanged, no stalls.

### 1.31 — Slow rates per minute or hour — CODE — Done
**Goal:** apply playtest 19.3 feedback: a slow producer showed "+0.00/s", which looks wrong.
**Details:** a rate under 0.1 a second shows per minute ("+4.40/min"), and under 1 a minute per hour ("+2.20/h"). This uses `formatRatePer` and `rateUnit` in `src/utils/format.ts`. The resource tooltip uses the same unit on every row ("Uranium per hour").
**Acceptance:** unit tests for the unit choice; checked in the running game.

### 1.30 — Birds that look like birds — CODE — Done
**Goal:** apply playtest 19.2 feedback: the map birds "don't look like birds at all" (tiny gray marks that read as lines).
**Details:**
- **New sprite:** one gull per 16×16 sprite (`map_bird_1/2`, wing up and down), side view facing right. It has a white body, gray wings with dark tips, a yellow beak, an eye and a tail, with a dark outline so it stands out on any ground. It replaces the 32×16 four-bird `map_birds_1/2`.
- **On the map:** three gulls fly in a V, each about one tile in size, flapping slightly out of step.
**Acceptance:** checked by eye in the running game; the map event test expects the new sprite; `npm run check:assets` passes.

### 1.29 — Map events halfway between the old and new pace — CODE — Done
**Goal:** apply playtest 19.1 feedback: after 1.27, map events were too rare to judge the new designs; they should sit between the v0.19.0 and v0.19.1 pace.
**Details:** `MAP_RATE_PER_HOUR` is now the midpoint of the two: common 4.1, uncommon 2.05, rare 0.8, legendary 0.16 per hour while the Map tab is open. That is about 17 events an hour, one every 3 to 4 minutes (v0.19.0: about one every 3; v0.19.1: one every 4 to 5).
**Acceptance:** the rates are the midpoint; build and tests pass.

### 1.28 — Much costlier contract perks — CODE — Done
**Goal:** apply playtest 19 feedback: maxing every perk shop item was "way too easy" and should be significantly harder.
**Details:**
- **More levels, steeper prices:** 13 perk levels for about 600 points in all (was 5 levels for 48). Each level adds a step: +1 slot, +25% deadline, +15% bundles and boosts, or new offers 5 minutes sooner (30 → 15 minutes).
- **Numbers** live in `PERKS` and `PERK_STEP` in `src/data/contracts.ts`.
- **Saves:** levels already bought stay bought. A level 1 "Patient customers" now gives +25% instead of +50%, "Better terms" +15% instead of +25%, and "Busy grid" 25 minutes instead of 20; the next levels go further.
**Acceptance:** tests for the per-level effects, the last level, and the shop texts; simulator: every perk at about 166 h (was 32 h), 100% at about 211 h, no stalls.

### 1.27 — Map events rarer; Exclusion Zone hint on the map — CODE — Done
**Goal:** apply playtest 19 feedback: map events were "a bit too frequent", and the owner could not find the Exclusion Zone on the map.
**Details:**
- **Rates:** `MAP_RATE_PER_HOUR` is about 35% lower (common 3.2, uncommon 1.6, rare 0.65, legendary 0.13 per hour while the Map tab is open).
- **Hint:** until the site reaches the zone's first row, a note under the map legend says the zone lies further south and opens with room expansions 9 and 10 (past 480 tiles).
**Acceptance:** a test shows the hint for a small site and hides it once the zone is in view.

### 1.26 — Dedicated pixel designs and animations for map events — CODE — Done
**Goal:** apply playtest 19 feedback: the emoji looked odd; use dedicated designs and animations.
**Details:**
- **New generic sprites** (`events/`): birds in two wing frames, a delivery truck, a lightning bolt, fire in two flame frames, a falling star with its trail, and a wave for the flood.
- **Animations:** the frames swap for wing flaps and flickering flames, and the truck bounces on its wheels. All of it stops with reduced motion.
**Acceptance:** a test checks that birds, truck and fire draw sprites and no emoji; `npm run check:assets` passes.

### 1.25 — Map events and sightings face the way they move — CODE — Done
**Goal:** fix the playtest 19 bug: the delivery truck and the birds drove and flew backwards (the emoji faced left while moving right).
**Details:**
- **Map events:** the new sprites (1.26) for everything that moves face right, the way it travels. The truck now drives in from the left and stops just left of the producer, facing it. The falling star's trail points back along its path.
- **Other randoms:** every sighting was checked. The whale faced left but swam right, so it is now mirrored. Spaceship, cat, paper plane and balloons were already correct.
**Acceptance:** sprites face their direction of travel (checked by eye).

### 1.24 — Scrapping refunds 10% of everything spent — CODE — Done
**Goal:** apply playtest 18 feedback: scrapping gives back 10% of the building cost, and for an upgraded machine 10% of everything spent on it.
**Details:**
- **Generators:** the refund is `SCRAP_REFUND_SHARE` (10%) of the build cost plus every upgrade, energy and resources, rounded down. Costs are counted at today's discounts, since what was paid is not stored.
- **Producers:** 10% of what each scrapped one cost; producers granted by research were free and give nothing.
- **Where it shows:** the Scrap tooltip and both confirm rows show the exact refund.
**Acceptance:** tests for the build-only and upgraded refunds, the producer refund, and free granted producers; UI texts updated. Simulator: about 112 h, no stalls.

### 1.23 — Map upgrade: the Exclusion Zone for fictional generators — CODE — Done
**Goal:** apply playtest 18 feedback: the fictional generators may need a map upgrade.
**Details:**
- **The zone:** room tiers 9 and 10 open a fenced "Exclusion Zone" at the bottom of the map, with its own glowing terrain. The fictional generators must stand there (like hydro on the river) and get +10% when fully inside.
- **Look:** new terrain and detail sprites (warning signs, containment pylons), and a soft pulse animation that honors reduced motion.
- **Tidying:** the map legend, the Guide and the expansion preview include the zone.
**Acceptance:** only fictional generators may stand there and they need it (tests); the zone appears only with tiers 9 and 10; the simulator places them and reaches 100% with no stalls.
**Notes:**
- **The zone:** every land tile from row 20 down, which is what tiers 9 and 10 open; the river and coast still run through it.
- **Look:** purple shielded floor with a glowing grid, warning signs and containment pylons, and a soft pulse (off with reduced motion).
- **Rules:** fictional generators need at least half their tiles in the zone and get +10% fully inside. Other machines may stand there until an experiment needs the spot, the same give-way rule as the river and coast, now for any required zone.
- **Cap:** the zone holds about 280 tiles, so it caps how many Fusion Reactors and Micro-Supernovas fit, a real decision for the late game.
- **Simulator:** when a zone is full it scraps weaker machines that belong there (for example a Fusion Reactor) to make room for a stronger one. About 138 h to 100%, no stalls.
- **New sprites:** tile_exclusion, deco_warning, deco_pylon.

### 0.38 — Event log and notifications — CODE — Done
**Goal:** the player can see what happened, especially while away.
**Details:** a capped in-memory event log (research completed, generator deactivated for lack of fuel, room nearly full, new unlock available) with timestamps, shown in a collapsible panel. Transient toasts for important events, with a cap so they cannot flood the screen. Events are generated by the systems, not the components.
**Acceptance:** events appear from each source system; the log is capped; unit tests for generation and the cap.
**Notes:** pure `deriveEvents(prev, next)` in `src/utils/eventLog.ts`, run by a store subscription after every change. It reports research completed, new generators, producers and research available, fuel run-outs (grouped by fuel) and room crossing "nearly full". Replacing the game (load, reset, rehydration) bumps `eventEpoch`, so it is not logged. The log is collapsible, holds at most 100 entries and shows newest first; at most 3 toasts show for 5 s each. Tunables are in `src/data/notifications.ts`. Random events (0.84/0.85) will use `logEvents`.

### 0.39 — Statistics panel — CODE — Done
**Goal:** the player can see where their energy comes from.
**Details:** lifetime energy, current rate, per-generator and per-type contribution with percentages, resource rates, total play time, time of last offline gain. Derived from selectors, with nothing new persisted beyond lifetime totals.
**Acceptance:** numbers match the simulation within rounding; unit tests for the aggregations.
**Notes:**
- **Stats tab** (new, between Completion and Guide): totals (lifetime energy, energy rate now, play time, clicks, energy from clicks, times back after a break, playing since, last offline gain), energy by generator type with share bars and percentages, resources per second (made, burned, net), and the top 10 generators with "Show all".
- **Pure aggregation:** `getStatistics(state)` in `src/utils/statistics.ts`, using the same rules the game runs on. Tests check the per-generator and per-type outputs add up to the energy rate, the resource rates equal the resource bar's, and both match what `advanceTime` actually produces over a minute.
- **Saved (lifetime totals only):** `stats` gained `playSeconds` (live, on-screen ticks only), `clickEnergy`, `startedAt` and `lastOffline` (save version 19). Older saves start these at 0 and show "Playing since: before statistics began".
- The page is a little wider on large screens (`max-w-7xl`) so the 11 tabs still fit one row at 1280 px; they wrap on smaller widths.

### 0.40 — First-run onboarding and in-game guide — CODE — Done
**Goal:** a new player understands the loop without being told. Playtest 11: the game also needs player info, like a tutorial or game guide.
**Details:**
- **Onboarding:** on a fresh save, a short, skippable sequence: click to make energy, then build your first generator, then start your first research. It highlights the relevant UI, one step at a time, is dismissible, and never repeats once completed (stored in settings). No modal walls of text.
- **Guide:** a **Guide** (❓) tab or panel with short illustrated sections. It covers energy and clicking, generators and room, fuel, producers and resources, research and the research level, upgrades, offline progress (24 hours), player level, completion, random events and saves. The text is written in data (`src/data/guide.ts`) so it is easy to update as features arrive.
- **Replay:** a "Replay the tutorial" button in Settings.
**Acceptance:** onboarding appears only on a fresh save; skipping works; reset and replay bring it back; every guide section renders; a smoke test covers the first onboarding step.
**Notes:**
- **Walkthrough:** 4 steps (click, build a Solar Panel, start research, "you're set"). A card under the click button highlights the target with a pulsing outline, using `data-tutorial` attributes. Steps move on when done; on a replay they move with "Next".
- **Saving:** the step is in `settings.tutorial` (save version 10). Older saves skip the walkthrough; Reset brings it back.
- **Guide:** a new Guide tab with 10 sections from `src/data/guide.ts`, plus a "Replay the tutorial" button there and in Settings.

### 0.41 — Responsive layout and keyboard access — CODE — Done
**Goal:** the game is usable on a phone browser and by keyboard.
**Details:** layout works from 360px wide upward (panels stack, grids reflow, no horizontal scroll). Tap targets at least 44px. All interactive controls are real buttons, reachable by Tab, with visible focus and sensible labels. Respect `prefers-reduced-motion` for the animations added in 0.20 and later.
**Acceptance:** no layout breakage at 360px, 768px and 1280px; every action reachable by keyboard.
**Notes:**
- **No sideways scroll:** the phone-width tab bar scrolled the whole page sideways (hidden tab labels escaped their tabs). The tabs now wrap onto a second row; checked on every tab at 360, 768 and 1280 px with a late-game save, and by a new Playwright test (`e2e/layout.spec.ts`).
- **Phones:** on touch screens every button and select is at least 44 px (a CSS rule in `src/index.css`; machines and fires drawn on the map keep their tile size). Rows in "Your generators" wrap their Turn on/off and Scrap buttons under the name instead of squeezing it.
- **Keyboard:** a visible amber focus ring on every control. The tabs follow the ARIA tabs pattern (one Tab stop; arrows, Home and End). Map machines move by keyboard: Enter selects, arrow keys move the outline, Enter places, Escape cancels. Dialogs (research details, welcome back, cloud dialogs) keep Tab inside them (`useFocusTrap`) and scroll when taller than the screen.
- **Motion:** the in-game "Reduce motion" setting now stills every CSS animation (celebrations, glows, pulses, transitions), the same as the operating system's setting, which was already respected.

### 0.42 — Performance pass — CODE — Not started
**Goal:** stays smooth with a large base.
**Details:** profile with around 200 generators and a full research tree. Memoize selectors, avoid re-rendering the whole tree on every tick, batch store updates, decouple the 1-second tick from React renders where possible. Add a benchmark script or test asserting the tick stays under a set budget.
**Acceptance:** measured improvement recorded in the PR; no behavior change; benchmark in CI.

### 0.43 — Visual polish pass — CODE — Done
**Goal:** the game looks deliberate rather than assembled.
**Details:** consistent spacing, panel styling and typography from Tailwind theme tokens using the AAP-64 palette; consistent dark theme; number and progress-bar styling unified; subtle transitions on build, unlock and research completion (respecting reduced motion); a tidy top bar with energy, rate and room. No new mechanics.
**Acceptance:** no regression in tests; screenshots or a description of before and after in the PR.
**Notes:**
- **Theme tokens and shared styles:** `@theme` in `src/index.css` names the AAP-64 colors the UI uses (`aap-yellow`, `aap-orange`, `aap-sky`, `aap-mint`, `aap-ink`, `aap-steel`). New `panel` and `panel-title` utilities replace 12 hand-written panel and 22 heading class lists, so every tab has the same card, padding and heading type. The dark theme and colors the owner approved are unchanged.
- **Top bar:** energy, rate, room and player level now stay pinned at the top while scrolling (on phones too); toasts moved below it on phones. The tab bar fits one row on desktop, and the selected tab has an energy-yellow top edge.
- **Transitions:** a new machine in "Your generators" fades in; a build card that unlocks during play glows twice (not when a game loads). Research completion keeps its celebration. All of it is off with reduced motion (the OS setting or the in-game one).
- **Before and after:** before, the tabs wrapped to two rows at 1280 px and the energy total scrolled out of view on long lists; panels and headings differed slightly between tabs. Progress bars already shared `ProgressBar`; no change there.

### 0.18 — Test coverage pass — CODE — Not started
**Goal:** fill gaps left by individual items.
**Details:** review coverage for `idleEngine`, `generatorSystem`, `researchSystem`, `resourceSystem`, `roomSystem`, `energyGeneration`, `formatNumber`. Cover edge cases: negative time, huge gaps, insufficient resources, prerequisite chains, save migrations. Target 80% or more on `src/utils/`.
**Acceptance:** coverage report meets the target; tests stable with no dependence on real time.

### 0.44 — More real-world generation methods — CODE — Not started
**Goal:** broaden the real-world methods the design lists, keeping fiction a minority.
**Details:** add Geothermal, Biomass and Wave power with distinct trade-offs (for example geothermal has a high build cost but no fuel; biomass burns a renewable resource). Place them in the research tree at sensible levels, add data, sprites and tests, then re-run 0.35.
**Acceptance:** each new method is reachable, balanced against its tier, and covered by tests.

### 0.45 — Deeper research tree — CODE — Not started
**Goal:** research stays meaningful into the late game.
**Details:** extend the tree toward research level 25 with branches for efficiency, room cost reduction, fuel efficiency and offline gain. Verify the 0.13 layout still reads well. Re-run 0.35 and record pacing.
**Acceptance:** no dead ends or unreachable nodes (add a test that validates the tree graph: every node reachable, no cycles, every prerequisite exists).

### 0.46 — Crash recovery and error boundaries — CODE — Done
**Goal:** a bug never destroys a save.
**Details:** React error boundary showing a recovery screen with export-save and reset options. Guard save loading: if the stored state fails validation, keep a backup copy and start from a safe state rather than crashing. Log the problem to the event log from 0.38.
**Acceptance:** tests simulate a corrupt save and a thrown render error; the save is recoverable in both cases.
**Notes:**
- **Save check before loading:** `checkStoredSave` (`src/store/saveGuard.ts`) reads, migrates and validates the stored save (the same checks as an imported save) before the game uses it. A save that fails is set aside under `megagen-idle-save:damaged` (IndexedDB, or localStorage if that fails), never overwritten. If the other copy (the 0.76 localStorage backup or the main save) is fine, it loads; otherwise a new game starts. A save from a newer game version is treated the same way.
- **Telling the player:** a 🛟 event log entry and toast ("Your saved game could not be loaded (reason). A copy was kept…"), and Settings → Save shows the kept copy with "Download the kept copy" (in the import-file format) and "Delete it". New log kind `save`.
- **Error boundary:** `src/components/ErrorBoundary.tsx` wraps the game. A render error shows a recovery screen (Try again, Download save, Reset game… which keeps a copy of the current game first) and is written to the event log, instead of a blank page.
- **Tests:** unit tests for the check, the guarded storage (damaged copy kept, fallback to the good copy, localStorage fallback) and the recovery screen; a Playwright test damages the real stored save and reloads.

### 0.47 — Balance re-tune and difficulty curve review — CODE — Not started
**Goal:** one coherent pacing pass once all content exists, aiming for at least 200 hours to 100% completion (owner, playtest 8). Playtest 10: reach it with a mix of new content (the larger share, including new activities, not only research and machines) and somewhat slower pacing.
**Details:** run 0.35 across the full content set, find stalls and runaway growth, adjust data files only (no mechanic changes), and record before and after in `BALANCE_REPORT.md`. Where the owner's playtest feedback conflicts with the targets, follow the feedback and update `src/data/pacingTargets.ts`.
**Acceptance:** no stall longer than the target for its phase; report explains every change.


### 0.65 — Achievements — CODE — Done
**Goal:** owner request (playtest 5): achievements that reward milestones.
**Details:** data-driven list in `src/data/achievements.ts` (first generator, 10 generators, each generator type built, each research completed, energy totals 1K/1M/1B, room expansions, producer counts, offline returns). Pure `checkAchievements(state)` run by the systems (not components); unlocked achievements saved with their unlock time. Achievements tab or panel with locked/unlocked states and progress bars; a toast when one unlocks (uses the event/toast system from 0.38 if present, otherwise its own). Rewards are cosmetic or small boosts only if the owner agrees; start with no gameplay rewards. New generic sprites (achievement badge locked/unlocked) via the manifest and generator script.
**Acceptance:** unlocks fire once, persist, survive migration; tests for each condition type.
**Notes:**
- **List:** 44 achievements in `src/data/achievements.ts`, each a metric and a target; rules in `src/utils/achievements.ts`.
- **Unlocking:** a store subscription unlocks them with the time and a 🏆 notice; a loaded or reset save unlocks silently.
- **Counters:** `stats.clicks` and `stats.returns` (save version 15).
- **Display:** a new Achievements tab with progress bars, grouped by category.
- **Completion:** gains an "Achievements" part without the 8 bonus ones.
- **Rewards:** none yet (the owner can decide).
- **Sprites:** achievement_unlocked and achievement_locked.
- **Tabs:** they wrap onto two rows on tablet and desktop widths.

### 0.66 — Perfection (completion) tracker — CODE — Done
**Goal:** owner request (playtest 5): a tracker showing how close the player is to "perfection", meaning 100% completion (confirmed in playtest 6).
**Details:** `getCompletion(state)` already exists (`src/utils/completion.ts`, with max levels since 0.82) but is backend only. Playtest 10: it must be visible to the player, like Melvor Idle's completion log. Show the overall % in the top bar. Add a Completion panel (its own tab or a section of a new Progress tab) with one row per part and a progress bar each, expandable to list exactly what is done and what is left (each research, each generator type with its best level out of max, each room tier, each producer type, later achievements, sightings and contracts). Each part shows its share of the total.
**Acceptance:** 0% on a fresh save (except what starts owned), 100% only when everything is done; tests for the aggregation.
**Notes:** new Completion tab. It shows the overall % (one decimal, rounded down) and one row per part with a bar and its share of the total. Each row expands to list every entry, done or not; generator rows show their best level out of the max. The % also shows on the tab button. Achievements (0.65), sightings (0.84) and contracts (0.86) add their own parts when they arrive.

### 0.67 — Public release plan: accounts and cloud saves — CODE — Done
**Goal:** owner request (playtest 5): make the game available to the public with sign-up, usernames, passwords, log-in and a per-account save. Accounts are for both cloud saves and leaderboards (playtest 6). Saves work like Melvor Idle (playtest 10). The game saves automatically to the cloud and locally. The player can load either the local or the cloud save, on the same device or another one: for example, play on a computer, then open the mobile app and load that save.
**Details:** GitHub Pages hosts static files only, so accounts need a hosted backend. This item writes `docs/PUBLIC_RELEASE.md`: options compared (e.g. Supabase, Firebase, a small server), recommended choice, data model (user, save blob, version), security (hashed passwords handled by the provider, no secrets in the repo, rate limits), privacy (what is stored, deleting an account), cheating considerations for an idle game (matters for leaderboards: server-side plausibility checks on submitted scores), leaderboard design, a LICENSE file and an in-game credits screen (AAP-64 palette by Adigun A. Polack, open-source libraries), cost estimate, and the exact one-time steps the owner must do (create the project, add the public keys as GitHub repository variables). Also adds a save-sync abstraction in code (`SaveBackend` interface with the current IndexedDB implementation) so a cloud backend can plug in later without touching game logic.
**Acceptance:** plan document reviewed in the PR; the abstraction is in place with the local backend and tests; nothing requires secrets.
**Notes:**
- **Plan:** `docs/PUBLIC_RELEASE.md` recommends Supabase, comparing it with Firebase, PlayFab and a small server. It covers the data model, security, privacy, cheating and leaderboards, sync, costs, the 15-minute owner setup and open decisions. `docs/supabase-schema.sql` has the tables, row-level security and `delete_my_account()`, ready to paste.
- **Code:** `src/store/saveBackend.ts` has `SaveBackend`, the IndexedDB local backend, `summarize` and `chooseSave` (conflict rule), with tests.
- **Credits:** Settings → Credits.
- **Licenses:** `THIRD_PARTY_NOTICES.md` comes from the new `npm run notices`. `LICENSE` reserves all rights, a safe default for a game meant for sale; the owner may change it.
- **Measured:** a late-game save is about 11 KB.

### 0.68 — Accounts and cloud saves — CODE — Partial (built and tested with fakes; live test waits for the owner's Supabase setup)
**Goal:** implement 0.67's plan once the owner has created the backend project.
**Details:** sign-up, log-in, log-out, password reset through the chosen provider; automatic cloud save on a timer and on close, alongside the local save; a load screen listing the local and cloud saves (time, version, energy, completion %) so the player picks which to load on any device; conflict handling (newest wins, with a prompt); guest play keeps working offline. **Blocked until the owner completes the one-time setup in `docs/PUBLIC_RELEASE.md`.** Until then, skip it and continue with other items.
**Acceptance:** end-to-end test against the provider's local emulator if available; otherwise mocked; no secrets committed.
**Notes:**
- **Built ahead of the setup (owner, playtest 17: the website comes next):** everything is in place but switched off until the two repository variables exist.
- **Code:**
  - `src/store/cloud.ts`: the Supabase service behind `CloudAuth` and `SaveBackend`, with the library loaded only when configured.
  - `src/store/account.ts`: account state and sync. It uploads every 5 minutes (timestamp-based) and when the game goes to the background (keepalive request). On sign-in it decides with `decideOnSignIn`: if the cloud save has not changed since this device last synced, play just continues; otherwise it asks.
- **Screens:**
  - Settings → Account and cloud saves: sign in, create an account (username checked first), forgot password, save or load now, sign out, delete account.
  - A "Which game do you want to keep?" dialog that marks the newer save, and a "Set a new password" dialog after a reset link.
- **Other:**
  - `public/privacy.html`.
  - The deploy workflow passes `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from repository variables.
  - Supabase was added to Credits and notices.
- **Tests:** the sign-in decision, the account flows against a fake service, the Supabase mapping against a fake client, and component tests.
- **Still to do:** once the owner has set up the project, a live test: sign up, confirm the email, sign in on two browsers, check the save-choice dialog and delete the account. Then mark this Done.

---

## Changes from the original Notion backlog

- Paths made repo-relative. The `deployment.sh` that pushed to `main` was replaced by GitHub Actions.
- 0.21 (room sprite sync bug) folded into 0.20; 0.23 (coal depletion bug) folded into 0.11; 0.25 (refactor energy generation) folded into 0.07. They described fixes to code that did not exist yet.
- 0.24 (Webpack config) dropped: this project uses Vite.
- 0.03 and 0.04 had leftover text from another project (`[cite: 2026-01-20]`, `newDayId`), now removed.
- Audio items (0.05, 0.06, 0.14, 0.15) and AI art items (0.08, 0.12, 0.17) moved out of scope; sprites are generated by a script instead (0.27).
- Items 0.01, 0.02 and 0.03 were marked Done in the original backlog, but that code and art no longer exist. They are replaced by 0.00, which builds the project from scratch.
- Added 0.00 (project creation), 0.37 (README), and items 0.28 to 0.47 so the plan does not run out of work.
- Order changed: deploy and README come early so playtesting needs only a browser; resources come before generators; export/import (0.28) comes before the settings screen that uses it (0.29).

---

## Playtest log

| Checkpoint | After item | Date | Owner feedback | Items created |
|---|---|---|---|---|
| 1 | 0.37 | 2026-10-01 | Works. Click value and click feedback feel right; colors suit the game. Offline cap should be 24 h, not 8 h. | 0.48 |
| 2 | 0.09 | 2026-10-01 | Works; layout readable; first Solar buildable at once is right; early metal pace fine for now. Fuel "Burns" line should not share the red of "not enough". Energy needs a use: building should cost energy equal to 10 minutes of the generator's output. | 0.49, 0.50 |
| 3 | 0.16 | 2026-10-01 | Starting research is clear; first room expansion price good; tree background looks great. Energy costs (build and research) reached too easily: raise them. Research times far too short; each level must take longer than the previous. Show boosts (e.g. Basic Solar) and their effect when hovering the energy rate, later for resources too. | 0.51, 0.52, 0.53 |
| 4 | 0.36 | 2026-10-01 | Costs and research times fine for now (longer playtests later). Tooltip good. Mid-tier generators feel like upgrades. Scrap: no refund, but add Cancel and a no-refund notice. Show a small release version. "Research level 2" looked like it rose before research finished. Construction animation looks odd: try another approach. Add ways to raise metal, stone, coal and gas income. Raise stone prices a bit. | 0.58, 0.54, 0.55, 0.56, 0.57; 0.31 moved up |
| 5 (v0.5.0) | 0.31 | 2026-10-01 | Producer cost growth should be 20%. Producers should be scrappable. Research labels clear now. Room animation not seen yet. Make research rewards ("Gives") stand out. Scrollbar not in game colors. Celebrate research completion with an animation on any tab. Small images on tab buttons. Add to backlog: achievements, perfection tracker, public release with accounts. | 0.59-0.64; later 0.65-0.68 |
| 6 (v0.6.0) | 0.64 | 2026-10-01 | Celebration and room animation not seen yet. Perfection tracker = 100% completion (confirmed). Accounts are for both cloud saves and leaderboards. Add manual ordering of generators. Scrapping producers should ask how many. Asked whether the sprites can be used legally (yes: drawn by our own script from shapes and AAP-64 colors; add LICENSE and credits before going public, see 0.67). | 0.69, 0.70; 0.66 and 0.67 updated |
| 7 (v0.7.0) | 0.30 | 2026-10-01 | List order as fuel priority is intuitive. Welcome-back detail fine; must mention completed research (it already does). Short notation as default (already). Boost research worth it: add ones for other resources (production and discounts). Say "24 hours" not "1d". Show running research on every tab with time left; running node should blink. Research celebration looks great. Room upgrade animation still looks weird (video not received); add more room tiers. | 0.71-0.75 |
| 8 (v0.8.0) | 0.75 | 2026-10-01 | Add the save-on-close safeguard. Room bar looks good (animation not seen yet). Research chip location odd: make it float at the bottom without hiding the version. 8 room tiers fine for now. +15% all-producer output sounds useful. The tree should start from 3 basic research, one starting resource upgrades. Long-term target: at least 200 hours of play for 100% completion. | 0.76-0.78; 200 h target added to 0.35 and 0.47 |
| 9 (v0.9.0) | 0.32 | 2026-10-01 | Research tree lines hard to follow: split into the three starting branches. Bug: "You were away for 1m 1s" after switching tabs. Bug: build-card tooltip shows over the card above and is unreadable. 100% completion must include building every generator type and upgrading each to max level. | 0.79-0.82 |
| 10 (v0.10.0) | 0.79, 0.80, 0.81, 0.82, 0.33 | 2026-10-01 | Branch layout is right. Oil and Nuclear feel like a real step up; uranium pace and level 9/10 gates fine for now. Reach 200 h with a mix of content (larger share) and slower pacing; content should include a new mode or activity, not only research and machines. 100% completion must be visible to the player (like Melvor Idle). More click-power research. Random events: a large variety, some cosmetic (e.g. a spaceship, foreground only), some with positive or negative effects (some also while idle); all rare, some much rarer. Saves like Melvor Idle: automatic cloud and local saves, load either on any device. Future release on Steam, a dedicated website and mobile. Report hours to 100% every version. Player levels based on lifetime energy. | 0.83-0.88; 0.66 and 0.38 moved up; 0.67, 0.68 and 0.47 updated |
| 11 (v0.11.0) | 0.83, 0.88, 0.66, 0.38, 0.84 | 2026-10-02 | Player level reward: yes but small, about +0.1% per level. About one sighting per hour is right for the common ones. Planned effect events approved. Grid Contracts fine; another activity idea: collect and grow pets that fit the energy theme. An Aurora was recorded as seen but went unnoticed: sightings should stay longer. Bug: 360,722 energy showed as 36K. Level-up needs a celebration like research, and levels gained belong in the welcome-back summary. Add player info: tutorial or game guide. Click research chain drawn on the wrong row. Tree lines should leave each parent as one trunk that splits into its children (sketch). The guide is meant to teach new players how the game works. | 0.89-0.94; 0.40 moved up and widened |
| 12 (v0.12.0) | 0.89, 0.93, 0.94, 0.90, 0.91, 0.40 | 2026-10-02 | Level-ups stay celebrated, but early levels must be harder (no clicking from level 1 to 4 or 5 in seconds). Guide clear. Prefers the squared-off tree lines. Negative events slightly rarer than positive ones. Add sorting to "Your generators" (e.g. by energy per second). | 0.95, 0.96; 0.85 updated |
| 13 (v0.13.0) | 0.95, 0.96, 0.85, 0.86, 0.92 | 2026-10-02 | Contract deadlines fine (still watching the feature); unclear why two contracts showed "Not enough yet" and one did not. Pet bonuses and feed-then-wait make sense; add a short animation when clicking a pet. One effect event per 2 hours fine for now. Achievements next. Bug: meteor shower meteors fall in the wrong direction. | 0.97-0.99; 0.65 moved up |
| 14 (v0.14.0) | 0.98, 0.97, 0.99, 0.65, 0.87 | 2026-10-02 | Achievement rewards should be cosmetic. The achievement list is fine for now. Contract wording much clearer. Release order not decided; prefers easiest to hardest, to reach production as soon as possible. Perk shop unclear: is the number on Buy a cost or an amount, how are points earned, is each contract 1 point? Add an "upgradable first" sort. Future: a map showing the builds, movable, with zones that suit some machines (sunny, windy) and sizes that matter; prioritize by impact. Notifications (browser, later mobile) for research done, level up and so on, handled carefully so they are not annoying. | 1.00-1.07 (map placed before fictional generators and statistics, as the highest-impact item); 0.34 and 0.39 moved up |
| 15 (v0.15.0) | 1.00, 1.03, 1.01, 1.02, 1.04 | 2026-10-02 | "Website" means a real site with sign-up and log-in and saves in the cloud, not in the browser. The map should be larger and more detailed, with varied terrain. Wants random events that only happen on the map and visibly do something there. Planned zones good; hydro must need a river and tidal the coast. Map decorations welcome. Amber accent did nothing. Mixed American and British English: use one (American, the larger market). Bug: coal plant #32 drawn as a huge box over other machines. Event messages vanish too fast; hovering an effect should say exactly what it does. An event seemed missing from the log. The Wheel Hamster's click bonus seemed to do nothing (+2 instead of +3). | 1.08-1.13; 1.05 widened; 0.67 moved up |
| 16 (v0.16.0) | 1.08, 1.09, 1.10, 1.11, 1.05 | 2026-10-02 | The ⭐ and 📍 marks need a tooltip on hover. Map size fine for now; more variety in the small objects would help. +20% and +10% are worth moving machines for. Wants drag and drop. Solar and wind should go onto their bonus zones automatically when built, but not move afterwards. Yes to producer zones (for example a coal field for coal mines). | 1.14-1.18 |
| 17 (v0.17.0) | 1.14, 1.17, 1.16, 1.15, 1.18 | 2026-10-02 | Drag and drop feels right on computer and phone. The "makes way for a new dam" rule is clear and fair. +20% for producers is worth moving them; averaging is clear. Next: accounts and cloud saves for the website (before map events and decorations). Bug: the 📍 tooltip opens to the side and is cut off. Bug: a 1-tile-wide strip of sunny plateau can never give a Solar Panel its bonus. Active bonuses get long: let it be opened and closed. | 1.19, 1.20, 1.21; 0.67 next |
| 18 (v0.18.0) | 1.19, 1.20, 1.21, 0.67, 1.06 (and 0.68 built, waiting for setup) | 2026-10-02 | Supabase is fine; setup in docs/PUBLIC_RELEASE.md done. Sign-in: email, plus Google and Discord as options. Usernames 3–20 letters, digits or _: fine. Keep the license "all rights reserved" (no one may use the project or assets as theirs). Next: 1. fictional generators (may need a map upgrade too), 2. map events and decorations. Scrapping should refund 10% of the building cost; for an upgraded machine, 10% of everything spent on it. | 1.22, 1.23, 1.24; 0.34 widened and moved first |
| 19 (v0.19.0) | 1.22, 1.24, 0.34, 1.23, 1.12 | 2026-10-02 | Fusion and the Micro-Supernova feel like a satisfying late game. The Exclusion Zone limit sounds good, but they could not see it on the map. Map events a bit too frequent; make them slightly rarer. Bugs: the delivery truck and the birds move backwards; emoji look odd, so they want dedicated designs and animations. Maxing contract perks is way too easy. Next after the fixes: map decorations and browser notifications. This run: only the fixes and feedback, no new features. | 1.25-1.28 (hotfix v0.19.1) |
| 19.1 (v0.19.1, hotfix) | 1.25, 1.26, 1.27, 1.28 | 2026-10-02 | Map events now too rare to judge the new designs: set them between the old and new pace. New perk prices are about right. Build nothing else from the backlog until told. | 1.29 (hotfix v0.19.2) |
| 19.2 (v0.19.2, hotfix) | 1.29 | 2026-10-02 | The birds do not look like birds at all; fix them. Build nothing else from the backlog until told. | 1.30 (hotfix v0.19.3) |
| 19.3 (v0.19.3, hotfix) | 1.30 | 2026-10-03 | Slow producers show "+0.00/s". Metal and stone costs too low everywhere they are used. Storage upgrades slightly harder. Research slightly longer. A Uranium Mine from research is missing from the map. Level ups should be in the event log. A second lightning strike adds no time, and strikes should respect the struck type. Nothing else from the backlog until told. | 1.31-1.35 (hotfix v0.19.4) |
| 19.4 (v0.19.4, hotfix) | 1.31-1.35 | 2026-10-03 | New metal and stone prices feel right; "storage upgrades" meant room expansions; research length now right. Map events are more frequent now, so their bonuses should be smaller. The truck should bring more to higher-level players. Nothing else from the backlog until told. | 1.36 (hotfix v0.19.5) |
| 19.5 (v0.19.5, hotfix) | 1.36 | 2026-10-03 | Bug: opening the game after a while starts two or three random events at once (for example Overcast with Sunny spell). | 1.37 (hotfix v0.19.6) |
| 19.6 (v0.19.6, hotfix) | 1.37 | 2026-10-04 | (no feedback before the next run; the owner asked to continue) | |
| 20 (v0.20.0) | 1.40 (birds), 0.41, 0.46, 0.43, 0.39 | 2026-10-04 | Pinned energy bar looks good on the phone. Stats tab fine for now. Fade-in and unlock glow fine. Keep the order 1.38, 1.39, 1.40, 1.41. Bug: with the bar pinned, hovering a build card near the top makes its tooltip jump very high and the bar half hidden. | 1.42 (hotfix v0.20.1) |
| 20.1 (v0.20.1, hotfix) | 1.42 | 2026-10-05 | (no feedback before the next run; the owner asked to continue) | |
| 21 (v0.21.0) | 1.38, 1.39, 1.40, 1.41, 1.13 | 2026-10-05 | 100% completion simulated at 251.0 h. The new bonus places are worth moving plants for; one lake spot is enough. Legend easy to read on computer and phone. Log icons help. Decoration unlocks fine for now. Keep the order: browser notifications (1.07), then the performance pass (0.42). | (none) |
| 21.1 (v0.21.1, hotfix) | 1.07, 1.43, 1.44 | 2026-10-05 | Sign-up showed "Invalid path specified in request URL". Bug: after a cloud save, signing in from an incognito tab did not load it, and "Load cloud save" did nothing. Requests: a click button by the pinned bar, cloud save from anywhere, decorations in a panel over the map, better sprites, a designed loader, a logo, petting achievements. | 1.43, 1.44 (fixed); 1.45-1.51 |
| 22 (v0.22.0) | 1.45, 1.46, 1.47 (and 1.52) | 2026-10-05 | 100% completion simulated at 251.0 h (unchanged). Before testing, owner notes: decorations bought with energy at rising prices, with achievements and completion; more decorations; more random events; more pets; raise one pet at a time, with a stronger effect as it matures; a growing animation; active pets walking on screen on every tab (with a setting); up to 3 active pets, bought with expensive energy upgrades; player level as a hard requirement for room expansions, pet slots and contract perks; research points for high-level research; map tooltips beside the machine. | 1.53-1.63 |
| 22 (after test) | 1.45, 1.46, 1.47 | 2026-10-05 | ⚡ and ☁️ buttons are fine. Decorations panel not good enough: on a big map, scrolled down, the button cannot be seen; bottom right is a good place. Research points: not a spent currency; research level requirements are too low (the top research needs level 14, the owner is research level 21 within a week): make them harder. Order the new items by approximate priority. | 1.64 (hotfix v0.22.1); 1.62 rewritten; 1.53-1.63 ordered |
| 22.1 (v0.22.1, hotfix) | 1.64 | 2026-10-05 | The decorations panel works as expected now. Put the map legend (under the map) into a similar floating panel. Sort the unlocked titles into tiers by difficulty, with a color per tier. Some map events (birds, truck) seem to always appear in the same place: they should appear anywhere, at random. In the ☁️ menu, highlight "Save to cloud now" like in Settings. (The first v0.22.1 deploy failed on a flaky test, fixed in PR #37.) | 1.65, 1.66, 1.67, 1.68 |
| 23 (v0.23.0) | 1.68, 1.62, 1.61, 1.65, 1.63 | 2026-10-06 | 100% completion simulated at 264.7 h (was 251.0 h): the player level gates slow the middle game. Map tooltips fine for now. Research requirements fine for now. Player levels 50 and 70 for the last two room expansions are right. Keep the order 1.66, 1.67, 1.53. Do not develop the next items until the owner says so. | (none) |
| 24 (v0.24.0) | 1.66, 1.67, 1.53, 1.57, 1.59 | 2026-10-06 | 100% completion simulated at 243.9 h (was 264.7 h): decorations and pet slots add purchases and completion entries; the stacked bonuses of up to 3 active pets speed up the end game. Owner note before testing: decorations are paid to unlock copies (up to 6 of a kind), then placed and removed freely; 1.53 reworked in the same PR. | 1.53 reworked |
| 24 (after review) | 1.66, 1.67, 1.53, 1.57, 1.59 | 2026-10-06 | Rose for Epic titles: yes. ×1.6 per copy and the decoration prices: right. Decorations stay as they are now (6 copies of a kind, bought once, placed and removed freely). Pet slot prices and player levels: right. Requests: open and close the Cosmetics section in the Achievements tab; a button to remove all decorations from the map at once; working machines on the map should look like they are working (an animation). Do not develop the next items until the owner says so. | 1.69, 1.70, 1.71 |
| 24 (bug reports) | | 2026-10-06 | The owner asked to continue. Bugs: the Oil Rig's map tooltip shows no level and no oil use; the Completion tab showed 0 decorations bought; "25 decorations bought" makes no sense with 6 of each kind. | 1.72, 1.73 |
| 25 (v0.25.0) | 1.58, 1.72, 1.73, 1.60, 1.56 | 2026-10-06 | 100% completion simulated at 293.3 h (was 243.9 h): all 6 copies of every decoration and six more pets. Waiting for feedback. | |
| 25 (report) | 1.58, 1.72, 1.73, 1.60, 1.56 | 2026-10-06 | The apple shows above the pet when it eats; same for the ball when it plays. A sleeping pet should sleep longer; pets should sometimes stop and do nothing, not move nonstop. | 1.74 (hotfix v0.25.1) |
| 25.1 (v0.25.1, hotfix) | 1.74 | 2026-10-06 | A hovered generator card hides the research chip at the bottom, and the walking pets. | 1.75 (hotfix v0.25.2) |
| 25 (answers) | 1.58, 1.72, 1.73, 1.60, 1.56 (and hotfixes 1.74, 1.75) | 2026-10-06 | Producers should show no level or fuel lines (the earlier note was a mistake); each tooltip should say briefly and clearly whether it is a producer or a generator. Landscape Architect should need all 36 decorations. Walking speed fine, but pets should walk at different speeds; pets should celebrate level ups, research, achievements and so on, and react to random events. Active pets on screen should interact with each other. New pets and their feeding costs fine. Keep the order 1.69, 1.70, 1.71, 1.55, 1.54. Bug: the 💤 still shows far from the pet. Do not develop new backlog items until the owner says so. | 1.76, 1.77 (hotfix v0.25.3); 1.78-1.81 |
