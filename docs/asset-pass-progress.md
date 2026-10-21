# Asset pass progress (Dolmuş)

Status: finished. Nothing is half-edited.

## Done
- Models (Blender scripts in `assets/src/`, GLBs in `assets/models/`): dolmus, car, bus, van, tram, shelter, carts.
- Textures (asphalt, pavement, grass), sky strip, 10 Kenney sound samples, `CREDITS.md`.
- index.html: loader (High tier only for models/textures/sky), props swap, Standard-material reflections, sky clouds, samples in AUD, camera obstacle fix, heading-up minimap (`N`, tap, Settings), flags `?noassets`, `?assets=`, `?nocamfix`.
- Docs: `docs/assets.md`, README Assets section, before/after screenshots in `docs/`.

## Last measured numbers (1280x720, ?auto, Intel UHD)
- Before: 60.1 fps, 38-40 calls, 149,481 tris.
- High with assets: 59.6-60.3 fps, 42 calls, 188,005 tris.
- Low and ?noassets: 60.1-60.4 fps, 40 calls, 149,481 tris.
- Campaign (?auto&sim=4000): same result with assets, ?noassets, ?low; 0 JS errors; file:// fallback also 0 errors.

## Not verified
- Sound quality by ear, real phones, other GPUs/browsers.

## Cleanup state
- http server (port 8773) stopped, no headless Chrome left, heavy lock released.

Update: minimap heading-up recentred (player at centre, zoom 1.5, ground-coloured background, larger arrow); gameplay/close screenshots retaken; fps 60.2-60.3, campaign unchanged, 0 errors.
