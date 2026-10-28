# Dolmuş v2 upgrade brief — for Claude Sonnet 5.5

## What the game is now
- Single-file Three.js r170 driving game: a yellow shared minibus on a fixed route through a low-poly Istanbul neighbourhood (Balat, Galata, Beşiktaş, Kadıköy ferry pier, bridges, tram, buses).
- 8 shifts of 240 s plus endless (`LEVELS`, line ~1031; `endlessLevel()`); 1 to 3 stars from net lira against `target / t2 / t3`.
- Core loop: Space near a stop opens the door (`doorPress()`, `serviceDoor()` ~2256), passengers alight and pay (`alight()`), new ones board and say their stop in a bubble; tips for fast and smooth rides, penalties for red lights, hard braking, skips and crashes.
- Strong: traffic, lights, rain, tram, pigeons, calibrated `?auto` bot. Weak: Play leads to an intro card and a second click, passengers only ever get off at stops, 5 repeating bubble lines, the end card only shows totals.

## Upgrade items (priority order)
1. **Straight into the shift, with a coached first stop**
   - why: Play calls `startCampaign()` then `enterIntro()` (~3289) which shows `sIntro` and waits for a second button; nothing teaches Space beyond a toast (`toastStart`). `settings.lang` defaults to `'tr'` (line ~462), so an English visitor lands in Turkish.
   - build: Play starts the shift behind a 3-second "3, 2, 1" countdown (the level card becomes a dismissable corner card, still shown for levels 2+ for the new-feature list); on level 1 the first stop gets a pulsing ring, an arrow in the guide pill and the prompt "Stop near the ring, press Space (or tap the door button)". Default language follows `navigator.language` (TR only if it starts with `tr`), `?lang=` still overrides.
   - done-when: title Play then driving within 4 seconds, 1 click; on a fresh profile with an English browser language the UI is English; `?auto` still starts without clicks.
2. **"Müsait bir yerde!": drop off anywhere safe (research-driven mechanic)**
   - why: bubbles already say "Anywhere near {0}, please!" (`STR.bub`, ~399/442) but `nearestBusiness()` (~2032) and `alight()` only work at stops; passing a stop only gives `missed` and -12 patience (~2312). The research lists the "Müsait bir yerde!" ritual as the heart of dolmuş culture.
   - build: from level 2 on, about a third of passengers are "anywhere" riders: they can get off at any legal curb spot within ~70 m (path distance) before or after their stop. The player stops and presses Space; the curb must be valid (not inside a zebra via `inZebra()`, not within a junction via `CROSS`, not in a red-light approach zone, not blocking a lane). A good spot pays a small "easy stop" tip, a bad one (crossing, junction) a penalty and a honk from traffic. The destination ring on the minimap becomes a 70 m arc for these riders; seat chip shows a "?" marker.
   - done-when: `?debug` log shows an `alight` event outside a stop; stopping on a zebra is refused with a toast and the passenger stays; the `?auto` bot still finishes all 8 levels (let it use stops only) with the same star outcomes.
3. **Fare chain ("para uzatma") at the door (research-driven mechanic)**
   - why: all fares are credited instantly in `alight()`; the research names the hand-to-hand fare chain as a core ritual and the door never has any rhythm beyond 0.3 s per passenger (`P.actT = 0.3`).
   - build: passengers seated further back pass their fare forward: a coin visibly hops along the occupied seat chips toward the driver, taking 0.25 s per row, and the fare is credited when it arrives; `closeDoor()` waits until the last coin has landed; leaving before the chain ends (the player forces the door shut or speeds off) forfeits the tip of that passenger. A full van unloads slower, matching the existing "full van accelerates slower" feel.
   - done-when: with 4 seated passengers all getting off at one stop the fares appear one after another with the coin hop; speeding away mid-chain shows "-tip" in the log; endless and campaign totals still add up (`G.log` net equals fares + tips - penalties).
4. **Passenger voices: no repeated lines**
   - why: `STR.bub` has 5 lines per language, picked at random in `finishBoard()` (~2063), so the same line shows up several times a minute (docs/02-gameplay-day.png shows three in a row).
   - build: 16 to 20 short lines per language grouped by passenger type (student, grandmother, shop owner, tourist, rushed commuter), each type with its own shirt/scale from `SHIRTS`, plus a no-repeat window of 8; keep the destination name as `{0}`. Flavour only, no factual claims.
   - done-when: 12 consecutive boardings in `?auto` show 12 different lines.
5. **Shift summary that teaches**
   - why: `fillEnd()` (~3330) lists totals only; a player who got 2 stars does not know why (`SC.brakes`, `SC.skips`, `SC.gaveUp`, `SC.reds` are tracked but not shown).
   - build: under the totals show the top 2 costs with a one-line tip in plain language ("Hard braking with passengers aboard cost you 9 TL: ease off earlier"), the best tip of the shift and the number of "anywhere" drops. Same data in TR and EN.
   - done-when: ending a shift with at least one penalty shows the correct top cause; with none it shows "Clean shift".
6. **District identity along the route**
   - why: the day screenshot (docs/02-gameplay-day.png) shows near-identical grey-beige blocks and plain pavement, `PAL_WALL` is applied randomly (`building()`, ~1128) without regard to district.
   - build: per-district palettes picked in `buildBlock()` (Balat: tall, colourful narrow houses; Galata and Karaköy: stone and cream; Kadıköy pier: pastel low-rise), a far Galata-Tower-like silhouette in `buildFar()` and 2 or 3 awnings with bakery/simit/çay signs near stops already using `SIGN_TXT`, all merged into existing static meshes.
   - done-when: screenshots at Balat, Galata and Kadıköy stops look clearly different; draw calls stay at the 42 (High) budget.
7. **Rain and night polish**
   - why: rain only slows the road; the stops fill with people (`maxW`), but wipers/puddles and passengers' umbrellas are missing, and the night shift (level 8) has few light sources.
   - build: umbrellas on waiting pedestrians in rain (instanced), puddle highlight on wet roads, lit shop windows and a glow on the stop shelters at night; keep the particle budget `MAXP`.
   - done-when: level 3 in rain shows umbrellas and level 8 shows lit windows; fps and draw calls unchanged on `?low`.

## Facts for in-game cards
None. Every dolmuş fact in the pool is marked "(doğrulanmadı)" (1931 line, Ankara-based study, name origin, fleet size). Do not add "Did you know" cards for this game; the cultural rituals above are gameplay, not facts.

## Mascot
Yes, small: the white Turkish Van kitten sleeps on the dolmuş back seat shown in the shift-summary card (corner of `sEnd`), and appears awake on 3-star results. Optional, must not appear with `?noassets`.

## Do not break
- Flags `?auto ?debug ?low ?lang ?noaudio ?touch ?noassets ?sim ?seed ?level ?cam ?camd ?cama ?assets ?nocamfix`; `window.dolmus`, `window.dolmusSim(seconds)`.
- Save keys `arena.dolmus.settings` and `arena.dolmus.save` (run level/total/stars, best stars/fares/endless; add fields only).
- Counts: 8 levels plus endless, 12 seats, 240 s shift, star thresholds `target / t2 = x1.4 / t3 = x1.85`, 24 max stars. Do not change `target` values.
- Controls: W/S/A/D or arrows, Space door, H horn, P/Esc, M, X, L, N; touch pedals and slider.

The shared rules in `_sablonlar/arena-upgrade-common.md` (and `_sablonlar/arena-round6-common.md`) are appended to this brief.
