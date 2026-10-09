// ---------------------------------------------------------------------------
// Per-asset 3D configuration, keyed by the car's model3d URL (a stable asset
// id). This is FRONTEND-ONLY config — it is never written to the backend/DB.
//
// Hood movement is enabled ONLY for an asset that is explicitly listed here AND
// whose configured node names are actually found in the loaded GLB (validated
// at load time in CarSpecReveal). A bare boolean is intentionally NOT enough.
//
// Shape per entry:
//   {
//     orientation: [rx, ry, rz],   // radians applied to the model group so the
//                                  // initial pose reads as a side profile
//     scale: number,               // optional manual scale (else auto-normalised)
//     hoodNodes:  string[],        // GLB node names that form the hood
//     engineNodes:string[],        // GLB node names for the engine (kept visible)
//     hood: { up, forward, tilt }, // lift-off motion (metres / metres / radians)
//   }
//
// Nothing is configured yet: no licensed Charger GLB with a verified separable
// hood is available (see docs/car-specs/asset-sources.md). Until a real asset is
// validated, every car falls back to rotation + the real specification panel.
// ---------------------------------------------------------------------------

export const CAR_ASSET_CONFIG = {
  // Example of the intended shape (commented out — unvalidated, do NOT enable):
  // 'https://cdn.example.com/models/1969-charger.glb': {
  //   orientation: [0, Math.PI / 2, 0],
  //   hoodNodes: ['Hood', 'Hood_primitive0'],
  //   engineNodes: ['Engine', 'V8'],
  //   hood: { up: 0.6, forward: 0.12, tilt: 0.1 },
  // },
}

export const getAssetConfig = (modelUrl) =>
  (modelUrl && CAR_ASSET_CONFIG[modelUrl]) || null
