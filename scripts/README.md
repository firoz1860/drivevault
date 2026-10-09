# Car Specs – Transition pipeline (dev-only)

Reproducible tooling for the `/car-specs` reconstruction. Not part of the
client or server bundle. Everything it downloads or generates lands in
`scripts/.work/` (git-ignored); only the final deliverables are written to
`docs/car-specs/`.

## Setup

```bash
cd scripts
npm install
npx playwright install chromium   # one-time, for capture-frames
```

## Steps

```bash
# 1. Download + measure the reference (ffprobe, frame extraction, contact sheets)
npm run analyze

# 2. Start the app in another terminal
cd ../client && npm run dev            # http://localhost:5173

# 3. Capture 150 deterministic frames from the live app
BASE_URL=http://localhost:5173 npm run capture

# 4. Encode MP4 + WebM + poster into docs/car-specs/ and verify with ffprobe
npm run encode

# 5. Build the ref-vs-output comparison sheet
npm run compare
```

## How it stays deterministic

The app exposes `window.__carSpecs` (`seekFrame`, `getRenderedTime`, `isReady`,
`fps`, `frameCount`). `capture-frames.mjs` seeks each absolute frame time, waits
until the rendered time matches and two animation frames have painted, then
screenshots the exact `[data-cs-stage]` 800×600 box. No wall-clock recording is
involved, so the capture is frame-exact and repeatable.

Target: **800×600, CFR 30fps, 150 frames, 5.000s** — matching the reference
video stream (the reference container/audio is 5.013s; see
`docs/car-specs/reference-analysis.md`).
