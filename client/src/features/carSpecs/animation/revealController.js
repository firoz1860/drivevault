// ---------------------------------------------------------------------------
// Small deterministic controller for the CarDetails spec reveal.
//
//   p = 0  -> initial side-profile presentation
//   p = 1  -> specs three-quarter view + specification reveal
//
// toSpecs() animates p 0 -> 1, toInitial() animates 1 -> 0, seek(p) jumps.
// reset() returns to the exact initial state (p = 0). One clock; no setTimeout
// choreography; same p always yields the same state.
// ---------------------------------------------------------------------------

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const DURATION_MS = 850

export function createRevealController() {
  let p = 0
  let target = 0
  let rafId = null
  let last = 0
  const listeners = new Set()

  const notify = () => listeners.forEach((fn) => fn(p))

  const tick = (now) => {
    const dt = now - last
    last = now
    const dir = Math.sign(target - p)
    p = clamp01(p + dir * (dt / DURATION_MS))
    if ((dir > 0 && p >= target) || (dir < 0 && p <= target) || dir === 0) {
      p = target
      rafId = null
    }
    notify()
    if (rafId !== null) rafId = requestAnimationFrame(tick)
  }

  const run = () => {
    if (rafId !== null || p === target) {
      notify()
      return
    }
    last = performance.now()
    rafId = requestAnimationFrame(tick)
  }

  const stop = () => {
    if (rafId !== null) cancelAnimationFrame(rafId)
    rafId = null
  }

  return {
    get p() {
      return p
    },
    get atSpecs() {
      return p >= 0.999
    },
    toSpecs() {
      target = 1
      run()
    },
    toInitial() {
      target = 0
      run()
    },
    toggle() {
      target = target >= 0.5 ? 0 : 1
      run()
    },
    // Immediate, deterministic jump (used by reset + the capture bridge).
    seek(value) {
      stop()
      p = clamp01(value)
      target = p
      notify()
    },
    reset() {
      stop()
      p = 0
      target = 0
      notify()
    },
    subscribe(fn) {
      listeners.add(fn)
      fn(p)
      return () => listeners.delete(fn)
    },
    dispose() {
      stop()
      listeners.clear()
    },
  }
}
