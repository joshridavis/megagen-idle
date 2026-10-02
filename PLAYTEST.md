# Playtest 14 (v0.14.0): achievements, clearer contracts, pet reactions, meteor fix, release plan (after item 0.87)

The version at the bottom of the screen should read **v0.14.0**.

## How to play

- **In a browser:** merge the pull request. Once the deploy run in the Actions tab is green, open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

Your save carries over. Achievements you have already earned unlock quietly when you load the save.

## Estimated play time

- **100% completion: about 112 hours** (simulated idle player), up from about 97. Achievements add the rest.
  - The last stretch is the "MegaGen" achievement (2 billion lifetime energy) and the 200th contract.
  - Target: 200+. The next content items (fictional generators, more real-world methods, a deeper research tree) and the final balance pass are meant to close the gap.
- **Milestones:**
  - First Wind about 2.4 h, Coal about 3.5 h, Hydro about 5.8 h.
  - First Gas about 16.4 h, Oil about 17.4 h, Nuclear about 44 h.
  - Every contract perk about 26 h.
  - Every research about 62 h; every generator type at max level about 65 h; 1 billion lifetime energy about 83 h; 2 billion about 112 h.

## New since last playtest

- **Your feedback:**
  - **Achievements** (new tab).
    - 44 achievements in 7 groups: energy, building, research, progress, contracts, pets and discovery. Each has a progress bar, and a 🏆 notice appears when one unlocks.
    - 36 count toward 100% completion. 8 are marked **Bonus** (clicks, sightings, events, coming back) because they depend on luck or play style. They don't count, so 100% never depends on luck.
  - **Clearer contracts.**
    - Each card is labelled **Delivery** or **Production**.
    - Delivery cards say "You have 40K of 114K energy", explain that delivering spends it, and the button names what is missing ("Need 74K more energy").
    - Production cards show the progress so far and say nothing is spent.
    - When two deliveries ask for the same thing, a note says each is paid separately.
  - **Pets react when clicked.** Tap a pet's picture: it hops and wiggles with sparks, glows or hearts. Reduce motion turns this off.
  - **Fixed: meteor shower.** Meteors now fly head first, down and to the right, with the trail behind. Shooting stars were fixed the same way.
- **Release plan:** `docs/RELEASE_PLAN.md` describes how to release on a dedicated website, Steam and mobile with cloud saves on every device. It marks the one-time steps only you can do: developer accounts, fees, signing, store pages. The code now has a small platform layer, so a desktop or mobile wrapper can plug in later.
- On tablet and desktop the tabs now wrap onto two rows, so none are cut off.

## Things to try

1. Open Achievements. Which ones did your save unlock? Do the progress bars make sense?
2. Earn a new one (for example, click 100 times or build a generator) and watch for the 🏆 notice.
3. Open Contracts. Is the difference between Delivery and Production clear now?
4. Tap each of your pets.
5. If you are lucky enough to see a meteor shower, check the direction.
6. Read `docs/RELEASE_PLAN.md` (in the repository) and note anything you disagree with, such as the order of platforms.

## Known issues

- Achievements have no rewards yet (see the questions).
- The Steam, mobile and cloud-save work is planned only; it needs your accounts and setup first.
- Placeholder art.

## Questions for you

1. Should achievements give rewards? For example, a small permanent bonus per achievement, a cosmetic like a title or badge color, or nothing.
2. Are any achievements missing, too easy or too grindy? (The top energy one was lowered from 10 billion to 2 billion, because 10 billion would add about 230 hours of pure idling.)
3. Is the contract wording clear now?
4. In the release plan, is starting with the website and Android, then Steam, the order you want?
