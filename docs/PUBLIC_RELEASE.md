# MegaGen Idle: accounts and cloud saves

Item 0.67 (owner requests: playtest 5, 6, 10, 15 and 17). This is the plan for the website step in `docs/RELEASE_PLAN.md`: players sign up, log in and keep their game in the cloud, like Melvor Idle. Item 0.68 builds it once the one-time setup in section 9 is done.

Prices and free-tier limits below are from the time of writing. Check them on each provider's pricing page when you start.

## 1. What players get

- **Accounts:** sign up with an email and password, then log in on any browser, and later in the Steam and mobile apps.
- **A username:** shown later on leaderboards.
- **Automatic cloud saves:** every few minutes and when the game closes, alongside the local save, which keeps working as now.
- **A load screen after logging in:** it lists the local and the cloud save, with time, version, energy and completion %.
  - If they differ, the game asks which to keep and suggests the newer one.
  - If they match, it just continues.
- **Guest play:** works as today. No account is needed, and a guest can sign up later and upload the game they have.
- **Account deletion:** "Delete my account" in Settings removes the login and every cloud save.

## 2. What exists today (0.67, 0.68)

- **The live save:** in IndexedDB, with a localStorage backup written at the moment of every save (0.76). Settings has Export and Import.
- **`src/store/saveBackend.ts`:** one `SaveBackend` interface for every place a save can live.
  - `list`, `load`, `save` and `remove` work by slot, and a summary carries time, version, energy and completion.
  - The local implementation stores slots in IndexedDB, with tests.
  - `chooseSave(local, cloud)` decides between them: a new game, use one without asking, or ask with the newer suggested. It is tested too.
  - The cloud backend (0.68, `src/store/cloud.ts`) implements the same interface, so the game logic does not change.
- **Accounts and sync (0.68):** built and switched off. They turn on by themselves once the two repository variables from section 9 exist (`src/store/account.ts`, Settings → Account and cloud saves, `public/privacy.html`).
- **Save format:** the save travels as the existing export file text. It carries `SAVE_VERSION` and migrates on load, and a save from a newer game version is refused, not damaged.
- **Credits and licenses:**
  - Settings → Credits lists the AAP-64 palette and the open-source libraries.
  - `THIRD_PARTY_NOTICES.md` (from `npm run notices`) has their full license texts.
  - `LICENSE` reserves all rights to the game itself.

## 3. Options compared

| | Supabase (recommended) | Firebase | PlayFab | Own small server |
|---|---|---|---|---|
| **What it is** | Hosted Postgres database, accounts, row-level security | Google's hosted accounts and document database | Microsoft's game backend (accounts, saves, leaderboards) | For example Node and Postgres on a VPS |
| **Works with our static site** | Yes: the browser talks to it directly | Yes | Yes | Yes, plus a server to run |
| **Accounts** | Email and password, magic links, Google, Discord, Apple and more | Email and password, Google, Apple and more | Its own, plus Steam, Google and Apple | You build it (risky) |
| **Saves** | A table row per save; size checked by the database | A document per save | Player data | Your tables |
| **Leaderboards later** | A table and plausibility checks in SQL or Edge Functions | Cloud Functions | Built in | You build it |
| **Free tier** | 2 projects, 500 MB database, 50,000 monthly active users; a free project pauses after a week without visits | Generous daily read and write quotas; pay as you go after | Free development tier, paid by players after | None: about $5–10 a month for a VPS |
| **Next step up** | Pro, about $25 a month | Pay per use | Paid tiers by players | Bigger VPS |
| **Lock-in** | Low: plain Postgres, can be self-hosted | Medium | High | None |
| **Steam and mobile** | Same account through its JavaScript client in Tauri, Electron or Capacitor | Same | Strongest: native Steam login | Yours to build |

**Recommendation: Supabase.**
- It fits the static website with no server to run, and it keeps the data in standard Postgres.
- Row-level security makes "a player can only touch their own saves" a database rule, not something the game has to get right.
- The free tier covers the launch, and the same account works later on Steam and mobile.
- **Downside:** a free project pauses after a week with no visits (it wakes on the next request, slowly). Once players arrive this does not happen; the Pro plan removes it.
- **When PlayFab would be the better choice:** if Steam login and built-in leaderboards become the priority. The `SaveBackend` interface keeps that switch open.

## 4. Data model

The database setup is in `docs/supabase-schema.sql`, ready to paste.

- **`profiles`:** one row per account with a unique username (3–20 letters, digits or `_`).
- **`saves`:** one row per account and slot (`auto` for the automatic save).
  - It holds the save version, the time saved, energy and completion (for the load screen without downloading the save) and the save text.
  - Each save is capped at 1 MB; a late-game save today is about 11 KB.
- **`delete_my_account()`:** deletes the caller's login, and the profile and saves go with it.

## 5. Security

- **Passwords** are handled by Supabase Auth (hashed and salted). The game never sees or stores them.
- **The key in the game is public by design:** the project URL and the "publishable" key (older projects call it the "anon public" key).
  - All protection comes from row-level security: every save row is readable and writable only by its owner (`auth.uid() = user_id`).
  - The secret "service role" key is never used by the game and never goes in the repository.
- **The keys are not committed:**
  - They are GitHub **repository variables** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), passed to the build by the deploy workflow.
  - Without them the game builds as today, with accounts hidden.
- **Abuse limits:**
  - Supabase limits sign-up, log-in and email rates by default.
  - The game saves to the cloud at most every few minutes, and the database refuses saves over 1 MB.
- **Email confirmation** is on, so an account needs a working email address.

## 6. Privacy

- **What is stored:** email, username, account creation time, cloud saves (game progress only) and their times. No real names, payment details or tracking.
- **Deletion:** players delete everything themselves from Settings, which takes effect immediately.
- **A privacy page:**
  - It is needed before launch, linked from the sign-up form and the website, and the app stores require one too.
  - 0.68 adds a plain page that says exactly the above.
- **Where the data lives:** in the Supabase region chosen at setup. An EU region suits EU players best.

## 7. Cheating and leaderboards

- **The risk:** saves are made in the player's browser, so a player can edit one. For cloud saves alone that only affects their own game.
- **Leaderboards (later, not in 0.68):** need plausibility checks before a score counts.
  - A server function compares lifetime energy with account age and the game's best possible rate, using the simulator's numbers with a wide margin.
  - Impossible scores are hidden from the board, not deleted.
  - Recorded at most once an hour per player.
- **Achievements and completion stay local.** They only feed leaderboards after the same checks.

## 8. How syncing will work (0.68)

1. **On start:** the local save loads as now. A logged-in player's cloud summary is fetched in the background, and `chooseSave` decides whether to ask.
2. **While playing:** the game uploads the automatic save every 5 minutes, and on closing or going to the background through the platform layer (`onBackground`), using a request that survives the tab closing.
3. **Offline:** the local save keeps working, and the next upload happens when the connection returns.
4. **Conflicts:** the newest save is suggested, but the player chooses. Saves less than a minute apart count as the same game.
5. **Older app, newer save:** the save is refused with a message to update the game; it is never loaded half-way.

## 9. Your one-time setup (owner)

About 15 minutes. Nothing here needs a credit card.

1. Go to https://supabase.com, sign up (GitHub login works), and click **New project**.
   - **Name:** `megagen-idle`.
   - **Database password:** generate one and keep it in a password manager. The game never needs it.
   - **Region:** pick the one closest to most players (for example Frankfurt or London for Europe).
2. When the project is ready, open **SQL Editor → New query**, paste all of `docs/supabase-schema.sql`, and click **Run**. It should say "Success. No rows returned".
3. Open **Authentication → Sign In / Providers → Email** and make sure **Confirm email** is on.
4. Open **Authentication → URL Configuration**:
   - **Site URL:** `https://joshridavis.github.io/megagen-idle/play/` (the game moved to `/play/` when the landing page took the site root, 1.94)
   - **Redirect URLs:** add the same address. Add `http://localhost:5173/play/` too, for testing locally. After the switch to megagenidle.com (section 9c), add `https://megagenidle.com/play/` and make it the Site URL.
5. Open **Project Settings → API** (or **Data API**) and copy the **Project URL**, which looks like `https://abcd1234.supabase.co` with nothing after `.co` (not the RESTful endpoint ending in `/rest/v1/`; the game now trims that anyway), and the **publishable** key (`sb_publishable_…`; older projects show an **anon public** key instead, which works the same). Do not copy the secret or `service_role` key.
6. In GitHub, open the repository **Settings → Secrets and variables → Actions → Variables** tab, and click **New repository variable** twice:
   - `VITE_SUPABASE_URL` = the Project URL
   - `VITE_SUPABASE_ANON_KEY` = the publishable (or anon public) key
7. Tell me it is done. The accounts code is already in the game (0.68), switched off. The next deploy turns it on: Settings shows "Account and cloud saves". I then run a live test (sign up, confirm, sync between two browsers, delete) and fix anything it finds.

**Optional, later:**
- Sign in with Google or Discord (each needs a small app registration on their side).
- A custom email sender, for branded confirmation emails.
- The Pro plan, once the game has regular players.

## 9b. Sign in with Google and Discord (owner, optional, about 20 minutes)

The game has "Continue with Google" and "Continue with Discord" buttons (1.22). They stay hidden until you do the steps below, so players never see a button that does not work yet.

You will need your Supabase **callback URL**. It is shown on each provider's page in Supabase (Authentication → Sign In / Providers → Google or Discord) and looks like `https://<your-project>.supabase.co/auth/v1/callback`.

**Google**
1. Open https://console.cloud.google.com and create a project (any name, for example "MegaGen Idle").
2. Open **APIs & Services → OAuth consent screen**:
   - Choose **External** and fill in the app name, your support email and the developer email.
   - Leave scopes as they are (email and profile).
   - Publish the app when you are ready for everyone; while it is in testing, only test users you add can sign in.
3. Open **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - **Type:** Web application.
   - **Authorized JavaScript origins:** `https://joshridavis.github.io`
   - **Authorized redirect URIs:** the Supabase callback URL.
   - Copy the **Client ID** and **Client secret**.
4. In Supabase → **Authentication → Sign In / Providers → Google**, turn it on, paste both values and save.

**Discord**
1. Open https://discord.com/developers/applications and click **New Application** (name it "MegaGen Idle").
2. Open **OAuth2**, add the Supabase callback URL under **Redirects**, and save.
3. Copy the **Client ID**, then click **Reset Secret** and copy the **Client Secret**.
4. In Supabase → **Authentication → Sign In / Providers → Discord**, turn it on, paste both values and save.

**Then turn the buttons on**
1. In GitHub → repository **Settings → Secrets and variables → Actions → Variables**, add `VITE_AUTH_PROVIDERS` = `google,discord` (or just one of them).
2. Variables are read when the site is built, so rebuild it: **Actions → Deploy to GitHub Pages → Run workflow** (on `main`). The same applies whenever you change any of these variables.

Players who sign in with Google or Discord choose a username the first time. Their email comes from the provider, and the cloud saves work the same.

## 9c. The website megagenidle.com (owner, about 20 minutes plus DNS wait)

> **Replaced by the owner's plan:** the domain is bought at Cloudflare and the site is hosted on Cloudflare Pages (playbook W-01, W-06; `docs/RELEASE_DECISIONS.md`). Item 2.05 moves the build there and rewrites this section. The GitHub Pages steps below apply only if the site stays on GitHub Pages until then.

The site is built for it already (1.94): a landing page at the root with **Play now**, the game at `/play/`, the privacy page at `/privacy.html`, and `public/CNAME` holding `megagenidle.com`. Until you switch, it all runs at `https://joshridavis.github.io/megagen-idle/` (game: `.../megagen-idle/play/`).

1. At the company where you bought the domain, open its DNS settings and add:
   - four **A** records for `megagenidle.com` (host `@`): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`;
   - optionally four **AAAA** records (host `@`): `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`;
   - a **CNAME** record for `www` pointing to `joshridavis.github.io`.
   (GitHub's current list: docs.github.com, "Managing a custom domain for your GitHub Pages site".)
2. Optional but recommended: verify the domain for your GitHub account (**GitHub → Settings → Pages → Add a domain**), so nobody else can take it over.
3. In the repository, **Settings → Pages → Custom domain**: type `megagenidle.com` and **Save**. When the DNS check passes (minutes to a day), tick **Enforce HTTPS**.
4. **Settings → Secrets and variables → Actions → Variables**: add `SITE_BASE` = `/` and `SITE_URL` = `https://megagenidle.com/`. These are not secrets.
5. Re-run **Actions → Deploy to GitHub Pages → Run workflow** on `main`. The site now builds for the domain root. The old github.io address forwards to the domain.
6. In Supabase (if accounts are on), update the Site URL and Redirect URLs as in section 9, step 4.

**Saves:** a browser keeps its save per web address. A player who played on the github.io address starts fresh on megagenidle.com unless they use cloud saves (Settings → Account) or export and import their save (Settings → Save). Moving the game from `/megagen-idle/` to `/megagen-idle/play/` keeps saves, as it is the same address.

## 10. Costs

| What | When | Cost |
|---|---|---|
| Supabase Free | Launch | $0 (2 projects, 500 MB database, 50,000 monthly active users) |
| Supabase Pro | Many players, or to stop the free project pausing | About $25 a month |
| Custom domain (optional) | Any time | About $10–20 a year |
| Email sending beyond the built-in limit | Many sign-ups a day | Free tiers exist (for example Resend or Brevo) |

A late-game save is about 11 KB, so 10,000 players with one save each use about 110 MB, well inside the free 500 MB. Monthly active users (50,000 free) are the limit you are more likely to reach first.

## 11. Open decisions for you

- **License:** `LICENSE` currently reserves all rights, the safe default for a game you plan to sell. Change it if you want the code open (for example MIT for the code only).
- **Usernames:** shown publicly on future leaderboards. Is 3–20 letters, digits and `_` fine?
- **Sign-in methods at launch:** email only, or also Google or Discord?
