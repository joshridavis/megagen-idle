# Playtest 1 — the skeleton (after item 0.37)

This first build is tiny on purpose: it checks that the game runs, saves, and keeps counting while you are away. There are no generators, resources or research yet.

## How to play

- **In a browser:** merge the pull request, set the repo's Pages source to "GitHub Actions" (Settings → Pages; `GETTING_STARTED.md` step 5), wait for the Actions run to go green, then open https://joshridavis.github.io/megagen-idle/
- **Locally:** `npm install`, then `npm run dev`, then open http://localhost:5173

## New since last playtest

Everything (this is the first one):
- Energy counter with a lightning-bolt icon, rising by 1 per second.
- "Generate energy" button: +1 energy per click, with a small "+1" pop.
- Autosave to your browser (IndexedDB) and offline gains, capped at 24 hours.
- Live site deploy and CI checks on pull requests.

## Things to try

1. Open the game and watch the counter rise about 1 per second.
2. Click "Generate energy" quickly 20 times. Does every click count? Does the button feel responsive?
3. Use the keyboard: Tab to the button and press Enter or Space.
4. Reload the page. Is your energy still there?
5. Close the tab, wait a few minutes, reopen. Did it add roughly 1 per second for the time away?
6. Switch to another tab for a minute and come back. Did the counter catch up?
7. Try it on your phone browser.

## Known issues

- No way to spend energy yet; that arrives with resources and generators (checkpoint 2).
- No in-game reset yet. To start over, clear the site data for the page.
- Large numbers are shown with plain thousands separators; short notation (1.2K, 3.4M) comes in item 0.29.
- The sprite is a generated placeholder.

## Questions for you

1. Should a click be worth more or less than one second of passive income at the start?
2. Is 8 hours the right offline cap, or should it be shorter or longer?
3. Is the click feedback (button press and "+1" pop) enough, too much, or too little?
4. Does the dark theme and bright yellow button feel right for the game's mood?
