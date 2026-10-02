# MegaGen Idle: multi-platform release plan

Item 0.87 (owner request, playtest 10). Goal: release on a **dedicated website**, on **Steam** and on **mobile (Android and iOS)**, with **Melvor Idle-style saves**. The game saves automatically, both locally and to the cloud, and the player can load either save on any device. For example, play on the computer, then open the mobile app and continue.

This document is a plan. Nothing here is built yet except the small platform layer in `src/platform/` (see "Shared code" below). Prices and store rules change; check them when you start each step.

## Summary

| Platform | How | Main owner steps | Rough cost |
|---|---|---|---|
| Website | The current Vite build, on a custom domain | Buy a domain, point DNS to GitHub Pages (or Netlify or Cloudflare Pages) | Domain: about $10–20 a year |
| Steam (Windows, macOS, Linux) | A desktop wrapper (Tauri recommended, Electron as fallback) around the same web build | Steamworks partner account, app fee, tax and bank forms, store page, code-signing certificate (Windows, optional at first) | Steam Direct fee: about $100 per game (paid back after $1,000 of sales); code signing: about $100–400 a year |
| Android | Capacitor around the same web build | Google Play developer account, signing key, store listing, data-safety form | Play Console: about $25 once |
| iOS | Capacitor around the same web build | Apple Developer Program, a Mac with Xcode, App Store listing, privacy form | About $99 a year |
| Cloud saves and accounts | Items 0.67 and 0.68 (Supabase recommended there) | Create the backend project, add public keys as repository variables | Free tier at first |

## 1. One codebase, thin platform layer

All platforms run the same React and Vite game. What differs is kept behind `src/platform/` (added in 0.87):

- `onBackground` / `isBackground`: the game going to the background and coming back.
  - On the web this is page visibility.
  - In Capacitor it is the app pause and resume events.
  - In Tauri or Electron it is window focus and minimise.
  - The idle engine already uses it, so offline gains and the "welcome back" summary work the same everywhere.
- `openExternal`: links open in the system browser in a wrapper, not inside the game window.
- **Later additions**, as each wrapper arrives:
  - `storage`: native file storage in wrappers. Browser storage can be cleared by the system on mobile, so the app should use the native store.
  - `achievementsSync`: maps our achievements (0.65) to Steam achievements.
  - `purchases`: only if in-app purchases are ever wanted. None are planned.

Rule: game logic never imports Capacitor, Tauri, Electron or Steam libraries directly. Only `src/platform/<name>.ts` does, and the build picks the platform.

## 2. Saves across devices (how 0.67 and 0.68 fit in)

- **Today:** the save lives in the browser (IndexedDB, plus a localStorage backup since 0.76), with manual export and import in Settings.
- **0.67** adds a `SaveBackend` interface and writes `docs/PUBLIC_RELEASE.md`, which compares backends. Supabase is the likely choice: accounts, a small table of save blobs, and row-level security.
- **0.68** adds accounts and cloud saves:
  - **Automatic saves:** an automatic cloud save on a timer and when the game closes, alongside the local save.
  - **Load screen:** lists the local and cloud saves with time, version, energy and completion %. The player picks one.
  - **Conflicts:** when the saves disagree, the newest wins, after asking the player.
  - **Guests:** guest play keeps working offline.
- **Every platform uses the same account and save format**, so the same login loads the same game on the website, Steam and mobile. The save already carries a version number with migrations, so an older app can refuse a newer save safely.
- **Steam Cloud is optional.** Steam's own cloud saves could sync the local file on Steam, but our account cloud already covers every platform. The suggestion is to rely on our own cloud and leave Steam Cloud off, so a save never has two different "clouds".

## 3. Website

1. Buy a domain (any registrar).
2. Either keep GitHub Pages (add a `CNAME` file and set the custom domain in the repository's Pages settings) or move to Netlify or Cloudflare Pages for preview links on pull requests. The Vite `base` path changes from `/megagen-idle/` to `/` for a root domain.
3. Add a simple landing section: screenshots, a "Play now" button, and links to Steam and the stores once they exist.
4. Privacy page: required by the app stores, and needed once accounts exist (0.67 lists what is stored).

## 4. Steam

- **Wrapper:**
  - **Tauri** is small (a few MB) and uses the system web view.
  - **Electron** is larger but has the most Steam examples. For Steam features, both use a small native plugin; `steamworks.js` for Electron is the common choice.
- **Steamworks features worth using:**
  - Achievements, mapped from `src/data/achievements.ts` (the ids are already stable).
  - Rich presence, for example "Producing 1.2M energy/s".
  - Steam Cloud is optional (see section 2).
- **Offline play:** the wrapper starts the game from local files, so it works without internet; cloud saves sync when online.
- **Store page checklist:**
  - Capsule images in Steam's required sizes.
  - At least 5 screenshots and a trailer (optional but strongly recommended).
  - A short and a long description, tags, content survey and system requirements.
  - A release date or "coming soon".
  - Steam reviews the page and a build before launch, so allow a few weeks.
- **Art:** real art should replace the generated stand-ins before a store launch. Sprites are swapped at the same path and size, and no code changes (see the README).

## 5. Mobile (Android and iOS)

- **Wrapper:** Capacitor puts the web build into native Android and iOS projects. It adds the native pause and resume events, file storage and links through `src/platform/mobile.ts`.
- **Mobile details to handle:**
  - Safe-area padding (already used for the research chip).
  - Touch target sizes (already at least 44 px for buttons).
  - Keeping the screen from sleeping is not needed for an idle game.
  - Offline gains rely on timestamps, which already works when the app is killed and restarted.
- **Android:** a Play Console account, an upload key (keep a backup; losing it is painful), the store listing, the data-safety form, the content rating questionnaire, and a closed testing track first. New personal accounts must run a closed test with a minimum number of testers before production; check the current rule.
- **iOS:** the Apple Developer Program, a Mac with Xcode to build and upload, App Store Connect listing, privacy "nutrition label", and TestFlight for testers. Apple reviews every release.

## 6. Order of steps

Each step lists what only the owner can do (marked **Owner**). Everything else can be done in cloud sessions.

1. **Content and art ready for the public.** Finish the planned content and a balance pass (0.47). Replace the stand-in art (**Owner**: commission or create art; the code needs no change).
2. **Credits and license.** Part of 0.67: a LICENSE file and an in-game credits screen (AAP-64 palette by Adigun A. Polack; open-source libraries).
3. **Accounts and cloud saves.** Item 0.67 writes the plan and the `SaveBackend` interface. **Owner:** create the backend project (e.g. Supabase) and add the public keys as GitHub repository variables. Then 0.68 builds it.
4. **Website on its own domain.** **Owner:** buy the domain and set DNS. Then a cloud session updates the build, the landing section and the privacy page.
5. **Android.** A cloud session adds Capacitor configuration files only. **Owner:** Play Console account and fee, build and sign in Android Studio on your computer (or set up a CI signing secret yourself), store listing, closed test.
6. **iOS.** **Owner:** Apple Developer account, a Mac with Xcode, signing, TestFlight, review.
7. **Steam.** A cloud session adds the Tauri or Electron configuration and the Steam achievements mapping. **Owner:** Steamworks account and app fee, tax and bank forms, store page assets, upload builds with SteamPipe, review, launch.

Steps 5–7 can run in any order; many idle games launch on the web and Android first because those are the cheapest, then Steam once reviews come in.

## 7. What stays out of cloud sessions

Signing keys, store accounts, fees, Xcode and Android Studio builds, and uploads to stores need the owner's machine or accounts. Cloud sessions can prepare configuration files, code and store text, but never hold secrets (CLAUDE.md, rule 6).
