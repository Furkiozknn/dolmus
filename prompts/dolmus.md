# Arena round 3, game 2: Dolmuş (minibus driving and routing) — built by Claude Sonnet 5.5

```text
Build a single-file browser game (one index.html with inline CSS and JS) using Three.js r170 loaded as an ES
module from https://cdn.jsdelivr.net/npm/three@0.170.0/ (import map; addons from examples/jsm if needed).
A 3D arcade driving game called "Dolmuş" (the shared minibus taxis of Turkish cities). Do not ask questions,
build it end to end.

WORLD: a compact low-poly Istanbul-style neighbourhood seen from a chase camera above and behind a yellow
dolmuş: a hilly main street with tram tracks, a square with a mosque and pigeons, a seaside road with a ferry
pier, narrow side streets with cars parked on the pavement, a bridge, shops with awnings and signs, street
vendors (simit cart, chestnut seller), traffic lights, zebra crossings, trees. Built entirely in code, no
external models or textures. Clean toy-like clay look, flat shading, soft shadows, one accent colour (#FACC15
dolmuş yellow) for UI highlights.

LIFE: passengers wait at stops and on corners and wave when you come near; they board, tell you their stop
(shown as a marker and a chat bubble), and pay when they get off. Other traffic has simple AI: cars follow lanes
and lights, buses stop at their stops, a tram runs on its tracks, pedestrians cross at crossings, a delivery van
double-parks and blocks a lane. Time of day passes from morning rush to evening; rain showers make the road
slippery and fill the stops.

GAME RULES: a shift of 4 minutes per level on a fixed route through the neighbourhood with 6-10 stops. Earn
fares, tips for fast and smooth rides, penalties for running red lights, hitting cars (a dent meter), braking
hard with standing passengers, or skipping a waving passenger. 12 seats; a full dolmuş is slower to accelerate.
Passengers have patience. 8 levels that add new streets, the tram, rain, a VIP passenger, a traffic jam event
and night; 1-3 stars per level from the fare total; an endless mode. Best scores saved.

INTERACTION: drive with arrow keys / WASD (accelerate, brake/reverse, steer), Space to stop at a stop and open
the door, H for the horn. On phones: on-screen pedals and a steering slider. Gamepad if available. The chase
camera follows smoothly and pulls back with speed.

HUD: top bar (logo, level, shift clock, fares vs target, seats used, dent meter, pause, sound, language), a
minimap of the route with stops and waiting passengers, passenger destination markers, a speedometer, floating
"+fare" numbers, toasts, title, level-end summary, victory and game-over screens.

EXTRAS: engine sound that follows the revs, horn, door, coins, rain, tram bell, street ambience, a light
arabesk-pop style music loop, all synthesised.
```

The shared rules in `_sablonlar/arena-round3-common.md` are appended to this prompt.
