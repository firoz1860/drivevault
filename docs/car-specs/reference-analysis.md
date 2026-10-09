# Reference analysis — "Car Specs – Transition"

Reference shot: https://dribbble.com/shots/9685356-Car-Specs-Transition
Reference video: `large-0be08344c5864e28a21aada7d4f250b9.mp4`

All numbers below are **measured** from the downloaded file unless marked
_(estimate)_. Analysis tooling: `ffprobe` (stream metadata), `ffmpeg` (frame
extraction + contact sheets), and a PNG pixel sampler for colours/bounds.

## 1. Encoding (measured, authoritative)

| Property | Value |
|---|---|
| Video codec | H.264 (High), yuv420p, bt709 |
| Encoded size | 800 × 600 (coded 800 × 608), SAR 1:1, DAR 4:3 |
| Frame rate | `r_frame_rate` = `avg_frame_rate` = **30/1** (CFR) |
| Frame count | **150** |
| **Video-stream duration** | **5.000000 s** (`duration_ts` 76800, `time_base` 1/15360) |
| Audio stream | AAC LC, stereo, 48 kHz, **5.013 s** (present) |
| Container duration | 5.014 s |

**On the "5.013 s" browser value:** that is the audio/container length. The
*picture* is a clean 150 frames at 30 fps = **5.000 s exactly**. The export
targets the video stream: 150 frames, 30 fps, 800 × 600, 5.000 s. The source
audio is a separate track; it is **not** reproduced (no licensed audio asset,
and the choreography carries no audio cues).

## 2. Composition (measured)

| Element | Value |
|---|---|
| Outer stage | 800 × 600, pale cool gray **#d9dddf** |
| White interface panel | **720 × 400 at (40, 100)** — confirmed by a gray→white edge scan |
| Panel background | ~**#f8f8f8** (≈ #FAFAFA) |
| Background lettering | ~**#f0–f4** on white — extremely faint, behind the car |
| Car paint | ~**#1b1d1d** near-black |
| Warm interior | tan, ≈ **#977A53** (shadows ≈ #4f3c28) |
| Green price caption | **#61a864** (sampled from the clip) |
| Primary button ("Contact the Seller") | muted dark gray-green ≈ #59–#6d |

Camera reads as a **long-lens perspective** (near-orthographic) in the side
profile, elevating and dollying slightly for the 3/4 specs view.

## 3. Animation timeline (measured, one deterministic timeline @ 30fps)

Boundaries read from extracted frames (`f_###.png`, 1-indexed; frame N below is
0-indexed time N/30). See `../../client/src/features/carSpecs/animation/referenceTiming.js`.

| event | start → end (s) | frames | easing | evidence |
|---|---|---|---|---|
| Original hold — side profile, car facing **left**, full UI | 0.000 → 1.600 | 0–48 | — | overview rows 1–2 static |
| Original UI fade/slide out | 1.600 → 1.800 | 48–54 | smoothstep | f48 full → f54 gone |
| Car rotates side → 3/4 front-left (+ camera dolly/elevate) | 1.667 → 2.133 | 50–64 | easeInOutCubic | transition_in sheet |
| Hood **lifts off** and floats above the bay + engine revealed | 1.700 → 2.100 | 51–63 | easeInOutCubic | hood-trajectory sheet (see §3a) |
| Specs UI fades in | 1.933 → 2.400 | 58–72 | smoothstep | specs text fades in |
| Specs hold — hood up, engine shown | 2.400 → 3.900 | 72–117 | — | overview rows 3–4 stable |
| Specs UI fades out | 3.900 → 4.100 | 117–123 | smoothstep | grid fades f117→f123 |
| Hood closes + car rotates 3/4 → side (+ dolly back) | 4.000 → 4.500 | 120–135 | easeInOutCubic | transition_out sheet |
| Original UI fades back in | 4.200 → 4.667 | 126–140 | smoothstep | title/price return |
| End hold — restored to start | 4.667 → 5.000 | 140–150 | — | **f149 ≈ f0** |

### 3a. Hood motion — determined, not assumed

Reading the zoomed hood-trajectory sheet frame by frame: the hood is **not** a
conventional hinge. As the car turns, the hood panel **translates straight up
(and slightly forward) and hovers above the engine bay**, staying roughly
horizontal with a small nose-up tilt — a lifted-component reveal. The
implementation reproduces this as a translation (`HOOD_LIFT = { up, forward,
tilt }` in `referenceTiming.js`), **not** a rotation about a cowl/front hinge.

**Boundary behaviour:** the clip is a **smooth, near-symmetric loop** — the last
decoded frame matches the opening frame. No hard cut or reset. The forward
transition and the reverse are mirror images with a steady specs hold between.

**What is NOT present** (checked, to avoid inventing motion): no scroll, no mouse
cursor, no exploding/door/trunk/roof movement, no wheel spin, no camera spin
beyond the single side↔3/4 move.

## 4. Text transcribed from frames (verbatim)

**Original state** (f001): `All Classic Cars` · nav `Cars for sale` / `Showroom`
/ `News & Reviews` · prev `1964 Chevrolet Corvette` · next `1971 Ford Mustang
Mach 1` · title `1969 Dodge` / `Charger R/T` · price `$89,995` · green
`$6,919 below avg.` · quick specs `39,889 miles` / `V8 6.7L Supercharger` /
`Excellent` / `Fenton, MO` · buttons `Specs`, `Contact the Seller` · faint
background word `MUSCLE` _(partial glyphs M-U-S-C… read on-screen; estimate of
full word)_.

**Specs state** (f075): `1969 Dodge` / `Charger R/T Specs` · dealer
`Streetside Classics` / `Fenton, MO` · menu `Overview` / `Engine` / `Interior`
/ `Wheels` · background word `SPECS` · description _"Express ride into the 21st
century with this stunning 1969 Charger RT! This is where the past meets the
future rather quickly with a 720 HP to get you there."_ · 8-field grid:
`MAX SPEED 720 HP`, `TRANSMISSION Automatic 4-Speed`, `MILEAGE 39,889 miles`,
`EXTERIOR COLOR Black`, `CONDITION Excellent`, `DRIVE TRAIN RWD`,
`ENGINE V8 6.7L Supercharger`, `FUEL Gasoline`.

## 5. Estimates vs confirmed

- **Confirmed:** encoding (fps/frames/duration/size), panel bounds, palette
  samples, timeline boundaries, all visible text except the two background words.
- **Estimates:** the full background words (`MUSCLE`/`SPECS` — only partial
  glyphs are ever on screen), exact camera focal length, and font identity
  (substituted — see `asset-sources.md`). Pose numbers in `referenceTiming.js`
  were tuned by eye against the frames and are honest approximations, not a
  solved camera.
