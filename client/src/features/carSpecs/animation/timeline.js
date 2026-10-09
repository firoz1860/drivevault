// ---------------------------------------------------------------------------
// Deterministic timeline controller: one clock for the whole experience.
//
// - play() / pause() / toggle() drive playback from a single rAF loop.
// - seek(t) jumps to an absolute time (pauses); repeatable and order-independent.
// - replay() / reset() restore the exact opening state.
// - subscribe(fn) notifies listeners with the computed scene state.
//
// The scene (R3F) and the interface (HTML) both read from this one source,
// so there is never a second, unrelated clock.
// ---------------------------------------------------------------------------

import { DURATION } from './referenceTiming'
import { computeSceneState } from './sceneState'
import { clamp } from './easing'

export function createTimeline({ loop = true } = {}) {
  let time = 0
  let playing = false
  let rafId = null
  let last = 0
  const listeners = new Set()

  const notify = () => {
    const state = computeSceneState(time)
    listeners.forEach((fn) => fn(state))
  }

  const step = (now) => {
    if (!playing) return
    const dt = (now - last) / 1000
    last = now
    time += dt
    if (time >= DURATION) {
      if (loop) time = time % DURATION
      else {
        time = DURATION
        playing = false
      }
    }
    notify()
    if (playing) rafId = requestAnimationFrame(step)
  }

  const api = {
    get time() {
      return time
    },
    get playing() {
      return playing
    },
    duration: DURATION,

    play() {
      if (playing) return
      playing = true
      last = performance.now()
      rafId = requestAnimationFrame(step)
    },
    pause() {
      playing = false
      if (rafId) cancelAnimationFrame(rafId)
      rafId = null
      notify()
    },
    toggle() {
      playing ? api.pause() : api.play()
    },
    // Absolute seek. Deterministic: same t -> same state, any order.
    seek(t) {
      time = clamp(t, 0, DURATION)
      playing = false
      if (rafId) cancelAnimationFrame(rafId)
      rafId = null
      notify()
    },
    replay() {
      api.seek(0)
      api.play()
    },
    reset() {
      api.seek(0)
    },
    getState() {
      return computeSceneState(time)
    },
    subscribe(fn) {
      listeners.add(fn)
      fn(computeSceneState(time))
      return () => listeners.delete(fn)
    },
    dispose() {
      playing = false
      if (rafId) cancelAnimationFrame(rafId)
      rafId = null
      listeners.clear()
    },
  }

  return api
}
