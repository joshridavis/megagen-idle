# Playtest 9 (v0.9.0): upgrades, safe saves, floating research chip, balance simulator (after item 0.32)

The version at the bottom of the screen should read **v0.9.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## New since last playtest

- **Your feedback:**
  - **Save-on-close safeguard.** Every save is also copied instantly to a backup, so closing the tab right after an action no longer loses it. A test simulates a tab closing before the main save lands, and the action survives.
  - **Floating research chip.** While a research runs, its chip floats at the bottom of the screen on every tab. The page leaves room beneath, so the version number is never hidden.
  - **Three starting research.** New root **Basic Mining** (+10% output from all producers). It starts the resource upgrades (Better Pickaxes, Controlled Blasting, Modular Mines). Like Basic Solar, it needs a Solar Panel built first.
  - **200 hours to 100% completion** is now the official long-term target. The balance simulator measures it (see below).
- **Generator upgrades.** Each generator in your list shows its level (Lv 1/10) and an **⬆ Upgrade** button. Each level adds +25% of its base output, and upgrades never take extra room. Hover over the button for the cost and gain.
- **Fix:** the free Gas Well from Natural Gas Extraction no longer takes room. It could push your room over capacity, for example 65/63.
- **Re-costed:** room tiers 6–8 need less metal, stone and coal (energy costs unchanged).
- **Balance simulator** (`npm run simulate`, for development): a simulated idle player plays the game and writes `BALANCE_REPORT.md` with milestone times, targets and stalls.

## What the simulator says now

- First research about 12 minutes, Wind about 2.5 h, Coal about 2.7 h, Hydro about 4.4 h, Gas Plants about 15 h. No stalls.
- **100% completion: about 25 hours.** Your target is 200+. The gap is mostly missing content, which the coming items add (tier 3 and fictional generators, more methods, a deeper tree, achievements). A final tuning pass (0.47) then aims for 200 hours.

## Things to try

1. Upgrade a generator a few times. Watch its level, its output and the energy rate.
2. Start a research and scroll to the bottom on a phone and on a computer. Does the chip float nicely without covering the version?
3. Build something, then close the tab right away and reopen it. Is it still there?
4. Look at the three starting research in the tree. Research Basic Mining and check the resource tooltips.
5. Once you have the resources, watch the room expansion animation.

## Known issues

- The research tree is getting tall, and some connecting lines run long. A layout pass is planned (0.41/0.43).
- In the generator list, long names wrap on narrow screens.
- Placeholder art.

## Questions for you

1. Should **100% completion include upgrading every generator type to max level**? That would add many hours and fits "perfection".
2. Do upgrades feel worth their cost compared with building new generators?
3. Is +25% per level and a maximum of 10 levels a good shape?
4. Is the floating chip better now?
