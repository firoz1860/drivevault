// ---------------------------------------------------------------------------
// DEV-ONLY fixture harness for CarSpecReveal. Not shipped in production (the
// route is guarded by import.meta.env.DEV in App.jsx). Lets us verify the
// integration component in the browser without a live backend/DB, using the
// repo's dummyCarData shape. These are FIXTURE checks — distinct from runs
// against real backend data, which require the API + database.
// ---------------------------------------------------------------------------

import React, { useRef, useState } from 'react'
import { dummyCarData } from '../../../assets/assets'
import CarSpecReveal from './CarSpecReveal'

const base = dummyCarData[0] // BMW X5, model3d = ferrari.glb (ordinary GLB)
const currency = import.meta.env.VITE_CURRENCY || '$'

const CASES = [
  { key: 'ordinary', title: 'Ordinary GLB (rotation + specs)', car: base },
  { key: 'nomodel', title: 'No model3d → vehicle image', car: { ...base, _id: 'no3d', model3d: '' } },
  { key: 'badurl', title: 'Failed model → image fallback', car: { ...base, _id: 'bad', model3d: 'https://example.com/missing.glb' } },
  {
    key: 'hood',
    title: 'Configured hood (mechanism demo: lifts "glass" node)',
    car: { ...base, _id: 'hooddemo' },
    configOverride: { hoodNodes: ['glass'], hood: { up: 0.9, forward: 0.1, tilt: 0.12 } },
  },
]

function Tile({ title, car, configOverride }) {
  const ref = useRef(null)
  const [info, setInfo] = useState(null)
  return (
    <div style={{ border: '1px solid #d7dbdd', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #e7eaeb' }}>
        <strong style={{ fontSize: 13 }}>{title}</strong>
        <span style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => ref.current?.toSpecs()} style={btn}>Specs</button>
          <button onClick={() => ref.current?.toInitial()} style={btn}>Initial</button>
          <button onClick={() => ref.current?.reset()} style={btn}>Reset</button>
        </span>
      </div>
      <div style={{ height: 300 }}>
        <CarSpecReveal
          ref={ref}
          car={car}
          currency={currency}
          configOverride={configOverride}
          onState={() => setInfo((i) => i || ref.current?.hoodInfo?.())}
        />
      </div>
      <div data-testid={`status-${car._id}`} style={{ fontSize: 11, color: '#5d5f5e', padding: '6px 12px' }}>
        model3d: {car.model3d || '(none)'} · hood: {info ? (info.active ? `active [${info.found.join(',')}]` : info.configured ? 'configured but nodes not found' : 'none') : 'n/a'}
      </div>
    </div>
  )
}

const btn = { font: 'inherit', fontSize: 12, padding: '5px 10px', borderRadius: 7, border: '1px solid #c7ccce', background: '#fff', cursor: 'pointer' }

export default function RevealFixtures() {
  return (
    <div style={{ padding: 20, display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ gridColumn: '1 / -1', margin: 0, fontSize: 18 }}>CarSpecReveal — fixture checks (dev only)</h1>
      {CASES.map((c) => (
        <Tile key={c.key} title={c.title} car={c.car} configOverride={c.configOverride} />
      ))}
    </div>
  )
}
