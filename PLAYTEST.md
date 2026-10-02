# Playtest 19 (v0.19.0): fusion, the Micro-Supernova, the Exclusion Zone, map events (after item 1.12)

The version at the bottom of the screen should read **v0.19.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 138 hours** (simulated; v0.18.0 was about 110).
  - The new content added nearly 30 hours without slowing anything that was already there.
  - Still short of your 200-hour target.
- **Milestones:**
  - Content: Wind 2.3 h, Coal 3.5 h, Hydro 5.7 h, Gas 10 h, Oil 17 h, Nuclear 44 h.
  - New content: room tiers 9 and 10 at 45 h and 70 h, first Fusion Reactor 75 h, first Micro-Supernova 92 h.
  - Contracts: every contract perk by 32 h, 200 contracts by 103 h.
  - Both new generators maxed by about 138 h.

## New since last playtest (your playtest 18 feedback)

- **Fictional generators.**
  - **Fusion Reactor** (research level 12): 200 energy/s, 16 tiles, burns 1 deuterium per hour.
  - **Micro-Supernova** (level 14): a star that lives and dies every second in a fast-time pocket dimension. 780 energy/s, 25 tiles, burns 2 deuterium per hour.
  - Each gives about 2.5 times the energy per tile of the tier before.
  - **Deuterium**, a new resource, comes from the new **Deuterium Extractor** (1 every 6 minutes, from sea water).
  - A new **Experimental physics** research branch (5 nodes) unlocks it all, after Reactor Safety Systems.
  - **Room tiers 9 and 10** (+180 and +240 room).
- **Map upgrade: the Exclusion Zone.**
  - The last two room tiers open a fenced, shielded purple zone at the bottom of the map, with warning signs, pylons and a soft glow.
  - Fusion Reactors and Micro-Supernovas must be built there (+10% fully inside).
  - It holds about 280 tiles, so you choose how many of each to fit.
- **Map events** (only while the Map tab is open, about one every few minutes):
  - birds flying over;
  - lightning that supercharges the generator it hits (+50% for that type, 3 minutes);
  - a delivery truck that brings resources to a producer;
  - a **fire at a coal plant: click it within 30 seconds** to put it out for a reward;
  - a river flood that slows dams briefly;
  - a rare falling star at sea.
- **Scrapping refunds 10%** of everything spent on the machine, build and upgrades. The Scrap tooltip and the confirm show the exact amount.
- **Sign in with Google and Discord:** the code is ready. The buttons stay hidden until you turn them on (`docs/PUBLIC_RELEASE.md`, section 9b, about 20 minutes). New Google or Discord players choose a username the first time.

## Please test: accounts and cloud saves (live)

I can't reach the live site or Supabase from my sandbox, so this part needs you. It takes about 5 minutes:

1. Open the game's Settings. If you don't see "Account and cloud saves", re-run the deploy: Actions → Deploy to GitHub Pages → Run workflow.
2. **Create an account** with your email, a username and a password. Open the confirmation email, then sign in.
3. Check that "Last cloud save" shows a time.
4. **Open the game in a second browser** (or a private window) and sign in there. You should get your game, not a new one.
5. Play a minute in the second browser, wait until it saves (or click "Save to cloud now"), then reload the first one. It should ask "Which game do you want to keep?" and mark the newer one.
6. Optional: try "Forgot password?".
7. Optional, with a throwaway account: "Delete my account".

Tell me what you see, especially any error message, and I'll fix it.

## Things to try

1. Research toward Fusion (Heavy Water Extraction first) and build a Deuterium Extractor.
2. Expand to room tier 9 and look at the Exclusion Zone on the map. Build a Fusion Reactor there.
3. Leave the Map tab open for a while. Did you catch a fire in time?
4. Scrap an upgraded machine and check the refund.

## Known issues

- The fictional generators reuse placeholder art, and map events use emoji for now.
- Accounts are tested against fakes only until your live test.

## Questions for you

1. Do the Fusion Reactor and Micro-Supernova feel like a satisfying late game?
2. Is the Exclusion Zone a good limit, or too tight?
3. Are map events too frequent, too rare, or about right? Is the fire fun?
4. Next: map decorations (1.13) and browser notifications (1.07) are queued. Should more content come first to get closer to 200 hours (for example geothermal or biomass generators, or a deeper research tree)?
