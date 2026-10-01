# Playtest 7 (v0.7.0): settings, welcome back, boost research, ordering (after item 0.30)

The version at the bottom of the screen should read **v0.7.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## New since last playtest

- **Your feedback:**
  - **Reorder generators.** Use ▲▼ on each row (Shift+click to send it to the top or bottom), or drag rows on a computer. The order is also the **fuel priority**: when coal or gas runs short, generators higher in the list get it first. Generator names (#1, #2…) no longer change when you reorder.
  - **Scrap several producers at once.** Scrap asks how many, with − / + buttons, a number field and an "All" button, and shows how much room you'll free.
- **Welcome back.** After at least a minute away, a summary shows:
  - how long you were away, and whether only the first 24 hours counted;
  - energy and resources gained;
  - research completed;
  - generators that ran out of fuel.
- **Settings tab** (gear icon):
  - number style: Short 1.23M, Scientific 1.23e6, or Full 1,234,567;
  - **Export save / Import save** for backups or moving devices (a wrong or damaged file is rejected and your game is untouched);
  - a note on the offline limit;
  - **Reset game**, which asks twice.
- **Short numbers everywhere:** 1.23K, 45.6M, 789B, 1.2T. They're never rounded up, so you never see more than you have.
- **Eight boost research nodes** (levels 3 to 7):
  - Hand-Crank Dynamo: double click energy.
  - Standard Parts and Bulk Purchasing: cheaper building.
  - Lab Notebooks and Automated Labs: faster research.
  - Grant Funding: cheaper research.
  - Smart Grid and Superconductors: more energy.
  - The Research tab shows an **Active bonuses** panel listing each bonus and where it comes from.
- **On phones,** tabs that aren't active show only their icon, so all four fit.

## Pacing I measured (idle player who buys mines and quarries, no clicking)

- All 16 research done within about 19 hours: Hydro at about 4 hours, Gas Plants at about 10 hours, Superconductors at about 19 hours.
- No stalls.

## Things to try

1. Reorder your generators with ▲▼ and by dragging. Put a coal plant at the top and let coal run low: does the top one keep running?
2. Scrap 3 of one producer at once.
3. Close the game for a while, then come back. Is the welcome-back summary useful?
4. Settings: switch the number style, export your save, then import it again.
5. Try Reset game, but press Cancel (unless you want to start over).
6. Research Hand-Crank Dynamo and check that clicks give 2.
7. Look at Active bonuses after a few boost research.

## Known issues

- No balance simulator yet (0.35); boost numbers are first guesses.
- The room animation and research celebration are still waiting for your verdict.
- Placeholder art.

## Questions for you

1. Is using list order as fuel priority intuitive, or would you rather set priority separately?
2. Is the welcome-back summary the right amount of detail?
3. Which number style do you prefer as the default?
4. Do the boost research feel worth their cost and time?
