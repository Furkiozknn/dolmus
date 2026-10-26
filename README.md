# Dolmuş

**Play online:** https://furkiozknn.github.io/dolmus/ (desktop and phone, no install)

A 3D arcade driving game about the shared minibus taxis of Turkish cities. Drive a yellow dolmuş through a compact,
low-poly Istanbul-style neighbourhood: pick up waving passengers, learn their stops from the chat bubbles, drop them off,
earn fares and tips, and keep out of trouble. Eight levels, an endless mode, rain, a tram, a VIP passenger, a traffic jam
and a night shift.

The game is one `index.html` and is fully playable on its own: every model, texture and sound has a procedural fallback.
On the High quality tier it also loads optional CC0 assets (Blender-built vehicles and props, Poly Haven textures and sky,
Kenney sounds) from `assets/`, see [Assets](#assets). Three.js r170 is loaded from the jsDelivr CDN as an ES module, so
you need an internet connection the first time.

Part of the **Claude Game Arena** (round 3, game 2). Built by Claude Sonnet 5.5 with Claude Code from one prompt:
[`prompts/dolmus.md`](prompts/dolmus.md).

![Title](docs/01-title.png)

## Play

Serve the folder over http (opening the file directly also works in most browsers, but a server is safer):

```bash
python -m http.server 8000
# open http://localhost:8000/
```

The game starts in Turkish. Press `L` (or the globe button) for English.

### How to play

* A shift lasts 4 minutes. Drive the fixed route (6 to 10 stops, shown as numbered circles on the minimap) and earn as
  many Turkish lira as you can. 1 to 3 stars depend on your net total versus the level target.
* Waiting passengers wave when you get close. Press **Space** within about 13 m of a stop (or of a waving passenger):
  the dolmuş brakes to a halt and opens the door. Passengers get off first (they pay), then new ones board and tell
  you where they want to go (chat bubble, numbered seat chip, green ring and light beam at the destination).
* **Tips** reward fast rides (the expected time is shown by the shrinking patience bar on the seat chip) and smooth
  rides (no hard braking, no crashes while they are on board). VIP passengers pay triple but have little patience.
* **Penalties:** running a red light, hitting cars (also raises the dent meter), hard braking with passengers on board,
  skipping a waving passenger when you have a free seat, hitting a pedestrian, and passengers who give up waiting.
  At 100 % dents the dolmuş is wrecked and the shift ends.
* The dolmuş has **12 seats**; a full one accelerates noticeably slower. Rain makes the road slippery and fills the
  stops with people. Pigeons, pedestrians, a tram, buses and a double-parked van are all part of the traffic puzzle.

### Controls

| Action | Keyboard | Touch | Gamepad |
|---|---|---|---|
| Accelerate | `W` / `Up` | gas pedal | RT / A |
| Brake, reverse | `S` / `Down` | brake pedal | LT / B |
| Steer | `A` `D` / `Left` `Right` | steering slider | left stick |
| Stop and open the door | `Space` | door button | X |
| Horn | `H` | horn button | Y |
| Pause | `P` / `Esc` | pause button | Start |
| Music / effects / language | `M` / `X` / `L` | HUD buttons | |
| Minimap: heading up / north up | `N` | tap the minimap | |

### Levels

| # | Name | New in this level |
|---|---|---|
| 1 | Main street run | lights, zebra crossings, 6 stops |
| 2 | Bridge and tram | new route over the canal bridges, tram, buses |
| 3 | Here comes the rain | rain showers, double-parked delivery van |
| 4 | Narrow streets | side streets with cars parked on the pavement, the mosque square, VIP passenger |
| 5 | Gridlock | traffic jam event on the main street, rain |
| 6 | The ferry pier | sea road and ferry pier stop, 9 stops |
| 7 | Evening rush | dusk, everything at once, 10 stops |
| 8 | Night shift | night, wet roads, three VIPs |
| E | Endless | repeating shifts that get harder, ends when you miss the target or wreck the car |

Best scores, stars and the run you can continue are stored in `localStorage` (`arena.dolmus.save`); settings in
`arena.dolmus.settings`.

## Flags (URL query)

| Flag | Effect |
|---|---|
| `?auto` | a real driving bot plays the whole campaign (same controls and rules as a player) |
| `?debug` | shows fps, draw calls, triangles, state, bot results and any JS errors on screen; exposes `window.dolmusSim(seconds)` |
| `?sim=N` | fast-forwards N seconds of the first shift before the first frame (add `&auto` to let the bot drive) |
| `?low` | low quality: shadows off, pixel ratio 1, half the particles, procedural models, no textures or sky (never downloads the models) |
| `?noassets` | skip every optional asset (models, textures, sky, sounds) and run the original procedural game |
| `?assets=models,tex,sky,snd` | QA: load only the listed asset groups |
| `?nocamfix` | QA: turn the chase-camera obstacle avoidance off |
| `?lang=en` / `?lang=tr` | language |
| `?level=N` | start the campaign at level N |
| `?mode=endless` | with `?auto` or `?sim`, start in endless mode |
| `?seed=N` | change the gameplay random seed (default 7) |
| `?touch` | force the touch controls |
| `?cam=tram`, `van`, `bus`, `mosque`, `pier`, `bridge`, `plaza`, `main` or `x,z` | QA spectator camera (`camd`, `camh`, `cama` adjust distance, height, angle) |
| `?cal` | with `?auto`: advance to the next level whatever the result (used to calibrate the targets) |

The live state is available as `window.dolmus` (state, level, time, net, score, seats, dent, log of finished shifts,
errors). Example: `index.html?auto&debug&sim=3000` plays the whole campaign in a few seconds without rendering and
leaves the result on screen.

## Screenshots

| | |
|---|---|
| ![Narrow street](docs/02-gameplay-day.png) | ![Rain](docs/03-rain-van.png) |
| ![Night](docs/04-night.png) | ![Phone](docs/05-phone-portrait.png) |
| ![Summary](docs/06-shift-summary.png) | |

## Technical notes

* **Rendering:** one directional light with a 1024 px shadow map that follows the player (about 100 m square),
  a hemisphere light, flat-shaded `MeshLambertMaterial` everywhere (vertex colours, emissive for windows, lamps and
  signs), a gradient sky shader, pixel ratio capped at 1.5, no post-processing. Static geometry (terrain, roads,
  about 300 buildings, trees, lamps, shelters, the mosque, bridges, the pier) is merged into a handful of meshes;
  cars, buses, the tram, pedestrians, pigeons, markers, lamps and traffic-light bulbs are `InstancedMesh`es; particles
  are `Points` with a soft round sprite drawn in the fragment shader.
* **Measured** on an Intel UHD 620-class iGPU (ANGLE / Direct3D 11) at 1280x720 in Chrome: about 41 draw calls,
  about 154 000 triangles, 56 to 62 fps with vsync and about 87 fps uncapped during busy dusk gameplay (level 7).
* **Simulation:** fixed 60 Hz step. Traffic follows lane polylines with follow-the-leader gaps, traffic lights with stop
  lines, bus stops and a scheduled double-parking van; the tram obeys the signals and platforms; pedestrians cross at
  zebras only when the light (or the traffic) allows. The route is a closed loop and passenger destinations are the
  next one to four stops on it.
* **Audio:** Web Audio. Engine (follows speed and throttle), horn, rain, tram bell, skid, street ambience and the looping
  arabesk-pop style tune in Hicaz (darbuka, bass, strings, saz-like lead) are synthesised. The door, coin, crash, thud and
  click one-shots are CC0 samples (Kenney) played through the same effects bus, with the synthesised versions as fallback.
* **Camera:** the chase camera shortens its distance (fast in, slow out) and lifts slightly when a wall, tree trunk or lamp
  post would sit between it and the dolmus (ray test against the static obstacle grid).
* **Minimap:** heading-up by default (the map rotates around the dolmus, a small N marks north); `N`, a tap on the minimap
  or the Settings screen switch to north-up. The choice is saved.
* **High-tier look:** vehicles use `MeshStandardMaterial` with reflections from the Poly Haven sky (strength follows the hour
  of day and rain); the road, pavement, plaza and grass get a subtle world-space detail texture chosen by vertex colour; the
  sky dome shows the photographed clouds tinted by the same hour and rain colours. Low keeps the plain flat-shaded Lambert look.
* **Self-test:** the bot drives the route with pure pursuit, brakes for cars, pedestrians and red lights, stops at the
  stops that need service, and retries a failed shift up to three times. The star thresholds were calibrated against it.

## Files

```
index.html     the whole game (HTML, CSS, JavaScript)
assets/        optional CC0 / Blender assets: models/ textures/ sky/ sfx/, src/ (model scripts), out/ (build previews)
CREDITS.md     sources and licences of the third-party assets
prompts/       the prompt this game was built from
docs/          screenshots, assets.md (asset table and performance numbers)
LICENSE        MIT
```

## Assets

The optional assets are listed with sources, licences, sizes and triangle counts in [`docs/assets.md`](docs/assets.md);
credits are in [`CREDITS.md`](CREDITS.md). Total about 1.1 MB. They are fetched after the first frame and only on the High
tier; if a file is missing or the page runs from `file://` the procedural version simply stays. To rebuild a model:

```bash
python <asset-forge>/forge.py build assets/src/car.py assets/out/car   # then copy assets/out/car.glb to assets/models/
```

![Before and after](docs/assets-after-close.png)

## Known issues

* The chase camera avoidance only looks at walls, tree trunks and lamp posts near the camera; a tree canopy or a bus can still hide the dolmus for a moment.
* Pedestrians ignore the horn (only the pigeons react to it).
* The minimap has no zoom (heading-up shows about 100 m ahead of the dolmus and 50 m behind).
* The sky and some far geometry are fogged for performance, so the horizon is hazy by design.
* Needs WebGL 2 and a network connection for the Three.js CDN on the first load.

## License

MIT, see [`LICENSE`](LICENSE). Copyright (c) 2026 Furkiozknn.
