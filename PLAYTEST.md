# Playtest 18 (v0.18.0): accounts and cloud saves (ready, waiting for setup), map fixes (after item 1.06)

The version at the bottom of the screen should read **v0.18.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over.

## Estimated play time

- **100% completion: about 110 hours** (simulated; v0.17.0 was about 119).
  - The terrain changed where slivers became plain land, which probably shifted where machines land and which bonuses they get.
- **Milestones:**
  - Content: first Wind about 2.3 h, Coal 3.5 h, Hydro 5.7 h, Tidal 7.2 h, Gas 9.2 h, Oil 16.5 h, Nuclear 44 h.
  - Contracts: every contract perk by about 27 h, 200 contracts by about 100 h.
  - Max levels: every type maxed by about 64 h.
  - The last stretch is the 2 billion lifetime energy achievement.
- **Target:** 200+ hours. Map events, decorations, the fictional generators and the final balance pass are still to come.

## New since last playtest

- **Your feedback:**
  - **Accounts and cloud saves (the website step), built but not switched on yet.**
    - Sign up with email, username and password, then sign in on any browser. The game saves to the cloud every 5 minutes and whenever you leave the tab.
    - If the game on this device and your cloud save differ, a "Which game do you want to keep?" window shows both (time, energy, completion) and marks the newer one.
    - You won't be asked at every start: only when another device saved since this one last did.
    - Settings also has: Forgot password, Save to cloud now, Load cloud save, Sign out and Delete my account. A privacy page explains what is stored.
    - **It turns on when you finish the 15-minute Supabase setup** in `docs/PUBLIC_RELEASE.md`, section 9. That is a free account, one SQL paste, and two GitHub repository variables. Until then the game looks and plays exactly as before.
    - `docs/PUBLIC_RELEASE.md` is also the full plan: why Supabase (compared with Firebase, PlayFab and an own server), the data model, security, privacy, cheating and leaderboards, and costs.
  - **📍 and ⭐ tooltips** now appear centered above the mark and are never cut off.
  - **No more useless zone slivers:** where the river or coast leaves a piece of plateau, ridge or field narrower than 3 tiles, it is now plain land. Every zone tile left can hold a whole machine.
  - **Active bonuses** (Research tab) opens and closes. Closed, it shows a one-line summary, and it remembers your choice.
- **Also:**
  - The Room panel shows what land the next expansion opens (for example "36 plain, 24 river, 12 windy ridge").
  - The Guide's Map section explains zones, placement and moving.
  - Settings → Credits lists the art palette and the open-source libraries.
  - `LICENSE` reserves all rights to the game; you can change that.

## Things to try

1. Hover a 📍 in Your generators and a ⭐ on the map. Is the tooltip in the right place now?
2. Look at the map where the river crosses a plateau or ridge. Any slivers left?
3. Close and reopen Active bonuses in the Research tab, then reload the page.
4. Open the Room panel and read the "New land" line.
5. Read `docs/PUBLIC_RELEASE.md` and, when you have 15 minutes, do the setup in section 9. Then tell me, and I'll run a live test of sign-up, sync between two browsers, and deletion.

## Known issues

- Accounts stay hidden until the setup is done. They are tested against a fake server, not yet a real one.
- Placeholder art.

## Questions for you

1. Are you happy with Supabase as the provider? The setup is in section 9 of `docs/PUBLIC_RELEASE.md`.
2. Sign-in methods at launch: email only, or also Google or Discord?
3. Usernames are 3–20 letters, digits or `_`, shown on future leaderboards. Is that fine?
4. License: keep "all rights reserved" (the safe choice for a game you plan to sell), or open the code?
5. After the accounts go live: map events and decorations next, or the fictional generators for more content and hours?
