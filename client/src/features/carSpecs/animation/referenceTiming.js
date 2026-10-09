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
  rotateIn: [f(50), f(64)], //                 1.667 - 2.133  car rotates side -> 3/4 front-left (early + fast)
  hoodOpen: [f(51), f(63)], //                 1.700 - 2.100  hood lifts OFF and floats above the bay
  specsIn: [f(58), f(72)], //                  1.933 - 2.400  specs interface fades in
  specsHold: [f(72), f(117)], //               2.400 - 3.900  hood floating, engine shown, specs visible
  specsOut: [f(117), f(123)], //               3.900 - 4.100  specs interface fades out
  hoodClose: [f(123), f(138)], //              4.100 - 4.600  hood lowers back onto the bay
  rotateOut: [f(124), f(138)], //              4.133 - 4.600  car rotates 3/4 -> side
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
  // Specs state (elevated 3/4 front-left).
  specs: {
    carRotationY: Math.PI + 0.95, //     front swings ~54deg toward camera
    carScale: 1.0,
    cameraPos: [0.4, 3.95, 13.6],
    cameraTarget: [0.0, 0.72, 0.0],
    fov: 18,
  },
}

// Hood reveal is a LIFT-OFF, not a hinge: the panel translates up (and a little
// forward) and hovers above the bay with a slight tilt. Measured from the clip
// (see docs/car-specs/reference-analysis.md, hood-trajectory sheet).
export const HOOD_LIFT = {
  up: 0.62, //      metres the panel rises (hovers just above the bay)
  forward: 0.12, // slight forward drift (+X, toward the front)
  tilt: 0.1, //     small nose-up tilt (radians about Z)
}
