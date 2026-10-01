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
| `npm run check:assets` | Checks every sprite in the manifest exists as a PNG of the right size, and lists which are still generic stand-ins. |
| `npm run generate:assets` | Draws any missing generic stand-in sprites. Add `-- --force` to redraw the generic ones; files not listed in `src/assets/generic-assets.json` (real art) are never touched. |

## Project layout

- `src/components/` — React UI components (kept thin).
- `src/store/` — Zustand store, persisted to IndexedDB through localforage.
- `src/utils/` — pure game rules and the idle engine (unit-tested).
- `src/data/` — game numbers: costs, rates, durations, starting state.
- `src/types/` — shared TypeScript types.
- `src/assets/` — sprites and `generic-assets.json` (the list of generated stand-ins).
- `scripts/` — Node scripts, such as the sprite generator.

## Balancing

All game numbers live in `src/data/`: `generators.ts` (output, room, build cost, fuel use), `producers.ts` and `resources.ts` (production rates, starting stock), `player.ts` (click value, starting energy), `research.ts` (research tree, bonus caps), `rooms.ts` (room expansions) and `time.ts` (offline-gain cap). Change them there, not in logic.

## Replacing a stand-in sprite with real art

Every sprite is a generated placeholder. To use real art, save your PNG at the same path and size (see the Asset manifest in `BACKLOG.md`, or `src/assets/sprite-manifest.json`), then remove its line from `src/assets/generic-assets.json` so the generator never overwrites it. Run `npm run check:assets` to confirm the size. No code change is needed.

## Resetting a save

The save lives in your browser's IndexedDB. To start over, clear the site data for the page (browser settings → site data, or DevTools → Application → Clear storage).

## More

- `BACKLOG.md` — the plan and status of every item.
- `CLAUDE.md` — project rules for Claude Code sessions.
- `PLAYTEST.md` — what to try in the current playtest build.
- `GETTING_STARTED.md` — owner setup steps.
