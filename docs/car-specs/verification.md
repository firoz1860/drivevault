# Verification

## Build & lint (run)

- `npm run build` (client) — **passes**. The feature is code-split: `three` +
  R3F ship only in the lazy `CarSpecs-*.js` chunk, so other routes are
  unaffected (main bundle unchanged by this feature).
- `npx eslint src/features/carSpecs src/pages/CarSpecs.jsx` — **clean**, no
  warnings or errors.
- No relevant console errors on `/car-specs` during capture (checked via the
  browser: 0 errors across all 150 seeks).

## Determinism (by construction + observed)

- All motion derives from one pure function `computeSceneState(t)` sampled by a
  single timeline. `seek(t)` is idempotent and order-independent — there are no
  `setTimeout` chains, no per-frame accumulation, no RNG, no machine-frame-rate
  dependence.
- The capture (`capture-frames.mjs` / the MCP run) seeks absolute frame times
  and waits until `getRenderedTime()` matches before screenshotting. Re-running
  reproduces the same frames.
- Replay/reset restore the opening state exactly (`seek(0)`); scrubbing backward
  works (seek accepts any time in `[0, 5]`); repeated replay never accumulates
  transforms (state is recomputed from `t`, not integrated).

## Readiness, failure, reduced motion

- Playback starts only after the model/scene render **and** `document.fonts.ready`.
- WebGL failure → error overlay with a poster fallback (`/car-specs/poster.png`)
  and a Retry button (no blank canvas).
- `prefers-reduced-motion` → the scene holds on the static opening frame with an
  explicit "Play animation" button. Export/capture mode ignores the OS setting
  (uses `?capture=1`, which stays paused and is seeked explicitly).
- Responsive mode scales the whole 800×600 composition uniformly (4:3 kept) via
  a single `--cs-scale`; no stretching and no horizontal overflow.

## Export (run + ffprobe-verified)

`docs/car-specs/car-specs-transition.mp4`

| Property | Target (reference video stream) | Exported | Match |
|---|---|---|---|
| Resolution | 800 × 600 | 800 × 600 | ✅ |
| Frame rate | 30/1 CFR | 30/1 | ✅ |
| Frame count | 150 | 150 | ✅ |
| Duration | 5.000000 s | 5.000000 s | ✅ |
| Codec / pix_fmt | H.264 / yuv420p | H.264 / yuv420p | ✅ |
| Audio | (omitted — see analysis) | none | intentional |

Also produced: `car-specs-transition.webm` (VP9) and `poster.png`.

## Visual comparison

`docs/car-specs/comparison.png` — top row = reference, bottom row = this output,
at frames **0, 48, 54, 60, 66, 75, 117, 132, 149** (opening, end of opening hold,
start of movement, mid-rotation, hood start, engine revealed, end of specs hold,
mid-reverse, final).

**Matches well:** stage/panel geometry and colours; all interface text, layout
and hierarchy for both states; the faint background lettering behind the car;
the event sequence and timing (side→3/4 rotation, hood lift + engine reveal,
specs reveal, symmetric reverse); the clean loop (final ≈ opening).

## Remaining differences (disclosed honestly)

1. **Car realism** — the hand-built primitive car is a stylized approximation
   (boxier greenhouse, simpler wheels) versus the sleek photoreal Charger in the
   reference. This is the single largest visible gap. Fix = drop in a licensed
   GLB (see `asset-sources.md`); nothing else needs to change.
2. **3/4-view framing** — the car reads slightly larger / lower in the specs
   pose than the reference; camera pose numbers are eyeballed, not solved.
3. **Rotation onset** — begins ~2–3 frames later than the reference at the very
   start of the move (within ~0.1 s); boundaries are frame-read estimates.
4. **Background words** — `MUSCLE` / `SPECS` are inferred from partial on-screen
   glyphs.
5. **Audio** — the source has a 5.013 s AAC track; intentionally omitted (no
   licensed asset; the video content is 5.000 s).

No "pixel-perfect" or "exactly identical" claim is made.
