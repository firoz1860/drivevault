// ---------------------------------------------------------------------------
// The one pure function the whole experience derives from: time -> scene state.
//
// computeSceneState(t) is deterministic. Calling it with the same t always
// returns the same state; calling times out of order is fine (no accumulation).
// Camera, car, hood, engine, and every interface group read from this result.
// ---------------------------------------------------------------------------

import { clamp, lerp, lerp3, invLerp, easeInOutCubic, easeInOut } from './easing'
import { EVENTS, POSE, DURATION } from './referenceTiming'

// progress 0 (side profile) -> 1 (specs pose). Ramps up on the way in,
// holds at 1 across the specs section, ramps back down on the way out.
const poseProgress = (t) => {
  const [inA, inB] = EVENTS.rotateIn
  const [outA, outB] = EVENTS.rotateOut
  if (t <= inA) return 0
  if (t < inB) return easeInOutCubic(invLerp(inA, inB, t))
  if (t <= outA) return 1
  if (t < outB) return 1 - easeInOutCubic(invLerp(outA, outB, t))
  return 0
}

// hood 0 (closed) -> 1 (fully lifted). Opens on the way in, closes on the way out.
const hoodProgress = (t) => {
  const [inA, inB] = EVENTS.hoodOpen
  const [outA, outB] = EVENTS.hoodClose
  if (t <= inA) return 0
  if (t < inB) return easeInOutCubic(invLerp(inA, inB, t))
  if (t <= outA) return 1
  if (t < outB) return 1 - easeInOutCubic(invLerp(outA, outB, t))
  return 0
}

// A faded element also drifts a few px — matches the slight slide in the clip.
const fadeGroup = (opacity, dir = 1) => ({
  opacity,
  // translateY in px: fully shown = 0, hidden = 10px in the drift direction.
  shiftY: lerp(10 * dir, 0, opacity),
})

const originalUiOpacity = (t) => {
  const [outA, outB] = EVENTS.uiOut
  const [inA, inB] = EVENTS.uiIn
  if (t < outA) return 1
  if (t < outB) return 1 - easeInOut(invLerp(outA, outB, t))
  if (t < inA) return 0
  if (t < inB) return easeInOut(invLerp(inA, inB, t))
  return 1
}

const specsUiOpacity = (t) => {
  const [inA, inB] = EVENTS.specsIn
  const [outA, outB] = EVENTS.specsOut
  if (t < inA) return 0
  if (t < inB) return easeInOut(invLerp(inA, inB, t))
  if (t < outA) return 1
  if (t < outB) return 1 - easeInOut(invLerp(outA, outB, t))
  return 0
}

export const PHASES = [
  { name: 'originalHold', until: EVENTS.uiOut[0] },
  { name: 'transitionIn', until: EVENTS.specsHold[0] },
  { name: 'specsHold', until: EVENTS.specsOut[0] },
  { name: 'transitionOut', until: EVENTS.endHold[0] },
  { name: 'endHold', until: DURATION },
]

const phaseAt = (t) => (PHASES.find((p) => t < p.until) || PHASES[PHASES.length - 1]).name

export function computeSceneState(timeSeconds) {
  const t = clamp(timeSeconds, 0, DURATION)
  const p = poseProgress(t)

  const carRotationY = lerp(POSE.side.carRotationY, POSE.specs.carRotationY, p)
  const carScale = lerp(POSE.side.carScale, POSE.specs.carScale, p)
  const cameraPos = lerp3(POSE.side.cameraPos, POSE.specs.cameraPos, p)
  const cameraTarget = lerp3(POSE.side.cameraTarget, POSE.specs.cameraTarget, p)
  const fov = lerp(POSE.side.fov, POSE.specs.fov, p)

  const hood = hoodProgress(t)

  const originalOpacity = originalUiOpacity(t)
  const specsOpacity = specsUiOpacity(t)

  return {
    t,
    phase: phaseAt(t),
    poseProgress: p,
    car: { rotationY: carRotationY, scale: carScale },
    hood: { progress: hood },
    // engine is physically revealed by the hood; expose the same value for UI/debug.
    engineReveal: hood,
    camera: { position: cameraPos, target: cameraTarget, fov },
    ui: {
      original: fadeGroup(originalOpacity, 1),
      specs: fadeGroup(specsOpacity, -1),
    },
  }
}
