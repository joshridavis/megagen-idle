# Playtest 8 (v0.8.0): research everywhere, new room bar, resource research (after item 0.75)

The version at the bottom of the screen should read **v0.8.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## New since last playtest (all from your feedback)

- **Research on every tab.** While a research runs, a chip under the energy display shows its name, time left and a progress bar on any tab. Click it to jump to Research. The running node in the research tree blinks.
- **New room bar.** Your video showed the old meter wrapping onto a second row, with scaffolding jumping between rows and sometimes coming back. The meter is now one fixed-width bar:
  - used room in green (red at 90%+), with tick marks every 10 room;
  - after an expansion, the new room slides in as an amber striped "under construction" section, then settles after about 2 seconds;
  - I checked it in a browser: it plays once and never comes back.
- **8 room tiers** (was 3): +35, +50, +70, +100 and +140 room after the first three. Later tiers also cost coal, and the last one costs natural gas. The panel shows "Expansion N of 8".
- **Resource research** (six new nodes):
  - Better Pickaxes: +25% metal.
  - Controlled Blasting: +25% stone.
  - Conveyor Belts: +15% from all producers.
  - Modular Mines: 15% cheaper producers.
  - Efficient Boilers: 20% less fuel burned.
  - Deep Drilling: +20% from all producers.
  
  Hover over a resource's rate to see these boosts, and the Active bonuses panel lists them.
- **"24 hours"** now replaces "1d" for the offline limit.
- Already in place, as you asked: the welcome-back summary lists research that finished while you were away, and Short is the default number style.

## Pacing I measured (simple idle player, 48 hours)

- All 22 research done by about 25 hours.
- Room tiers 4 to 7 by about 20 hours. Tier 8 (100 natural gas) is a long-term goal.
- No stalls.

## Things to try

1. Start a research, then switch tabs. Is the chip clear? Click it.
2. Look at the blinking node in the research tree.
3. Expand your room and watch the new bar animation.
4. Research Better Pickaxes or Conveyor Belts and hover over the metal rate.
5. Run coal plants with Efficient Boilers: does the coal rate improve?
6. Check the Settings note says "24 hours".

## Known issues

- Saves are written in the background, so an action in the last second before closing the tab may not be saved. Tell me if you want a save-on-close safeguard.
- No balance simulator yet (0.35). All numbers are first guesses.
- Placeholder art.

## Questions for you

1. Is the new room bar animation better?
2. Is the research chip in the right place, or would you prefer it smaller or somewhere else?
3. Are 8 room tiers enough, and do the later costs feel right?
4. Which resource research felt most useful?
