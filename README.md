# MegaGen Idle

An idle/incremental game about generating energy. You start with almost nothing and clumsy, inefficient methods, then reinvest energy into resources, research, room and better machines: from solar panels up to nuclear fission and a few fictional methods. Machines keep producing while the game is closed.

**Play it:** https://joshridavis.github.io/megagen-idle/play/ (the landing page is at https://joshridavis.github.io/megagen-idle/). The deploy workflow publishes every merge to `main` there, built with `SITE_BASE=/megagen-idle/`, alongside Cloudflare Pages at https://megagenidle.com/ (`docs/PUBLIC_RELEASE.md` section 9c), until the owner says to stop.

## Run locally

1. Install **Node.js 20 or newer** (nodejs.org).
2. In the repo folder run `npm install`, then `npm run dev`.
3. Open the `http://localhost:5173` address it prints: the landing page. The game itself is at `http://localhost:5173/play/`.

## Other commands

| Command | What it does |
|---|---|
| `npm run build` | Type-checks and builds the website into `dist/`: the landing page at `/`, the game (`play/index.html`) at `/play/`, and `/press/`, `/privacy/`, `/terms/`, `/support/` and `404.html`. |
| `npm run build:web` | The same build into `dist-web/` for Cloudflare Pages, then checks every site page (under 200 KB before images, title, description and sharing tags). `PLAY_EDITION` picks the game's edition. |
| `npm run preview` | Serves the built `dist/` locally at `http://localhost:4173/` (game: `/play/`). Add `-- --outDir dist-web` to serve the web build. |
| `npm test` | Runs the Vitest unit tests once. |
| `npm run test:coverage` | Runs the unit tests with a coverage report (HTML in `coverage/`); fails if the game rules in `src/utils/` drop below 80% lines, statements, functions or branches. CI runs this. |
| `npm run test:e2e` | Builds the website (`build:web`) and runs the Playwright browser tests against it: the game and every site page. First run `npx playwright install chromium` (or set `PW_CHROMIUM_PATH` to an existing Chromium). |
| `npm run simulate` | Runs the balance simulator (a greedy idle player) and writes `BALANCE_REPORT.md`: milestone times, pacing targets from `src/data/pacingTargets.ts`, stalls and hours to 100% completion. |
| `npm run screens:site` | Captures the website's screenshots with Playwright (six game scenes at 1920×1080 and the Settings save panel) into `public/screens/`. Set `PW_CHROMIUM_PATH` if Playwright's own Chromium is not installed. |
| `npm run check:assets` | Checks every sprite in the manifest exists as a PNG of the right size, and lists which are still generic stand-ins. |
| `npm run notices` | Rewrites `THIRD_PARTY_NOTICES.md` with the license of every package shipped in the game. Run after changing dependencies. |
| `npm run generate:assets` | Draws any missing generic stand-in sprites. Add `-- --force` to redraw the generic ones; files not listed in `src/assets/generic-assets.json` (real art) are never touched. |
| `npm run brand` | Draws the store and brand images from the existing sprites: `src/assets/brand/` (logo, 1024 px app icon, key scene, the 1200×630 sharing picture and the favicons) and the Steam capsules in `docs/steam/capsules/`. Overwrites them; run it after changing `scripts/generate-brand.mjs` (a test checks the committed images match). |

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

## Desktop app (Windows, for Steam)

The same game in an Electron window (`electron/`), loaded from local files so it works offline, with the save in a file in the user data folder (`%APPDATA%\MegaGen Idle\saves` on Windows) instead of browser storage.

| Command | What it does |
|---|---|
| `npm run desktop:dev` | Builds the game for the desktop and opens it in Electron (needs a desktop session; not in the cloud sandbox). |
| `npm run desktop:build` | Builds the Windows installer and the plain folder for Steam's depot into `release/` with electron-builder. |
| `npm run desktop:web` / `npm run desktop:compile` | The two halves: the game build in `dist-desktop/`, and `electron/*.ts` compiled to `dist-electron/`. |

The **Desktop build (Windows)** workflow (`.github/workflows/desktop.yml`) runs `desktop:build` on `windows-latest` for every `v*` tag and on manual runs (Actions → Desktop build (Windows) → Run workflow), and uploads the installer and the Steam folder as artifacts. Code signing is optional: add the repository secrets `WIN_CSC_LINK` (the `.pfx` certificate as base64) and `WIN_CSC_KEY_PASSWORD`, and the next build is signed.

## Purchases

The business model: a free part, a one-time **Full Game** unlock and a cosmetic **Supporter Pack**; never pay-to-win, no ads, no premium currency. Where the free part ends is one constant, `FREE_MAX_RESEARCH_LEVEL` in `src/data/purchases.ts`. The web build has no store, so the whole game is open there. To try purchases locally, run `npm run dev`, open Settings and tick **Developer: test store** (development builds only; purchases are free and stay in that browser).

## Saves

The game saves automatically in your browser (IndexedDB). In the **Settings** tab you can **export** the save to a JSON file and **import** it again, for backups or to move to another device; a damaged or wrong file is rejected without touching your current game. If the stored save itself is ever damaged, the game keeps a copy instead of overwriting it and offers it for download in Settings → Save. To start over, use **Reset game** in the Settings tab (it asks twice). Settings also has the number notation choice (short 1.23M, scientific 1.23e6, or full).

## Accounts and cloud saves

Optional. With no settings, the game has no accounts, as before. To turn them on, set two public values from the Supabase project (setup in `docs/PUBLIC_RELEASE.md`, section 9):

- **The published site:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables of the Cloudflare Pages project (`docs/PUBLIC_RELEASE.md`, section 9c). They are not secrets.
- **Locally:** put the same two lines in a `.env.local` file in the repository root (`VITE_SUPABASE_URL=...`), then run `npm run dev`. `.env.local` is ignored by git.

Settings then shows "Account and cloud saves". Optional `VITE_AUTH_PROVIDERS` (for example `google,discord`) adds "Continue with …" buttons once those providers are set up in Supabase (`docs/PUBLIC_RELEASE.md`, section 9b). Variables are read at build time, so redeploy the site in Cloudflare after changing them.

## More

- `BACKLOG.md` — the plan and status of every item.
- `CLAUDE.md` — project rules for Claude Code sessions.
- `PLAYTEST.md` — what to try in the current playtest build.
- `GETTING_STARTED.md` — owner setup steps.
- `docs/RELEASE_PLAN.md` — plan for the website, Steam and mobile releases.
