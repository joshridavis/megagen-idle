# MegaGen Idle: multi-platform release plan

Item 0.87 (owner request, playtest 10). Goal: release on a **dedicated website**, on **Steam** and on **mobile (Android and iOS)**, with **Melvor Idle-style saves**. The game saves automatically, both locally and to the cloud, and the player can load either save on any device. For example, play on the computer, then open the mobile app and continue.

This document is a plan. Nothing here is built yet except the small platform layer in `src/platform/` (see "Shared code" below). Prices and store rules change; check them when you start each step.

## Summary

| Platform | How | Main owner steps | Rough cost |
|---|---|---|---|
| Website with accounts | The current Vite build, plus sign-up, log-in and cloud saves (0.67, 0.68). Players log in on any browser and continue the same game. | Create the backend project and add its public keys as repository variables; optional domain | Free tier at first; domain about $10–20 a year |
| Web portals (itch.io) | The same build, zipped | An itch.io account and page | Free |
| Steam (Windows, macOS, Linux) | A desktop wrapper (Tauri recommended, Electron as fallback) around the same web build | Steamworks partner account, app fee, tax and bank forms, store page, code-signing certificate (Windows, optional at first) | Steam Direct fee: about $100 per game (paid back after $1,000 of sales); code signing: about $100–400 a year |
| Android | Capacitor around the same web build | Google Play developer account, signing key, store listing, data-safety form | Play Console: about $25 once |
| iOS | Capacitor around the same web build | Apple Developer Program, a Mac with Xcode, App Store listing, privacy form | About $99 a year |
| Cloud saves and accounts | Items 0.67 and 0.68 (Supabase recommended there) | Create the backend project, add public keys as repository variables | Free tier at first |

## 1. One codebase, thin platform layer

All platforms run the same React and Vite game. What differs is kept behind `src/platform/` (added in 0.87):

- `onBackground` / `isBackground`: the game going to the background and coming back.
  - On the web this is page visibility.
  - In Capacitor it is the app pause and resume events.
  - In Tauri or Electron it is window focus and minimize.
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

**Plan and setup:** `docs/PUBLIC_RELEASE.md` (0.67).

**What "website" means (owner, playtest 15):** a real site where players sign up and log in, and their game is saved in the cloud, not only in browser storage. The game on GitHub Pages today is a preview with local saves. The website step is therefore 0.67 (plan, `SaveBackend` interface) followed by 0.68 (accounts and cloud saves), and 0.67 is moved up to come right after the map work.


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

## 6. Order of steps: easiest first (playtest 14)

You prefer releasing from the easiest platform to the hardest, so the game reaches players as soon as possible. The website comes first and includes accounts (playtest 15). **The other steps can go live before accounts exist.** Each platform works on its own with local saves plus export and import, so nothing waits on the backend. When 0.67 and 0.68 land, an update adds cloud saves everywhere.

| # | Step | Owner cost | Typical time to live | What blocks it |
|---|---|---|---|---|
| 1 | **Website with accounts and cloud saves** (the game itself is already live on GitHub Pages, with local saves only) | Free tier at first | 1–2 weeks after the owner setup | 0.67 then 0.68; the owner creates the backend project and adds the public keys. Optional custom domain. |
| 2 | **Web game portal: itch.io** (optionally also others such as Newgrounds) | Free | 1–2 days | An itch.io account, a page, the zipped build (a cloud session can prepare the zip and the page text). |
| 3 | **Android (Google Play)** | About $25 once | 1–3 weeks | Play Console account; signing and building in Android Studio on your computer; the closed-test rule for new personal accounts (check the current tester count and duration). |
| 4 | **Steam (Windows, macOS, Linux)** | About $100 per game (paid back after $1,000 of sales) | 2–6 weeks | Steamworks account, tax and bank forms, store page assets, Steam's review of the page and the build. Real art is strongly advised first. |
| 5 | **iOS (App Store)** | About $99 a year | 2–4 weeks | Apple Developer Program, **a Mac with Xcode**, TestFlight, App Review. The hardest, mainly because of the Mac and review requirements. |

Alongside these, at any time:

- **Accounts and cloud saves** are part of step 1. When they are ready, an update adds them to any other platform already live.
- **Real art** before Steam and the app stores (**Owner**: commission or create it; the code needs no change).
- **Credits and LICENSE** (part of 0.67) before the first store submission.
- **A custom domain** for the website, whenever you like (**Owner**: buy the domain and set DNS).

What a cloud session can prepare for each step: the itch.io zip and page text, Capacitor configuration files for Android and iOS, Tauri or Electron configuration and the Steam achievements mapping, and store descriptions. Signing, accounts, fees and uploads stay with you (section 7).

## 7. What stays out of cloud sessions

Signing keys, store accounts, fees, Xcode and Android Studio builds, and uploads to stores need the owner's machine or accounts. Cloud sessions can prepare configuration files, code and store text, but never hold secrets (CLAUDE.md, rule 6).
