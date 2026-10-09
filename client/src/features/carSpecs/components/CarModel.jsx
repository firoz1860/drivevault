// ---------------------------------------------------------------------------
// Hand-built stylized muscle car (1969 Dodge Charger R/T silhouette).
//
// IMPORTANT / HONESTY: this is an ORIGINAL approximation built from Three.js
// primitives, chosen for correct proportions and a separately-addressable hood
// + engine so the reveal works. It is NOT a scanned/licensed Charger model and
// is deliberately not claimed to be visually identical. See docs/asset-sources.md.
//
// Scene graph (local axes: +X = front, +Y = up, +Z = passenger side):
//   CarRoot (rotation/scale driven by CarScene)
//     LowerBody / RearUpper / FrontFenders / NoseCap
//     Cabin / Fastback
//     HoodPivot (cowl hinge) -> Hood panel          [independently animated]
//     EngineBay -> Block, ValveCovers, AirCleaner   [revealed by the hood]
//     Interior (seats, dash)  / Glass / Trim / Wheels x4
// ---------------------------------------------------------------------------

import React, { forwardRef, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { HOOD_OPEN_ANGLE } from '../animation/referenceTiming'

// Measured / tuned palette (from frame pixel sampling).
const PAINT = '#15171a'
const PAINT_DARK = '#0c0d0f'
const CHROME = '#c7ccd0'
const TIRE = '#111214'
const GLASS = '#242a2e'
const INTERIOR = '#9c7c52'
const INTERIOR_DARK = '#4f3c28'
const ENGINE_RED = '#b2201c'
const ENGINE_METAL = '#8a9095'
const LIGHT_AMBER = '#d79a3a'
const TAIL_RED = '#8e1410'

const bodyMaterial = (
  <meshPhysicalMaterial color={PAINT} roughness={0.3} metalness={0.62} clearcoat={0.9} clearcoatRoughness={0.25} />
)

function Wheel({ position }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.44, 0.44, 0.32, 36]} />
        <meshStandardMaterial color={TIRE} roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.27, 0.27, 0.34, 28]} />
        <meshStandardMaterial color={CHROME} roughness={0.25} metalness={0.9} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.09, 0.09, 0.36, 16]} />
        <meshStandardMaterial color={'#2a2d30'} roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  )
}

function Engine() {
  // Raised enough to read clearly through the open bay from the 3/4 view, yet
  // still cleared by the flush hood when closed (top ~1.0, hood plane ~0.9 +
  // the hood lifts well before the engine would show from the side).
  return (
    <group position={[1.25, 0.5, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.02, 0.34, 1.0]} />
        <meshStandardMaterial color={'#3a3f44'} roughness={0.5} metalness={0.8} />
      </mesh>
      {/* red valve covers (V) */}
      <mesh position={[0, 0.2, -0.28]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.86, 0.14, 0.28]} />
        <meshStandardMaterial color={ENGINE_RED} roughness={0.35} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.2, 0.28]} rotation={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.86, 0.14, 0.28]} />
        <meshStandardMaterial color={ENGINE_RED} roughness={0.35} metalness={0.6} />
      </mesh>
      {/* prominent red air cleaner with chrome lid */}
      <mesh position={[0.02, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.38, 0.2, 36]} />
        <meshStandardMaterial color={ENGINE_RED} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0.02, 0.48, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.07, 28]} />
        <meshStandardMaterial color={CHROME} roughness={0.18} metalness={0.95} />
      </mesh>
      {/* chrome headers */}
      {[-0.32, 0.32].map((z) => (
        <mesh key={z} position={[-0.36, -0.04, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.55, 16]} />
          <meshStandardMaterial color={ENGINE_METAL} roughness={0.3} metalness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Hood() {
  // Flush panel extending forward (+X) from the cowl hinge at the parent origin.
  return (
    <group>
      <RoundedBox args={[1.55, 0.1, 1.64]} radius={0.05} smoothness={4} position={[0.78, 0, 0]} castShadow>
        <meshPhysicalMaterial color={PAINT} roughness={0.32} metalness={0.7} clearcoat={0.8} clearcoatRoughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[0.8, 0.07, 0.5]} radius={0.03} smoothness={3} position={[0.85, 0.07, 0]}>
        <meshPhysicalMaterial color={PAINT_DARK} roughness={0.3} metalness={0.7} clearcoat={0.7} />
      </RoundedBox>
    </group>
  )
}

const CarModel = forwardRef(function CarModel({ timeline }, ref) {
  const hoodPivot = useRef()

  useFrame(() => {
    if (!timeline || !hoodPivot.current) return
    const s = timeline.getState()
    // negative rotation about Z lifts the forward (+X) edge of the hood.
    hoodPivot.current.rotation.z = s.hood.progress * HOOD_OPEN_ANGLE
  })

  return (
    <group ref={ref} dispose={null}>
      {/* ---- Lower body / rockers (full length) ---- */}
      <RoundedBox args={[4.6, 0.5, 1.82]} radius={0.16} smoothness={5} position={[-0.05, 0.5, 0]} castShadow receiveShadow>
        {bodyMaterial}
      </RoundedBox>

      {/* ---- Rear + mid upper body (trunk, under-cabin, cowl) ---- */}
      <RoundedBox args={[2.95, 0.34, 1.8]} radius={0.16} smoothness={5} position={[-1.0, 0.9, 0]} castShadow>
        <meshPhysicalMaterial color={PAINT} roughness={0.3} metalness={0.62} clearcoat={0.9} clearcoatRoughness={0.25} />
      </RoundedBox>

      {/* ---- Front fenders flanking the engine bay ---- */}
      {[-0.7, 0.7].map((z) => (
        <RoundedBox key={z} args={[1.75, 0.34, 0.44]} radius={0.12} smoothness={4} position={[1.12, 0.9, z]} castShadow>
          <meshPhysicalMaterial color={PAINT} roughness={0.3} metalness={0.62} clearcoat={0.9} clearcoatRoughness={0.25} />
        </RoundedBox>
      ))}
      {/* nose cap closing the very front, above the grille */}
      <RoundedBox args={[0.22, 0.34, 1.66]} radius={0.08} smoothness={4} position={[2.0, 0.9, 0]} castShadow>
        <meshPhysicalMaterial color={PAINT} roughness={0.3} metalness={0.62} clearcoat={0.9} />
      </RoundedBox>

      {/* ---- Cabin / fastback roof (connected to upper body) ---- */}
      <RoundedBox args={[2.35, 0.54, 1.56]} radius={0.24} smoothness={5} position={[-0.5, 1.22, 0]} castShadow>
        <meshPhysicalMaterial color={PAINT} roughness={0.32} metalness={0.6} clearcoat={0.85} />
      </RoundedBox>
      {/* fastback slope to the rear deck */}
      <mesh position={[-1.55, 1.08, 0]} rotation={[0, 0, 0.62]} castShadow>
        <boxGeometry args={[1.0, 0.5, 1.5]} />
        <meshPhysicalMaterial color={PAINT} roughness={0.32} metalness={0.6} clearcoat={0.85} />
      </mesh>

      {/* ---- Glass ---- */}
      {/* windshield (cowl -> roof front) */}
      <mesh position={[0.28, 1.2, 0]} rotation={[0, 0, -0.66]}>
        <boxGeometry args={[0.05, 0.6, 1.42]} />
        <meshPhysicalMaterial color={GLASS} roughness={0.08} metalness={0.1} transparent opacity={0.78} />
      </mesh>
      {/* side windows */}
      {[-0.76, 0.76].map((z) => (
        <mesh key={z} position={[-0.5, 1.32, z]}>
          <boxGeometry args={[1.95, 0.42, 0.03]} />
          <meshPhysicalMaterial color={GLASS} roughness={0.08} metalness={0.1} transparent opacity={0.68} />
        </mesh>
      ))}
      {/* rear glass */}
      <mesh position={[-1.52, 1.22, 0]} rotation={[0, 0, 0.62]}>
        <boxGeometry args={[0.04, 0.46, 1.36]} />
        <meshPhysicalMaterial color={GLASS} roughness={0.08} metalness={0.1} transparent opacity={0.7} />
      </mesh>

      {/* ---- Interior (warm tan, inside the cabin) ---- */}
      <group position={[-0.5, 0.98, 0]}>
        <mesh>
          <boxGeometry args={[1.7, 0.08, 1.4]} />
          <meshStandardMaterial color={INTERIOR} roughness={0.9} />
        </mesh>
        {[-0.38, 0.38].map((z) => (
          <group key={z} position={[-0.25, 0.16, z]}>
            <mesh>
              <boxGeometry args={[0.42, 0.28, 0.42]} />
              <meshStandardMaterial color={INTERIOR} roughness={0.9} />
            </mesh>
            <mesh position={[-0.22, 0.22, 0]} rotation={[0, 0, 0.18]}>
              <boxGeometry args={[0.12, 0.48, 0.42]} />
              <meshStandardMaterial color={INTERIOR} roughness={0.9} />
            </mesh>
          </group>
        ))}
        <mesh position={[0.62, 0.12, 0]}>
          <boxGeometry args={[0.2, 0.26, 1.3]} />
          <meshStandardMaterial color={INTERIOR_DARK} roughness={0.8} />
        </mesh>
      </group>

      {/* ---- Engine bay + engine (revealed by the hood) ---- */}
      <mesh position={[1.2, 0.4, 0]}>
        <boxGeometry args={[1.7, 0.05, 1.3]} />
        <meshStandardMaterial color={'#17191b'} roughness={0.95} />
      </mesh>
      <Engine />

      {/* ---- Hood on its cowl pivot (hinge near windshield base) ---- */}
      <group ref={hoodPivot} position={[0.45, 1.0, 0]}>
        <Hood />
      </group>

      {/* ---- Trim: bumpers, grille, lights ---- */}
      <mesh position={[2.32, 0.5, 0]} castShadow>
        <boxGeometry args={[0.16, 0.26, 1.72]} />
        <meshStandardMaterial color={CHROME} roughness={0.2} metalness={0.95} />
      </mesh>
      <mesh position={[2.22, 0.74, 0]}>
        <boxGeometry args={[0.1, 0.3, 1.5]} />
        <meshStandardMaterial color={'#17191b'} roughness={0.6} metalness={0.5} />
      </mesh>
      {[-0.66, 0.66].map((z) => (
        <mesh key={z} position={[2.26, 0.76, z]}>
          <boxGeometry args={[0.06, 0.12, 0.18]} />
          <meshStandardMaterial color={LIGHT_AMBER} emissive={LIGHT_AMBER} emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[-2.34, 0.5, 0]} castShadow>
        <boxGeometry args={[0.16, 0.26, 1.72]} />
        <meshStandardMaterial color={CHROME} roughness={0.2} metalness={0.95} />
      </mesh>
      <mesh position={[-2.28, 0.74, 0]}>
        <boxGeometry args={[0.06, 0.16, 1.5]} />
        <meshStandardMaterial color={TAIL_RED} emissive={TAIL_RED} emissiveIntensity={0.6} roughness={0.4} />
      </mesh>

      {/* chrome rocker trim along the sills */}
      {[-0.92, 0.92].map((z) => (
        <mesh key={z} position={[0, 0.3, z]}>
          <boxGeometry args={[3.9, 0.04, 0.03]} />
          <meshStandardMaterial color={CHROME} roughness={0.25} metalness={0.9} />
        </mesh>
      ))}

      {/* ---- Wheels ---- */}
      <Wheel position={[1.5, 0.44, 0.82]} />
      <Wheel position={[1.5, 0.44, -0.82]} />
      <Wheel position={[-1.55, 0.44, 0.82]} />
      <Wheel position={[-1.55, 0.44, -0.82]} />
    </group>
  )
})

export default CarModel
