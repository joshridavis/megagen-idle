# Playtest 15 (v0.15.0): site map, cosmetic rewards, clearer perk shop, "upgradable first" sort (after item 1.04)

The version at the bottom of the screen should read **v0.15.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 112 hours** (simulated idle player), the same as v0.14.0; nothing in this version changes balance.
- **Milestones:** first Wind about 2.4 h, Coal about 3.5 h, Hydro about 5.8 h, Gas about 16.4 h, Oil about 17.4 h, Nuclear about 44 h. Every contract perk about 26 h, 1 billion lifetime energy about 83 h.
- Target: 200+. The next map steps (terrain bonuses), the fictional generators and the final balance pass come next.

## New since last playtest

- **Your feedback:**
  - **Site map** (new Map tab), the first of three steps.
    - Every machine sits on a tile grid: one tile per unit of room, so a solar panel covers 2 tiles and a dam 8.
    - Hover over or tap one to see it; click a generator to jump to it in your list.
    - Fenced land at the bottom is your next room expansion.
    - Coming next: terrain zones (sunny, windy, river, coast…) that boost the machines that suit them, and moving machines around.
  - **Cosmetic achievement rewards.**
    - 16 achievements unlock a **title**, which you can show under your player level.
    - Having 5, 15, 25 or 36 achievements unlocks a new **accent color** for the top bar.
    - Pick them in the new Cosmetics box at the top of the Achievements tab. They change nothing in the game.
  - **Clearer perk shop.**
    - A "How Contract Points work" box: choose points as a contract's reward; ★ = 1, ★★ = 2, ★★★ = 3 points.
    - Buttons say "Buy for 10 points" or "Costs 10 points · need 3 more".
    - Each perk shows its effect now → next (e.g. "Contract slots: 3 → 4"), and every contract card shows its points.
  - **"Upgradable first" sort** in Your generators: upgrades you can afford right now first, then the ones not yet maxed, then maxed ones.
  - **Release plan reordered** from easiest to hardest: website (live) → itch.io → Android → Steam → iOS. Every step can go live with local saves before accounts and cloud saves exist.
- **Added to the backlog:** browser notifications (1.07). Off by default, only while the game is in the background, a switch per type, and at most a few per hour.

## Things to try

1. Open the Map. Do your machines look right? Hover over a few and click one.
2. Buy a room expansion and watch the fenced land turn into ground.
3. Open Achievements → Cosmetics. Pick a title and, if you have 5 achievements, a color.
4. Open Contracts. Is the perk shop clear now?
5. In Your generators, choose "Upgradable first".

## Known issues

- Machines can't be moved yet, and the map has no terrain yet (next item).
- Some odd-sized machines (3, 5 tiles) have L-shaped footprints, so their picture can overlap a neighbor's corner.
- Placeholder art.

## Questions for you

1. Does the map feel like the right base for zones and moving machines? Should the map be wider or taller?
2. Which zones would you like? Planned: sunny plateau, windy ridge, river, coast, coal or gas field, and plain.
3. Should hydro need a river and tidal need the coast (real constraints), or should zones only give bonuses?
4. Are the titles and colors a nice reward, or would you like other cosmetics (for example map decorations)?
