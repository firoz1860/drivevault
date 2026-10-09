// ---------------------------------------------------------------------------
// Development-only controls, rendered OUTSIDE the captured stage and hidden in
// capture mode. Play/pause, replay, timestamp, scrub (0..duration), mode toggle.
// Keyboard-accessible (real <button>/<input> with labels + focus styles).
// ---------------------------------------------------------------------------

import React, { useEffect, useState } from 'react'
import { DURATION, FPS } from '../animation/referenceTiming'

export default function PlaybackControls({ timeline, mode, onModeChange }) {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!timeline) return
    const unsub = timeline.subscribe((s) => {
      setTime(s.t)
      setPlaying(timeline.playing)
    })
    return unsub
  }, [timeline])

  const frame = Math.round(time * FPS)

  return (
    <div className="cs-controls" role="group" aria-label="Animation playback controls">
      <button type="button" onClick={() => timeline.toggle()} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? '❚❚ Pause' : '► Play'}
      </button>
      <button type="button" onClick={() => timeline.replay()} aria-label="Replay from start">
        ⟲ Replay
      </button>
      <button type="button" onClick={() => timeline.reset()} aria-label="Reset to opening frame">
        ⏮ Reset
      </button>

      <input
        className="cs-scrub"
        type="range"
        min={0}
        max={DURATION}
        step={1 / FPS}
        value={time}
        onChange={(e) => timeline.seek(parseFloat(e.target.value))}
        aria-label="Scrub timeline"
      />
      <span className="cs-time">
        {time.toFixed(3)}s · f{frame}/{FPS * DURATION}
      </span>

      <div className="cs-seg" role="group" aria-label="Stage mode">
        <button
          type="button"
          className={mode === 'reference' ? 'cs-on' : ''}
          onClick={() => onModeChange('reference')}
        >
          Reference 800×600
        </button>
        <button
          type="button"
          className={mode === 'responsive' ? 'cs-on' : ''}
          onClick={() => onModeChange('responsive')}
        >
          Responsive
        </button>
      </div>
    </div>
  )
}
