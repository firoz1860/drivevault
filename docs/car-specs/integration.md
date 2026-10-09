# CarDetails integration — status

Two separate tracks (the feature is **not** fully complete while the realistic
Charger model is missing):

| Track | Status |
|---|---|
| **A. CarDetails integration** (data-driven spec reveal) | Implemented + fixture-verified |
| **B. Reference fidelity** (`/car-specs` Charger demo) | Still using a labelled stylized primitive — awaits a licensed GLB |

## A. What was integrated

`CarSpecReveal` (`src/features/carSpecs/components/CarSpecReveal.jsx`) is a
reusable, **lazy-loaded** component wired into the existing CarDetails preview
panel (`src/pages/CarDetails.jsx`):

- **Show Image / Show 3D is preserved.** Separate **Specs** and **Reset**
  buttons were added (3D mode, only when the car has a `model3d`) — the image
  toggle was not replaced.
- Uses the selected car's **actual `model3d`** and **real fields**
  (`buildSpecModel` in `data/revealSpecs.js`): `brand model`, `pricePerDay`
  shown explicitly as **“… / day”**, plus seats/fuel/transmission/category/
  year/location/mileage/protection. Missing values are omitted, never invented.
- **No generic Ferrari fallback.** When `model3d` is missing or fails to load,
  the car's **own image** is shown (with a note on failure) — never an unrelated
  model.
- **States:** `p = 0` is the initial side-profile presentation; **Specs**
  animates to the three-quarter view + spec panel; **Reset** returns to the exact
  initial state. (For an arbitrary GLB the exact facing depends on the model;
  per-asset `orientation` in `carAssets.js` sets it. Unconfigured models get a
  best-effort initial pose — documented, not misdescribed.)
- **Hood movement is gated**, not a boolean: `data/carAssets.js` keys config by
  `model3d` URL with actual `hoodNodes`/`engineNodes` names + `orientation`,
  `scale` and `hood` motion. At load the named nodes are **validated** in the
  GLB; hood animates only if found (else rotation + specs only). This is
  frontend-only config — **no backend/DB field** is added.
- **Per-instance cloning** (`SkeletonUtils.clone`) so animating one viewer never
  mutates another sharing the cached model; node transforms are **restored on
  reset**.
- Loading / WebGL-error (→ image) / reduced-motion (instant seek) / mobile
  (responsive, no horizontal overflow) all handled. **Switching car routes
  resets** the timeline and discards stale load results (`useEffect` on
  `car._id`/`model3d`). **Booking flow is unchanged.**

## Verification — fixtures vs real backend

Browser checks were run against a **DEV-only fixture harness**
(`/dev/car-reveal`, `RevealFixtures.jsx`, guarded by `import.meta.env.DEV`) using
the repo's `dummyCarData` shape — because this environment has **no database /
backend**, so `/car-details/:id` cannot load real cars here.

Fixture results (screenshots in the PR description / `docs/car-specs/`):

- Ordinary GLB (BMW X5 → ferrari.glb): rotates + shows real specs; `hood: none`.
- `model3d` missing → BMW **image**.
- Failed model URL → **image** + “3D model unavailable”.
- Configured hood (demo: lifts the real `glass` node) → `hood: active [glass]`,
  proving clone + node validation + transform + restore end to end.
- Specs / Initial / Reset repeatable (panel opacity 0 → 1 → 0); mobile has no
  horizontal overflow.

**Not runnable here (requires real backend data + DB):** the live
`/car-details/:id` route with owner-provided `model3d` values, and the
Show Image/Show 3D toggle in the real page context. These should be checked once
the API + database are available.

## B. Reference fidelity (unchanged this step)

The `/car-specs` standalone demo still uses the **hand-built stylized primitive**
Charger, explicitly labelled temporary. A validated, licensed Charger GLB (with a
separable hood + engine) is still required to close the realism gap. Candidates +
blockers: `asset-sources.md`. When provided, it drops into `client/public/…` and
is enabled per-asset in `carAssets.js` — no other code changes.
