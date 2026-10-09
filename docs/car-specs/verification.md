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
| Video-stream duration | 5.000000 s | 5.000000 s | ✅ |
| Codec / pix_fmt | H.264 / yuv420p | H.264 / yuv420p | ✅ |
| Audio | (omitted — see analysis) | none | intentional |

**Container duration (reported separately, as requested):** the exported MP4's
container is **5.000 s** (video-only — no audio track). The reference container
is **5.014 s** because it carries a separate ~5.013 s AAC track; its *video
stream* is 5.000 s, which is what the export matches frame-for-frame.

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

## Corrections applied in this revision

- **Hood is now a lift-off** (translate up + slight forward + small tilt), not a
  cowl hinge — this was determined from the hood-trajectory sheet, not assumed.
- **Rotation onset moved earlier/faster** (starts f50, as the UI fades) to remove
  the earlier rotation delay; reverse timing nudged to match.
- **Engine** rebuilt as a prominent chromed injected V8 (velocity stacks + red
  intake) that reads through the open bay yet stays hidden when the hood is down.
- **3/4 pose** deepened (more front shown) with higher camera elevation.
- **Materials** tuned glossier but still clearly black (not mirror); stronger
  contact shadow.

## Remaining differences (disclosed honestly)

1. **Car realism — the single largest gap.** The car is still a hand-built
   *stylized primitive* (boxier greenhouse, simpler wheels, no fine chrome/trim)
   versus the sleek photoreal Charger in the reference. Closing this needs a real
   detailed Charger model; candidates + blockers are in `asset-sources.md`. The
   timeline, camera, hood lift, UI, capture and export are all model-agnostic, so
   a GLB swap needs no other change.
2. **3/4-view framing** — the car reads slightly larger than the reference in the
   specs pose; camera numbers are eyeballed, not a solved camera.
3. **Background words** — `MUSCLE` / `SPECS` inferred from partial on-screen glyphs.
4. **Audio** — source has a ~5.013 s AAC track; intentionally omitted (no licensed
   asset; the video content is 5.000 s).

No "pixel-perfect" or "exactly identical" claim is made — material differences
(above all the car model) remain.
