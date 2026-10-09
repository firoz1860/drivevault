# Asset sources & limitations

## 3D renderer

**Three.js** via **@react-three/fiber** + **@react-three/drei** (added to
`client`). Not Spline. The Spline MCP was available, but the reference needs a
frame-exact, seekable timeline with an independently-liftable hood + engine
reveal and a clean 800×600 deterministic export — all of which are most reliably
driven from code with R3F. See the note below on a Spline path.

## Car model — ORIGINAL approximation (important)

The car is **hand-built from Three.js primitives**
(`client/src/features/carSpecs/components/CarModel.jsx`). It is an **original
stylized approximation** of a 1969 Dodge Charger R/T silhouette, chosen so that:

- the hood is a separately addressable object on a cowl hinge, and
- an engine sits in a bay beneath it, revealed as the hood lifts.

It is **not** a scanned, licensed, or photoreal Charger, and it is **not claimed
to be visually identical**. A freely/clearly-licensed photoreal Charger GLB was
not available locally, and auto-downloading one (e.g. from Sketchfab) would be
unreliable and of uncertain licensing. No assets were purchased.

**Replacement path (precise):** drop a GLB with correct body/hood/engine parts
into `client/public/car-specs/` and swap `CarModel.jsx` to load it with
`useGLTF`, mapping the hood node to the `hoodPivot` group and keeping the same
`timeline`-driven `rotation.z`. Everything else (timeline, UI, capture, export)
is model-agnostic and needs no change. The missing asset is specifically: a
rights-cleared 1969 Charger R/T GLB with a separable hood + visible engine.

## Could this be a Spline scene instead?

Yes, as an alternative. Manual Spline setup that would match this analysis:
object `CarRoot` (empty) containing `Body`, `HoodPivot`→`Hood`, `Engine`,
`Interior`, `Glass`, `Trim`, `Wheel*`; a perspective camera keyed between the
two poses in `referenceTiming.js`; two states ("Original", "Specs") with the
hood `rotation` and camera transform; and a single transition timeline matching
the event table. The HTML/CSS interface and the capture/export pipeline here
would be reused unchanged. This repo does **not** ship a `.splinecode` URL —
none was created, and a fake one is never fabricated.

## Fonts

Source font not identified from the clip. Substituted with **Poppins** (Google
Fonts, loaded via `@import` in `car-specs.css`) — the closest readily-available
geometric sans. Fonts are awaited (`document.fonts.ready`) before the experience
reports ready, so capture/export never races the webfont.

## Reference clip

Downloaded only for local analysis into `scripts/.work/` (git-ignored). It is
**not** committed and is **not** part of any bundle.
