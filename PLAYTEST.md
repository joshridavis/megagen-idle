# Playtest 10 (v0.10.0): clearer research tree, tab-switch and tooltip fixes, max-level completion, Oil and Nuclear (after item 0.33)

The version at the bottom of the screen should read **v0.10.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## New since last playtest

- **Your feedback:**
  - **Research tree in three branches.** The tree is now split into labelled bands: *Energy & research*, *Resources* and *Fuels*. Each starts from one of the three first research. Lines within a branch are solid. The few lines that cross between branches are fainter.
  - **Fix: "You were away for 1m 1s" after switching tabs.** The welcome-back message now shows only after a real absence of at least a minute. It reports what you gained while the tab was hidden. Short tab switches show nothing.
  - **Fix: build-card tooltips.** The pop-up is now fully opaque and sits above the card above it, so it is readable. This includes locked cards.
  - **100% completion now includes every generator type at max level.** The game permanently remembers each type you have built and its best level. Scrapping a generator never lowers your completion.
- **Tier 3: Oil and Nuclear.**
  - **Oil Power Plant:** research level 9. It burns 6 oil per hour and gives 2.5× the energy per room of a gas plant.
  - **Nuclear Fission Plant:** research level 10. It burns 1 uranium per hour, for another 2.5× the energy per room.
  - **New resources:** oil and uranium. **New producers:** Oil Rig and Uranium Mine. Your first of each is granted by research.
  - **Seven new research:** Oil Drilling, Oil Refining, Uranium Mining, Nuclear Fission, Reinforced Concrete, Heat Recovery and Reactor Safety Systems.

## What the simulator says now

- First Oil plant at about 16.5 h and first Nuclear plant at about 40 h. No stalls. All earlier targets are still met: Wind about 2.5 h, Coal about 2.7 h, Hydro about 4.4 h, Gas about 10 h.
- **100% completion: about 82 hours** (was 25). Max levels added about 27 h and tier 3 about 30 h. Your target is still 200+; the fictional generators (0.34), more methods, a deeper tree and achievements come next.

## Things to try

1. Open the Research tab. Can you follow each branch now? Is any line still confusing?
2. Switch to another browser tab for 10 seconds, then come back. You should see no "away" message. Leave it for over a minute: you should see one that matches what you gained.
3. Hover over a build card in the second or third row, including a locked one. Is the tooltip readable?
4. Research Oil Drilling and Oil Refining (Fuels branch), then build an Oil Power Plant. Watch the oil stock and the Burns line.
5. Let an Oil plant run out of oil. Does it switch off with a clear warning?
6. Research Uranium Mining (Resources branch) and Nuclear Fission. Build a reactor.
7. Upgrade a generator and then scrap it. Completion should not go down (the tracker screen comes with item 0.66).

## Known issues

- The research tree is now wide; on a small screen you scroll sideways.
- There is no screen that shows completion yet (perfection tracker, item 0.66).
- Placeholder art.

## Questions for you

1. Is the branch layout what you had in mind? Should the branch labels or colours differ?
2. Do Oil and Nuclear feel like a real step up? Is uranium (1 per 30 minutes) too slow, or about right?
3. Are research level 9 and 10 for Oil and Nuclear reasonable gates?
4. With 100% at about 82 h now, should the remaining hours come mostly from new content, or partly from slower pacing?
