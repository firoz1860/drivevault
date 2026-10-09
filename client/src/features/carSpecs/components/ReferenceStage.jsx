// ---------------------------------------------------------------------------
// The fixed 800x600 composition: pale gray stage, inset 720x400 white panel,
// the 3D canvas filling the panel, and the HTML interface on top. This is the
// exact box used for screenshots, comparisons and video export.
// `overlay` (loading / error / poster) renders above everything when present.
// ---------------------------------------------------------------------------

import React from 'react'
import CarScene from './CarScene'
import CarInterface, { BackgroundLettering } from './CarInterface'

export default function ReferenceStage({ timeline, onFrame, showUI = true, overlay = null, stageRef }) {
  return (
    <div className="cs-stage" ref={stageRef} data-cs-stage>
      <div className="cs-panel">
        {showUI && <BackgroundLettering timeline={timeline} />}
        <div className="cs-canvas">
          <CarScene timeline={timeline} onFrame={onFrame} />
        </div>
        {showUI && <CarInterface timeline={timeline} />}
      </div>
      {overlay}
    </div>
  )
}
