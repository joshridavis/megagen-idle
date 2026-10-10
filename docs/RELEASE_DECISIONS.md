# MegaGen Idle: release decisions

The owner's fixed decisions for the public launch: prices, platforms, editions, names, IDs, hosting and dates. They come from the owner's **Launch & Growth Playbook** (October 2, 2026), adopted on October 10, 2026 (playtest 31 answers), and from later owner answers in the Playtest log. **Follow them; do not ask the owner about anything this file settles.** If an owner answer in `BACKLOG.md` (Playtest log) is newer and differs, the newer answer wins; record it here the same day.

The playbook also holds the owner's personal and account details. Those never go into this repository (CLAUDE.md, "No secrets in the repo").

Step IDs in brackets (S-08, A-03, ...) are the playbook's own; they say which owner step a piece of work serves.

## Launch

- **Date:** Thursday, March 11, 2027, 20:00 Israel time (10:00 PST), on Steam (Windows), Google Play and the App Store at once. The free part plays on megagenidle.com/play/, itch.io and galaxy.click.
- **If the date slips** (missing the Next Fest registration on January 10, 2027), launch moves to Thursday, July 15, 2027, and every later date by the same 18 weeks.
- **Platform fees:** $235 in total (Steam Direct $100, Apple $99 a year, Google Play $25, domain about $11 a year). Everything else uses free tiers. **No paid ads, anywhere, ever.**

## Platforms

| Platform | At launch | Later |
|---|---|---|
| Steam | Windows x64 (Electron), plays on Steam Deck | macOS and Linux: needed in the future (owner, playtest 31), after the Windows launch |
| Google Play | Android, targetSdk 36, minSdk 24 | |
| App Store | iPhone and iPad, iOS 15 and newer | |
| Web | megagenidle.com/play/ (free part), itch.io, galaxy.click (embeds megagenidle.com/play/ in an iframe) | |

## Names and positioning

- **Steam:** "MegaGen Idle". **Google Play and App Store:** "MegaGen Idle: Energy Tycoon". **App Store subtitle:** "Idle power-plant tycoon".
- **Never shorten the game's name to "MegaGen"** in any text (game, site, store, docs): "MEGA GEN" is a registered dental-implant trademark. The two-line logo ("MegaGen" over "Idle") shows the full name and is fine.
- **One line, used everywhere:** "Build an energy empire, from one solar panel to a micro-supernova. It keeps generating while you're away."
- **Promise:** fair and calm. Buy once, own it. No ads, no energy for cash, no timers you must pay to skip.
- **Developer and publisher (public name):** Joshri Games, a solo developer in Israel. Contact: support@megagenidle.com; press: press@megagenidle.com.
- **Store genres and tags:** Steam genres Casual, Indie, Simulation, Strategy; tags (in order) Idler, Incremental, Clicker, Resource Management, Management, Automation, Building, Base Building, Simulation, Strategy, Casual, Relaxing, Singleplayer, 2D, Pixel Graphics, Indie, Science, Economy, Minimalist, Cozy. Google Play category Simulation. App Store: Games, Simulation and Strategy. English only at launch; translations (German, Simplified Chinese, Russian, Brazilian Portuguese, Japanese) about three months after launch.
- **Steam AI disclosure:** yes, pre-generated content (AI-assisted text; sprites and store images drawn by code written with an AI coding assistant).

## Business model and prices

"Free to start, buy once" (the Melvor Idle model). Never: ads (not even rewarded), a premium currency, energy or time skips for money, subscriptions, loot boxes, VIP multipliers.

| Platform | Free | Paid | Price (USD) |
|---|---|---|---|
| Steam | A separate free **demo** app: the free part | The **full game** (paid up front); the **Supporter Pack** as DLC | $6.99 (launch discount 15% for 7 days); DLC $2.99 |
| Google Play | The free part | **Full Game** unlock and **Supporter Pack**, one-time in-app purchases | $4.99; $2.99 |
| App Store | The free part | Same, non-consumable in-app purchases | $4.99; $2.99 |
| Web (megagenidle.com, itch.io, galaxy.click) | The free part only | An optional tip on Ko-fi (https://ko-fi.com/megagenidle). **The web never sells the Full Game.** | Any |

- **Steam pricing:** propose $6.99 with Valve's recommended regional prices. Store prices are set in each store, never in the game's code; the game shows the store's own local price.
- **Mobile:** Google Play keeps 10% of the first $1M a year in the US, UK and EU and 15% elsewhere; Apple keeps 15% with the Small Business Program.
- **Where the free part ends:** the playbook says "everything before the research Natural Gas Extraction, about 10 hours". The owner kept the **current boundary, research level 9** (`FREE_MAX_RESEARCH_LEVEL` in `src/data/purchases.ts`; first paid research at about 58 h in the simulator), with "For now it is fine" (playtest 31). Use level 9 until the owner changes it; changing it is that one constant. Store and site texts that say "about 10 hours" must follow the real boundary (measure it with the simulator) when they are written.
- **Full Game:** everything after the free part, and every update after launch.
- **Supporter Pack (cosmetic only):** three color themes, **Solar Gold**, **Neon Grid** and **Aurora Night**; an optional gold frame on generator cards; a **Supporter** badge beside the player level; a thank-you line in Settings. Without the pack, Settings shows the themes as previews labeled "Supporter Pack". It never changes energy, speed, resources, offline time or completion.
- **Purchases are per platform** (Steam, Google and Apple do not share them). Saves move freely by export and import; cross-device cloud saves are planned for April 2027.
- **After launch:** free content updates every 4 to 6 weeks; first discount 20% in the Steam Summer Sale (June 24 to July 8, 2027), then discounts slowly growing to 40% by the first anniversary; **Expansion 1 "Orbital Age"** in June 2027 at $3.99 (orbital solar, space elevator, Dyson swarm, a new research branch; Steam DLC and mobile in-app purchase); a "Complete" Steam bundle (game, Supporter Pack, expansion) in September 2027; **Expansion 2** in December 2027 at $3.99. Expansions are new mechanics the owner has decided on; their items are written when that work is due.

## Editions (one codebase, chosen at build time with `VITE_EDITION`)

- **demo:** the web build (/play/), itch.io, galaxy.click and the Steam demo. Only the free part; data for later content is **not in the bundle at all**.
- **full:** the Steam full game. Everything unlocked.
- **mobile:** Android and iOS. Full content in the bundle; everything after the free part is locked until the `full_game` entitlement is owned.
- **Saves carry over:** a demo save loads unchanged in the full and mobile editions; on desktop both Steam flavours use the same save folder, so the full game picks up the demo save.
- **Owner playtests** use the Cloudflare preview link of each pull request, where /play/ is the full edition (`PLAY_EDITION=full` in Cloudflare's preview environment). Never share preview links.
- **Upsell:** at the boundary, or when the player taps a locked item, a calm "Get the Full Game" panel: what comes next (Gas, Oil, Nuclear, Fusion, Micro-Supernova, Grid Contracts, energy pets), "Your save carries over", "Buy once. No ads. No pay-to-win." Web demo: Steam, Google Play and App Store links (empty ones hidden); Steam demo: the Steam store page; mobile: a buy button with the store's local price. The panel opens by itself at most once per session; a small "Full Game" button stays in the top bar in the demo and in the locked mobile edition.
- **Web demo extra:** a small "Support the developer" link to Ko-fi in Settings and in the site footer.

## IDs and services

- **App ID and bundle ID:** `com.megagenidle.game` (Android, iOS, Electron `appId`).
- **Products:** `full_game` and `supporter_pack`. **RevenueCat entitlements:** `full_game` and `supporter`. RevenueCat (`@revenuecat/purchases-capacitor`) handles mobile purchases; its public SDK keys live in `src/platform/purchaseKeys.ts` as `ANDROID = "goog_REPLACE"` and `IOS = "appl_REPLACE"` until the owner pastes the real public keys (public keys, safe to commit).
- **Steam:** Electron with **steamworks.js**. App IDs in `desktop/steam-app-ids.json` as `{"full": 0, "demo": 0, "supporterDlc": 0}`, filled in by the owner. Achievement API names `ACH_` plus the achievement id in upper snake case; `docs/steam/achievements.csv` (api name, display name, description, hidden 0/1) and 256×256 JPG icons (unlocked in color, locked in gray) in `docs/steam/achievement-icons/`. The demo never unlocks Steam achievements; the full game re-syncs all earned ones on start. The Supporter Pack DLC has no files; the game checks ownership.
- **Steam Cloud:** Auto-Cloud on `%APPDATA%/MegaGen Idle/saves/*.json` (root WinAppDataRoaming, subdirectory `MegaGen Idle/saves`). The desktop app keeps its save files exactly there.
- **Desktop window:** 1280×800 default, resizable, at least 960×600, remembers size and position, F11 toggles full screen, no menu bar, no dev tools in packaged builds, links in the system browser, a single instance, keeps producing when minimized (`backgroundThrottling: false`). Executable "MegaGen Idle.exe", icon from `src/assets/brand/app_icon_1024.png`. Flags: `--trailer` (trailer mode) and `--clip` (a 608×1080 portrait window for clip mode).
- **Desktop workflow:** `.github/workflows/desktop.yml` on `windows-latest`, started by hand with an input `flavour` = `full` or `demo`; uploads `MegaGenIdle-<flavour>-win64.zip` (the unpacked folder, zipped) as an artifact. No Steam credentials anywhere in CI; the owner uploads with SteamPipe GUI.
- **Mobile builds:** Capacitor (latest stable), `android/` and `ios/` committed, both orientations. `codemagic.yaml` with two hand-started workflows: `android-release` (npm ci, build with `VITE_EDITION=mobile`, cap sync, signed AAB with the keystore reference `megagen_upload`, versionCode = Codemagic build number, artifact `app-release.aab`) and `ios-release` (build with `VITE_EDITION=mobile`, cap sync, signing with certificate `megagen_distribution` and profile `megagen_appstore`, publishing through the App Store Connect integration "MegaGen ASC", build number = latest TestFlight build + 1, TestFlight only). iOS: `PrivacyInfo.xcprivacy` (no tracking; purchase history collected, not linked to identity) and `ITSAppUsesNonExemptEncryption` = NO. Optional local notifications (off by default): "Research complete" and "Your offline storage is full". No push server.
- **Website hosting:** **Cloudflare Pages** from the (soon private) repository, not GitHub Pages: build command `npm run build:web`, output `dist-web/`, `NODE_VERSION=22`, domains megagenidle.com and www.megagenidle.com. Cloudflare also provides the domain, email forwarding (support@, press@) and cookie-free analytics, so the site has **no cookies, no analytics code and no cookie banner**. GitHub Pages and `.github/workflows/deploy.yml` are retired when the website item moves to Cloudflare. The repository becomes **private** (so nobody can rebuild the paid game); everything must keep building from a private repository.
- **External links:** one file, `src/site/links.ts`: `STEAM_URL`, `STEAM_DEMO_URL`, `GOOGLE_PLAY_URL`, `APP_STORE_URL`, `DISCORD_URL`, `YOUTUBE_URL` (https://www.youtube.com/@MegaGenIdle), `TIKTOK_URL` (https://www.tiktok.com/@megagenidle), `X_URL` (https://x.com/MegaGenIdle), `BLUESKY_URL` (https://bsky.app/profile/megagenidle.bsky.social), `REDDIT_URL`, `TRAILER_YOUTUBE_ID`, `KOFI_URL` (https://ko-fi.com/megagenidle). An empty link hides its button or embed. The Google Play URL will be https://play.google.com/store/apps/details?id=com.megagenidle.game.

## Website (megagenidle.com)

Pages: `/` (landing), `/play/` (the game), `/press/`, `/privacy/`, `/terms/`, `/support/` and a 404 page. Plain Vite multi-page HTML with Tailwind (no React on site pages), the game's dark pixel-art look and AAP-64 colors, works from 360 px wide, under 200 KB per page before images.

- **Landing, top to bottom:** hero (app icon, "MegaGen Idle", the tagline; buttons "Play free in your browser", "Wishlist on Steam", "Join the Discord"; "Coming March 11, 2027 to PC, Android and iPhone" plus store buttons when their links exist); the trailer (YouTube, loaded only on click; hidden while empty); six feature cards with sprites; a screenshot gallery (4 in-game screenshots at 1920×1080); "Fair by design"; the FAQ; the footer (social icons for non-empty links, support email, Privacy, Terms, Press kit, "© 2026 MegaGen Idle").
- **Texts** (feature cards, FAQ, Privacy policy, Terms of use, Press kit): the playbook's copy-paste pack. The owner adds `docs/legal/privacy.md`, `docs/legal/terms.md` and `docs/press.md` (step W-04); the site renders them. `/press/` offers `press-kit.zip` (logo, app icon, 6 screenshots).
- **SEO:** a title and description per page, Open Graph and Twitter tags with a 1200×630 image made from the sprites and logo, favicons from the app icon, `sitemap.xml`, `robots.txt`, JSON-LD `VideoGame` data on the landing page.
- **Owner feedback (playtest 31):** the current landing page's pitch is fine.

## Store images and media (made by code from the current sprites)

- Steam capsules and library images (done, 1.52); store screenshots: 8 at 1920×1080 into `docs/steam/screenshots/` with `npm run screenshots` (scenes: early game with the tutorial, a busy grid around Coal and Hydro, the research tree running, the room expansion, the welcome-back summary after 8 hours, the Completion tab at about 60%, late game with Nuclear, a UFO sighting); `docs/steam/og-1200x630.png`; `docs/stores/itch-cover-630x500.png`; Steam icons in `docs/steam/icons/` (community 184×184 JPG, client .ico 16 and 32 px, shortcut .ico 256 px).
- Mobile store graphics into `docs/stores/`: Android icon 512×512, feature graphic 1024×500, 8 phone screenshots 1080×1920, 4 tablet 1920×1200; iOS 8 iPhone 1320×2868 and 4 iPad 2064×2752.
- Supporter Pack DLC art: the four Steam capsules with a gold "Supporter Pack" ribbon under the logo and 5 screenshots of the themes, in `docs/steam/supporter/`.
- No new hand-made or AI art and no sound at launch; art and sound upgrades only if the game sells.

## Code work the playbook asks for (written as backlog items when due)

Website on Cloudflare (W-05); editions, the Full Game unlock and the Supporter Pack (R-01); store screenshots (S-06); clip mode for short videos (C-07: a hidden developer menu, tap the footer version 7 times, seven 15 to 20 second portrait scenes); the Steam desktop build (S-08); the itch.io package (C-03: `npm run build:itch`, the demo with relative paths, zipped, works in an iframe, manual workflow); the mobile apps (A-03); trailer mode (S-12: `?trailer=1` or `--trailer`, a scripted 75-second time-lapse at 1920×1080, starts on Space); Supporter Pack store art (R-02); a review prompt (L-01: once, after 3 hours of play, right after a happy moment; native review APIs on mobile, a small panel on Steam and the web; never again); then cloud saves across devices (April 2027), translations (month 3) and the expansions.

## Key dates (owner steps; code must be ready before them)

| Date | What | Code needed first |
|---|---|---|
| Oct 10–16, 2026 | Website online on Cloudflare (W-05, W-06); repo private (F-06) | Website item |
| Oct 17–23 | Editions and purchases (R-01) | Before the Steam and mobile builds |
| Nov 7 | Store screenshots uploaded (S-07) | Screenshots item |
| Nov 13 → Nov 20 | Steam page submitted → public "Coming Soon" | |
| Nov 14–20 | First Steam build (S-11) | Steam desktop build |
| Nov 21–27 | Mobile builds (A-03, A-05) | Mobile apps item |
| Dec 13–27 | Google closed test (12+ testers, 14 days); production application Dec 28 | Mobile builds with purchases |
| Dec 2026 | Trailer recorded (S-13) | Trailer mode |
| Jan 10, 2027 | Next Fest registration | |
| Jan 25 | Steam demo uploaded for the press preview | Demo flavour |
| Feb 15 | iOS review with pre-orders | |
| Feb 22 – Mar 1 | Steam Next Fest | |
| Feb 25 | Steam full build for review; Supporter DLC submitted | Steam achievements, DLC check |
| Mar 11, 2027 | Launch on all three stores | |
| Apr 2027 | Cloud saves across devices | |
