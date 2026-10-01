# Playtest 3: research, room and energy costs (after item 0.16)

Energy now has uses: building, research and room expansion. This is the first build with a real progression from solar to coal.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your old save carries over. Generators you already built stay, but Wind and Coal must be researched before you can build more of them.

## New since last playtest

- **Your feedback:**
  - Fuel use ("🔥 Burns") is amber now. Red only means "you can't afford this".
  - Every generator costs energy equal to 10 minutes of its output: Solar 300, Wind 480, Coal 1,200.
  - New games start with 300 energy, so the first Solar Panel can still be built straight away.
- **Research** (new Research tab):
  - Takes real time and keeps running while the game is closed. Your Research level rises by 1 each time one finishes.
  - **Basic Solar:** +10% energy from all generators. Needs a Solar Panel built first.
  - **Wind Power Fundamentals:** unlocks the Wind Turbine. Needs Basic Solar and level 2.
  - **Fossil Fuels 101:** unlocks the Coal Plant. Needs level 2, 300 energy and 5 coal.
  - Click a node to see its details and start it.
- **Room expansion** (Room panel on the Generators tab):
  - Three expansions: +10, +15 and +25 room, paid in energy, metal and stone.
  - The meter turns red with a warning at 90% full.
- Locked generator cards say which research unlocks them.

## Pacing I measured (idle player, no clicking)

- First research starts after about 2 minutes.
- All three research are done after about 20 minutes.
- Room expansions are bought at about 40 minutes, 70 minutes and 3 hours.
- After that there is nothing new to unlock until the next batch: Hydro, Gas and Tidal (item 0.20).

## Things to try

1. Start fresh (clear site data) and build your first Solar Panel at once.
2. Open the Research tab. Basic Solar should pulse once it's affordable. Start it and watch the progress bar.
3. Close the game during a research and come back after it should have finished. Is it complete, and did your Research level rise?
4. Research Wind, then build a Wind Turbine. Then research Fossil Fuels and build a Coal Plant.
5. Fill your room, then buy the first expansion. Does the meter grow?
6. Check the "Not enough energy" and "Not enough resources" messages on build cards.
7. Try the Research tab on your phone. The tree scrolls sideways inside its box.

## Known issues

- There are only three research items for now. More come with item 0.20 and later.
- No "welcome back" summary after time away (item 0.28), and no in-game reset (item 0.29).
- Numbers use plain separators, and short notation (1.2K) comes in item 0.29.
- You can't build more quarries or mines yet (item 0.31). Metal is the main bottleneck later on.
- Placeholder art.

## Questions for you

1. Do the energy costs (10 minutes of output) feel right now that there is more to spend energy on?
2. Are the research times (1, 2 and 3 minutes) too short, too long, or about right for a start?
3. Is it clear how to start research (click a node, then "Start research")?
4. Room expansion: is 500 energy + 50 metal + 20 stone for the first one about right?
5. The research tree background is a bright blueprint grid. Is it too busy?
