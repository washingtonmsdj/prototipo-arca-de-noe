import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createBasePersonRig } from "../../vendor/pilgrimage/lib/game/base-person/rig"
import { PERSON_PRESETS, personRecipe } from "../../vendor/pilgrimage/lib/game/base-person/design"
import {
  PERSON_CLIPS,
  type BaseClip,
} from "../../vendor/pilgrimage/lib/game/base-person/pose"
import {
  EDITABLE_JOINTS,
  type EditableJoint,
  type PoseEdits,
} from "../../vendor/pilgrimage/lib/game/base-person/pose-edits"
import { terrainHeight, terrainSlope } from "../world/terrain"

export const UPSTREAM_PERSON_PRESETS = Object.keys(PERSON_PRESETS)
export const UPSTREAM_PERSON_CLIPS = Object.keys(PERSON_CLIPS) as BaseClip[]
export type UpstreamHumanClip = BaseClip

export interface UpstreamHumanProps {
  preset: string
  clip: BaseClip
  paused?: boolean
  origin?: [number, number]
  scale?: number
  speedScale?: number
  edits?: PoseEdits
  phaseOverride?: number
  showRig?: boolean
}

export function UpstreamHuman({
  preset,
  clip,
  paused = false,
  origin = [0, 0],
  scale = 1.2,
  speedScale = 1,
  edits,
  phaseOverride,
  showRig = false,
}: UpstreamHumanProps) {
  const container = useRef<THREE.Group>(null)
  const markers = useRef<Partial<Record<EditableJoint, THREE.Mesh | null>>>({})
  const phase = useRef(0)

  const setup = useMemo(() => {
    const design = PERSON_PRESETS[preset] ?? PERSON_PRESETS.Storybook
    const recipe = personRecipe(design)
    const rig = createBasePersonRig(recipe)
    rig.root.name = `pilgrimage-person-${preset}`
    return { design, recipe, rig }
  }, [preset])

  useEffect(() => {
    setup.rig.root.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true
        object.receiveShadow = true
      }
    })
    return () => setup.rig.dispose()
  }, [setup])

  useFrame((_, delta) => {
    if (!container.current) return
    const dt = paused ? 0 : Math.min(delta, .05)
    phase.current = (phase.current + dt * 1.1 * speedScale) % 1
    const displayPhase = phaseOverride ?? phase.current

    const x = origin[0]
    const z = origin[1]
    const y = terrainHeight(x, z)
    const slope = terrainSlope(x, z)

    container.current.position.set(x, y, z)
    container.current.rotation.order = "YXZ"
    container.current.rotation.x = -Math.atan(slope.dz * .22)
    container.current.rotation.z = Math.atan(slope.dx * .22)

    setup.rig.pose(displayPhase, clip, edits)
    const joints = setup.rig.joints()
    for (const name of EDITABLE_JOINTS) {
      const marker = markers.current[name]
      const joint = joints[name]
      if (!marker) continue
      marker.visible = showRig && !!joint
      if (joint) marker.position.set(...joint)
    }
  })

  return (
    <group ref={container} scale={scale}>
      <primitive object={setup.rig.root} />
      {EDITABLE_JOINTS.map((name) => (
        <mesh
          key={name}
          ref={(node) => { markers.current[name] = node }}
          visible={false}
        >
          <sphereGeometry args={[.026, 7, 5]} />
          <meshBasicMaterial color="#ff7ad9" depthTest={false} />
        </mesh>
      ))}
    </group>
  )
}
