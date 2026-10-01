# Playtest 6 (v0.6.0): celebrations, clearer rewards, scrappable producers (after item 0.64)

The version at the bottom of the screen should read **v0.6.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## New since last playtest (all from your feedback)

- **Producer prices** now rise by 20% for each one you own (was 15%).
- **Scrap producers.** Each producer card has a Scrap button with the same no-refund tooltip, Confirm and Cancel as generators. The next one you buy costs what your new count implies.
- **Research rewards stand out.** The research panel has a green **🎁 You get:** box with one line per reward:
  - ⚡ unlocks a generator;
  - ⛏️ grants a producer;
  - 📈 a % boost;
  - ⬆️ Research level +1.
  
  Each research node also shows a 🎁 hint.
- **Game-coloured scrollbars** on long lists (Your generators, the research tree, the page).
- **Research-complete celebration.** When a research finishes while you're playing, a "Research complete!" banner with a sparkle burst appears over whatever tab you're on. It shows for about 3.5 seconds; click to dismiss it. It doesn't play for research that finished while you were away.
- **Tab icons:** a solar panel for Generators, a mine for Producers, an atom for Research.
- **Backlog:** Achievements, a perfection (completion) tracker, and a plan for making the game public with accounts are now in the backlog.

## Things to try

1. Buy two more of a producer and check that each costs 20% more than the last.
2. Scrap a producer: hover over Scrap, click it, press Cancel. Then do it again and press Confirm.
3. Open a few research nodes. Is the "You get:" box clear?
4. Start a short research and stay on the Generators tab until it finishes. Did the celebration play?
5. Build enough generators that the list scrolls. Does the scrollbar fit the game's look?
6. Check the tab icons, also on your phone.
7. You haven't seen the room animation yet: expand your room and watch the meter build in.

## Known issues

- No "welcome back" summary after time away yet (0.28). Research that completes while you're away isn't celebrated, by design.
- No in-game reset or short number format yet (0.29).
- Placeholder art.

## Questions for you

1. Is the celebration the right size and length, or is it too much?
2. Is the reward box clear? Should completed research also show what it gave you?
3. "Perfection tracker": I read this as a 100% completion tracker (research, generator types, expansions, achievements). Is that what you meant?
4. For the public version: do you want accounts mainly for cloud saves across devices, for leaderboards, or both?
5. How did the room animation look, once you've seen it?
