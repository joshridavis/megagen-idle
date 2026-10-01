# Playtest 2 — resources and generators (after item 0.09)

This build adds the first real loop: gather resources, build generators, watch energy rise. Research and room expansion come next (checkpoint 3), so **energy has nothing to spend on yet**. That's expected for this build.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save from playtest 1 carries over: it is upgraded and given the new starting resources.

## New since last playtest

- **Offline cap is now 24 hours** (your feedback).
- **Resources:** metal, stone, coal and natural gas, with icons, amounts and net rates per second. You start with 15 metal and 10 stone, plus one stone quarry (1 per 10 s), one metal mine (1 per 15 s) and one coal mine (1 per 20 s). They keep producing while the game is closed.
- **Generators:** Solar Panel (0.5/s, 2 room, 10 metal), Wind Turbine (0.8/s, 3 room, 15 metal + 5 stone) and Coal Plant (2/s, 5 room, 20 metal + 10 stone, burns 1 coal a minute).
- **Fuel:** if coal runs out, Coal Plants switch off and a red warning appears. Turn them back on once you have coal.
- **Room:** you have 10. Every generator takes some, even when switched off.
- **Passive energy now comes only from generators.** The free 1/s from playtest 1 is gone, so at the very start clicking is your only income.
- Pixel-art placeholder sprites for every generator, resource and future research icon.

## Things to try

1. On a fresh start, build a Solar Panel straight away. Does the energy rate change to +0.5/s?
2. Save up for a Wind Turbine. How long did the 10 extra metal take? (It should be about 2.5 minutes.)
3. Build a Coal Plant. Watch the coal rate go negative or positive: one coal mine makes 3 coal a minute and one plant burns 1.
4. Build enough Coal Plants (or let coal run low) to see the "Coal ran out" warning and the "Out of fuel" status, then turn them back on.
5. Fill all 10 room and check the build buttons say "Not enough room".
6. Turn a generator off and on. Does the rate update at once?
7. Hover over a build card (or Tab to its button) to see the tooltip.
8. Close the game for a while and come back. Did your resources and energy grow?
9. Try it at phone width.

## Known issues

- Energy cannot be spent yet. Research (0.10, 0.13) and room expansion (0.16) are next.
- No way to build more quarries or mines yet (item 0.31).
- No "welcome back" summary after offline time (item 0.28), and no in-game reset (item 0.29). To start over, clear the site data.
- Numbers use plain separators; short notation (1.2K) comes in item 0.29.
- Placeholder art. The "off" sprites of solar and wind look almost the same as the "on" ones, because the desaturated colours snap back to the 64-colour palette.

## Questions for you

1. Is it right that the first Solar Panel can be built immediately, or should it take a little clicking or waiting first?
2. Is about 2.5 minutes per 10 metal a good early pace, or too slow?
3. With only clicking at the start, does the opening feel too slow now that the free 1/s is gone?
4. Is the Coal Plant's trade-off (4× solar output, but needs coal and room) clear from the card?
5. Is the layout (build cards on the left, your generators on the right) easy to read?
