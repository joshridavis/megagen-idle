# Getting started — running MegaGen Idle development with Claude Code

Follow these in order. Everything is done in a browser unless marked otherwise.

## 1. Create the GitHub repository

1. Go to **github.com**. Sign in, or create a free account.
2. Click **+** (top right) → **New repository**.
3. Name it `megagen-idle`. Choose **Private**. Leave everything else as it is.
4. Click **Create repository**. Keep this page open.

## 2. Add the three planning files

1. On the repo page, click **Add file** → **Upload files**.
2. Upload `CLAUDE.md`, `BACKLOG.md` and `GETTING_STARTED.md` (this file).
3. Click **Commit changes**.

They must sit in the repo root, not in a folder. The repo needs nothing else — Claude writes the game itself.

## 3. Start the first cloud session

1. Go to **claude.ai/code**.
2. Connect your GitHub account when prompted, and grant access to `megagen-idle`.
3. Select the `megagen-idle` repository.
4. Start a **cloud** session (not local).
5. Send this message:

```
Read CLAUDE.md and BACKLOG.md in the repo root.
Then work through the Order of work from the top, following the
autonomy and playtest rules. Start now; don't ask me between items.
```

The first item creates the whole project, so the first pull request is large. Claude works on a branch and opens a pull request. It stops at the first playtest checkpoint, or when the session ends.

## 4. Review and merge the pull request

1. Go to your repo → **Pull requests** tab → open the newest one.
2. Read the description. Click **Files changed** if you want to see the code.
3. Click **Merge pull request** → **Confirm merge**.

Do this each time Claude opens a PR. Nothing reaches `main` until you merge.

## 5. Turn on the live website (once, after item 0.22 is merged)

1. Repo → **Settings** → **Pages** (left sidebar).
2. Under **Source**, choose **GitHub Actions**. Save if asked.
3. Repo → **Actions** tab. Wait for the deploy run to finish (a green check).
4. Your game is at `https://<your-github-username>.github.io/megagen-idle/`.

If the page is blank, open the Actions tab and check the run finished.

## 6. Playtest when Claude asks

Claude stops and says the game is ready to test, and writes `PLAYTEST.md` in the repo with what to try.

Play it at the URL from step 5. Then reply in the same Claude session with what felt good, what felt slow, what was confusing, and anything broken. Be specific about pacing ("it took 20 minutes to afford the second generator"). Claude turns your feedback into new items and continues.

## 7. Keep going

Open a new cloud session whenever you want more work done. Use:

```
Read CLAUDE.md and BACKLOG.md, then continue from the Order of work.
```

Claude picks up from the statuses in `BACKLOG.md`. Merge each PR as it arrives.

---

## Running the game on your own computer (optional)

You don't need this if you use the live URL from step 5. If you want it:

1. Install **Node.js 20 or newer** from nodejs.org (the LTS download).
2. Install **Git** from git-scm.com if you don't have it.
3. In a terminal:

```
git clone https://github.com/<your-github-username>/megagen-idle.git
cd megagen-idle
npm install
npm run dev
```

4. Open the `http://localhost:5173` address it prints.

Press Ctrl+C in the terminal to stop. Run `git pull` to get the latest merged changes.

---

## Things worth knowing

- **Credit:** the $250 cloud session credit expires **November 5**. After that, cloud sessions use your normal Max plan limits at no extra cost.
- **Saves:** the game saves in your browser. Clearing site data for the page erases progress.
- **Changing playtest frequency:** edit `PLAYTEST_EVERY` at the top of `BACKLOG.md` (default 5 items).
- **Changing direction:** say so in the session. Claude adds new items at the top of the order. For a lasting rule, ask it to add the rule to `CLAUDE.md`.
- **Art and sound:** sprites are plain generated placeholders, and there is no audio. To use real art later, drop a PNG at the same path and size listed in the Asset manifest in `BACKLOG.md`, and remove its line from `src/assets/generic-assets.json`.
