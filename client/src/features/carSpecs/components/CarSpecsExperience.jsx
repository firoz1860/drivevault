// ---------------------------------------------------------------------------
// Orchestrator for the Car Specs - Transition experience.
//
// Owns the single timeline, gates playback on readiness (fonts + first render),
// handles load failure + reduced motion, switches reference/responsive modes,
// and exposes window.__carSpecs so the capture script can seek deterministically.
// ---------------------------------------------------------------------------

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createTimeline } from '../animation/timeline'
import { DURATION, FPS, FRAME_COUNT } from '../animation/referenceTiming'
import ReferenceStage from './ReferenceStage'
import PlaybackControls from './PlaybackControls'
import '../styles/car-specs.css'

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const getParam = (k) => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get(k) : null)

export default function CarSpecsExperience() {
  // capture mode: ?capture=1 -> no dev chrome, stay paused at f0 awaiting seeks.
  const capture = getParam('capture') === '1'
  const timeline = useMemo(() => createTimeline({ loop: !capture }), [capture])

  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)
  const [mode, setMode] = useState('reference')
  const reduced = useMemo(() => prefersReducedMotion() && !capture, [capture])

  const renderedTimeRef = useRef(0)
  const frameTicksRef = useRef(0)
  const stageRef = useRef(null)
  const fitRef = useRef(null)

  const setReadyWhenFontsLoaded = () => {
    const done = () => setReady(true)
    if (document?.fonts?.ready) document.fonts.ready.then(done).catch(done)
    else done()
  }

  const onFrame = (t) => {
    renderedTimeRef.current = t
    frameTicksRef.current += 1
    if (!ready && frameTicksRef.current >= 2) {
      // first real render done; readiness also waits on fonts below.
      setReadyWhenFontsLoaded()
    }
  }

  // Autoplay once ready (unless capture or reduced motion).
  useEffect(() => {
    if (!ready) return
    if (capture || reduced) {
      timeline.seek(0)
    } else {
      timeline.replay()
    }
  }, [ready, capture, reduced, timeline])

  // Safety: if the scene never renders (WebGL failure), surface an error.
  useEffect(() => {
    const id = setTimeout(() => {
      if (frameTicksRef.current === 0) setError(true)
    }, 8000)
    return () => clearTimeout(id)
  }, [])

  // Responsive scaling: fit the 800x600 stage into the container uniformly.
  useEffect(() => {
    if (mode !== 'responsive' || !fitRef.current) return
    const el = fitRef.current
    const update = () => {
      const scale = Math.min(1, el.clientWidth / 800)
      el.style.setProperty('--cs-scale', String(scale))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [mode, ready])

  // Playwright / capture bridge.
  useEffect(() => {
    window.__carSpecs = {
      version: 1,
      fps: FPS,
      frameCount: FRAME_COUNT,
      duration: DURATION,
      isReady: () => ready && !error,
      getRenderedTime: () => renderedTimeRef.current,
      seek: (t) => timeline.seek(t),
      seekFrame: (n) => timeline.seek(n / FPS),
      play: () => timeline.play(),
      pause: () => timeline.pause(),
      replay: () => timeline.replay(),
      reset: () => timeline.reset(),
      getTime: () => timeline.time,
    }
    return () => {
      try {
        delete window.__carSpecs
      } catch {
        window.__carSpecs = undefined
      }
    }
  }, [ready, error, timeline])

  useEffect(() => () => timeline.dispose(), [timeline])

  const overlay = error ? (
    <div className="cs-overlay cs-error" role="alert">
      <img
        src="/car-specs/poster.png"
        alt="1969 Dodge Charger R/T"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
      />
      <div style={{ position: 'relative' }}>3D preview couldn’t start.</div>
      <button
        type="button"
        onClick={() => {
          setError(false)
          frameTicksRef.current = 0
          // re-mounting the canvas: simplest is a full reload of the route.
          window.location.reload()
        }}
      >
        Retry
      </button>
    </div>
  ) : !ready ? (
    <div className="cs-overlay" aria-live="polite">
      <div className="cs-spinner" />
      <div>Loading the showroom…</div>
    </div>
  ) : null

  const stage = (
    <ReferenceStage timeline={timeline} onFrame={onFrame} overlay={overlay} stageRef={stageRef} />
  )

  return (
    <div className={`cs-root ${capture ? 'cs-capture' : ''}`}>
      <div className="cs-page">
        {!capture && (
          <div className="cs-pagehead" style={{ width: '100%', maxWidth: 800 }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Car Specs — Transition</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5d5f5e' }}>
              1969 Dodge Charger R/T · deterministic reconstruction (Three.js). 800×600 · 5.000s · 30fps.
            </p>
          </div>
        )}

        {mode === 'responsive' && !capture ? (
          <div className="cs-stage-fit" ref={fitRef}>
            {stage}
          </div>
        ) : (
          stage
        )}

        {reduced && ready && !capture && (
          <button
            type="button"
            className="cs-interactive"
            onClick={() => timeline.replay()}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #c7ccce', background: '#fff' }}
          >
            Play animation
          </button>
        )}

        {!capture && <PlaybackControls timeline={timeline} mode={mode} onModeChange={setMode} />}
      </div>
    </div>
  )
}
