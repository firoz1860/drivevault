// ---------------------------------------------------------------------------
// CarSpecReveal — data-driven 3D spec reveal for the real CarDetails page.
//
// - Loads the selected car's actual model3d GLB (no generic Ferrari fallback).
// - p = 0 is the INITIAL side-profile presentation; "Specs" animates to the
//   three-quarter view + a real-data specification panel; "Reset" returns to the
//   exact initial state.
// - Ordinary GLBs get rotation + the spec panel. Hood movement runs ONLY when
//   the asset is configured in carAssets.js AND the configured nodes are found
//   in the loaded GLB (validated here). Loaded scenes are cloned per instance so
//   animating one viewer never mutates another sharing the cached model; node
//   transforms are restored on reset.
// - Loading / error / reduced-motion / mobile all handled. On load failure the
//   car's own image is shown (never an unrelated model).
//
// Imperative API (via ref): { toSpecs, toInitial, reset, isAtSpecs }.
// ---------------------------------------------------------------------------

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  Suspense,
  Component,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows } from '@react-three/drei'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { Box3, Vector3 } from 'three'
import { easeInOutCubic, lerp, lerp3 } from '../animation/easing'
import { createRevealController } from '../animation/revealController'
import { getAssetConfig } from '../data/carAssets'
import { buildSpecModel } from '../data/revealSpecs'
import '../styles/car-specs.css'

const TARGET_LEN = 4.2 // normalised car length in scene units

// Generic poses: camera orbits from a side view to an elevated 3/4-front.
const SIDE = { pos: [0, 1.05, 8.6], target: [0, 0.62, 0], fov: 20 }
const SPECS = { pos: [4.2, 2.4, 6.0], target: [0, 0.72, 0], fov: 24 }

// ---- GLB error boundary (load failure -> image fallback) ------------------
class GLBErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError?.()
  }
  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

// ---- The loaded, normalised, cloned model + its per-frame rig --------------
function Model({ url, config, controller, onHoodInfo }) {
  const { scene } = useGLTF(url)
  const group = useRef()
  const { camera } = useThree()
  const targetVec = useRef(new Vector3())

  // Clone per instance so transforms never mutate the cached/shared scene.
  const cloned = useMemo(() => cloneSkeleton(scene), [scene])

  // Normalise: centre horizontally, sit on the ground, scale to TARGET_LEN.
  const { scale, offset } = useMemo(() => {
    const box = new Box3().setFromObject(cloned)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const maxHoriz = Math.max(size.x, size.z) || 1
    const s = TARGET_LEN / maxHoriz
    return { scale: s, offset: [-center.x, -box.min.y, -center.z] }
  }, [cloned])

  // Validate + collect configured hood nodes in the cloned graph.
  const hood = useMemo(() => {
    if (!config?.hoodNodes?.length) return null
    const found = []
    cloned.traverse((o) => {
      if (config.hoodNodes.includes(o.name)) {
        found.push({ node: o, base: { x: o.position.x, y: o.position.y, z: o.position.z, rz: o.rotation.z } })
      }
    })
    return found.length ? { nodes: found, motion: config.hood || { up: 0.6, forward: 0.12, tilt: 0.1 } } : null
  }, [cloned, config])

  useEffect(() => {
    onHoodInfo?.({
      configured: !!config?.hoodNodes?.length,
      active: !!hood,
      found: hood ? hood.nodes.map((n) => n.node.name) : [],
    })
  }, [hood, config, onHoodInfo])

  const baseRot = config?.orientation || [0, 0, 0]

  useFrame(() => {
    const e = easeInOutCubic(controller.p)
    if (group.current) group.current.rotation.set(baseRot[0], baseRot[1], baseRot[2])
    const [px, py, pz] = lerp3(SIDE.pos, SPECS.pos, e)
    const [tx, ty, tz] = lerp3(SIDE.target, SPECS.target, e)
    camera.position.set(px, py, pz)
    targetVec.current.set(tx, ty, tz)
    camera.lookAt(targetVec.current)
    const fov = lerp(SIDE.fov, SPECS.fov, e)
    if (camera.fov !== fov) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
    if (hood) {
      const m = hood.motion
      for (const { node, base } of hood.nodes) {
        node.position.set(base.x + m.forward * e, base.y + m.up * e, base.z)
        node.rotation.z = base.rz + m.tilt * e
      }
    }
  })

  return (
    <group ref={group}>
      <group scale={scale} position={offset}>
        <primitive object={cloned} />
      </group>
    </group>
  )
}

function Scene({ url, config, controller, onHoodInfo, onError, onReady }) {
  return (
    <Canvas
      camera={{ position: SIDE.pos, fov: SIDE.fov, near: 0.1, far: 100 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      shadows
      onCreated={() => onReady?.()}
    >
      <hemisphereLight args={['#ffffff', '#dfe2e3', 0.6]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 8, 6]} intensity={1.0} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <GLBErrorBoundary onError={onError}>
        <Suspense fallback={null}>
          <Model url={url} config={config} controller={controller} onHoodInfo={onHoodInfo} />
          <Environment preset="studio" environmentIntensity={0.7} />
        </Suspense>
      </GLBErrorBoundary>
      <ContactShadows position={[0, 0, 0]} opacity={0.42} scale={10} blur={2.4} far={4} resolution={512} color="#53585a" />
    </Canvas>
  )
}

const CarSpecReveal = forwardRef(function CarSpecReveal(
  { car, currency = '', reduced = false, onState, configOverride = null },
  ref,
) {
  const controller = useMemo(() => createRevealController(), [])
  const modelUrl = car?.model3d || ''
  // configOverride is a dev/test seam (fixtures) — production uses carAssets.js.
  const config = useMemo(() => configOverride || getAssetConfig(modelUrl), [modelUrl, configOverride])
  const spec = useMemo(() => buildSpecModel(car, currency), [car, currency])

  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const [hoodInfo, setHoodInfo] = useState(null)
  const panelRef = useRef(null)

  // Reset the timeline + discard stale load results whenever the car changes.
  useEffect(() => {
    controller.reset()
    setFailed(false)
    setReady(false)
    setHoodInfo(null)
  }, [car?._id, modelUrl, controller])

  useEffect(() => {
    const unsub = controller.subscribe((p) => {
      if (panelRef.current) {
        const o = Math.max(0, (p - 0.2) / 0.8)
        panelRef.current.style.opacity = o
        panelRef.current.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
      }
      onState?.({ p, atSpecs: p >= 0.999 })
    })
    return unsub
  }, [controller, onState])

  useEffect(() => () => controller.dispose(), [controller])

  useImperativeHandle(
    ref,
    () => ({
      toSpecs: () => (reduced ? controller.seek(1) : controller.toSpecs()),
      toInitial: () => (reduced ? controller.seek(0) : controller.toInitial()),
      reset: () => controller.reset(),
      isAtSpecs: () => controller.atSpecs,
      hoodInfo: () => hoodInfo,
    }),
    [controller, reduced, hoodInfo],
  )

  // No model, or load failed -> the car's own image (never an unrelated model).
  if (!modelUrl || failed) {
    return (
      <div className="csr-fallback">
        <img src={car?.image} alt={spec.title} className="csr-fallback-img" />
        {failed && <div className="csr-fallback-note">3D model unavailable — showing vehicle image.</div>}
      </div>
    )
  }

  return (
    <div className="csr-root" data-hood={hoodInfo ? (hoodInfo.active ? 'active' : 'none') : 'pending'}>
      <Scene
        url={modelUrl}
        config={config}
        controller={controller}
        onReady={() => setReady(true)}
        onError={() => setFailed(true)}
        onHoodInfo={setHoodInfo}
      />

      {/* real-data specification overlay (fades in toward the specs state) */}
      <div className="csr-panel" ref={panelRef} style={{ opacity: 0 }}>
        <div className="csr-panel-head">
          <div className="csr-title">{spec.title}</div>
          {spec.subtitle && <div className="csr-sub">{spec.subtitle}</div>}
          {spec.price && (
            <div className="csr-price">
              {spec.price}
              <span className="csr-per"> / day</span>
            </div>
          )}
        </div>
        {spec.rows.length > 0 && (
          <div className="csr-grid">
            {spec.rows.map((r) => (
              <div key={r.label} className="csr-cell">
                <div className="csr-label">{r.label}</div>
                <div className="csr-value">{r.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!ready && (
        <div className="csr-overlay" aria-live="polite">
          <div className="csr-spinner" />
        </div>
      )}
    </div>
  )
})

export default CarSpecReveal
