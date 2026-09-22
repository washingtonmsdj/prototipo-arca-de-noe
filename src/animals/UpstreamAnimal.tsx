import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createWildlifeRig } from "../pilgrimage/wildlife/rig"
import { speciesGaits, type WildlifeGait } from "../pilgrimage/wildlife/gait"
import { ANIMAL_JOINT_LABELS, type AnimalClip, type AnimalJoint } from "../pilgrimage/wildlife/rig-edits"
import {
  WILDLIFE_PROFILES,
  WILDLIFE_SPECIES,
  isBird,
  isChicken,
  type WildlifeKind,
} from "../pilgrimage/wildlife/species"
import { terrainHeight, terrainSlope } from "../world/terrain"

export const UPSTREAM_WILDLIFE_SPECIES = WILDLIFE_SPECIES
export type UpstreamAnimalClip = AnimalClip

export function upstreamAnimalClips(kind: WildlifeKind): AnimalClip[] {
  if (isBird(kind)) return ["idle", "fly", "glide"]
  if (isChicken(kind)) return ["idle", "graze", "walk", "lie"]
  const gaits = speciesGaits(kind)
  return ["idle", "graze", ...gaits, "lie", ...(kind === "rabbit" ? ["burrow" as const] : [])]
}

function gaitForClip(kind: WildlifeKind, clip: AnimalClip): WildlifeGait {
  const available = speciesGaits(kind)
  return available.includes(clip as WildlifeGait) ? clip as WildlifeGait : available[0] ?? "walk"
}

export interface UpstreamAnimalProps {
  kind: WildlifeKind
  clip: AnimalClip
  paused?: boolean
  showRig?: boolean
  origin?: [number, number]
  scale?: number
  speedScale?: number
}

export function UpstreamAnimal({
  kind,
  clip,
  paused = false,
  showRig = true,
  origin = [0, 0],
  scale = 1.35,
  speedScale = 1,
}: UpstreamAnimalProps) {
  const container = useRef<THREE.Group>(null)
  const markers = useRef<Partial<Record<AnimalJoint, THREE.Mesh | null>>>({})
  const phase = useRef(0)
  const age = useRef(0)

  const rig = useMemo(() => createWildlifeRig(kind), [kind])

  useEffect(() => () => rig.dispose(), [rig])

  useFrame((_, delta) => {
    if (!container.current) return
    const dt = paused ? 0 : Math.min(delta, .05)
    const profile = WILDLIFE_PROFILES[kind]
    const cadence = profile.cyclesPerSecond || 1
    phase.current = (phase.current + dt * cadence * speedScale) % 1
    age.current += dt

    const moving = ["walk", "trot", "canter", "gallop", "hop", "leap"].includes(clip)
    const grazing = clip === "graze" ? 1 : 0
    const flying = clip === "fly" || clip === "glide"
    const lying = clip === "lie" ? 1 : 0
    const gait = gaitForClip(kind, clip)

    rig.pose(
      phase.current,
      moving,
      age.current,
      grazing,
      flying ? 1 : false,
      gait,
      {
        clip,
        lying,
        glide: clip === "glide" ? 1 : 0,
      },
    )

    const x = origin[0]
    const z = origin[1]
    const y = terrainHeight(x, z)
    const slope = terrainSlope(x, z)
    container.current.position.set(x, y, z)
    container.current.rotation.order = "YXZ"
    container.current.rotation.x = -Math.atan(slope.dz * .18)
    container.current.rotation.z = Math.atan(slope.dx * .18)

    const joints = rig.joints()
    for (const name of Object.keys(ANIMAL_JOINT_LABELS) as AnimalJoint[]) {
      const marker = markers.current[name]
      const joint = joints[name]
      if (!marker) continue
      marker.visible = showRig && !!joint
      if (joint) marker.position.set(...joint.position)
    }
  })

  return (
    <group ref={container} scale={scale}>
      <primitive object={rig.root} />
      {(Object.keys(ANIMAL_JOINT_LABELS) as AnimalJoint[]).map((name) => (
        <mesh
          key={name}
          ref={(node) => { markers.current[name] = node }}
          visible={false}
        >
          <sphereGeometry args={[.026, 7, 5]} />
          <meshBasicMaterial color="#ffcc55" depthTest={false} />
        </mesh>
      ))}
    </group>
  )
}
