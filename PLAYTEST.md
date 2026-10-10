# Playtest 32 (v0.32.0): no water off the water, flying shadows far below, lighter shadows, and the website for Cloudflare

The version at the bottom of the game screen and in the site footer should read **v0.32.0**.

## How to play

This version retires GitHub Pages: the old address (https://joshridavis.github.io/megagen-idle/) stays at v0.31.0 and no longer updates. The site now builds for **Cloudflare Pages** (your playbook steps W-05 and W-06, due October 10 to 16).

- **In a browser (once Cloudflare is set up):** follow `docs/PUBLIC_RELEASE.md`, section 9c (about 30 minutes): connect this repository to a Cloudflare Pages project with the build command `npm run build:web`, the output folder `dist-web` and `NODE_VERSION` = `22`, and set `PLAY_EDITION` = `full` for previews. From then on Cloudflare posts a **preview link** on every pull request; open it for each playtest (the game is at `/play/` on that link). After merging, the site is at https://megagenidle.com/ and the game at https://megagenidle.com/play/.
- **Your save:** a browser keeps its save per web address, so the new address starts fresh. To keep your progress: on the old address, Settings → Save → **Export save**; on the new one, **Import save** and pick that file.
- **Locally (works today):** `npm install`, then `npm run dev`, then open http://localhost:5173 (the website) or http://localhost:5173/play/ (the game).

## Estimated play time

- **100% completion: about 761.4 hours** (simulated with `npm run simulate`; unchanged, since nothing in this version changes balance), so roughly 4 to 5 weeks with the game closed most of the time.
- Key times: 25% at 11.4 h, first Natural Gas Plant 17.1 h, end of the free part (first research past research level 9, Oil Refining) 58.4 h, first Oil Power Plant 74.5 h, 50% at 78.8 h, first Nuclear Fission Plant 143.1 h, 75% at 301.9 h, first Fusion Reactor 335.4 h, first Micro-Supernova 440.4 h, last room expansion (13) at 496.9 h, 100% at 761.4 h.

## What's new

- **"Player level up" starts checked (2.06):** turning notifications on now shows all five types checked. A save that never turned notifications on gets "Player level up" checked too; a save that did keeps your choices.
- **No water drawn into machine pictures (2.01):** the Hydro Dam, Tidal Power Station, Oil Rig and Deuterium Extractor now stand on a foundation or on pilings, with no sea or river in the picture. On the map the water comes from the tiles under them, so a dam on the river still sits on water and an Oil Rig on the oil field is on dry ground. The dam's second frame now turns a turbine wheel in its powerhouse. The key scene, the Steam capsules and the website use the new pictures. Before and after: `docs/screenshots/water-2.01-*.png`.
- **Flying shadows fall far below (2.02):** the map birds and the shooting star have their shadow as its own layer, about a tile and a quarter below them and a little to the right, smaller and blurred, flapping with the bird. Flying sightings (UFO, balloons, the gull flock and the rest) cast their shadow about 50 px below them on a computer, about 30 px on a phone. Things on the ground keep their shadow right under them. Screenshots: `docs/screenshots/shadows-2.02-*.png`.
- **Shadows a quarter lighter (2.03):** machines, pets, the walking cat and flying things. Each kind has one named value, so another step lighter or darker is a one-line change. Screenshot: `docs/screenshots/shadows-2.03-lighter.png`.
- **The website, rebuilt for launch (2.05):** a new landing page (app icon, the tagline, **Play free in your browser**, "Coming March 11, 2027 to PC, Android and iPhone", the key scene, your pitch, six feature cards, four screenshots, "Fair by design" and a FAQ), plus **Press** (fact sheet and a `press-kit.zip` with the logo, app icon, key art and 6 screenshots), **Privacy**, **Terms**, **Support** (FAQ, the support email and how to move a save, with a picture) and a 404 page. Link previews use a new 1200×630 picture. "Wishlist on Steam", "Join the Discord", the store buttons and the trailer stay hidden until their links are filled in `src/site/links.ts`. No cookies, no analytics code. Screenshots: `docs/screenshots/website-2.05-*.png`.
- **Trademark:** the achievement for 2 billion energy was called "MegaGen"; it is now **Mega Generator** (same achievement, already earned ones stay earned). A test checks that no text in the game or on the site says "MegaGen" without "Idle".

## Things to try

1. Settings → Notifications: turn notifications on. All five types should be checked, "Player level up" included.
2. Generators tab: look at the Hydropower Dam and Tidal Power Station cards. No water in the pictures.
3. Map tab: find your dams on the river and your tidal stations on the coast. Do they still read as standing on water? Do the Oil Rigs on the oil field look right on dry ground?
4. Map tab, a few minutes with the tab open: when gulls fly over, their shadows should sit well below them. Does it look like they are flying high?
5. Wait for a sighting (UFO, balloon, the gull flock) over the page. Is the shadow far enough below, and soft enough?
6. Look at the machine and pet shadows on light ground (sand, plateau) and dark ground (coal field). Still visible, but not too dark?
7. The website: open the landing page on a computer and on a phone. Read it top to bottom, open a few questions, then click **Play free in your browser**.
8. Open **Press** and download the press kit. Open **Support**, **Privacy** and **Terms**.
9. Paste the site address into Discord or another chat. The preview should show the new picture with the logo.

## Known issues

- Privacy, Terms and the press text are short in-repo placeholders until you add `docs/legal/privacy.md`, `docs/legal/terms.md` and `docs/press.md` (playbook W-04). The site picks them up by itself.
- The social links are text buttons (YouTube, TikTok, X, Bluesky), not logos.
- The game at `/play/` is still the whole game: editions (demo, full, mobile) come with the next item, 2.04. The site already passes `PLAY_EDITION` on for it.
- The screenshots are taken from the game as it is today (generic stand-in sprites); `npm run screens:site` takes them again after any visible change.

## Questions

1. The flying shadows: is about a tile and a quarter below the map birds right, or should they fall even further? The same for sightings (about 50 px on a computer).
2. Are the lighter shadows right now, or one more step lighter or darker?
3. Do the dam and the tidal station look right standing on their foundations, on the cards and on the map?
4. The landing page: do the feature cards, "Fair by design" and the FAQ say what you want? Anything to add or cut? (The FAQ says the free part is "about 58 hours of play at an idle pace", from the simulator.)
5. Is "Mega Generator" a good new name for the 2-billion-energy achievement?
