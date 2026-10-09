// ---------------------------------------------------------------------------
// HTML/CSS interface overlay (sharp text) for both states. Two fade layers:
// the original side-profile UI and the specs UI. Opacity + drift are applied
// imperatively from the same timeline (no per-frame React re-render).
// ---------------------------------------------------------------------------

import React, { useEffect, useRef } from 'react'
import { vehicle as V } from '../data/vehicle'

const Arrow = ({ dir }) => <span className="cs-arrow">{dir === 'up' ? '↑' : dir === 'down' ? '↓' : '←'}</span>

function OriginalLayer() {
  return (
    <>
      <div className="cs-top">
        <div className="cs-top-left">
          <Arrow dir="back" />
          <span>{V.topLeft}</span>
        </div>
        <nav className="cs-topnav">
          {V.topNav.map((n) => (
            <span key={n} className="cs-interactive">
              {n}
            </span>
          ))}
        </nav>
      </div>

      <div className="cs-switcher">
        {[V.prevVehicle, V.nextVehicle].map((it, i) => (
          <div className="cs-switch-item" key={i}>
            <Arrow dir={it.arrow} />
            <div>
              {it.lines.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="cs-title">
        {V.titleLines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      <div className="cs-price">
        <span className="cs-dollar">$</span>
        {V.price}
      </div>
      <div className="cs-caption">{V.priceCaption}</div>

      <div className="cs-quickspecs">
        {V.quickSpecs.map((col, i) => (
          <div className="cs-col" key={i}>
            {col.map((c) => (
              <div key={c}>{c}</div>
            ))}
          </div>
        ))}
      </div>

      <div className="cs-actions cs-interactive">
        <button className="cs-btn cs-btn-secondary" type="button">
          {V.buttons.secondary}
        </button>
        <button className="cs-btn cs-btn-primary" type="button">
          {V.buttons.primary}
        </button>
      </div>
    </>
  )
}

function SpecsLayer() {
  const s = V.specs
  return (
    <>
      <div className="cs-specs-title">
        <Arrow dir="back" />
        <div className="cs-tt">
          {s.titleLines.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </div>

      <div className="cs-dealer">
        {s.dealer.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
      <div className="cs-actions cs-interactive" style={{ bottom: 'auto', top: 30 }}>
        <button className="cs-btn cs-btn-primary" type="button">
          {V.buttons.primary}
        </button>
      </div>

      <div className="cs-menu">
        {s.menu.map((m, i) => (
          <div key={m} className={i === 0 ? 'cs-active' : ''}>
            {m}
          </div>
        ))}
      </div>

      <div className="cs-desc">{s.description}</div>

      <div className="cs-grid">
        {s.grid.map((g) => (
          <div key={g.label}>
            <div className="cs-label">{g.label}</div>
            <div className="cs-value">{g.value}</div>
          </div>
        ))}
      </div>
    </>
  )
}

// Huge faint background lettering. Lives BEHIND the 3D canvas so the car
// occludes it, matching the reference. Opacity tracks each UI state.
export function BackgroundLettering({ timeline }) {
  const origRef = useRef(null)
  const specRef = useRef(null)
  useEffect(() => {
    if (!timeline) return
    return timeline.subscribe((state) => {
      if (origRef.current) origRef.current.style.opacity = state.ui.original.opacity
      if (specRef.current) specRef.current.style.opacity = state.ui.specs.opacity
    })
  }, [timeline])
  return (
    <div className="cs-bg" aria-hidden>
      <div className="cs-bgword" ref={origRef}>
        {V.backgroundWord}
      </div>
      <div className="cs-bgword" ref={specRef} style={{ opacity: 0 }}>
        {V.specs.backgroundWord}
      </div>
    </div>
  )
}

export default function CarInterface({ timeline }) {
  const originalRef = useRef(null)
  const specsRef = useRef(null)

  useEffect(() => {
    if (!timeline) return
    const apply = (state) => {
      const o = originalRef.current
      const sp = specsRef.current
      if (o) {
        o.style.opacity = state.ui.original.opacity
        o.style.transform = `translateY(${state.ui.original.shiftY}px)`
        o.style.pointerEvents = state.ui.original.opacity > 0.5 ? 'auto' : 'none'
      }
      if (sp) {
        sp.style.opacity = state.ui.specs.opacity
        sp.style.transform = `translateY(${state.ui.specs.shiftY}px)`
        sp.style.pointerEvents = state.ui.specs.opacity > 0.5 ? 'auto' : 'none'
      }
    }
    const unsub = timeline.subscribe(apply)
    return unsub
  }, [timeline])

  return (
    <div className="cs-ui">
      <div className="cs-layer" ref={originalRef}>
        <OriginalLayer />
      </div>
      <div className="cs-layer" ref={specsRef} style={{ opacity: 0 }}>
        <SpecsLayer />
      </div>
    </div>
  )
}
