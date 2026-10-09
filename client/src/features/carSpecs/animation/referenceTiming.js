// ---------------------------------------------------------------------------
// Measured timing for the Dribbble "Car Specs - Transition" reference clip.
// Source: large-0be08344c5864e28a21aada7d4f250b9.mp4
// ffprobe: 800x600, H.264, CFR 30fps, 150 frames, video duration 5.000000s.
// (Container/audio = 5.013s due to a separate AAC track; the VIDEO is 5.000s.)
//
// All boundaries below were read from extracted frames (0.0333s/frame).
// Every event is expressed in SECONDS so the timeline is resolution agnostic.
// See docs/reference-analysis.md for the frame-by-frame evidence.
// ---------------------------------------------------------------------------

export const FPS = 30
export const FRAME_COUNT = 150
export const DURATION = FRAME_COUNT / FPS // 5.000s exactly

export const f = (frame) => frame / FPS // frame index -> seconds

// Event windows [startSeconds, endSeconds], named by what moves.
// The forward transition (in) and the reverse (out) are near-symmetric.
export const EVENTS = {
  originalHold: [f(0), f(48)], //              0.000 - 1.600  side profile, facing left
  uiOut: [f(48), f(54)], //                    1.600 - 1.800  original interface fades/slides out
  rotateIn: [f(53), f(72)], //                 1.767 - 2.400  car rotates side -> 3/4 front-left
  hoodOpen: [f(56), f(72)], //                 1.867 - 2.400  hood lifts (cowl hinge), engine revealed
  specsIn: [f(58), f(72)], //                  1.933 - 2.400  specs interface fades in
  specsHold: [f(72), f(117)], //               2.400 - 3.900  hood up, engine shown, specs visible
  specsOut: [f(117), f(123)], //               3.900 - 4.100  specs interface fades out
  hoodClose: [f(120), f(135)], //              4.000 - 4.500  hood lowers, engine re-covered
  rotateOut: [f(122), f(135)], //              4.067 - 4.500  car rotates 3/4 -> side
  uiIn: [f(126), f(140)], //                   4.200 - 4.667  original interface fades back in
  endHold: [f(140), f(150)], //                4.667 - 5.000  restored to start (loops cleanly)
}

// Camera + car poses for the two stable states. Three.js units (metres-ish).
// Car modelled facing +X; rotated to face screen-left for the side profile.
// Tuned against the reference frames; refine in sceneState if needed.
export const POSE = {
  // Side profile (original hold): long lens, level, car filling centre-right.
  side: {
    carRotationY: Math.PI, //            front points to screen-left (-X)
    carScale: 1.0,
    cameraPos: [0.0, 1.5, 15.2],
    cameraTarget: [0.0, 0.62, 0.0],
    fov: 16,
  },
  // Specs state (3/4 front-left, slightly elevated, dollied in).
  specs: {
    carRotationY: Math.PI + 0.6, //      front swings ~35deg toward camera
    carScale: 1.0,
    cameraPos: [0.6, 3.4, 13.0],
    cameraTarget: [0.1, 0.62, 0.0],
    fov: 18,
  },
}

// Hood lift angle (radians) about its cowl-edge pivot, fully open.
// Positive rotation about Z lifts the forward (+X) edge of the hood up.
export const HOOD_OPEN_ANGLE = 1.0
