// ---------------------------------------------------------------------------
// R3F scene: camera rig, studio lighting, soft ground + contact shadow, and the
// car. Camera and car root are driven imperatively from the one timeline each
// frame, so playback, scrubbing and export all read the same deterministic state.
// ---------------------------------------------------------------------------

import React, { useRef, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import CarModel from './CarModel'

function Rig({ timeline, onFrame }) {
  const carRoot = useRef()
  const { camera } = useThree()
  const target = useRef(new THREE.Vector3())

  useFrame(() => {
    if (!timeline) return
    const s = timeline.getState()

    if (carRoot.current) {
      carRoot.current.rotation.y = s.car.rotationY
      carRoot.current.scale.setScalar(s.car.scale)
    }

    const [px, py, pz] = s.camera.position
    const [tx, ty, tz] = s.camera.target
    camera.position.set(px, py, pz)
    target.current.set(tx, ty, tz)
    camera.lookAt(target.current)
    if (camera.fov !== s.camera.fov) {
      camera.fov = s.camera.fov
      camera.updateProjectionMatrix()
    }

    if (onFrame) onFrame(s.t)
  })

  return (
    <group ref={carRoot}>
      <CarModel timeline={timeline} />
    </group>
  )
}

export default function CarScene({ timeline, onFrame, dpr = [1, 2] }) {
  return (
    <Canvas
      // Fixed stage: no auto-resize weirdness; parent controls the box.
      camera={{ position: [0, 1.15, 9.3], fov: 20, near: 0.1, far: 100 }}
      dpr={dpr}
      gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
      shadows
      frameloop="always"
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0) // transparent: panel + faint lettering show behind the car
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        gl.outputColorSpace = THREE.SRGBColorSpace
      }}
    >
      {/* Soft, broad studio illumination — neutral temperature, no spotlights. */}
      <hemisphereLight args={['#ffffff', '#dfe2e3', 0.55]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 8, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-6, 4, -4]} intensity={0.3} />

      <Suspense fallback={null}>
        <Rig timeline={timeline} onFrame={onFrame} />
        {/* No opaque floor: the soft contact shadow alone grounds the car so the
            panel background and faint lettering stay visible, as in the reference. */}
        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.42}
          scale={12}
          blur={2.4}
          far={4}
          resolution={1024}
          color="#5b5f61"
        />
        <Environment preset="studio" environmentIntensity={0.5} />
      </Suspense>
    </Canvas>
  )
}
