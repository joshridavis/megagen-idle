# Playtest 5 (v0.5.0): producers, clearer research level, Scrap cancel (after item 0.31)

The version is shown at the bottom of the screen. It should read **v0.5.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over. Your room capacity goes up by 3 to make space for the three producers you already own. Producers now take room.

## New since last playtest

- **Your feedback:**
  - **Producers** (new Producers tab). Buy more Stone Quarries, Metal Mines, Coal Mines and, after Natural Gas Extraction, Gas Wells.
    - Each one takes room, and output grows with how many you own.
    - Each one you buy costs 15% more than the last.
    - Hover over a resource's rate (for example "+0.07/s" under Metal) to see your producers, fuel burned and the net rate.
  - **Scrap** now asks you to Confirm or Cancel, and says there's no refund. The Scrap button also shows this in a tooltip on hover.
  - **Version number** at the bottom of the screen. It goes up with each playtest release.
  - **Research level.** It wasn't actually rising early: "Research level 2" was your current level, earned by Basic Solar, shown while a level-2 research ran. The labels are now clearer:
    - "Your research level: 2";
    - "Rises to 3 when Wind Power Fundamentals finishes";
    - research nodes say "Needs level N".
    
    A test now proves the level only rises when research completes.
  - **New construction animation.** After a room expansion, the room meter itself grows. The new boxes appear one after another as scaffolding, then settle. The corner overlay is gone.
  - **Stone prices up about 1.5×:** Wind 8, Coal 15, Hydro 120, Tidal 90 and Gas 75 stone, and Hydropower research 75. Room expansions are unchanged.
- The tab bar now fits on a 360 px phone screen.

## Pacing I measured (idle player who also buys mines and quarries)

- Same research milestones as before: Basic Solar at about 18 minutes, Wind at about 2 hours, Hydro at about 4.5 hours.
- With producers, metal and stone income grows steadily (16 mines and 14 quarries after 9 hours). Nothing stalls.

## Things to try

1. Check the version at the bottom of the screen.
2. Producers tab: buy a Metal Mine. Does the metal rate go up, and does the next one cost more?
3. Hover over each resource's rate. Is the breakdown clear?
4. Scrap a generator, then press Cancel. Then Scrap and Confirm.
5. Expand your room and watch the meter build in.
6. Start a research and read the research level labels. Is it clear now?
7. Once you have Natural Gas Extraction, buy a second Gas Well and run more gas plants.

## Known issues

- No "welcome back" summary after time away (0.28), and no in-game reset or short number format (0.29) yet.
- Late-game resources can pile up once you own many producers. The balance simulator (0.35) will tune this.
- Placeholder art.

## Questions for you

1. Are producer prices (and the 15% increase each time) about right?
2. Should producers be scrappable too, like generators?
3. Is the new room animation better?
4. Are the research level labels clear now?
