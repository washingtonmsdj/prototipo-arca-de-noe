import { useEffect, useMemo, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { createBasePersonRig } from "../../vendor/pilgrimage/lib/game/base-person/rig"
import { PERSON_PRESETS, personRecipe } from "../../vendor/pilgrimage/lib/game/base-person/design"
import {
  PERSON_CLIPS,
  SOCKET_NAMES,
  type BaseClip,
  type SocketName,
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

export function upstreamHumanFrames(clip: BaseClip) {
  return PERSON_CLIPS[clip].frames
}

export function upstreamHumanLabel(clip: BaseClip) {
  return PERSON_CLIPS[clip].label
}

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
  attachmentSocket?: SocketName
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
  attachmentSocket,
}: UpstreamHumanProps) {
  const container = useRef<THREE.Group>(null)
  const markers = useRef<Partial<Record<EditableJoint, THREE.Mesh | null>>>({})
  const socketMarkers = useRef<Partial<Record<SocketName, THREE.Mesh | null>>>({})
  const socketPoint = useRef(new THREE.Vector3())
  const phase = useRef(0)
  const attachment = useMemo(() => {
    const group = new THREE.Group()
    group.name = "socket-attachment-preview"

    const material = new THREE.MeshStandardMaterial({
      color: "#d9a852",
      roughness: .72,
      metalness: .03,
    })
    const handleGeometry = new THREE.CylinderGeometry(.018, .022, .32, 8)
    const headGeometry = new THREE.BoxGeometry(.11, .06, .08)
    const handle = new THREE.Mesh(handleGeometry, material)
    const head = new THREE.Mesh(headGeometry, material)
    handle.rotation.z = Math.PI / 2
    handle.position.x = .12
    head.position.x = .28
    group.add(handle, head)

    return {
      group,
      dispose() {
        handleGeometry.dispose()
        headGeometry.dispose()
        material.dispose()
      },
    }
  }, [])

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

  useEffect(() => {
    attachment.group.removeFromParent()
    if (attachmentSocket) setup.rig.sockets[attachmentSocket].add(attachment.group)
    return () => attachment.group.removeFromParent()
  }, [attachment, attachmentSocket, setup])

  useEffect(() => () => attachment.dispose(), [attachment])

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

    setup.rig.root.updateWorldMatrix(true, true)
    container.current.updateWorldMatrix(true, true)
    for (const name of SOCKET_NAMES) {
      const marker = socketMarkers.current[name]
      const socket = setup.rig.sockets[name]
      if (!marker || !socket) continue
      marker.visible = showRig
      socket.getWorldPosition(socketPoint.current)
      container.current.worldToLocal(socketPoint.current)
      marker.position.copy(socketPoint.current)
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
      {SOCKET_NAMES.map((name) => (
        <mesh
          key={`socket-${name}`}
          ref={(node) => { socketMarkers.current[name] = node }}
          visible={false}
        >
          <octahedronGeometry args={[.024, 0]} />
          <meshBasicMaterial color="#57d7ff" depthTest={false} />
        </mesh>
      ))}
    </group>
  )
}
