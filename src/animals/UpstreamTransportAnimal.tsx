import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createAnimalRig } from "../pilgrimage/transport/animal-rig"
import { COATS } from "../pilgrimage/transport/coats"
import { animalProfile, type Animal, type HorseVariant } from "../pilgrimage/transport-core"
import { ANIMAL_JOINT_LABELS, type AnimalJoint, type AnimalRigEdits } from "../pilgrimage/wildlife/rig-edits"
import { terrainHeight, terrainSlope } from "../world/terrain"
import type { ActorMotionRef } from "../pilgrimage/runtime/actor-motion"
import { plantFoot, type FootPlant } from "../../vendor/pilgrimage/lib/game/base-person/gait"
import {
  advanceDistancePhase,
  directTransportSpeed,
  directTransportStride,
  transportSupportContact,
} from "./upstream-motion"

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
  edits?: AnimalRigEdits
  phaseOverride?: number
  pathRadius?: number
  pathOffset?: number
  stationary?: boolean
  motionState?: ActorMotionRef
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
  edits,
  phaseOverride,
  pathRadius = 1.6,
  pathOffset = 0,
  stationary = true,
  motionState,
}: UpstreamTransportAnimalProps) {
  const container = useRef<THREE.Group>(null)
  const markers = useRef<Partial<Record<AnimalJoint, THREE.Mesh | null>>>({})
  const phase = useRef(0)
  const plantedFoot = useRef<FootPlant | null>(null)
  const motion = useRef({
    distance: Math.max(0, pathRadius) * pathOffset,
    angle: pathOffset,
  })
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
    const cadenceEdit = edits?.clips.walk?.cadence ?? 1
    const moving = clip === "walk"
    const grazing = clip === "graze" ? 1 : 0

    let displayPhase: number
    let rootX: number
    let rootY: number
    let rootZ: number
    let heading: number
    let slope: { dx: number; dz: number }

    if (motionState) {
      const state = motionState.current
      displayPhase = phaseOverride ?? state.phase
      rootX = state.x
      rootY = state.y
      rootZ = state.z
      heading = state.heading
      slope = { dx: state.slopeX, dz: state.slopeZ }
    } else {
      const worldMoving = moving
        && !stationary
        && phaseOverride === undefined
        && pathRadius > 0

      if (worldMoving) {
        const distance = directTransportSpeed(
          definition.animal,
          definition.variant,
          scale,
          speedScale,
          edits,
        ) * dt
        const stride = directTransportStride(
          definition.animal,
          definition.variant,
          scale,
        )
        phase.current = advanceDistancePhase(phase.current, distance, stride)
        motion.current.distance += distance
        motion.current.angle += distance / Math.max(.25, pathRadius)
      } else {
        phase.current = (
          phase.current
          + dt * profile.cyclesPerSecond * cadenceEdit * speedScale
        ) % 1
      }

      displayPhase = phaseOverride ?? phase.current
      const angle = motion.current.angle
      heading = worldMoving ? -angle : 0
      const desiredX = worldMoving ? origin[0] + Math.cos(angle) * pathRadius : origin[0]
      const desiredZ = worldMoving ? origin[1] + Math.sin(angle) * pathRadius : origin[1]
      const desiredY = terrainHeight(desiredX, desiredZ)

      rootX = desiredX
      rootY = desiredY
      rootZ = desiredZ

      if (worldMoving) {
        const support = transportSupportContact(
          definition.animal,
          definition.variant,
          displayPhase,
          scale,
          heading,
        )
        if (support) {
          const planted = plantFoot(
            plantedFoot.current,
            support.key,
            { x: desiredX, y: desiredY, z: desiredZ },
            support,
            terrainHeight,
          )
          plantedFoot.current = planted.plant
          rootX += planted.offset.x
          rootY += planted.offset.y
          rootZ += planted.offset.z
        } else {
          plantedFoot.current = null
        }
      } else {
        plantedFoot.current = null
      }

      slope = terrainSlope(rootX, rootZ)
    }

    rig.pose(displayPhase, moving, grazing, edits)

    container.current.position.set(rootX, rootY, rootZ)
    container.current.rotation.order = "YXZ"
    container.current.rotation.y = heading
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
