# MegaGen Idle

An idle/incremental game about generating energy. You start with almost nothing and clumsy, inefficient methods, then reinvest energy into resources, research, room and better machines: from solar panels up to nuclear fission and a few fictional methods. Machines keep producing while the game is closed.

**Play it:** https://joshridavis.github.io/megagen-idle/ (live once the repo's Pages source is set to "GitHub Actions"; see `GETTING_STARTED.md`, step 5). Until then the deploy workflow skips publishing with a warning instead of failing; after enabling Pages, re-run it from Actions → Deploy to GitHub Pages → Run workflow, or push to `main`.

## Run locally

1. Install **Node.js 20 or newer** (nodejs.org).
2. In the repo folder run `npm install`, then `npm run dev`.
3. Open the `http://localhost:5173` address it prints.

## Other commands

| Command | What it does |
|---|---|
| `npm run build` | Type-checks and builds the static site into `dist/` (served under `/megagen-idle/`). |
| `npm run preview` | Serves the built `dist/` locally, at `http://localhost:4173/megagen-idle/`. |
| `npm test` | Runs the Vitest unit tests once. |
| `npm run test:e2e` | Builds the game and runs the Playwright browser smoke test against it. First run `npx playwright install chromium` (or set `PW_CHROMIUM_PATH` to an existing Chromium). |
| `npm run simulate` | Runs the balance simulator (a greedy idle player) and writes `BALANCE_REPORT.md`: milestone times, pacing targets from `src/data/pacingTargets.ts`, stalls and hours to 100% completion. |
| `npm run check:assets` | Checks every sprite in the manifest exists as a PNG of the right size, and lists which are still generic stand-ins. |
| `npm run notices` | Rewrites `THIRD_PARTY_NOTICES.md` with the license of every package shipped in the game. Run after changing dependencies. |
| `npm run generate:assets` | Draws any missing generic stand-in sprites. Add `-- --force` to redraw the generic ones; files not listed in `src/assets/generic-assets.json` (real art) are never touched. |

## Project layout

- `src/components/` — React UI components (kept thin).
- `src/store/` — Zustand store, persisted to IndexedDB through localforage.
- `src/utils/` — pure game rules and the idle engine (unit-tested).
- `src/data/` — game numbers: costs, rates, durations, starting state.
- `src/types/` — shared TypeScript types.
- `src/assets/` — sprites and `generic-assets.json` (the list of generated stand-ins).
- `scripts/` — Node scripts, such as the sprite generator.
- `e2e/` — Playwright browser smoke tests.

## Balancing

All game numbers live in `src/data/`: `generators.ts` (output, room, build cost, fuel use), `producers.ts` and `resources.ts` (production rates, starting stock), `player.ts` (click value, starting energy), `research.ts` (research tree, bonus caps), `rooms.ts` (room expansions), `time.ts` (offline-gain cap) and `pacingTargets.ts` (what `npm run simulate` checks). Change them there, not in logic.

## Replacing a stand-in sprite with real art

Every sprite is a generated placeholder. To use real art, save your PNG at the same path and size (see the Asset manifest in `BACKLOG.md`, or `src/assets/sprite-manifest.json`), then remove its line from `src/assets/generic-assets.json` so the generator never overwrites it. Run `npm run check:assets` to confirm the size. No code change is needed.

## Versions

The game shows its release version (from `package.json`) at the bottom of the screen. The minor version goes up with each playtest release (`0.5.0`, `0.6.0`, ...).

## Saves

The game saves automatically in your browser (IndexedDB). In the **Settings** tab you can **export** the save to a JSON file and **import** it again, for backups or to move to another device; a damaged or wrong file is rejected without touching your current game. To start over, use **Reset game** in the Settings tab (it asks twice). Settings also has the number notation choice (short 1.23M, scientific 1.23e6, or full).

## More

- `BACKLOG.md` — the plan and status of every item.
- `CLAUDE.md` — project rules for Claude Code sessions.
- `PLAYTEST.md` — what to try in the current playtest build.
- `GETTING_STARTED.md` — owner setup steps.
- `docs/RELEASE_PLAN.md` — plan for the website, Steam and mobile releases.
