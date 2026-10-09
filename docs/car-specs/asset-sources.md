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

## Candidate real Charger models (searched — decision pending)

A web search surfaced free 1969 Charger models on Sketchfab. None could be
confirmed, from listings alone, to have a **separate opening hood + visible
engine in GLB**, and each has a blocker:

- **CC-BY (commercial OK with credit):** "Dodge Charger 1969" by *Ilya_1392*
  (~138k tris), "1969 Dodge Charger RT" by *David_Holiday* (~12k tris, no
  hood/engine detail stated), "Dodge Charger 500 1969" by *Pinkie* (~14k tris),
  "Dodge Charger 1969 Obj" by *Sxi.Sai* (OBJ — GLB not confirmed).
- **Non-commercial / NoDerivs (NOT usable here):** *OUTPISTON* R/T (BY-NC-SA,
  lists a 440 V8), *Ddiaz Design* R/T (BY-NC-SA, derived from NFS Heat),
  *Alex.Ka.* Daytona customs (BY-NC-ND — cannot modify, so no hood split).

**Blockers before any swap:**
1. Sketchfab downloads require an interactive login/click — they can't be fetched
   headlessly from this environment, so a human needs to download the chosen file.
2. Separate-hood + visible-engine + GLB must be verified per-model (listings don't
   confirm it); several "free" car models also have questionable license provenance.
3. Licensing must fit DriveVault's use (CC-BY needs a credit line; NC/ND are out).

**Recommendation:** pick one CC-BY candidate (or provide a model), download the
GLB, and drop it in; I'll wire it to the existing `timeline`/`hoodPivot`. Until
then the hand-built car remains as a labelled approximation.

## Spline availability (checked)

The Spline MCP is configured but returned *"No … editor is connected. Open the
document in the editor, enable the AI bridge, then retry."* — i.e. there is **no
live Spline scene or asset to inspect**, and no demonstrated fidelity gain over
R3F. Staying on Three.js/R3F is the correct call for now.

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
