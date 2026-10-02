# Playtest 12 (v0.12.0): number fix, tutorial and guide, level rewards, clearer tree, longer sightings (after item 0.40)

The version at the bottom of the screen should read **v0.12.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 66.5 hours** (simulated idle player), down from about 82.
  - Why: the new player-level bonus (+0.1% per level, about +7% by the end) compounds through the long upgrade stretch at the end.
  - The target is still 200+. Effect events, Grid Contracts, pets and fictional generators come next and add time.
- **Milestones:**
  - First Wind about 2.4 h, Coal about 2.6 h, Hydro about 5.3 h.
  - First Gas about 11.4 h, Oil about 17.4 h, Nuclear about 44 h.
  - Player level 15 at about 3 h, 30 at about 12 h, 49 at about 30 h, and about 72 at 100%.

## New since last playtest

- **Your feedback:**
  - **Bug fixed: numbers lost their zeros.** 360,722 showed as "36K"; it now shows "360K". The same bug made 100K look like "1K" and 200M like "2M".
  - **Bug fixed: click research in the wrong place.** Geared Crank, Kinetic Capture and Grid Tap now continue Flywheel's row.
  - **Tree lines as in your sketch.** Each research sends one trunk line that splits into its children, instead of many curves starting at the same spot. Two parents in one column never share a trunk.
  - **Player level reward:** +0.1% energy from all generators per level (shown in the energy tooltip and the Bonuses panel).
  - **Level-up celebration** like "Research complete!".
  - **Levels in welcome back:** the welcome-back summary now shows "Player level A → B".
  - **Sightings are harder to miss.**
    - Each one now stays 15–20 seconds and moves more slowly.
    - If the tab is hidden, it waits for you.
    - When it ends, a "You spotted: …!" notice appears.
  - **Guide for new players.**
    - A new game starts with a short tutorial: click, build a Solar Panel, start your first research. It is a small card under the click button that highlights what to do next; you can skip it.
    - The new **Guide** tab explains every part of the game. "Replay the tutorial" is in the Guide and in Settings.

## Things to try

1. Look at your energy and resources in short notation. Do the numbers now match "Full" notation (to 3 digits)?
2. Open the Research tab. Are the lines easier to follow now? Is the click chain in the right place?
3. Hover over the energy rate: is "Player level N" listed? Watch for a "Level up!" celebration.
4. Close the game for a while and come back. Does the summary show your new player level?
5. Open the Guide tab. Is anything unclear or missing? Try "Replay the tutorial".
6. To see the tutorial as a new player would: Settings → export your save first, then Reset game, then play the first steps. Import your save again afterwards.
7. Leave the game on screen and wait for a sighting. Is it easier to notice now?

## Known issues

- Early player levels come very fast (levels 2–10 in the first hour), so the first minutes show several level-up celebrations. Quick ones merge into one.
- The event log is for this session only.
- Placeholder art.

## Questions for you

1. Are early level-up celebrations too frequent? Should the first few levels (2–5) level up silently?
2. Is the Guide's text clear, and is there a topic you would add?
3. The tree now uses squared-off trunk lines. Do you like them better than the old curves?
4. Next are effect events: sunny spell, strong winds, rich seam, grant, eureka and volunteer crew on the plus side; overcast, calm air, coal shortage, grid fault, pipe leak and equipment wear on the minus side. Should negative events be rarer than positive ones?
