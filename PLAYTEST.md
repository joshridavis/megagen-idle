# Playtest 11 (v0.11.0): completion tab, player level, click research, event log, random sightings (after item 0.84)

The version at the bottom of the screen should read **v0.11.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 82 hours** (simulated idle player; same as v0.10.0). Your target is 200+.
- **Milestones:**
  - first Wind about 2.5 h, Coal about 2.7 h, Hydro about 4.4 h;
  - first Gas about 10 h, Oil about 16.5 h, Nuclear about 43.5 h;
  - player level 10 at about 1 h, 50 at about 30 h, 76 at 100%.
- None of this version's items adds to that time. Random events with effects (0.85) and Grid Contracts (0.86) are the next items that do.

## New since last playtest

- **Your feedback:**
  - **Completion is now visible**, like Melvor Idle's completion log.
    - A new **Completion** tab shows the overall % (the % also appears on the tab button) and one bar per part.
    - Open a part to see every entry, done or not. Generators show their best level, for example *Lv 7/10*.
  - **Player level** grows from all the energy you have ever produced. It shows in the top bar with a progress bar and a "Level up!" badge. Spending never lowers it, and it gives no bonus yet (see the questions).
  - **More click research.**
    - Ergonomic Handle, Flywheel and Geared Crank raise energy per click.
    - Late game, **Kinetic Capture** and **Grid Tap** each add a quarter second of your total energy/s to every click, so clicking stays worthwhile.
  - **Random events, part 1: sightings.** 11 harmless surprises can happen while the game is on screen, from common (birds, a paper plane) to rare (a small spaceship, a whale at the tidal station) to legendary.
    - Each is recorded. The Completion tab lists "Sightings discovered", with unseen ones shown as **???** and their rarity. They do not count toward 100%.
    - Settings has a **Reduce motion** option.
- **Event log:** a collapsible list at the bottom of the screen of what happened this session: research done, new unlocks, fuel running out, room nearly full, sightings. Important events also show a short notice at the top right.

## Things to try

1. Open the Completion tab. Expand each part. Is it clear what is left?
2. Watch the player level in the top bar for a while. Does it level up at a nice pace early on?
3. Research Ergonomic Handle and Flywheel (after Hand-Crank Dynamo) and click. Hover over "+N per click" for the breakdown.
4. Leave the game open on screen for an hour or so. Did you spot anything? Check "Sightings discovered" in the Completion tab.
5. Let a coal plant run out of coal, or fill your room. Do the notice and the event log entry appear?
6. Turn on Reduce motion in Settings: sightings then show as a notice instead.

## Known issues

- The event log is for this session only; it is not saved.
- Sightings fly over the top bar for a few seconds; they never block clicks.
- Placeholder art.

## Questions for you

1. Should player levels give a small reward, for example +1% energy per level (capped)? Or stay a pure progress number?
2. Is about one sighting per hour of on-screen play right, or should they be rarer?
3. Which **effect events** (next item) sound good to you? Planned positive ones: sunny spell, strong winds, rich seam, government grant, eureka, volunteer crew. Planned negative ones: overcast, calm air, coal shortage, grid fault, pipe leak, equipment wear.
4. For the new activity, **Grid Contracts** is planned: timed delivery orders with a choice of rewards and a small perk shop. Does that fit what you meant by "a new mode or activity"? Do you have another idea in mind?
