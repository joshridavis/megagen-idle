# MegaGen Idle — Project Guide for Claude

The repository starts empty: item 0.00 in `BACKLOG.md` creates the project from scratch. Read this file at the start of every session. Then read `BACKLOG.md`. If the user names items, do those. If the user just says to continue (or names nothing), follow the "Order of work" in `BACKLOG.md`.

## What the game is

MegaGen Idle is an idle/incremental game about generating energy. The player starts with almost nothing and very inefficient methods, then reinvests into resources, research, room (capacity) and better machines, from solar panels up to nuclear fission and a few fictional methods (for example a micro supernova in a fast-time dimension). Most machines exist in real life; fictional ones are a minority.

Core concepts:

- **Energy**: the main currency. Machines produce it over real time, including while the game is closed (offline gains).
- **Resources**: coal, natural gas, stone, metal, and so on, stored in an inventory. Used to build machines and to run some of them. Machines that burn resources (coal) produce more energy but need ongoing supply. Machines like solar panels need none.
- **Room**: capacity that every machine takes up. The player spends energy and resources to expand it. Better machines give more energy per room or cost fewer resources.
- **Research**: takes real time (offline too), costs energy and sometimes resources, and has a level requirement. It unlocks machines and gives permanent boosts (build discounts, cheaper research, global energy %). A global Research level rises as research completes.
- **Machine skill tree**: starts basic and unlocks more efficient and complex methods through research.

## Tech stack

- TypeScript, React, Vite, Tailwind CSS
- State: Zustand, persisted to IndexedDB through localforage
- Tests: Vitest (unit); Playwright for browser smoke tests, with a jsdom fallback if its browsers cannot be installed in the cloud
- Art: pixel art, palette AAP-64. For now all sprites are generic stand-ins made by a script; AI-generated art may replace them later
- Audio: out of scope for now (no sound effects or music)
- Web deploy: static Vite build to GitHub Pages through GitHub Actions
- Desktop (Electron) and mobile (Capacitor) builds are out of scope

## Cloud session rules (important)

You run in a cloud sandbox on a clone of this repository. Therefore:

1. **All paths are relative to the repo root.** Write `src/store/index.ts`, never `/src/store/index.ts`. Older backlog text used leading slashes; treat them as repo-relative.
2. **Work on a branch and open a PR.** Never push directly to `main`. Make small, meaningful commits. Do not run deploy scripts that push to `main`.
3. **Audio is out of scope.** Do not add sound effects, music, audio hooks or audio settings. Out-of-scope items listed in `BACKLOG.md` are not built.
   **Art is generic.** You cannot run AI image tools here (Stable Diffusion and similar). Sprites are simple generated stand-ins created by `scripts/generate-generic-assets.mjs`. Never try to install AI art or audio tools.
4. **Never overwrite real art.** A file under `src/assets/` may be regenerated only if it is listed in `src/assets/generic-assets.json`. Anything not listed is art the owner added by hand; leave it alone.
5. **Electron and Capacitor packaging, signing, and anything needing Android Studio or Xcode is out of scope** unless the user explicitly asks for config files only.
6. **No secrets in the repo.** Do not add API keys or tokens.
7. If the repo state does not match what the backlog says (a file is missing, an item marked Done looks incomplete), reconcile it with the smallest reasonable fix, describe it in the PR, and continue. Stop only if the project cannot build at all and you cannot fix it.

## Assets

- Sprites live in `src/assets/sprites/` (subfolders `generators/`, `research/`, `ui/`). The list of expected files, sizes and status is in `BACKLOG.md` under "Asset manifest".
- There is no real art in this project. Every sprite is a generic stand-in created by `scripts/generate-generic-assets.mjs` (item 0.27); the energy icon is created earlier, by item 0.00. The script may regenerate only files listed in `src/assets/generic-assets.json`. The script never overwrites an existing file unless run with `--force`, never touches `energy_currency_icon_32.png`, and records what it created in `src/assets/generic-assets.json`.
- Code never hard-codes sprite paths. It uses the typed `sprites` object exported from `src/assets/index.ts`.
- When the owner later adds real art at the same path and size, nothing in the code changes. Run `npm run check:assets` to confirm sizes and formats.
- If a feature needs a new sprite, add it to the manifest in `BACKLOG.md` and to the generator script, then regenerate.

## Code conventions

- **Named exports only** for the store, hooks and utilities (`export const useStore`, `export const useIdleEngine`). The store has no default export. React components may use default exports if the folder already does; stay consistent within a folder.
- Import the store as `import { useStore } from '../store'` (or the configured alias). Use the selector pattern: `const energy = useStore((s) => s.energy)`.
- Store is split into slices under `src/store/slices/` (energy, resource, generator, research, room, settings) combined in `src/store/index.ts`, with typed selectors in `src/store/selectors.ts` and state types in `src/types/state.ts`.
- Game rules live in pure functions under `src/utils/` that take state and return results. This keeps them unit-testable. Components stay thin.
- **Time is timestamp-based.** Research timers and idle gains compute from `Date.now()` differences, never from counting intervals. Clamp negative deltas to 0 and cap offline gains with a named constant so it can be tuned.
- `package.json` must stay valid JSON (no comments, no trailing commas).
- Folder layout: `src/components`, `src/store`, `src/assets`, `src/utils`, `src/types`, `src/tests` (or colocated `*.test.ts`; pick one and stay consistent).
- Game numbers (costs, rates, durations) go in data files such as `src/data/generators.ts` and `src/data/research.ts`, not scattered in logic, so balancing is easy.

## How to work on a backlog item

1. Read the item in `BACKLOG.md`, including its Acceptance criteria.
2. Implement it, plus Vitest tests for any new utility logic.
3. Run `npm run build` and `npm test`. Fix failures before finishing.
4. Update the item's Status in `BACKLOG.md` (`Done`, or `Partial` with a note on what remains).
5. Commit, then move straight to the next item in the order. Do not ask for approval between items.
6. If the item added, renamed or removed an npm script, or changed how the game is run, update `README.md` in the same PR.
7. In the PR description, summarize: what changed, any deviation from the item, any new generic sprite added, any assumption.

If an item cannot be finished, mark it `Partial`, explain why in the PR, and go to the next independent item. Do not stop the run for a single blocked item.

## Playtest checkpoints

`PLAYTEST_EVERY` is set at the top of `BACKLOG.md` (default 5). After that many completed items since the last checkpoint:

1. Check that the game is **playable**: `npm run build` and `npm test` pass, the app loads, and the features finished since the last checkpoint can be reached from the UI. If not, keep working and check again after each next item.
2. If playable, write or update `PLAYTEST.md` in the repo root with: how to play it (the GitHub Pages URL once item 0.22 is merged and Pages is enabled; otherwise `npm install` then `npm run dev`), what is new since the last playtest, 5 to 10 concrete things to try, known issues, and specific questions about feel and pacing. Always run `npm run simulate` first and state the **estimated hours to 100% completion** (and the key milestone times) in `PLAYTEST.md` and in the message to the owner (owner request, playtest 10).
3. Add a row to the Playtest log in `BACKLOG.md`.
4. Bump the minor version in `package.json` (`0.5.0` → `0.6.0`; patch for a hotfix). The game footer shows it; mention it in `PLAYTEST.md`, the Playtest log and the PR.
5. **Stop and tell the owner it is ready to test.** This is the only planned pause.
6. When the owner replies, turn the feedback into new `CODE` items, put them at the top of the order, record them in the Playtest log, and continue.

## Writing new backlog items

When asked to generate the next items:

- Inspect the actual repo first. Do not write bug-fix items for code that does not exist yet; put the check in the Acceptance criteria of the feature item instead.
- Keep the order of work stocked: if fewer than 5 `Not started` items remain, add more before continuing, so the run never ends for lack of work. Also write items after playtest feedback. Continue the version numbering (`0.xx`, two digits) and use the same template as existing items: Type, Status, Goal, Details, Acceptance criteria. Add at most 5 items at a time.
- Every item must be completable inside a cloud session with no owner action.
- One item = one coherent change a single session can finish and test. New sprites needed by an item are added to the manifest and the generic asset script as part of that item.
- Stay consistent with the game design above. Do not introduce mechanics (prestige, multiplayer, and so on) the owner has not asked for; list such ideas separately as "Suggestions". Do not write audio items.
- Good sources of further work, in rough priority order: more real-world generation methods from the design (geothermal, biomass, wave, orbital solar), deeper research branches, more resource types and producers, quality-of-life features (bulk build, build queue, sorting and filtering), balance passes, test and performance work, and polish. Each must still be one session's worth of work.
- Never mix build tools. This project uses Vite, not Webpack.
