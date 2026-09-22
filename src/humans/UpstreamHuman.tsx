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
import { createHumanAttachment, type HumanAttachmentKind } from "./attachments"
import { plantFoot, type FootPlant } from "../../vendor/pilgrimage/lib/game/base-person/gait"
import {
  advanceOriginalRigWalk,
  crossedOriginalSupport,
  isOriginalMovingClip,
  originalRigWalkContact,
  originalRigWalkSpeed,
} from "./upstream-motion"
import {
  blendHumanPose,
  captureHumanPose,
  humanTransitionProgress,
  type HumanPoseSnapshot,
} from "./pose-transition"

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
  attachment?: HumanAttachmentKind
  attachmentSocket?: SocketName
  pathRadius?: number
  pathOffset?: number
  stationary?: boolean
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
  attachment,
  attachmentSocket,
  pathRadius = 1.6,
  pathOffset = 0,
  stationary = true,
}: UpstreamHumanProps) {
  const container = useRef<THREE.Group>(null)
  const markers = useRef<Partial<Record<EditableJoint, THREE.Mesh | null>>>({})
  const socketMarkers = useRef<Partial<Record<SocketName, THREE.Mesh | null>>>({})
  const socketPoint = useRef(new THREE.Vector3())
  const phase = useRef(0)
  const plantedFoot = useRef<FootPlant | null>(null)
  const lastClip = useRef<BaseClip>(clip)
  const transition = useRef<{ snapshot: HumanPoseSnapshot; elapsed: number } | null>(null)
  const motion = useRef({
    distance: Math.max(0, pathRadius) * pathOffset,
    angle: pathOffset,
  })
  const attachmentInstance = useMemo(
    () => attachment ? createHumanAttachment(attachment) : null,
    [attachment],
  )

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
    lastClip.current = clip
    transition.current = null
    plantedFoot.current = null
    phase.current = 0
    motion.current.distance = Math.max(0, pathRadius) * pathOffset
    motion.current.angle = pathOffset
    return () => setup.rig.dispose()
  }, [setup])

  useEffect(() => {
    attachmentInstance?.group.removeFromParent()
    if (attachmentInstance && attachmentSocket) {
      setup.rig.sockets[attachmentSocket].add(attachmentInstance.group)
    }
    return () => {
      attachmentInstance?.group.removeFromParent()
    }
  }, [attachmentInstance, attachmentSocket, setup])

  useEffect(() => () => {
    attachmentInstance?.dispose()
  }, [attachmentInstance])

  useFrame((_, delta) => {
    if (!container.current) return
    const dt = paused ? 0 : Math.min(delta, .05)
    const clipChanged = lastClip.current !== clip
    if (clipChanged) {
      transition.current = !paused && phaseOverride === undefined
        ? { snapshot: captureHumanPose(setup.rig.root), elapsed: 0 }
        : null

      const preserveWalkPhase = isOriginalMovingClip(lastClip.current)
        && isOriginalMovingClip(clip)
      if (!preserveWalkPhase) phase.current = 0

      lastClip.current = clip
      plantedFoot.current = null
    }

    const moving = !stationary
      && phaseOverride === undefined
      && isOriginalMovingClip(clip)
      && pathRadius > 0

    const transitioning = transition.current !== null
    const previousPhase = phase.current
    const cadence = 1.1 * speedScale
    const distance = moving && !transitioning
      ? originalRigWalkSpeed(setup.recipe.body, scale, cadence) * dt
      : 0

    if (moving && distance > 0) {
      motion.current.distance += distance
      motion.current.angle += distance / Math.max(.25, pathRadius)
      phase.current = advanceOriginalRigWalk(
        phase.current,
        distance,
        clip,
        setup.recipe.body,
        scale,
      )
    } else if (!moving) {
      phase.current = (phase.current + dt * cadence) % 1
    }

    const displayPhase = phaseOverride ?? phase.current
    const angle = motion.current.angle
    const desiredX = moving ? origin[0] + Math.cos(angle) * pathRadius : origin[0]
    const desiredZ = moving ? origin[1] + Math.sin(angle) * pathRadius : origin[1]
    const heading = moving ? -angle : 0
    const desiredGround = terrainHeight(desiredX, desiredZ)

    let rootX = desiredX
    let rootY = desiredGround
    let rootZ = desiredZ

    if (moving) {
      if (crossedOriginalSupport(
        previousPhase,
        distance,
        clip,
        setup.recipe.body,
        scale,
      )) plantedFoot.current = null

      const contact = originalRigWalkContact(
        displayPhase,
        clip,
        setup.recipe.body,
        scale,
        heading,
      )
      const planted = plantFoot(
        plantedFoot.current,
        `${preset}:${contact.side}`,
        { x: desiredX, y: desiredGround, z: desiredZ },
        contact,
        terrainHeight,
      )
      plantedFoot.current = planted.plant
      rootX += planted.offset.x
      rootY += planted.offset.y
      rootZ += planted.offset.z
    } else {
      plantedFoot.current = null
    }

    const slope = terrainSlope(rootX, rootZ)
    container.current.position.set(rootX, rootY, rootZ)
    container.current.rotation.order = "YXZ"
    container.current.rotation.y = heading
    container.current.rotation.x = -Math.atan(slope.dz * .22)
    container.current.rotation.z = Math.atan(slope.dx * .22)

    setup.rig.pose(displayPhase, clip, edits)

    if (transition.current && phaseOverride === undefined && !paused) {
      transition.current.elapsed += Math.min(delta, .05)
      const progress = humanTransitionProgress(transition.current.elapsed, .18)
      blendHumanPose(transition.current.snapshot, progress)
      if (progress >= 1) transition.current = null
    }

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
