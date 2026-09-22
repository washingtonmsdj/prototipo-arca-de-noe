import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createAnimalRig } from "../pilgrimage/transport/animal-rig"
import { COATS } from "../pilgrimage/transport/coats"
import { animalProfile, type Animal, type HorseVariant } from "../pilgrimage/transport-core"
import { ANIMAL_JOINT_LABELS, type AnimalJoint } from "../pilgrimage/wildlife/rig-edits"
import { terrainHeight, terrainSlope } from "../world/terrain"

export type UpstreamTransportClip = "idle" | "walk" | "graze"
export type UpstreamTransportKind = "donkey" | "horse-common" | "horse-noble" | "ox"

export const UPSTREAM_TRANSPORT_ANIMALS: readonly {
  id: UpstreamTransportKind
  label: string
  animal: Animal
  variant: HorseVariant
}[] = [
  { id: "donkey", label: "Jumento", animal: "donkey", variant: "common" },
  { id: "horse-common", label: "Cavalo comum", animal: "horse", variant: "common" },
  { id: "horse-noble", label: "Cavalo nobre", animal: "horse", variant: "noble" },
  { id: "ox", label: "Boi", animal: "ox", variant: "common" },
]

export function upstreamTransportDefinition(kind: UpstreamTransportKind) {
  return UPSTREAM_TRANSPORT_ANIMALS.find((entry) => entry.id === kind) ?? UPSTREAM_TRANSPORT_ANIMALS[0]
}

export function upstreamTransportCoats(kind: UpstreamTransportKind) {
  const definition = upstreamTransportDefinition(kind)
  return COATS[definition.animal]
}

interface UpstreamTransportAnimalProps {
  kind: UpstreamTransportKind
  clip: UpstreamTransportClip
  coatId?: string
  paused?: boolean
  showRig?: boolean
  origin?: [number, number]
  scale?: number
  speedScale?: number
}

export function UpstreamTransportAnimal({
  kind,
  clip,
  coatId,
  paused = false,
  showRig = true,
  origin = [0, 0],
  scale = 1.05,
  speedScale = 1,
}: UpstreamTransportAnimalProps) {
  const container = useRef<THREE.Group>(null)
  const markers = useRef<Partial<Record<AnimalJoint, THREE.Mesh | null>>>({})
  const phase = useRef(0)
  const definition = upstreamTransportDefinition(kind)

  const rig = useMemo(
    () => createAnimalRig(definition.animal, definition.variant, coatId),
    [definition.animal, definition.variant, coatId],
  )

  useEffect(() => {
    rig.root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
    return () => rig.dispose()
  }, [rig])

  useFrame((_, delta) => {
    if (!container.current) return
    const dt = paused ? 0 : Math.min(delta, .05)
    const profile = animalProfile(definition.animal, definition.variant)
    phase.current = (phase.current + dt * profile.cyclesPerSecond * speedScale) % 1

    const moving = clip === "walk"
    const grazing = clip === "graze" ? 1 : 0
    rig.pose(phase.current, moving, grazing)

    const x = origin[0]
    const z = origin[1]
    const y = terrainHeight(x, z)
    const slope = terrainSlope(x, z)
    container.current.position.set(x, y, z)
    container.current.rotation.order = "YXZ"
    container.current.rotation.x = -Math.atan(slope.dz * .16)
    container.current.rotation.z = Math.atan(slope.dx * .16)

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
          <sphereGeometry args={[.03, 7, 5]} />
          <meshBasicMaterial color="#5bd6ff" depthTest={false} />
        </mesh>
      ))}
    </group>
  )
}
